import crypto from "node:crypto";
import { aggregateCloudSubmissions } from "./community";
import { getApps, initializeApp } from "firebase-admin/app";
import {
  getFirestore,
  FieldValue,
  type WriteBatch,
} from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

if (!getApps().length) initializeApp();

const db = getFirestore();
const MIN_COMMUNITY_THRESHOLD = 50;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a cryptographically unpredictable, expiring partner invitation.
 * Never embeds user responses in invitation URLs.
 */
export const createPartnerInvitation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication required to create cloud invitations.",
    );
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
    throw new HttpsError(
      "invalid-argument",
      "Missing creatorResultId or assessmentSlug.",
    );
  }

  const submissionDoc = await db
    .collection("submissions")
    .doc(String(creatorResultId))
    .get();
  if (
    !submissionDoc.exists ||
    submissionDoc.data()?.ownerUid !== request.auth.uid
  ) {
    throw new HttpsError(
      "permission-denied",
      "Cannot invite using a submission you do not own.",
    );
  }

  const rawToken = crypto.randomBytes(24).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const hours = Math.min(
    24 * 30,
    Math.max(1, Number(expiresInHours || 24 * 7)),
  );
  const now = Date.now();
  const expiresAt = new Date(now + hours * 3600 * 1000).toISOString();

  const inviteRef = db.collection("invitations").doc();
  await inviteRef.set({
    inviteId: inviteRef.id,
    tokenHash,
    creatorUid: request.auth.uid,
    creatorDisplayName: String(creatorDisplayName || "Your partner").slice(
      0,
      40,
    ),
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
    throw new HttpsError(
      "failed-precondition",
      "This invitation has been revoked.",
    );
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
    throw new HttpsError(
      "permission-denied",
      "Invitation not owned by caller.",
    );
  }

  await inviteRef.update({
    status: "revoked",
    revokedAt: new Date().toISOString(),
  });
  const compId = snap.data()?.compatibilityId;
  if (compId) {
    await db
      .collection("compatibilities")
      .doc(compId)
      .update({ revoked: true });
  }
  return { ok: true };
});

/** Rebuild versioned measured cohorts, including deletions and consent withdrawals. */
export const onSubmissionWriteAggregate = onDocumentWritten(
  "submissions/{submissionId}",
  async (event) => {
    const slug =
      event.data?.after.data()?.assessmentSlug ||
      event.data?.before.data()?.assessmentSlug;
    if (typeof slug !== "string") return;
    const [submissions, previous] = await Promise.all([
      db.collection("submissions").where("assessmentSlug", "==", slug).get(),
      db
        .collection("communityAggregates")
        .where("assessmentSlug", "==", slug)
        .get(),
    ]);
    const aggregates = aggregateCloudSubmissions(
      submissions.docs.map((d) => d.data()),
      MIN_COMMUNITY_THRESHOLD,
    );
    const writes = new Map<string, Record<string, unknown>>();
    for (const aggregate of aggregates) {
      const id = hashToken(
        JSON.stringify([
          aggregate.assessmentSlug,
          aggregate.assessmentVersion,
          aggregate.scoringEngineVersion,
          aggregate.mode,
          aggregate.dimension,
        ]),
      );
      writes.set(id, { ...aggregate, updatedAt: FieldValue.serverTimestamp() });
    }
    const operations: Array<(batch: WriteBatch) => void> = [];
    for (const doc of previous.docs)
      if (!writes.has(doc.id))
        operations.push((batch) => {
          batch.delete(doc.ref);
        });
    for (const [id, value] of writes)
      operations.push((batch) => {
        batch.set(db.collection("communityAggregates").doc(id), value);
      });
    for (let offset = 0; offset < operations.length; offset += 400) {
      const batch = db.batch();
      for (const op of operations.slice(offset, offset + 400)) op(batch);
      await batch.commit();
    }
  },
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

  const creatorInvites = await db
    .collection("invitations")
    .where("creatorUid", "==", uid)
    .get();
  const invBatch = db.batch();
  creatorInvites.forEach((d) => invBatch.delete(d.ref));
  await invBatch.commit();

  const mrInvites = await db
    .collection("multiRaterInvites")
    .where("ownerUid", "==", uid)
    .get();
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
