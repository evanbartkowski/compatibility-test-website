import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import type { AssessmentDefinition } from "@/lib/assessment/types";
let store: typeof import("@/lib/server/store");
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "truth-desire-version-tests-"),
);
beforeAll(async () => {
  vi.stubEnv("BETWEEN_US_DATA_DIR", directory);
  store = await import("@/lib/server/store");
});
afterAll(() => {
  vi.unstubAllEnvs();
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith("truth-desire-version-tests-")
  )
    fs.rmSync(directory, { recursive: true, force: true });
});
const template = getAssessmentBySlug("big-five-personality-profile")!;
const definition = (slug: string): AssessmentDefinition => ({
  ...structuredClone(template),
  slug,
  id: slug,
  version: "1.0.0",
});
describe("Stored community cohort integrity", () => {
  it("keeps quick and deep participants in separate matching cohorts", () => {
    const a = definition("mode-cohort-test");
    store.saveCustomAssessment(a);
    const consent = {
      confirmedAdult18Plus: true,
      acceptedPrivacyTerms: true,
      optInCommunityStats: true,
      consentedAt: "",
    };
    const quick = store.saveAssessmentSubmission({
      sessionKey: "quick-person",
      assessmentSlug: a.slug,
      mode: "quick",
      perspective: "primary",
      consent,
      answers: {},
    });
    store.saveAssessmentSubmission({
      sessionKey: "deep-person",
      assessmentSlug: a.slug,
      mode: "complete",
      perspective: "primary",
      consent,
      answers: {},
    });
    expect(
      store.getCommunityComparisonForResult({ resultId: quick.submissionId })
        ?.eligibleCohortParticipants,
    ).toBe(1);
    expect(
      store.getGlobalCommunityAggregates({
        assessmentSlug: a.slug,
        mode: "quick",
      })?.eligibleCohortParticipants,
    ).toBe(1);
    expect(
      store.getGlobalCommunityAggregates({
        assessmentSlug: a.slug,
        mode: "complete",
      })?.eligibleCohortParticipants,
    ).toBe(1);
  });
});
describe("Versioned authoring", () => {
  it("resolves original scoring versions while publishing only the curated defaults", () => {
    expect(
      store.resolveAssessment("emotional-availability-reflection")?.version,
    ).toBe("6.0.0");
    expect(
      store.resolveAssessment("intimacy-partner-preferences", "2.0.0")
        ?.scoringStrategy,
    ).toBe("intimacy_weighted");
    expect(
      store.resolveAssessment("private-fantasy-matcher", "2.0.0")?.questions
        .length,
    ).toBeGreaterThan(0);
    expect(store.resolveAssessment("private-fantasy-matcher")).toBeUndefined();
    expect(
      store.listPublishedAssessments().filter((a) => a.version === "6.0.0"),
    ).toHaveLength(6);
  });
  it("keeps a live version available while a new draft is edited and unpublishes only explicitly", () => {
    const a = definition("live-draft-test");
    store.saveCustomAssessment(a);
    store.saveCustomAssessment({
      ...a,
      version: "1.1.0",
      status: "draft",
      questions: a.questions.map((q, i) =>
        i ? q : { ...q, prompt: "A future revision question." },
      ),
    });
    expect(store.resolveAssessment(a.slug)?.version).toBe("1.0.0");
    expect(
      store.listPublishedAssessments().some((test) => test.slug === a.slug),
    ).toBe(true);
    store.unpublishAssessment(a.slug);
    expect(store.resolveAssessment(a.slug)).toBeUndefined();
    expect(store.resolveAssessment(a.slug, "1.0.0")?.questions[0].prompt).toBe(
      a.questions[0].prompt,
    );
  });
  it("archives a published definition and refuses changed scoring under its existing version", () => {
    const original = definition("immutable-test");
    store.saveCustomAssessment(original);
    const changed = {
      ...original,
      questions: original.questions.map((q, i) =>
        i ? q : { ...q, prompt: "A meaningfully different question." },
      ),
    };
    expect(() => store.saveCustomAssessment(changed)).toThrow(/version/i);
    store.saveCustomAssessment({ ...changed, version: "2.0.0" });
    expect(
      store.resolveAssessment(original.slug, "1.0.0")?.questions[0].prompt,
    ).toBe(original.questions[0].prompt);
  });
  it("rejects invalid scoring references before a test is published", () => {
    const invalid = definition("invalid-weights");
    invalid.questions[0].dimensionWeights = { nonexistent: 1 };
    expect(() => store.saveCustomAssessment(invalid)).toThrow(/dimension/i);
  });
  it("does not accept public submissions to an unpublished draft", () => {
    const draft = { ...definition("private-draft"), status: "draft" as const };
    store.saveCustomAssessment(draft);
    expect(() =>
      store.saveAssessmentSubmission({
        sessionKey: "guest",
        assessmentSlug: draft.slug,
        mode: "quick",
        perspective: "primary",
        answers: {},
        consent: {
          confirmedAdult18Plus: true,
          acceptedPrivacyTerms: true,
          optInCommunityStats: false,
          consentedAt: "",
        },
      }),
    ).toThrow(/published/i);
  });
});
describe("Saved partner comparisons", () => {
  it("reuses only an owned result and completes an invitation once", () => {
    const test = definition("saved-match");
    store.saveCustomAssessment(test);
    const consent = {
      confirmedAdult18Plus: true,
      acceptedPrivacyTerms: true,
      optInCommunityStats: false,
      consentedAt: "",
    };
    const sharing = {
      shareCategoryScores: true,
      shareAlignedHighlights: true,
      shareComplementaryHighlights: true,
      shareSharedCuriosities: true,
      shareHighLevelBoundariesWithoutDetails: true,
      neverExposeRawPrivateAnswers: true,
    };
    const answers = Object.fromEntries(
      test.questions.map((q) => [
        q.id,
        { questionId: q.id, customValue: 4, updatedAt: "" },
      ]),
    );
    const a = store.saveAssessmentSubmission({
      sessionKey: "a",
      assessmentSlug: test.slug,
      mode: "quick",
      perspective: "primary",
      consent,
      answers,
    });
    const b = store.saveAssessmentSubmission({
      sessionKey: "b",
      assessmentSlug: test.slug,
      mode: "quick",
      perspective: "primary",
      consent,
      answers,
    });
    const invite = store.createPartnerInvitationRecord({
      creatorSessionKey: "a",
      creatorResultId: a.submissionId,
      creatorDisplayName: "A",
      creatorSharing: sharing,
    });
    expect(() =>
      store.submitPartnerInvitationResponse({
        token: invite.token,
        partnerSessionKey: "attacker",
        existingResultId: b.submissionId,
        consent,
        partnerSharing: sharing,
      }),
    ).toThrow(/owned|session|unauthorized/i);
    const report = store.submitPartnerInvitationResponse({
      token: invite.token,
      partnerSessionKey: "b",
      existingResultId: b.submissionId,
      consent,
      partnerSharing: sharing,
    });
    expect(report.partnerResult.resultId).toBe(b.submissionId);
    expect(() =>
      store.submitPartnerInvitationResponse({
        token: invite.token,
        partnerSessionKey: "other",
        answers,
        consent,
        partnerSharing: sharing,
      }),
    ).toThrow(/completed/i);
  });
});
describe("Curated shared profile", () => {
  it("publishes only selected summary fields and supports revocation", () => {
    const test = definition("shared-profile-test");
    store.saveCustomAssessment(test);
    const consent = {
      confirmedAdult18Plus: true,
      acceptedPrivacyTerms: true,
      optInCommunityStats: false,
      consentedAt: "",
    };
    const q = test.questions[0];
    const result = store.saveAssessmentSubmission({
      sessionKey: "share-owner",
      assessmentSlug: test.slug,
      mode: "quick",
      perspective: "primary",
      consent,
      answers: { [q.id]: { questionId: q.id, customValue: 4, updatedAt: "" } },
    });
    expect(() =>
      store.createSharedProfile({
        sessionKey: "intruder",
        displayName: "No",
        expiresInHours: 24,
        selections: [
          {
            resultId: result.submissionId,
            dimensionKeys: ["openness"],
            includeArchetype: false,
            includeAssessmentTitle: false,
            allowSensitive: false,
          },
        ],
      }),
    ).toThrow(/owned|unauthorized/i);
    const share = store.createSharedProfile({
      sessionKey: "share-owner",
      displayName: "My profile",
      expiresInHours: 24,
      selections: [
        {
          resultId: result.submissionId,
          dimensionKeys: ["openness"],
          includeArchetype: false,
          includeAssessmentTitle: false,
          allowSensitive: false,
        },
      ],
    });
    const visible = store.getPublicSharedProfile(share.token)!;
    expect(visible.results[0].dimensions.map((d) => d.key)).toEqual([
      "openness",
    ]);
    expect(JSON.stringify(visible)).not.toContain(result.submissionId);
    expect(JSON.stringify(visible)).not.toContain(q.prompt);
    expect(store.revokeSharedProfile(share.profileId, "intruder")).toBe(false);
    expect(store.revokeSharedProfile(share.profileId, "share-owner")).toBe(
      true,
    );
    expect(store.getPublicSharedProfile(share.token)).toBeNull();
  });
});
describe("Claimed account isolation", () => {
  it("keeps account preferences separate from later guest changes and other accounts on the same device", () => {
    store.claimGuestSessionData({
      sessionKey: "settings-device",
      uid: "settings-owner",
    });
    store.upsertUserPrivacyPreferences({
      sessionKey: "settings-device",
      uid: "settings-owner",
      displayName: "Account preference",
      defaultCommunityOptIn: true,
    });
    store.upsertUserPrivacyPreferences({
      sessionKey: "settings-device",
      displayName: "Later guest",
      defaultCommunityOptIn: false,
    });
    store.claimGuestSessionData({
      sessionKey: "settings-device",
      uid: "another-account",
    });
    expect(
      store.getUserPrivacyPreferences("new-device", "settings-owner"),
    ).toMatchObject({
      displayName: "Account preference",
      defaultCommunityOptIn: true,
    });
    expect(store.getUserPrivacyPreferences("settings-device")).toMatchObject({
      displayName: "Later guest",
      defaultCommunityOptIn: false,
    });
  });
  it("requires the account after claiming and invalidates dependent reports on deletion", () => {
    const test = definition("account-owned-test");
    store.saveCustomAssessment(test);
    const record = store.saveAssessmentSubmission({
      sessionKey: "shared-device",
      assessmentSlug: test.slug,
      mode: "quick",
      perspective: "primary",
      answers: {},
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: "",
      },
    });
    store.claimGuestSessionData({
      sessionKey: "shared-device",
      uid: "account-owner",
    });
    expect(
      store.canAccessResult({
        resultId: record.submissionId,
        sessionKey: "shared-device",
      }),
    ).toBe(false);
    expect(store.listSubmissionsForSession("shared-device")).toHaveLength(0);
    expect(
      store.deleteSubmissionForSession({
        resultId: record.submissionId,
        sessionKey: "shared-device",
      }),
    ).toBe(false);
    expect(
      store.canAccessResult({
        resultId: record.submissionId,
        sessionKey: "new-device",
        uid: "account-owner",
      }),
    ).toBe(true);
    expect(store.deleteAllSessionData("shared-device").deletedSubmissions).toBe(
      0,
    );
    expect(
      store.deleteAllSessionData(null, "account-owner").deletedSubmissions,
    ).toBe(1);
  });
});
describe("Adaptive measurement", () => {
  it("excludes stale follow-up answers after their parent response changes", () => {
    const base = template.questions[0];
    const assessment: AssessmentDefinition = {
      ...definition("adaptive-test"),
      scoringStrategy: "dimension_average",
      dimensions: [
        {
          key: "openness",
          label: "Openness",
          description: "Novelty preference",
        },
      ],
      questions: [
        {
          ...base,
          id: "parent",
          dimensionWeights: { openness: 1 },
          scaleConfig: { min: 1, max: 5, minLabel: "Low", maxLabel: "High" },
        },
        {
          ...base,
          id: "followup",
          order: 2,
          dimensionWeights: { openness: 1 },
          scaleConfig: { min: 1, max: 5, minLabel: "Low", maxLabel: "High" },
          branchingCondition: {
            dependsOnQuestionId: "parent",
            operator: "equals",
            value: 5,
          },
        },
      ],
    };
    const result = scoreAssessmentSubmission({
      assessment,
      resultId: "adaptive",
      mode: "complete",
      perspective: "primary",
      createdAt: "",
      answers: {
        parent: { questionId: "parent", customValue: 1, updatedAt: "" },
        followup: { questionId: "followup", customValue: 5, updatedAt: "" },
      },
    });
    expect(result.radar[0].score).toBe(0);
    expect(result.answeredCount).toBe(1);
  });
});
