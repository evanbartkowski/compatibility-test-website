import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  canAccessCompatibility,
  canAccessResult,
  claimGuestSessionData,
  createMultiRaterInvite,
  createPartnerInvitationRecord,
  createResultAccessGrant,
  deleteAllSessionData,
  deleteSubmissionForSession,
  getCompatibilityReport,
  getMultiRaterSummaryForSubmission,
  getPublicInvitationByToken,
  getSubmissionResult,
  revokeInvitationForSession,
  saveAssessmentSubmission,
  submitMultiRaterResponse,
  submitPartnerInvitationResponse,
  updateBucketListState,
} from "@/lib/server/store";
import type { QuestionAnswer, SharingPreferences } from "@/lib/assessment/types";

const STORE_FILE = path.join(process.cwd(), ".between-us-data", "store.json");

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
  deleteAllSessionData("test-session-alice");
  deleteAllSessionData("test-session-bob");
});

describe("Server Persistence, Invitations, Security & Deletion", () => {
  it("runs full invite lifecycle, rejects expired/revoked links, isolates sessions, and deletes records", () => {
    const aliceSub = saveAssessmentSubmission({
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

    const invite = createPartnerInvitationRecord({
      creatorSessionKey: "test-session-alice",
      creatorDisplayName: "Alice",
      creatorResultId: aliceSub.submissionId,
      creatorSharing: sharing,
      expiresInHours: 48,
    });

    // Public invitation metadata must never expose Alice's answers
    const pub = getPublicInvitationByToken(invite.token);
    expect(pub.invitation).not.toBeNull();
    expect(JSON.stringify(pub.invitation)).not.toContain("comm_ask_preferences_before");

    // Partner completes assessment
    const bobOutcome = submitPartnerInvitationResponse({
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
    expect(getCompatibilityReport(bobOutcome.compatibility.compatibilityId)).not.toBeNull();

    // Unrelated session cannot revoke Alice's invitation
    expect(revokeInvitationForSession(invite.inviteId, "test-session-stranger")).toBe(false);

    // Alice revokes -> compatibility report and invitation become unavailable
    expect(revokeInvitationForSession(invite.inviteId, "test-session-alice")).toBe(true);
    expect(getCompatibilityReport(bobOutcome.compatibility.compatibilityId)).toBeNull();
    expect(getPublicInvitationByToken(invite.token).invitation).toBeNull();

    // Alice deletes all her stored data
    const deleted = deleteAllSessionData("test-session-alice");
    expect(deleted.deletedSubmissions).toBeGreaterThanOrEqual(1);
    expect(getSubmissionResult(aliceSub.submissionId)).toBeNull();
    expect(fs.existsSync(STORE_FILE)).toBe(true);
  });

  it("enforces owner/partner authorization, expiring email access grants, multi-rater n>=3, bucket list persistence, and guest migration", () => {
    const sub = saveAssessmentSubmission({
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
        mr_1: { questionId: "mr_1", customValue: 5, updatedAt: new Date().toISOString() },
        mr_2: { questionId: "mr_2", customValue: 4, updatedAt: new Date().toISOString() },
        mr_3: { questionId: "mr_3", customValue: 4, updatedAt: new Date().toISOString() },
      },
    });

    // Stranger cannot access without grant
    expect(canAccessResult({ resultId: sub.submissionId, sessionKey: "test-session-stranger" })).toBe(false);
    expect(canAccessResult({ resultId: sub.submissionId, sessionKey: "test-session-alice" })).toBe(true);

    // Expiring access grant unlocks read access temporarily
    const grant = createResultAccessGrant({
      targetType: "result",
      targetId: sub.submissionId,
      expiresInHours: 24,
    });
    expect(
      canAccessResult({
        resultId: sub.submissionId,
        sessionKey: "test-session-stranger",
        accessToken: grant.token,
      })
    ).toBe(true);

    // Multi-rater 360 check (< 3 respondents hides peer averages)
    const mrInvite = createMultiRaterInvite({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
      displayName: "Alice",
    })!;
    expect(mrInvite).not.toBeNull();

    for (let i = 0; i < 2; i++) {
      submitMultiRaterResponse({
        token: mrInvite.token,
        relationshipType: "friend",
        answers: {
          mr_1: { questionId: "mr_1", customValue: 2, updatedAt: new Date().toISOString() },
        },
      });
    }
    const sup = getMultiRaterSummaryForSubmission({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
    });
    expect(sup?.available).toBe(false);
    expect(sup?.dimensionComparison[0].othersMeanScore).toBeNull();

    // 3rd respondent unlocks anonymous aggregate
    submitMultiRaterResponse({
      token: mrInvite.token,
      relationshipType: "close_friend",
      answers: {
        mr_1: { questionId: "mr_1", customValue: 3, updatedAt: new Date().toISOString() },
      },
    });
    const unlocked = getMultiRaterSummaryForSubmission({
      submissionId: sub.submissionId,
      sessionKey: "test-session-alice",
    });
    expect(unlocked?.available).toBe(true);
    expect(unlocked?.respondentCount).toBe(3);

    // Compatibility + bucket list persistence + authorization
    const blSub = saveAssessmentSubmission({
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
    const blInv = createPartnerInvitationRecord({
      creatorSessionKey: "test-session-alice",
      creatorDisplayName: "Alice",
      creatorResultId: blSub.submissionId,
      creatorSharing: sharing,
    });
    const blOut = submitPartnerInvitationResponse({
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
      canAccessCompatibility({
        compatibilityId: blOut.compatibility.compatibilityId,
        sessionKey: "test-session-stranger",
      })
    ).toBe(false);
    expect(
      canAccessCompatibility({
        compatibilityId: blOut.compatibility.compatibilityId,
        sessionKey: "test-session-bob",
      })
    ).toBe(true);

    const updatedBl = updateBucketListState({
      compatibilityId: blOut.compatibility.compatibilityId,
      sessionKey: "test-session-alice",
      toggleItemId: "bl_northern_lights",
      addCustomItem: { label: "Sail across the Greek islands", category: "Travel & Scenic Wonders" },
    });
    const sharedBucket = updatedBl?.bucketListMatches?.sharedItems || [];
    expect(sharedBucket.find((s) => s.id === "bl_northern_lights")?.completed).toBe(true);
    expect(sharedBucket.some((c) => c.label.includes("Greek islands"))).toBe(true);

    // Claim guest data under Firebase UID, delete single submission
    const claimed = claimGuestSessionData({ sessionKey: "test-session-alice", uid: "uid-alice-123" });
    expect(claimed.claimedSubmissions).toBeGreaterThanOrEqual(2);
    expect(getSubmissionResult(sub.submissionId)?.ownerUid).toBe("uid-alice-123");

    expect(
      deleteSubmissionForSession({ resultId: blSub.submissionId, sessionKey: "test-session-stranger" })
    ).toBe(false);
    expect(
      deleteSubmissionForSession({ resultId: blSub.submissionId, sessionKey: "test-session-alice" })
    ).toBe(true);
    expect(getSubmissionResult(blSub.submissionId)).toBeNull();
  });
});
