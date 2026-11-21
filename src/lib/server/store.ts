import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { brandConfig } from "@/config/brand";
import {
  builtInAssessments,
  archivedAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
import {
  referenceChartAuditItems,
  type ReferenceChartItem,
} from "@/data/reference-chart-audit";
import {
  compareUserWithCommunity,
  computeCommunityAggregates,
  generateSyntheticDemoSubmissions,
  type CohortFilter,
  type OptedInSubmissionRecord,
} from "@/lib/assessment/community";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { attachIntimacyBlueprint } from "@/lib/assessment/intimacy-profile";
import { ADVICE_VERSION, attachPersonalizedAdvice, attachPairAdvice } from "@/lib/assessment/advice";
import {
  parseAssessmentDefinition,
  measurementSignature,
  validateAssessmentAnswers,
} from "@/lib/assessment/definition";
import {
  projectResultForSharing,
  type ResultShareSelection,
  type SharedProfileView,
} from "@/lib/assessment/sharing";
import {
  computeMultiRaterSummary,
  scoreAssessmentSubmission,
} from "@/lib/assessment/scoring";
import type {
  AssessmentDefinition,
  AssessmentMode,
  AuditEventRecord,
  CompatibilityReport,
  ConsentSettings,
  EmailDeliveryRecord,
  EmailVerificationRecord,
  MultiRaterInviteRecord,
  MultiRaterSubmissionRecord,
  PartnerInvitation,
  QuestionAnswer,
  ResultAccessGrant,
  ScoredAssessmentResult,
  SharedBucketListState,
  SharingPreferences,
  UserPrivacyPreferences,
} from "@/lib/assessment/types";

export interface StoredSubmission {
  submissionId: string;
  sessionKey: string;
  ownerUid?: string;
  assessmentSlug: string;
  assessmentVersion: string;
  assessmentSnapshot?: AssessmentDefinition;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  consent: ConsentSettings;
  answers: Record<string, QuestionAnswer>;
  result: ScoredAssessmentResult;
  createdAt: string;
}

export interface StoredInvitation extends PartnerInvitation {
  creatorSessionKey: string;
  creatorUid?: string;
  partnerSessionKey?: string;
  partnerUid?: string;
  tokenHash: string;
  partnerSharing?: SharingPreferences;
}

export interface EmailTemplateConfig {
  secureLinkSubject: string;
  secureLinkIntro: string;
  summarySubject: string;
  summaryIntro: string;
  pdfSubject: string;
  pdfDisclaimer: string;
  updatedAt: string;
}

interface PersistedDatabase {
  liveAssessmentVersions: Record<string, string | null>;
  revokedAccountSessions: Record<string, number>;
  sharedProfiles: Record<
    string,
    {
      profileId: string;
      tokenHash: string;
      sessionKey: string;
      ownerUid?: string;
      sourceResultIds: string[];
      view: SharedProfileView;
      revoked: boolean;
    }
  >;
  submissions: Record<string, StoredSubmission>;
  invitations: Record<string, StoredInvitation>;
  compatibilities: Record<string, CompatibilityReport>;
  customAssessments: Record<string, AssessmentDefinition>;
  assessmentVersions: Record<string, AssessmentDefinition>;
  editorialOverrides: Record<
    string,
    {
      editorialStatus: ReferenceChartItem["editorialStatus"];
      editorialNotes: string;
    }
  >;
  accessGrants: Record<string, ResultAccessGrant>;
  emailVerifications: Record<string, EmailVerificationRecord>;
  verifiedEmailSessions: Record<string, string[]>; // sessionKey -> verified email hashes
  emailDeliveries: EmailDeliveryRecord[];
  multiRaterInvites: Record<string, MultiRaterInviteRecord>;
  multiRaterSubmissions: Record<string, MultiRaterSubmissionRecord[]>;
  sharedBucketLists: Record<string, SharedBucketListState>;
  userPrivacyPrefs: Record<string, UserPrivacyPreferences>;
  auditEvents: AuditEventRecord[];
  emailTemplates?: EmailTemplateConfig;
}

const DATA_DIR =
  process.env.BETWEEN_US_DATA_DIR ||
  path.join(process.cwd(), ".between-us-data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const DEFAULT_EMAIL_TEMPLATES: EmailTemplateConfig = {
  secureLinkSubject: "Your private Truth Desire summary link",
  secureLinkIntro:
    "Here is your expiring private access link to revisit your Truth Desire reflection report. Because links expire automatically, your full results remain stored only inside your protected session.",
  summarySubject: "Your personal reflection highlights from Truth Desire",
  summaryIntro:
    "Below is the high-level insight summary you requested. Sensitive act-level selections and raw boundary answers are omitted from this email body.",
  pdfSubject: "Your Truth Desire report export",
  pdfDisclaimer:
    "Important privacy reminder: you explicitly requested a PDF attachment. Downloaded or emailed attachments persist in your inbox outside Truth Desire.",
  updatedAt: "2026-11-08T00:00:00.000Z",
};

function emptyDb(): PersistedDatabase {
  return {
    liveAssessmentVersions: {},
    revokedAccountSessions: {},
    sharedProfiles: {},
    submissions: {},
    invitations: {},
    compatibilities: {},
    customAssessments: {},
    assessmentVersions: {},
    editorialOverrides: {},
    accessGrants: {},
    emailVerifications: {},
    verifiedEmailSessions: {},
    emailDeliveries: [],
    multiRaterInvites: {},
    multiRaterSubmissions: {},
    sharedBucketLists: {},
    userPrivacyPrefs: {},
    auditEvents: [],
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  };
}

function readDb(): PersistedDatabase {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return emptyDb();
    }
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PersistedDatabase>;
    return {
      liveAssessmentVersions: parsed.liveAssessmentVersions || {},
      revokedAccountSessions: parsed.revokedAccountSessions || {},
      sharedProfiles: parsed.sharedProfiles || {},
      submissions: parsed.submissions || {},
      invitations: parsed.invitations || {},
      compatibilities: parsed.compatibilities || {},
      customAssessments: parsed.customAssessments || {},
      assessmentVersions: parsed.assessmentVersions || {},
      editorialOverrides: parsed.editorialOverrides || {},
      accessGrants: parsed.accessGrants || {},
      emailVerifications: parsed.emailVerifications || {},
      verifiedEmailSessions: parsed.verifiedEmailSessions || {},
      emailDeliveries: parsed.emailDeliveries || [],
      multiRaterInvites: parsed.multiRaterInvites || {},
      multiRaterSubmissions: parsed.multiRaterSubmissions || {},
      sharedBucketLists: parsed.sharedBucketLists || {},
      userPrivacyPrefs: parsed.userPrivacyPrefs || {},
      auditEvents: parsed.auditEvents || [],
      emailTemplates: parsed.emailTemplates || DEFAULT_EMAIL_TEMPLATES,
    };
  } catch (error) {
    throw new Error(
      "The private data store could not be read safely. Restore access or a valid backup before continuing.",
      { cause: error },
    );
  }
}

