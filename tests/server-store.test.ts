import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getArchivedAssessmentBySlug } from "@/data/assessments/catalog";
import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
let store: typeof import("@/lib/server/store");
import type {
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "truth-desire-store-tests-"),
);
const STORE_FILE = path.join(directory, "store.json");
beforeAll(async () => {
  vi.stubEnv("BETWEEN_US_DATA_DIR", directory);
  store = await import("@/lib/server/store");
  // Exercise historical workflows in this isolated store with explicit archived publications.
  for (const slug of [
    "intimacy-partner-preferences",
    "how-others-really-see-you",
    "couples-bucket-list-matcher",
  ])
    store.saveCustomAssessment(
      structuredClone(getArchivedAssessmentBySlug(slug)!),
    );
});
afterAll(() => {
  vi.unstubAllEnvs();
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith("truth-desire-store-tests-")
  )
    fs.rmSync(directory, { recursive: true, force: true });
});

const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};

function sampleAnswers(rating: 1 | 5): Record<string, QuestionAnswer> {
  return {
    comm_ask_preferences_before: {
      questionId: "comm_ask_preferences_before",
      enjoyment: rating,
      importance: "essential",
      updatedAt: new Date().toISOString(),
    },
    comm_verbal_checkin: {
      questionId: "comm_verbal_checkin",
      enjoyment: rating,
      importance: "important",
      updatedAt: new Date().toISOString(),
    },
    pace_extended_foreplay: {
      questionId: "pace_extended_foreplay",
      enjoyment: rating,
      importance: "important",
      updatedAt: new Date().toISOString(),
    },
    dyn_partner_takes_lead: {
      questionId: "dyn_partner_takes_lead",
      enjoyment: rating,
      importance: "important",
      updatedAt: new Date().toISOString(),
    },
    pace_aftercare_affection: {
      questionId: "pace_aftercare_affection",
      enjoyment: rating,
      importance: "essential",
      updatedAt: new Date().toISOString(),
    },
  };
}

afterEach(() => {
  // Clean up test records from session keys used in tests
  store.deleteAllSessionData("test-session-alice", "uid-alice-123");
  store.deleteAllSessionData("test-session-bob");
});

