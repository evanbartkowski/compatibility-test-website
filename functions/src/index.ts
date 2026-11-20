import crypto from "node:crypto";
import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const MIN_COMMUNITY_THRESHOLD = 50;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function extractNumericAnswerValue(ans: Record<string, unknown>): number | null {
  if (!ans || ans.skipped) return null;
  if (typeof ans.enjoyment === "number" && ans.enjoyment >= 1 && ans.enjoyment <= 5) {
    return ans.enjoyment;
  }
  if (typeof ans.customValue === "number" && Number.isFinite(ans.customValue)) {
    return ans.customValue;
  }
  if (typeof ans.curiosityLevel === "string") {
    const map: Record<string, number> = {
      very_interested: 5,
      interested: 4,
      curious_uncertain: 3.5,
      havent_considered: 2.5,
      not_interested: 2,
      firm_boundary: 1,
    };
    return map[ans.curiosityLevel] ?? null;
  }
  return null;
}

/**
 * Creates a cryptographically unpredictable, expiring partner invitation.
 * Never embeds user responses in invitation URLs.
 */
export const createPartnerInvitation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required to create cloud invitations.");
  }

  const {
    creatorDisplayName,
    assessmentSlug,
    assessmentVersion,
    mode,
    creatorResultId,
    creatorSharing,
    expiresInHours,
  } = request.data || {};

  if (!creatorResultId || !assessmentSlug) {
    throw new HttpsError("invalid-argument", "Missing creatorResultId or assessmentSlug.");
  }

  const submissionDoc = await db.collection("submissions").doc(String(creatorResultId)).get();
  if (!submissionDoc.exists || submissionDoc.data()?.ownerUid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Cannot invite using a submission you do not own.");
  }

  const rawToken = crypto.randomBytes(24).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const hours = Math.min(24 * 30, Math.max(1, Number(expiresInHours || 24 * 7)));
  const now = Date.now();
  const expiresAt = new Date(now + hours * 3600 * 1000).toISOString();

  const inviteRef = db.collection("invitations").doc();
  await inviteRef.set({
    inviteId: inviteRef.id,
    tokenHash,
    creatorUid: request.auth.uid,
    creatorDisplayName: String(creatorDisplayName || "Your partner").slice(0, 40),
    assessmentSlug: String(assessmentSlug),
    assessmentVersion: String(assessmentVersion || "1.0.0"),
    mode: mode === "quick" ? "quick" : "complete",
    creatorResultId: String(creatorResultId),
    creatorSharing: creatorSharing || {
      shareCategoryScores: true,
      shareAlignedHighlights: true,
      shareComplementaryHighlights: true,
      shareSharedCuriosities: true,
      shareHighLevelBoundariesWithoutDetails: true,
      neverExposeRawPrivateAnswers: true,
    },
    status: "pending",
    createdAt: new Date(now).toISOString(),
    expiresAt,
  });

  return {
    inviteId: inviteRef.id,
    token: rawToken,
    expiresAt,
  };
});

/**
 * Validates an invitation token server-side without exposing creator answers.
 */
export const getPartnerInvitationMeta = onCall(async (request) => {
  const token = String(request.data?.token || "");
  if (!token || token.length < 16) {
    throw new HttpsError("invalid-argument", "Invalid invitation token.");
  }

  const snap = await db
    .collection("invitations")
    .where("tokenHash", "==", hashToken(token))
    .limit(1)
    .get();

  if (snap.empty) {
    throw new HttpsError("not-found", "Invitation not found.");
  }

  const data = snap.docs[0].data();
  if (data.status === "revoked") {
    throw new HttpsError("failed-precondition", "This invitation has been revoked.");
  }
  if (new Date(data.expiresAt).getTime() <= Date.now()) {
    throw new HttpsError("deadline-exceeded", "This invitation has expired.");
  }

  return {
    inviteId: data.inviteId,
    creatorDisplayName: data.creatorDisplayName,
    assessmentSlug: data.assessmentSlug,
    assessmentVersion: data.assessmentVersion,
    mode: data.mode,
    status: data.status,
    expiresAt: data.expiresAt,
  };
});