function writeDb(db: PersistedDatabase): void {
  if (process.env.NODE_ENV === "production" && !process.env.BETWEEN_US_DATA_DIR)
    throw new Error(
      "Configure BETWEEN_US_DATA_DIR on a persistent private volume before saving production data.",
    );
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp.${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmpPath, STORE_PATH);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function pushAuditEvent(
  db: PersistedDatabase,
  event: Omit<AuditEventRecord, "eventId" | "createdAt">,
): void {
  db.auditEvents.unshift({
    eventId: `evt_${crypto.randomBytes(6).toString("hex")}`,
    createdAt: new Date().toISOString(),
    ...event,
  });
  if (db.auditEvents.length > 250) {
    db.auditEvents = db.auditEvents.slice(0, 250);
  }
}

export function resolveAssessment(
  slug: string,
  version?: string,
): AssessmentDefinition | undefined {
  return resolveAssessmentFromDb(readDb(), slug, version);
}
function resolveAssessmentFromDb(
  db: PersistedDatabase,
  slug: string,
  version?: string,
): AssessmentDefinition | undefined {
  const current = db.customAssessments[slug] || getAssessmentBySlug(slug);
  const archived = (revision: string) =>
    db.assessmentVersions[slug + "@" + revision] ||
    builtInAssessments.find((a) => a.slug === slug && a.version === revision) ||
    archivedAssessments.find((a) => a.slug === slug && a.version === revision) ||
    Object.values(db.submissions).find(
      (s) => s.assessmentSlug === slug && s.assessmentVersion === revision,
    )?.assessmentSnapshot ||
    (current?.version === revision ? current : undefined);
  if (version) return archived(version);
  if (Object.hasOwn(db.liveAssessmentVersions, slug)) {
    const live = db.liveAssessmentVersions[slug];
    return live ? archived(live) : undefined;
  }
  return current?.status === "published" ? current : undefined;
}
export function listPublishedAssessments(): AssessmentDefinition[] {
  return publishedAssessmentsFromDb(readDb());
}
function publishedAssessmentsFromDb(
  db: PersistedDatabase,
): AssessmentDefinition[] {
  const slugs = new Set([
    ...builtInAssessments.map((a) => a.slug),
    ...Object.keys(db.customAssessments),
  ]);
  return [...slugs]
    .map((slug) => resolveAssessmentFromDb(db, slug))
    .filter((a): a is AssessmentDefinition =>
      Boolean(a && a.status === "published"),
    );
}
export function unpublishAssessment(slug: string): void {
  const db = readDb();
  if (!db.customAssessments[slug] && !getAssessmentBySlug(slug))
    throw new Error("Assessment not found.");
  db.liveAssessmentVersions[slug] = null;
  pushAuditEvent(db, {
    eventType: "admin_update",
    assessmentSlug: slug,
    status: "ok",
    detail: "Unpublished the live assessment. Historical definitions retained.",
  });
  writeDb(db);
}

export function listAllAssessments(): AssessmentDefinition[] {
  const db = readDb();
  const merged = new Map<string, AssessmentDefinition>();
  for (const a of builtInAssessments) merged.set(a.slug, a);
  for (const a of Object.values(db.customAssessments)) merged.set(a.slug, a);
  return Array.from(merged.values());
}

export function listAssessmentVersions() {
  const db = readDb();
  const revisions = new Map<string, AssessmentDefinition>();
  for (const a of [
    ...archivedAssessments,
    ...builtInAssessments,
    ...Object.values(db.assessmentVersions),
    ...Object.values(db.customAssessments),
  ])
    revisions.set(`${a.slug}@${a.version}`, a);
  return [...revisions.values()].map((a) => ({
    slug: a.slug,
    version: a.version,
    status: a.status,
    questions: a.questions.length,
  }));
}

export function saveCustomAssessment(
  assessment: AssessmentDefinition,
): AssessmentDefinition {
  const db = readDb();
  assessment = parseAssessmentDefinition(assessment);
  const previous =
    db.customAssessments[assessment.slug] ||
    getAssessmentBySlug(assessment.slug);
  const archived =
    db.assessmentVersions[`${assessment.slug}@${assessment.version}`];
  const locked =
    archived ||
    (previous?.status === "published" && previous.version === assessment.version
      ? previous
      : undefined);
  if (
    locked &&
    measurementSignature(locked) !== measurementSignature(assessment)
  )
    throw new Error(
      "Published scoring is immutable. Increase the assessment version before changing questions, dimensions, or scoring.",
    );
  if (previous?.status === "published")
    db.assessmentVersions[`${previous.slug}@${previous.version}`] =
      structuredClone(previous);
  if (assessment.status === "published")
    db.assessmentVersions[`${assessment.slug}@${assessment.version}`] =
      structuredClone(assessment);
  if (assessment.status === "published")
    db.liveAssessmentVersions[assessment.slug] = assessment.version;
  else if (!Object.hasOwn(db.liveAssessmentVersions, assessment.slug))
    db.liveAssessmentVersions[assessment.slug] =
      previous?.status === "published" ? previous.version : null;
  db.customAssessments[assessment.slug] = assessment;
  pushAuditEvent(db, {
    eventType: "admin_update",
    assessmentSlug: assessment.slug,
    status: "ok",
    detail: `Saved assessment ${assessment.slug} v${assessment.version} (${assessment.status})`,
  });
  writeDb(db);
  return assessment;
}

export function saveAssessmentSubmission(params: {
  sessionKey: string;
  ownerUid?: string;
  assessmentSlug: string;
  assessmentVersion?: string;
  allowArchivedVersion?: boolean;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  consent: ConsentSettings;
  answers: Record<string, QuestionAnswer>;
}): StoredSubmission {
  const assessment = resolveAssessment(
    params.assessmentSlug,
    params.assessmentVersion,
  );
  if (!assessment) {
    throw new Error(
      `Unknown or unpublished assessment: ${params.assessmentSlug}`,
    );
  }
  const live = resolveAssessment(params.assessmentSlug);
  if (
    !params.allowArchivedVersion &&
    (!live || live.version !== assessment.version)
  )
    throw new Error(
      "Only the current published version accepts new attempts. Reload this test before continuing.",
    );
  if (assessment.status !== "published")
    throw new Error("Only published assessments accept submissions.");
  if (
    !params.consent.confirmedAdult18Plus ||
    !params.consent.acceptedPrivacyTerms
  ) {
    throw new Error(
      "Adult age confirmation (18+) and privacy consent are required.",
    );
  }

  validateAssessmentAnswers(assessment, params.answers);
  const submissionId = `sub_${crypto.randomBytes(10).toString("hex")}`;
  const createdAt = new Date().toISOString();
  const result = scoreAssessmentSubmission({
    resultId: submissionId,
    assessment,
    mode: params.mode,
    perspective: params.perspective,
    answers: params.answers,
    createdAt,
  });

  const record: StoredSubmission = {
    submissionId,
    sessionKey: params.sessionKey,
    ...(params.ownerUid ? { ownerUid: params.ownerUid } : {}),
    assessmentSlug: assessment.slug,
    assessmentVersion: assessment.version,
    assessmentSnapshot: structuredClone(assessment),
    mode: params.mode,
    perspective: params.perspective,
    consent: params.consent,
    answers: params.answers,
    result,
    createdAt,
  };

  const db = readDb();
  if (assessment.slug === "personal-erotic-blueprint" && params.perspective === "primary") {
    const sources = Object.values(db.submissions).flatMap((submission) => {
      if (!ownsRecord(submission, params.sessionKey, params.ownerUid) || submission.perspective !== "primary") return [];
      const sourceAssessment = resolveAssessment(submission.assessmentSlug);
      if (sourceAssessment?.collection !== "intimacy-suite") return [];
      return [{ result: submission.result, assessment: sourceAssessment }];
    });
    attachIntimacyBlueprint(result, sources);
    attachPersonalizedAdvice(result, assessment, params.answers);
  }
  db.submissions[submissionId] = record;
  pushAuditEvent(db, {
    eventType: "submission_created",
    assessmentSlug: assessment.slug,
    status: "ok",
    detail: `${params.mode} mode (${params.perspective})`,
  });
  writeDb(db);
  return record;
}

export function getSubmissionResult(resultId: string): StoredSubmission | null {
  const db = readDb();
  const sub = db.submissions[resultId];
  if (!sub) return null;
  if (sub.result.advice?.version !== ADVICE_VERSION) {
    const original = sub.assessmentSnapshot || resolveAssessment(sub.assessmentSlug, sub.assessmentVersion);
    const current = getAssessmentBySlug(sub.assessmentSlug);
    if (original) attachPersonalizedAdvice(sub.result, { ...original, adviceProfile: current?.version === original.version ? current.adviceProfile : original.adviceProfile }, sub.answers);
  }
  return sub;
}

function ownsRecord(
  record: { sessionKey?: string; ownerUid?: string },
  sessionKey?: string | null,
  uid?: string | null,
): boolean {
  return record.ownerUid
    ? Boolean(uid && record.ownerUid === uid)
    : Boolean(sessionKey && record.sessionKey === sessionKey);
}
function ownsInvitation(
  inv: StoredInvitation,
  sessionKey?: string | null,
  uid?: string | null,
): boolean {
  return (
    ownsRecord(
      { sessionKey: inv.creatorSessionKey, ownerUid: inv.creatorUid },
      sessionKey,
      uid,
    ) ||
    ownsRecord(
      { sessionKey: inv.partnerSessionKey, ownerUid: inv.partnerUid },
      sessionKey,
      uid,
    )
  );
}
function cleanDependentData(db: PersistedDatabase): void {
  for (const [id, inv] of Object.entries(db.invitations))
    if (
      !db.submissions[inv.creatorResultId] ||
      (inv.partnerResultId && !db.submissions[inv.partnerResultId])
    ) {
      if (inv.compatibilityId) {
        delete db.compatibilities[inv.compatibilityId];
        delete db.sharedBucketLists[inv.compatibilityId];
      }
      delete db.invitations[id];
    }
  for (const [id, grant] of Object.entries(db.accessGrants))
    if (
      grant.targetType === "result"
        ? !db.submissions[grant.targetId]
        : !db.compatibilities[grant.targetId]
    )
      delete db.accessGrants[id];
  for (const [id, profile] of Object.entries(db.sharedProfiles))
    if (profile.sourceResultIds.some((id) => !db.submissions[id]))
      delete db.sharedProfiles[id];
  for (const [id, invite] of Object.entries(db.multiRaterInvites))
    if (!db.submissions[invite.submissionId]) {
      delete db.multiRaterInvites[id];
      delete db.multiRaterSubmissions[id];
    }
}
export function canAccessResult(params: {
  resultId: string;
  sessionKey?: string | null;
  uid?: string | null;
  accessToken?: string | null;
}): boolean {
  const db = readDb();
  const sub = db.submissions[params.resultId];
  if (!sub) return false;
  if (ownsRecord(sub, params.sessionKey, params.uid)) return true;
  if (params.accessToken) {
    const tHash = hashToken(params.accessToken);
    const grant = db.accessGrants[tHash];
    if (
      grant &&
      grant.targetType === "result" &&
      grant.targetId === params.resultId &&
      new Date(grant.expiresAt).getTime() > Date.now()
    ) {
      return true;
    }
  }
  return false;
}

export function canAccessCompatibility(params: {
  compatibilityId: string;
  sessionKey?: string | null;
  uid?: string | null;
  accessToken?: string | null;
}): boolean {
  const db = readDb();
  const comp = db.compatibilities[params.compatibilityId];
  if (!comp || comp.revoked) return false;
  const inv = db.invitations[comp.inviteId];
  if (inv && inv.status === "revoked") return false;
  if (inv && ownsInvitation(inv, params.sessionKey, params.uid)) return true;
  if (params.accessToken) {
    const tHash = hashToken(params.accessToken);
    const grant = db.accessGrants[tHash];
    if (
      grant &&
      grant.targetType === "compatibility" &&
      grant.targetId === params.compatibilityId &&
      new Date(grant.expiresAt).getTime() > Date.now()
    ) {
      return true;
    }
  }
  return false;
}

export function createResultAccessGrant(params: {
  targetType: "result" | "compatibility";
  targetId: string;
  expiresInHours?: number;
}): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(24).toString("base64url");
  const tHash = hashToken(token);
  const hours = Math.min(24 * 14, Math.max(1, params.expiresInHours ?? 72));
  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + hours * 3600 * 1000,
  ).toISOString();

  const db = readDb();
  db.accessGrants[tHash] = {
    tokenHash: tHash,
    targetType: params.targetType,
    targetId: params.targetId,
    createdAt: createdAt.toISOString(),
    expiresAt,
  };
  writeDb(db);
  return { token, expiresAt };
}