describe("Server Persistence, Invitations, Security & Deletion", () => {
  it("runs full invite lifecycle, rejects expired/revoked links, isolates sessions, and deletes records", () => {
    const aliceSub = store.saveAssessmentSubmission({
      sessionKey: "test-session-alice",
      assessmentSlug: "intimacy-partner-preferences",
      mode: "quick",
      perspective: "primary",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: new Date().toISOString(),
      },
      answers: sampleAnswers(5),
    });

    const invite = store.createPartnerInvitationRecord({
      creatorSessionKey: "test-session-alice",
      creatorDisplayName: "Alice",
      creatorResultId: aliceSub.submissionId,
      creatorSharing: sharing,
      expiresInHours: 48,
    });

    // Public invitation metadata must never expose Alice's answers
    const pub = store.getPublicInvitationByToken(invite.token);
    expect(pub.invitation).not.toBeNull();
    expect(JSON.stringify(pub.invitation)).not.toContain(
      "comm_ask_preferences_before",
    );

    // Partner completes assessment
    const bobOutcome = store.submitPartnerInvitationResponse({
      token: invite.token,
      partnerSessionKey: "test-session-bob",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: new Date().toISOString(),
      },
      partnerSharing: sharing,
      answers: {
        comm_ask_preferences_before: {
          questionId: "comm_ask_preferences_before",
          partnerWillingness: "enthusiastically_enjoy",
          importance: "essential",
          updatedAt: new Date().toISOString(),
        },
        comm_verbal_checkin: {
          questionId: "comm_verbal_checkin",
          partnerWillingness: "enthusiastically_enjoy",
          importance: "important",
          updatedAt: new Date().toISOString(),
        },
        pace_extended_foreplay: {
          questionId: "pace_extended_foreplay",
          partnerWillingness: "enthusiastically_enjoy",
          importance: "important",
          updatedAt: new Date().toISOString(),
        },
        dyn_partner_takes_lead: {
          questionId: "dyn_partner_takes_lead",
          partnerWillingness: "enthusiastically_enjoy",
          importance: "important",
          updatedAt: new Date().toISOString(),
        },
        pace_aftercare_affection: {
          questionId: "pace_aftercare_affection",
          partnerWillingness: "enthusiastically_enjoy",
          importance: "essential",
          updatedAt: new Date().toISOString(),
        },
      },
    });

    expect(bobOutcome.compatibility.overallScore).toBeGreaterThan(85);
    expect(
      store.getCompatibilityReport(bobOutcome.compatibility.compatibilityId),
    ).not.toBeNull();

    // Unrelated session cannot revoke Alice's invitation
    expect(
      store.revokeInvitationForSession(
        invite.inviteId,
        "test-session-stranger",
      ),
    ).toBe(false);

    // Alice revokes -> compatibility report and invitation become unavailable
    expect(
      store.revokeInvitationForSession(invite.inviteId, "test-session-alice"),
    ).toBe(true);
    expect(
      store.getCompatibilityReport(bobOutcome.compatibility.compatibilityId),
    ).toBeNull();
    expect(
      store.getPublicInvitationByToken(invite.token).invitation,
    ).toBeNull();

    // Alice deletes all her stored data
    const deleted = store.deleteAllSessionData("test-session-alice");
    expect(deleted.deletedSubmissions).toBeGreaterThanOrEqual(1);
    expect(store.getSubmissionResult(aliceSub.submissionId)).toBeNull();
    expect(fs.existsSync(STORE_FILE)).toBe(true);
  });

  it("enforces owner/partner authorization, expiring email access grants, multi-rater n>=3, bucket list persistence, and guest migration", () => {
    const sub = store.saveAssessmentSubmission({
      sessionKey: "test-session-alice",
      assessmentSlug: "how-others-really-see-you",
      mode: "complete",
      perspective: "primary",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: new Date().toISOString(),
      },
      answers: {
        mr_1: {
          questionId: "mr_1",
          customValue: 5,
          updatedAt: new Date().toISOString(),
        },
        mr_2: {
          questionId: "mr_2",
          customValue: 4,
          updatedAt: new Date().toISOString(),
        },
        mr_3: {
          questionId: "mr_3",
          customValue: 4,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    // Stranger cannot access without grant
    expect(
      store.canAccessResult({
        resultId: sub.submissionId,
        sessionKey: "test-session-stranger",
      }),
    ).toBe(false);
    expect(
      store.canAccessResult({
        resultId: sub.submissionId,
        sessionKey: "test-session-alice",
      }),
    ).toBe(true);

    // Expiring access grant unlocks read access temporarily
    const grant = store.createResultAccessGrant({
      targetType: "result",
      targetId: sub.submissionId,
      expiresInHours: 24,
    });
    expect(
      store.canAccessResult({
        resultId: sub.submissionId,
        sessionKey: "test-session-stranger",
        accessToken: grant.token,
      }),
    ).toBe(true);

    // Multi-rater 360 check (< 3 respondents hides peer averages)
    const mrInvite = store.createMultiRaterInvite({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
      displayName: "Alice",
    })!;
    expect(mrInvite).not.toBeNull();

    for (let i = 0; i < 2; i++) {
      store.submitMultiRaterResponse({
        token: mrInvite.token,
        relationshipType: "friend",
        answers: {
          mr_1: {
            questionId: "mr_1",
            customValue: 2,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }
    const sup = store.getMultiRaterSummaryForSubmission({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
    });
    expect(sup?.available).toBe(false);
    expect(sup?.dimensionComparison[0].othersMeanScore).toBeNull();

    // 3rd respondent unlocks anonymous aggregate
    store.submitMultiRaterResponse({
      token: mrInvite.token,
      relationshipType: "close_friend",
      answers: {
        mr_1: {
          questionId: "mr_1",
          customValue: 3,
          updatedAt: new Date().toISOString(),
        },
      },
    });
    const unlocked = store.getMultiRaterSummaryForSubmission({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
    });
    expect(unlocked?.available).toBe(true);
    expect(unlocked?.respondentCount).toBe(3);

    // Compatibility + bucket list persistence + authorization
    const blSub = store.saveAssessmentSubmission({
      sessionKey: "test-session-alice",
      assessmentSlug: "couples-bucket-list-matcher",
      mode: "complete",
      perspective: "primary",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: new Date().toISOString(),
      },
      answers: {
        bl_northern_lights: {
          questionId: "bl_northern_lights",
          curiosityLevel: "very_interested",
          updatedAt: new Date().toISOString(),
        },
      },
    });
    const blInv = store.createPartnerInvitationRecord({
      creatorSessionKey: "test-session-alice",
      creatorDisplayName: "Alice",
      creatorResultId: blSub.submissionId,
      creatorSharing: sharing,
    });
    const blOut = store.submitPartnerInvitationResponse({
      token: blInv.token,
      partnerSessionKey: "test-session-bob",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: new Date().toISOString(),
      },
      partnerSharing: sharing,
      answers: {
        bl_northern_lights: {
          questionId: "bl_northern_lights",
          curiosityLevel: "interested",
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect(
      store.canAccessCompatibility({
        compatibilityId: blOut.compatibility.compatibilityId,
        sessionKey: "test-session-stranger",
      }),
    ).toBe(false);
    expect(
      store.canAccessCompatibility({
        compatibilityId: blOut.compatibility.compatibilityId,
        sessionKey: "test-session-bob",
      }),
    ).toBe(true);

    const updatedBl = store.updateBucketListState({
      compatibilityId: blOut.compatibility.compatibilityId,
      sessionKey: "test-session-alice",
      toggleItemId: "bl_northern_lights",
      addCustomItem: {
        label: "Sail across the Greek islands",
        category: "Travel & Scenic Wonders",
      },
    });
    const sharedBucket = updatedBl?.bucketListMatches?.sharedItems || [];
    expect(
      sharedBucket.find((s) => s.id === "bl_northern_lights")?.completed,
    ).toBe(true);
    expect(sharedBucket.some((c) => c.label.includes("Greek islands"))).toBe(
      true,
    );

    // Claim guest data under Firebase UID, delete single submission
    const claimed = store.claimGuestSessionData({
      sessionKey: "test-session-alice",
      uid: "uid-alice-123",
    });
    expect(claimed.claimedSubmissions).toBeGreaterThanOrEqual(2);
    expect(store.getSubmissionResult(sub.submissionId)?.ownerUid).toBe(
      "uid-alice-123",
    );

    expect(
      store.deleteSubmissionForSession({
        resultId: blSub.submissionId,
        sessionKey: "test-session-stranger",
      }),
    ).toBe(false);
    expect(
      store.deleteSubmissionForSession({
        resultId: blSub.submissionId,
        sessionKey: "test-session-alice",
        uid: "uid-alice-123",
      }),
    ).toBe(true);
    expect(store.getSubmissionResult(blSub.submissionId)).toBeNull();
  });
});