/**
 * Revokes an invitation and marks any linked compatibility report inaccessible.
 */
export const revokePartnerInvitation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const inviteId = String(request.data?.inviteId || "");
  const inviteRef = db.collection("invitations").doc(inviteId);
  const snap = await inviteRef.get();
  if (!snap.exists || snap.data()?.creatorUid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Invitation not owned by caller.");
  }

  await inviteRef.update({ status: "revoked", revokedAt: new Date().toISOString() });
  const compId = snap.data()?.compatibilityId;
  if (compId) {
    await db.collection("compatibilities").doc(compId).update({ revoked: true });
  }
  return { ok: true };
});

/**
 * Re-aggregates anonymized community statistics whenever a consenting submission is written
 * across all 28 assessments. Strictly skips non-consenting submissions and enforces n >= 50.
 */
export const onSubmissionWriteAggregate = onDocumentWritten(
  "submissions/{submissionId}",
  async (event) => {
    const afterData = event.data?.after.data();
    const beforeData = event.data?.before.data();
    const slug = afterData?.assessmentSlug || beforeData?.assessmentSlug;
    if (!slug) return;

    const consentingSnap = await db
      .collection("submissions")
      .where("assessmentSlug", "==", slug)
      .where("consent.optInCommunityStats", "==", true)
      .get();

    const perQuestionValues = new Map<string, number[]>();
    consentingSnap.forEach((doc) => {
      const answers = doc.data()?.answers || {};
      for (const [qId, rawAns] of Object.entries<Record<string, unknown>>(answers)) {
        const val = extractNumericAnswerValue(rawAns);
        if (val !== null) {
          if (!perQuestionValues.has(qId)) perQuestionValues.set(qId, []);
          perQuestionValues.get(qId)!.push(val);
        }
      }
    });

    const batch = db.batch();
    for (const [qId, vals] of perQuestionValues.entries()) {
      const ref = db.collection("communityAggregates").doc(`${slug}__${qId}`);
      if (vals.length < MIN_COMMUNITY_THRESHOLD) {
        batch.set(ref, {
          assessmentSlug: slug,
          questionId: qId,
          respondentCount: vals.length,
          available: false,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const variance = vals.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / vals.length;
        batch.set(ref, {
          assessmentSlug: slug,
          questionId: qId,
          respondentCount: vals.length,
          meanEnjoyment: Number(mean.toFixed(2)),
          stdDevEnjoyment: Number(Math.sqrt(variance).toFixed(2)),
          available: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    await batch.commit();
  }
);

/**
 * Deletes all user-owned drafts, submissions, invitations, multi-rater invites, shared bucket lists, and compatibility reports.
 */
export const deleteUserData = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const uid = request.auth.uid;

  const collections = ["drafts", "submissions", "invitations"];
  for (const col of collections) {
    const snap = await db.collection(col).where("ownerUid", "==", uid).get();
    const batch = db.batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const creatorInvites = await db.collection("invitations").where("creatorUid", "==", uid).get();
  const invBatch = db.batch();
  creatorInvites.forEach((d) => invBatch.delete(d.ref));
  await invBatch.commit();

  const mrInvites = await db.collection("multiRaterInvites").where("ownerUid", "==", uid).get();
  for (const d of mrInvites.docs) {
    const responses = await db
      .collection("multiRaterSubmissions")
      .where("feedbackInviteId", "==", d.id)
      .get();
    const mrBatch = db.batch();
    responses.forEach((r) => mrBatch.delete(r.ref));
    mrBatch.delete(d.ref);
    await mrBatch.commit();
  }

  const comps = await db
    .collection("compatibilities")
    .where("participantUids", "array-contains", uid)
    .get();
  const compBatch = db.batch();
  comps.forEach((d) => {
    compBatch.delete(d.ref);
    compBatch.delete(db.collection("sharedBucketLists").doc(d.id));
  });
  await compBatch.commit();

  await db.collection("users").doc(uid).delete();
  return { deleted: true };
});