export function listSubmissionsForSession(
  sessionKey?: string | null,
  uid?: string | null,
): StoredSubmission[] {
  if (!sessionKey && !uid) return [];
  const db = readDb();
  return Object.values(db.submissions)
    .filter((s) => ownsRecord(s, sessionKey, uid))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteSubmissionForSession(params: {
  resultId: string;
  sessionKey?: string | null;
  uid?: string | null;
}): boolean {
  const db = readDb();
  const sub = db.submissions[params.resultId];
  if (!sub) return false;
  const authorized = ownsRecord(sub, params.sessionKey, params.uid);
  if (!authorized) return false;
  delete db.submissions[params.resultId];
  cleanDependentData(db);
  pushAuditEvent(db, {
    eventType: "data_deleted",
    assessmentSlug: sub.assessmentSlug,
    status: "ok",
    detail: "Single submission deleted by participant",
  });
  writeDb(db);
  return true;
}

export function updateSubmissionCommunityOptIn(params: {
  resultId: string;
  sessionKey?: string | null;
  uid?: string | null;
  optInCommunityStats: boolean;
}): StoredSubmission | null {
  const db = readDb();
  const existing = db.submissions[params.resultId];
  if (!existing || !ownsRecord(existing, params.sessionKey, params.uid)) {
    return null;
  }
  existing.consent.optInCommunityStats = params.optInCommunityStats;
  db.submissions[params.resultId] = existing;
  writeDb(db);
  return existing;
}

export function createPartnerInvitationRecord(params: {
  creatorSessionKey: string;
  creatorUid?: string;
  creatorDisplayName: string;
  creatorResultId: string;
  creatorSharing: SharingPreferences;
  expiresInHours?: number;
}): StoredInvitation {
  const db = readDb();
  const sub = db.submissions[params.creatorResultId];
  if (!sub || !ownsRecord(sub, params.creatorSessionKey, params.creatorUid)) {
    throw new Error("Referenced submission was not found for this session.");
  }

  if (sub.result.scoringEngineVersion !== brandConfig.scoringEngineVersion)
    throw new Error(
      "Retake this test with the current scoring version before creating a new comparison.",
    );
  if (sub.perspective !== "primary")
    throw new Error("Start a comparison from your own primary result.");
  const inviteId = `inv_${crypto.randomBytes(8).toString("hex")}`;
  const token = crypto.randomBytes(24).toString("base64url");
  const hours = Math.min(
    24 * 30,
    Math.max(
      1,
      params.expiresInHours ?? brandConfig.defaultInviteExpirationHours,
    ),
  );
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + hours * 3600 * 1000);

  const invite: StoredInvitation = {
    inviteId,
    token,
    tokenHash: hashToken(token),
    creatorSessionKey: params.creatorSessionKey,
    ...(params.creatorUid ? { creatorUid: params.creatorUid } : {}),
    creatorDisplayName:
      params.creatorDisplayName.trim().slice(0, 40) || "Your Partner",
    assessmentSlug: sub.assessmentSlug,
    assessmentVersion: sub.assessmentVersion,
    mode: sub.mode,
    creatorResultId: sub.submissionId,
    creatorSharing: params.creatorSharing,
    status: "pending",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  db.invitations[inviteId] = invite;
  pushAuditEvent(db, {
    eventType: "invitation_created",
    assessmentSlug: sub.assessmentSlug,
    status: "ok",
  });
  writeDb(db);
  return invite;
}

export function getPublicInvitationByToken(token: string): {
  invitation: Omit<PartnerInvitation, "token" | "creatorResultId"> | null;
  error?: string;
} {
  const db = readDb();
  const tHash = hashToken(token);
  const found = Object.values(db.invitations).find(
    (inv) => inv.tokenHash === tHash,
  );
  if (!found) {
    return {
      invitation: null,
      error: "Invitation link is invalid or was deleted.",
    };
  }
  if (found.status === "revoked") {
    return {
      invitation: null,
      error: "This invitation has been revoked by its creator.",
    };
  }
  if (new Date(found.expiresAt).getTime() <= Date.now()) {
    if (found.status !== "expired") {
      found.status = "expired";
      db.invitations[found.inviteId] = found;
      writeDb(db);
    }
    return { invitation: null, error: "This invitation link has expired." };
  }

  return {
    invitation: {
      inviteId: found.inviteId,
      creatorDisplayName: found.creatorDisplayName,
      assessmentSlug: found.assessmentSlug,
      assessmentVersion: found.assessmentVersion,
      mode: found.mode,
      creatorSharing: found.creatorSharing,
      status: found.status,
      createdAt: found.createdAt,
      expiresAt: found.expiresAt,
      compatibilityId: found.compatibilityId,
    },
  };
}

export function submitPartnerInvitationResponse(params: {
  token: string;
  partnerSessionKey: string;
  partnerUid?: string;
  consent: ConsentSettings;
  answers?: Record<string, QuestionAnswer>;
  existingResultId?: string;
  partnerSharing: SharingPreferences;
}): {
  compatibility: CompatibilityReport;
  partnerResult: ScoredAssessmentResult;
} {
  const db = readDb();
  const tHash = hashToken(params.token);
  const invite = Object.values(db.invitations).find(
    (inv) => inv.tokenHash === tHash,
  );

  if (!invite) throw new Error("Invitation not found.");
  if (invite.status === "revoked")
    throw new Error("Invitation has been revoked.");
  if (invite.status === "completed")
    throw new Error("This invitation has already been completed.");
  if (new Date(invite.expiresAt).getTime() <= Date.now()) {
    throw new Error("Invitation has expired.");
  }

  const creatorSub = db.submissions[invite.creatorResultId];
  if (!creatorSub)
    throw new Error("Creator assessment results are no longer available.");

  const assessment =
    creatorSub.assessmentSnapshot ||
    resolveAssessment(invite.assessmentSlug, invite.assessmentVersion);
  if (!assessment) throw new Error("Assessment definition not found.");

  if (
    creatorSub.result.scoringEngineVersion !== brandConfig.scoringEngineVersion
  )
    throw new Error(
      "The creator needs to retake the test with the current scoring version before comparing.",
    );
  const existing = params.existingResultId
    ? db.submissions[params.existingResultId]
    : undefined;
  if (
    params.existingResultId &&
    (!existing ||
      !ownsRecord(existing, params.partnerSessionKey, params.partnerUid))
  )
    throw new Error("The saved result is not owned by this session.");
  if (
    existing &&
    (existing.assessmentSlug !== creatorSub.assessmentSlug ||
      existing.assessmentVersion !== creatorSub.assessmentVersion ||
      existing.result.scoringEngineVersion !==
        creatorSub.result.scoringEngineVersion)
  )
    throw new Error(
      "Saved results must use compatible assessment and scoring versions. Retake this version to compare.",
    );
  if (
    existing &&
    existing.perspective === "primary" &&
    assessment.scoringStrategy === "intimacy_weighted"
  )
    throw new Error(
      "This test asks different receiving and offering questions. Complete the partner perspective to compare accurately.",
    );
  if (
    existing &&
    ["prediction_accuracy", "would_rather"].includes(
      assessment.scoringStrategy || "",
    )
  )
    throw new Error(
      "This game depends on the current partner. Complete a fresh partner form for this invitation.",
    );
  const partnerSub =
    existing ||
    saveAssessmentSubmission({
      sessionKey: params.partnerSessionKey,
      ownerUid: params.partnerUid,
      assessmentSlug: invite.assessmentSlug,
      assessmentVersion: invite.assessmentVersion,
      allowArchivedVersion: true,
      mode: invite.mode,
      perspective: "partner",
      consent: params.consent,
      answers: params.answers || {},
    });

  const compatibilityId = `cmp_${crypto.randomBytes(10).toString("hex")}`;
  const compatibility = computeCoupleCompatibility({
    compatibilityId,
    inviteId: invite.inviteId,
    assessment,
    mode:
      invite.mode === "quick" || partnerSub.mode === "quick"
        ? "quick"
        : "complete",
    primaryAnswers: creatorSub.answers,
    partnerAnswers: partnerSub.answers,
    creatorSharing: invite.creatorSharing,
    partnerSharing: params.partnerSharing,
  });

  const refreshedDb = readDb();
  refreshedDb.compatibilities[compatibilityId] = compatibility;
  refreshedDb.invitations[invite.inviteId] = {
    ...invite,
    status: "completed",
    partnerSessionKey: params.partnerSessionKey,
    ...(params.partnerUid ? { partnerUid: params.partnerUid } : {}),
    partnerResultId: partnerSub.submissionId,
    compatibilityId,
    partnerSharing: params.partnerSharing,
  };
  pushAuditEvent(refreshedDb, {
    eventType: "compatibility_generated",
    assessmentSlug: assessment.slug,
    status: "ok",
  });
  writeDb(refreshedDb);

  return { compatibility, partnerResult: partnerSub.result };
}

export function getCompatibilityReport(
  compatibilityId: string,
): CompatibilityReport | null {
  const db = readDb();
  const comp = db.compatibilities[compatibilityId];
  if (!comp || comp.revoked) return null;
  const inv = db.invitations[comp.inviteId];
  if (inv && inv.status === "revoked") return null;
  if (comp.pairAdvice?.version !== ADVICE_VERSION) {
    const assessment = resolveAssessment(comp.assessmentSlug, comp.assessmentVersion);
    if (assessment) attachPairAdvice(comp, assessment);
  }

  // Merge persistent Shared Bucket List state if present
  const bucketState = db.sharedBucketLists[compatibilityId];
  if (bucketState && comp.bucketListMatches) {
    const completedSet = new Set(bucketState.completedIds);
    return {
      ...comp,
      bucketListMatches: {
        ...comp.bucketListMatches,
        sharedItems: [
          ...comp.bucketListMatches.sharedItems.map((it) => ({
            ...it,
            completed: completedSet.has(it.id),
          })),
          ...bucketState.customItems.map((c) => ({
            id: c.id,
            label: c.label,
            category: c.category,
            completed: c.completed,
            addedCustom: true,
          })),
        ],
      },
    };
  }
  return comp;
}

export function listInvitationsForSession(
  sessionKey?: string | null,
  uid?: string | null,
): PartnerInvitation[] {
  if (!sessionKey && !uid) return [];
  const db = readDb();
  return Object.values(db.invitations)
    .filter((i) => ownsInvitation(i, sessionKey, uid))
    .map((i) => ({
      inviteId: i.inviteId,
      token: ownsRecord(
        { sessionKey: i.creatorSessionKey, ownerUid: i.creatorUid },
        sessionKey,
        uid,
      )
        ? i.token
        : "",
      creatorDisplayName: i.creatorDisplayName,
      assessmentSlug: i.assessmentSlug,
      assessmentVersion: i.assessmentVersion,
      mode: i.mode,
      creatorResultId: i.creatorResultId,
      creatorSharing: i.creatorSharing,
      status:
        i.status === "pending" && new Date(i.expiresAt).getTime() <= Date.now()
          ? "expired"
          : i.status,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
      partnerResultId: i.partnerResultId,
      compatibilityId: i.compatibilityId,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function revokeInvitationForSession(
  inviteId: string,
  sessionKey?: string | null,
  uid?: string | null,
): boolean {
  const db = readDb();
  const inv = db.invitations[inviteId];
  if (!inv || !ownsInvitation(inv, sessionKey, uid)) return false;
  inv.status = "revoked";
  db.invitations[inviteId] = inv;
  if (inv.compatibilityId && db.compatibilities[inv.compatibilityId]) {
    db.compatibilities[inv.compatibilityId].revoked = true;
  }
  writeDb(db);
  return true;
}

export function deleteAllSessionData(
  sessionKey?: string | null,
  uid?: string | null,
): { deletedSubmissions: number; deletedInvitations: number } {
  const db = readDb();
  let deletedSubmissions = 0;
  let deletedInvitations = 0;

  for (const [id, sub] of Object.entries(db.submissions)) {
    if (ownsRecord(sub, sessionKey, uid)) {
      delete db.submissions[id];
      deletedSubmissions += 1;
    }
  }

  for (const [id, inv] of Object.entries(db.invitations)) {
    if (ownsInvitation(inv, sessionKey, uid)) {
      if (inv.compatibilityId) {
        delete db.compatibilities[inv.compatibilityId];
        delete db.sharedBucketLists[inv.compatibilityId];
      }
      delete db.invitations[id];
      deletedInvitations += 1;
    }
  }

  for (const [mrId, mr] of Object.entries(db.multiRaterInvites)) {
    if (
      ownsRecord(
        { sessionKey: mr.ownerSessionKey, ownerUid: mr.ownerUid },
        sessionKey,
        uid,
      )
    ) {
      delete db.multiRaterInvites[mrId];
      delete db.multiRaterSubmissions[mrId];
    }
  }

  if (sessionKey) {
    delete db.userPrivacyPrefs[sessionKey];
    delete db.verifiedEmailSessions[sessionKey];
  }
  if (uid) {
    for (const [key, pref] of Object.entries(db.userPrivacyPrefs)) {
      if (pref.uid === uid) {
        delete db.userPrivacyPrefs[key];
      }
    }
  }

  cleanDependentData(db);
  pushAuditEvent(db, {
    eventType: "data_deleted",
    status: "ok",
    detail: `Deleted ${deletedSubmissions} submissions and ${deletedInvitations} invitations`,
  });
  writeDb(db);
  return { deletedSubmissions, deletedInvitations };
}

export function claimGuestSessionData(params: {
  sessionKey: string;
  uid: string;
  email?: string;
  displayName?: string;
}): { claimedSubmissions: number; claimedInvitations: number } {
  const db = readDb();
  let claimedSubmissions = 0;
  let claimedInvitations = 0;

  for (const sub of Object.values(db.submissions)) {
    if (sub.sessionKey === params.sessionKey && !sub.ownerUid) {
      sub.ownerUid = params.uid;
      claimedSubmissions += 1;
    }
  }

  for (const inv of Object.values(db.invitations)) {
    if (inv.creatorSessionKey === params.sessionKey && !inv.creatorUid) {
      inv.creatorUid = params.uid;
      claimedInvitations += 1;
    }
    if (inv.partnerSessionKey === params.sessionKey && !inv.partnerUid) {
      inv.partnerUid = params.uid;
      claimedInvitations += 1;
    }
  }

  for (const profile of Object.values(db.sharedProfiles))
    if (profile.sessionKey === params.sessionKey && !profile.ownerUid)
      profile.ownerUid = params.uid;
  for (const mr of Object.values(db.multiRaterInvites)) {
    if (mr.ownerSessionKey === params.sessionKey && !mr.ownerUid) {
      mr.ownerUid = params.uid;
    }
  }

  const prevPref = preferenceForIdentity(db, params.sessionKey, params.uid);
  db.userPrivacyPrefs[`uid:${params.uid}`] = {
    sessionKey: params.sessionKey,
    uid: params.uid,
    displayName: prevPref?.displayName || params.displayName,
    verifiedEmail: params.email || prevPref?.verifiedEmail,
    defaultCommunityOptIn: prevPref?.defaultCommunityOptIn ?? false,
    notifyNewTests: prevPref?.notifyNewTests ?? false,
    notifyPartnerReports: prevPref?.notifyPartnerReports ?? false,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  return { claimedSubmissions, claimedInvitations };
}

export function updateBucketListState(params: {
  compatibilityId: string;
  sessionKey?: string | null;
  uid?: string | null;
  toggleItemId?: string;
  addCustomItem?: { label: string; category?: string };
  toggleCustomId?: string;
  removeCustomId?: string;
}): CompatibilityReport | null {
  if (
    !canAccessCompatibility({
      compatibilityId: params.compatibilityId,
      sessionKey: params.sessionKey,
      uid: params.uid,
    })
  ) {
    return null;
  }

  const db = readDb();
  const state: SharedBucketListState = db.sharedBucketLists[
    params.compatibilityId
  ] || {
    compatibilityId: params.compatibilityId,
    completedIds: [],
    customItems: [],
    updatedAt: new Date().toISOString(),
  };

  if (params.toggleItemId) {
    const idx = state.completedIds.indexOf(params.toggleItemId);
    if (idx >= 0) state.completedIds.splice(idx, 1);
    else state.completedIds.push(params.toggleItemId);
  }

  if (params.addCustomItem?.label?.trim()) {
    state.customItems.push({
      id: `custom_${crypto.randomBytes(5).toString("hex")}`,
      label: params.addCustomItem.label.trim().slice(0, 140),
      category: (params.addCustomItem.category || "Shared Custom Ideas").slice(
        0,
        50,
      ),
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (params.toggleCustomId) {
    state.customItems = state.customItems.map((it) =>
      it.id === params.toggleCustomId
        ? { ...it, completed: !it.completed }
        : it,
    );
  }

  if (params.removeCustomId) {
    state.customItems = state.customItems.filter(
      (it) => it.id !== params.removeCustomId,
    );
  }

  state.updatedAt = new Date().toISOString();
  db.sharedBucketLists[params.compatibilityId] = state;
  writeDb(db);

  return getCompatibilityReport(params.compatibilityId);
}

// Multi-Rater Feedback (Test 19)
export function createMultiRaterInvite(params: {
  submissionId: string;
  sessionKey: string;
  uid?: string | null;
  displayName: string;
}): { feedbackInviteId: string; token: string; expiresAt: string } | null {
  const db = readDb();
  const sub = db.submissions[params.submissionId];
  if (!sub || !ownsRecord(sub, params.sessionKey, params.uid)) {
    return null;
  }

  const feedbackInviteId = `mr_${crypto.randomBytes(8).toString("hex")}`;
  const token = crypto.randomBytes(24).toString("base64url");
  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + 14 * 24 * 3600 * 1000,
  ).toISOString();

  db.multiRaterInvites[feedbackInviteId] = {
    feedbackInviteId,
    tokenHash: hashToken(token),
    submissionId: params.submissionId,
    ownerSessionKey: params.sessionKey,
    ...(params.uid ? { ownerUid: params.uid } : {}),
    ownerDisplayName:
      params.displayName.trim().slice(0, 40) || "Someone close to you",
    assessmentSlug: sub.assessmentSlug,
    minRespondents: 3,
    createdAt: createdAt.toISOString(),
    expiresAt,
  };
  db.multiRaterSubmissions[feedbackInviteId] = [];
  writeDb(db);
  return { feedbackInviteId, token, expiresAt };
}

export function getPublicMultiRaterInviteByToken(token: string): {
  invite: Omit<MultiRaterInviteRecord, "tokenHash" | "ownerSessionKey"> | null;
  error?: string;
} {
  const db = readDb();
  const tHash = hashToken(token);
  const found = Object.values(db.multiRaterInvites).find(
    (i) => i.tokenHash === tHash,
  );
  if (!found) return { invite: null, error: "Feedback link is invalid." };
  if (found.revoked)
    return { invite: null, error: "Feedback link was revoked." };
  if (new Date(found.expiresAt).getTime() <= Date.now()) {
    return { invite: null, error: "Feedback link has expired." };
  }
  return {
    invite: {
      feedbackInviteId: found.feedbackInviteId,
      submissionId: found.submissionId,
      ownerDisplayName: found.ownerDisplayName,
      assessmentSlug: found.assessmentSlug,
      minRespondents: found.minRespondents,
      createdAt: found.createdAt,
      expiresAt: found.expiresAt,
    },
  };
}

export function submitMultiRaterResponse(params: {
  token: string;
  relationshipType: MultiRaterSubmissionRecord["relationshipType"];
  answers: Record<string, QuestionAnswer>;
}): {
  ok: boolean;
  respondentCount: number;
  minRespondents: number;
  error?: string;
} {
  const db = readDb();
  const tHash = hashToken(params.token);
  const found = Object.values(db.multiRaterInvites).find(
    (i) => i.tokenHash === tHash,
  );
  if (
    !found ||
    found.revoked ||
    new Date(found.expiresAt).getTime() <= Date.now()
  ) {
    return {
      ok: false,
      respondentCount: 0,
      minRespondents: 3,
      error: "Feedback link unavailable.",
    };
  }

  const list = db.multiRaterSubmissions[found.feedbackInviteId] || [];
  list.push({
    responseId: `mrr_${crypto.randomBytes(6).toString("hex")}`,
    feedbackInviteId: found.feedbackInviteId,
    relationshipType: params.relationshipType,
    answers: params.answers,
    createdAt: new Date().toISOString(),
  });
  db.multiRaterSubmissions[found.feedbackInviteId] = list;
  writeDb(db);
  return {
    ok: true,
    respondentCount: list.length,
    minRespondents: found.minRespondents,
  };
}

export function getMultiRaterSummaryForSubmission(params: {
  submissionId: string;
  sessionKey?: string | null;
  uid?: string | null;
}) {
  if (
    !canAccessResult({
      resultId: params.submissionId,
      sessionKey: params.sessionKey,
      uid: params.uid,
    })
  ) {
    return null;
  }

  const db = readDb();
  const sub = db.submissions[params.submissionId];
  if (!sub) return null;
  const assessment =
    sub.assessmentSnapshot ||
    resolveAssessment(sub.assessmentSlug, sub.assessmentVersion);
  if (!assessment) return null;

  const invites = Object.values(db.multiRaterInvites).filter(
    (i) => i.submissionId === params.submissionId && !i.revoked,
  );
  const allResponses = invites.flatMap(
    (inv) => db.multiRaterSubmissions[inv.feedbackInviteId] || [],
  );
  const minRespondents = invites[0]?.minRespondents ?? 3;

  return {
    inviteCount: invites.length,
    ...computeMultiRaterSummary({
      assessment,
      selfResult: sub.result,
      raterSubmissions: allResponses,
      minRespondents,
    }),
  };
}

// Email verification & delivery
export function createEmailVerificationChallenge(email: string): {
  code: string;
  expiresAt: string;
  normalizedEmail: string;
} {
  const normalized = normalizeEmail(email);
  const emailHash = hashToken(normalized);
  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = hashToken(`${normalized}:${code}`);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const db = readDb();
  db.emailVerifications[emailHash] = {
    emailHash,
    codeHash,
    expiresAt,
    attempts: 0,
  };
  writeDb(db);

  return { code, expiresAt, normalizedEmail: normalized };
}

export function verifyEmailCode(params: {
  email: string;
  code: string;
  sessionKey?: string;
}): { ok: boolean; error?: string } {
  const normalized = normalizeEmail(params.email);
  const emailHash = hashToken(normalized);
  const db = readDb();
  const rec = db.emailVerifications[emailHash];
  if (!rec) {
    return {
      ok: false,
      error: "No pending verification code found for that address.",
    };
  }
  if (rec.attempts >= 5) {
    return {
      ok: false,
      error: "Too many incorrect attempts. Request a new code.",
    };
  }
  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    return {
      ok: false,
      error: "Verification code expired. Request a new code.",
    };
  }

  const candidateHash = hashToken(`${normalized}:${params.code.trim()}`);
  if (candidateHash !== rec.codeHash) {
    rec.attempts += 1;
    db.emailVerifications[emailHash] = rec;
    writeDb(db);
    return { ok: false, error: "Incorrect verification code." };
  }

  rec.verifiedAt = new Date().toISOString();
  db.emailVerifications[emailHash] = rec;
  if (params.sessionKey) {
    const existingList = new Set(
      db.verifiedEmailSessions[params.sessionKey] || [],
    );
    existingList.add(emailHash);
    db.verifiedEmailSessions[params.sessionKey] = Array.from(existingList);
  }
  writeDb(db);
  return { ok: true };
}

export function isEmailVerifiedForSession(
  email: string,
  sessionKey?: string | null,
): boolean {
  if (!sessionKey) return false;
  const normalized = normalizeEmail(email);
  const emailHash = hashToken(normalized);
  const db = readDb();
  const list = db.verifiedEmailSessions[sessionKey] || [];
  return list.includes(emailHash);
}

export function recordEmailDelivery(params: {
  resultId?: string;
  compatibilityId?: string;
  recipientEmail: string;
  mode: EmailDeliveryRecord["mode"];
  status: EmailDeliveryRecord["status"];
  provider: EmailDeliveryRecord["provider"];
  errorSummary?: string;
}): EmailDeliveryRecord {
  const db = readDb();
  const rec: EmailDeliveryRecord = {
    deliveryId: `eml_${crypto.randomBytes(6).toString("hex")}`,
    resultId: params.resultId,
    compatibilityId: params.compatibilityId,
    recipientHash: hashToken(normalizeEmail(params.recipientEmail)),
    mode: params.mode,
    status: params.status,
    provider: params.provider,
    createdAt: new Date().toISOString(),
    errorSummary: params.errorSummary,
  };
  db.emailDeliveries.unshift(rec);
  if (db.emailDeliveries.length > 200) {
    db.emailDeliveries = db.emailDeliveries.slice(0, 200);
  }
  pushAuditEvent(db, {
    eventType: params.status === "sent" ? "email_requested" : "email_failed",
    status: params.status === "sent" ? "ok" : "error",
    detail: `Email mode=${params.mode} status=${params.status} provider=${params.provider}`,
  });
  writeDb(db);
  return rec;
}

function preferenceForIdentity(
  db: PersistedDatabase,
  sessionKey?: string | null,
  uid?: string | null,
): UserPrivacyPreferences | undefined {
  if (uid) {
    const account =
      db.userPrivacyPrefs["uid:" + uid] ||
      Object.values(db.userPrivacyPrefs)
        .filter((p) => p.uid === uid)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (account) return account;
  }
  const guest = sessionKey ? db.userPrivacyPrefs[sessionKey] : undefined;
  return guest && !guest.uid ? guest : undefined;
}
export function getUserPrivacyPreferences(
  sessionKey?: string | null,
  uid?: string | null,
): UserPrivacyPreferences {
  return (
    preferenceForIdentity(readDb(), sessionKey, uid) || {
      sessionKey: sessionKey || "guest",
      uid: uid || undefined,
      defaultCommunityOptIn: false,
      notifyNewTests: false,
      notifyPartnerReports: false,
      updatedAt: new Date().toISOString(),
    }
  );
}
export function upsertUserPrivacyPreferences(
  prefs: Partial<UserPrivacyPreferences> & { sessionKey: string },
): UserPrivacyPreferences {
  const db = readDb(),
    legacy = db.userPrivacyPrefs[prefs.sessionKey];
  if (legacy?.uid && !db.userPrivacyPrefs["uid:" + legacy.uid])
    db.userPrivacyPrefs["uid:" + legacy.uid] = { ...legacy };
  const existing = preferenceForIdentity(db, prefs.sessionKey, prefs.uid) || {
    sessionKey: prefs.sessionKey,
    defaultCommunityOptIn: false,
    notifyNewTests: false,
    notifyPartnerReports: false,
    updatedAt: new Date().toISOString(),
  };
  const next: UserPrivacyPreferences = {
    ...existing,
    ...prefs,
    uid: prefs.uid,
    updatedAt: new Date().toISOString(),
  };
  db.userPrivacyPrefs[prefs.uid ? "uid:" + prefs.uid : prefs.sessionKey] = next;
  writeDb(db);
  return next;
}

export function getCommunityComparisonForResult(params: {
  resultId: string;
  cohortFilter?: CohortFilter;
  includeSyntheticDemo?: boolean;
  mode?: AssessmentMode;
}) {
  const db = readDb();
  const sub = db.submissions[params.resultId];
  if (!sub) return null;
  const assessment =
    sub.assessmentSnapshot ||
    resolveAssessment(sub.assessmentSlug, sub.assessmentVersion);
  if (!assessment) return null;
  if (sub.result.scoringEngineVersion !== brandConfig.scoringEngineVersion)
    return {
      items: [],
      dimensions: [],
      archetypes: [],
      eligibleCohortParticipants: 0,
      suppressedByPrivacyThreshold: true,
      minimumThreshold: brandConfig.communityMinimumThreshold,
      realOptedInCount: 0,
      isSyntheticDemo: false,
    };

  const realOptedIn: OptedInSubmissionRecord[] = Object.values(db.submissions)
    .filter((s) => s.perspective === "primary")
    .map((s) => ({
      submissionId: s.submissionId,
      mode: s.mode,
      participantId: s.ownerUid || s.sessionKey,
      assessmentVersion: s.assessmentVersion,
      scoringEngineVersion: s.result.scoringEngineVersion,
      createdAt: s.createdAt,
      assessmentSlug: s.assessmentSlug,
      consent: s.consent,
      answers: s.answers,
    }));

  if (params.includeSyntheticDemo) {
    const synthetic = generateSyntheticDemoSubmissions(assessment, 84);
    return {
      ...compareUserWithCommunity({
        assessment,
        userAnswers: sub.answers,
        userMode: sub.mode,
        submissions: synthetic,
        cohortFilter: params.cohortFilter,
        isSyntheticDemo: true,
      }),
      realOptedInCount: computeCommunityAggregates({
        assessment,
        mode: sub.mode,
        submissions: realOptedIn,
      }).eligibleCohortParticipants,
      isSyntheticDemo: true,
    };
  }

  return {
    ...compareUserWithCommunity({
      assessment,
      userAnswers: sub.answers,
      userMode: sub.mode,
      submissions: realOptedIn,
      cohortFilter: params.cohortFilter,
      isSyntheticDemo: false,
    }),
    realOptedInCount: computeCommunityAggregates({
      assessment,
      mode: sub.mode,
      submissions: realOptedIn,
    }).eligibleCohortParticipants,
    isSyntheticDemo: false,
  };
}

export function getGlobalCommunityAggregates(params: {
  mode?: AssessmentMode;
  assessmentSlug: string;
  cohortFilter?: CohortFilter;
  includeSyntheticDemo?: boolean;
}) {
  const db = readDb();
  const assessment = resolveAssessmentFromDb(db, params.assessmentSlug);
  if (!assessment) return null;

  const realOptedIn: OptedInSubmissionRecord[] = Object.values(db.submissions)
    .filter(
      (s) =>
        s.assessmentSlug === params.assessmentSlug &&
        s.perspective === "primary",
    )
    .map((s) => ({
      submissionId: s.submissionId,
      mode: s.mode,
      participantId: s.ownerUid || s.sessionKey,
      assessmentVersion: s.assessmentVersion,
      scoringEngineVersion: s.result.scoringEngineVersion,
      createdAt: s.createdAt,
      assessmentSlug: s.assessmentSlug,
      consent: s.consent,
      answers: s.answers,
    }));

  const dataset = params.includeSyntheticDemo
    ? generateSyntheticDemoSubmissions(assessment, 84)
    : realOptedIn;

  const res = computeCommunityAggregates({
    assessment,
    mode: params.mode || "quick",
    submissions: dataset,
    cohortFilter: params.cohortFilter,
    isSyntheticDemo: Boolean(params.includeSyntheticDemo),
  });
  const categories = compareUserWithCommunity({
    assessment,
    userAnswers: {},
    userMode: params.mode || "quick",
    submissions: dataset,
    cohortFilter: params.cohortFilter,
    isSyntheticDemo: Boolean(params.includeSyntheticDemo),
  });

  return {
    aggregates: res.aggregates,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    dimensions: categories.dimensions,
    archetypes: categories.archetypes,
    eligibleCohortParticipants: res.eligibleCohortParticipants,
    suppressedByPrivacyThreshold: res.suppressedByPrivacyThreshold,
    realOptedInCount: computeCommunityAggregates({
      assessment,
      mode: params.mode || "quick",
      submissions: realOptedIn,
    }).eligibleCohortParticipants,
    isSyntheticDemo: Boolean(params.includeSyntheticDemo),
    questions: assessment.questions.map((q) => ({
      questionId: q.id,
      prompt: q.prompt,
      sectionTitle: q.sectionTitle,
      aggregate: res.aggregates[q.id],
    })),
  };
}

export function listEditorialAuditItems(): ReferenceChartItem[] {
  const db = readDb();
  return referenceChartAuditItems.map((item) => {
    const override = db.editorialOverrides[item.chartId];
    return override
      ? {
          ...item,
          editorialStatus: override.editorialStatus,
          editorialNotes: override.editorialNotes,
        }
      : item;
  });
}

export function updateEditorialAuditItem(
  chartId: string,
  editorialStatus: ReferenceChartItem["editorialStatus"],
  editorialNotes: string,
): ReferenceChartItem | null {
  const base = referenceChartAuditItems.find((i) => i.chartId === chartId);
  if (!base) return null;
  const db = readDb();
  db.editorialOverrides[chartId] = { editorialStatus, editorialNotes };
  pushAuditEvent(db, {
    eventType: "admin_update",
    status: "ok",
    detail: `Editorial status updated for ${chartId} -> ${editorialStatus}`,
  });
  writeDb(db);
  return { ...base, editorialStatus, editorialNotes };
}

export function getEmailTemplates(): EmailTemplateConfig {
  const db = readDb();
  return db.emailTemplates || DEFAULT_EMAIL_TEMPLATES;
}

export function saveEmailTemplates(
  patch: Partial<Omit<EmailTemplateConfig, "updatedAt">>,
): EmailTemplateConfig {
  const db = readDb();
  const next: EmailTemplateConfig = {
    ...(db.emailTemplates || DEFAULT_EMAIL_TEMPLATES),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  db.emailTemplates = next;
  pushAuditEvent(db, {
    eventType: "admin_update",
    status: "ok",
    detail: "Updated transactional email templates",
  });
  writeDb(db);
  return next;
}

export function getAdminTelemetrySummary() {
  const db = readDb();
  const submissions = Object.values(db.submissions);
  const bySlug: Record<string, { total: number; optedIn: number }> = {};
  for (const s of submissions) {
    if (!bySlug[s.assessmentSlug])
      bySlug[s.assessmentSlug] = { total: 0, optedIn: 0 };
    bySlug[s.assessmentSlug].total += 1;
    if (s.consent.optInCommunityStats) bySlug[s.assessmentSlug].optedIn += 1;
  }
  return {
    totalSubmissions: submissions.length,
    totalInvitations: Object.keys(db.invitations).length,
    totalCompatibilities: Object.keys(db.compatibilities).length,
    totalEmailDeliveries: db.emailDeliveries.length,
    byAssessment: bySlug,
    recentAuditEvents: db.auditEvents.slice(0, 40),
  };
}

export function createSharedProfile(params: {
  sessionKey: string;
  uid?: string | null;
  displayName: string;
  expiresInHours: number;
  selections: Array<ResultShareSelection & { resultId: string }>;
}) {
  const db = readDb();
  if (!params.selections.length || params.selections.length > 8)
    throw new Error("Select between one and eight results to share.");
  if (
    !Number.isFinite(params.expiresInHours) ||
    params.expiresInHours < 1 ||
    params.expiresInHours > 720
  )
    throw new Error("Choose an expiration between one hour and thirty days.");
  const results = params.selections.map((selection) => {
    const submission = db.submissions[selection.resultId];
    if (
      !submission ||
      (submission.ownerUid
        ? submission.ownerUid !== params.uid
        : submission.sessionKey !== params.sessionKey)
    )
      throw new Error(
        "Every shared result must be owned by this session or account.",
      );
    return projectResultForSharing(submission.result, selection);
  });
  const profileId = `share_${crypto.randomBytes(12).toString("hex")}`,
    token = crypto.randomBytes(32).toString("base64url");
  const createdAt = new Date().toISOString(),
    expiresAt = new Date(
      Date.now() + params.expiresInHours * 3600000,
    ).toISOString();
  db.sharedProfiles[profileId] = {
    profileId,
    tokenHash: hashToken(token),
    sessionKey: params.sessionKey,
    ...(params.uid ? { ownerUid: params.uid } : {}),
    sourceResultIds: params.selections.map((s) => s.resultId),
    view: {
      displayName:
        params.displayName.trim().slice(0, 60) || "A discovery profile",
      createdAt,
      expiresAt,
      results,
    },
    revoked: false,
  };
  writeDb(db);
  return { profileId, token, expiresAt };
}
export function getPublicSharedProfile(
  token: string,
): SharedProfileView | null {
  if (token.length < 32 || token.length > 100) return null;
  const db = readDb(),
    hashed = hashToken(token);
  const record = Object.values(db.sharedProfiles).find(
    (s) => s.tokenHash === hashed,
  );
  if (
    !record ||
    record.revoked ||
    Date.parse(record.view.expiresAt) <= Date.now() ||
    record.sourceResultIds.some((id) => !db.submissions[id])
  )
    return null;
  return structuredClone(record.view);
}
export function listSharedProfiles(
  sessionKey: string | null,
  uid?: string | null,
) {
  return Object.values(readDb().sharedProfiles)
    .filter((record) =>
      record.ownerUid
        ? record.ownerUid === uid
        : record.sessionKey === sessionKey,
    )
    .map((record) => ({
      profileId: record.profileId,
      displayName: record.view.displayName,
      expiresAt: record.view.expiresAt,
      createdAt: record.view.createdAt,
      revoked: record.revoked,
      resultCount: record.view.results.length,
    }));
}
export function revokeSharedProfile(
  profileId: string,
  sessionKey: string | null,
  uid?: string | null,
): boolean {
  const db = readDb(),
    record = db.sharedProfiles[profileId];
  if (
    !record ||
    (record.ownerUid
      ? record.ownerUid !== uid
      : record.sessionKey !== sessionKey)
  )
    return false;
  record.revoked = true;
  writeDb(db);
  return true;
}

export function revokeAccountSessions(uid: string) {
  const db = readDb();
  db.revokedAccountSessions[hashToken(uid)] = Date.now();
  writeDb(db);
}
export function isAccountSessionRevoked(uid: string, issuedAt: number) {
  const at = readDb().revokedAccountSessions[hashToken(uid)];
  return Boolean(at && issuedAt <= at);
}

export function getCommunityReadiness(mode: AssessmentMode = "quick") {
  const db = readDb();
  return publishedAssessmentsFromDb(db)
    .filter((a) => a.status === "published" && a.supportsCommunityComparison)
    .map((a) => {
      const latest = new Map<string, StoredSubmission>();
      for (const sub of Object.values(db.submissions))
        if (
          sub.assessmentSlug === a.slug &&
          sub.assessmentVersion === a.version &&
          sub.result.scoringEngineVersion ===
            brandConfig.scoringEngineVersion &&
          sub.mode === mode &&
          sub.perspective === "primary"
        ) {
          const key = sub.ownerUid || sub.sessionKey;
          const prior = latest.get(key);
          if (!prior || sub.createdAt >= prior.createdAt) latest.set(key, sub);
        }
      const count = [...latest.values()].filter(
        (s) =>
          s.consent.optInCommunityStats &&
          s.result.radar.some((d) => d.answeredCount > 0),
      ).length;
      return {
        slug: a.slug,
        title: a.title,
        category: a.category,
        realOptedInCount: count,
        minimumThreshold: brandConfig.communityMinimumThreshold,
        unlocked: count >= brandConfig.communityMinimumThreshold,
      };
    });
}
