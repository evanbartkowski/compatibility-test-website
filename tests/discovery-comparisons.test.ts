import { describe, expect, it } from "vitest";
import { intimacyPartnerPreferencesAssessment as base } from "@/data/assessments/intimacy-partner-preferences";
import {
  compareUserWithCommunity,
  generateSyntheticDemoSubmissions,
  type OptedInSubmissionRecord,
} from "@/lib/assessment/community";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { versionTwoAssessments as builtInAssessments } from "@/data/assessments/catalog";
import type {
  AssessmentDefinition,
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";

const assessment: AssessmentDefinition = {
  ...base,
  slug: "comparison-fixture",
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  dimensions: [
    {
      key: "openness",
      label: "Openness",
      description: "Preference for new experiences",
    },
  ],
  questions: [
    {
      ...base.questions[0],
      id: "openness",
      inputType: "rating_scale",
      dimensionWeights: { openness: 1 },
      scaleConfig: { min: 1, max: 5, minLabel: "Familiar", maxLabel: "New" },
      quickDiscovery: true,
    },
  ],
};
const answer = (value: number): Record<string, QuestionAnswer> => ({
  openness: {
    questionId: "openness",
    customValue: value,
    updatedAt: "2026-11-20T00:00:00Z",
  },
});
const submissions: OptedInSubmissionRecord[] = [1, 3, 5].map((value, i) => ({
  submissionId: `sample-${i}`,
  assessmentSlug: assessment.slug,
  answers: answer(value),
  consent: {
    confirmedAdult18Plus: true,
    acceptedPrivacyTerms: true,
    optInCommunityStats: true,
    consentedAt: "2026-11-20T00:00:00Z",
  },
}));
const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};

describe("Category population benchmarks", () => {
  it("generates valid choice answers for clearly separated synthetic chart previews", () => {
    const love = builtInAssessments.find((a) =>
      a.questions.some((q) => q.options?.length),
    )!;
    const samples = generateSyntheticDemoSubmissions(love, 60);
    const choice = love.questions.find((q) => q.options?.length)!;
    expect(samples[0].answers[choice.id].customValue).toBeDefined();
    const comparison = compareUserWithCommunity({
      assessment: love,
      userAnswers: samples[0].answers,
      submissions: samples,
      isSyntheticDemo: true,
    });
    expect(comparison.dimensions.some((d) => d.available)).toBe(true);
    expect(comparison.dimensions.every((d) => d.isSyntheticDemo)).toBe(true);
  });
  it("compares actual category scores from rating inputs with a midrank percentile", () => {
    const result = compareUserWithCommunity({
      assessment,
      userAnswers: answer(3),
      submissions,
      minimumThreshold: 3,
    });
    expect(result.dimensions?.[0]).toMatchObject({
      dimension: "openness",
      userScore: 50,
      communityMean: 50,
      percentile: 50,
      respondentCount: 3,
      available: true,
    });
  });
  it("suppresses a category whose scored respondents are below the threshold", () => {
    const result = compareUserWithCommunity({
      assessment,
      userAnswers: answer(5),
      submissions: [
        ...submissions.slice(0, 2),
        { ...submissions[2], answers: {} },
      ],
      minimumThreshold: 3,
    });
    expect(result.dimensions?.[0]).toMatchObject({
      available: false,
      communityMean: null,
      percentile: null,
      respondentCount: 2,
    });
  });
  it("counts one latest response per participant and excludes incompatible assessment versions", () => {
    const result = compareUserWithCommunity({
      assessment,
      userAnswers: answer(3),
      minimumThreshold: 3,
      submissions: [
        { ...submissions[0], participantId: "same-person" },
        { ...submissions[1], participantId: "same-person" },
        { ...submissions[2], assessmentVersion: "obsolete" },
      ],
    });
    expect(result.eligibleCohortParticipants).toBe(1);
  });
});

describe("Compatibility evidence and privacy", () => {
  it("uses only jointly answered questions when a category has partial overlap", () => {
    const definition = {
      ...assessment,
      questions: [
        assessment.questions[0],
        { ...assessment.questions[0], id: "other" },
        { ...assessment.questions[0], id: "third" },
      ],
    };
    const report = computeCoupleCompatibility({
      compatibilityId: "partial",
      inviteId: "invite",
      assessment: definition,
      mode: "quick",
      primaryAnswers: {
        ...answer(5),
        other: { questionId: "other", customValue: 5, updatedAt: "" },
      },
      partnerAnswers: {
        ...answer(5),
        third: { questionId: "third", customValue: 1, updatedAt: "" },
      },
      creatorSharing: sharing,
      partnerSharing: sharing,
    });
    expect(report.bothAnsweredCount).toBe(1);
    expect(report.dimensionScores[0].score).toBe(100);
  });
  it("keeps every compatibility strategy unmeasured when both profiles are empty", () => {
    for (const definition of builtInAssessments.filter(
      (a) => a.supportsPartnerMatching,
    )) {
      const report = computeCoupleCompatibility({
        compatibilityId: "empty",
        inviteId: "invite",
        assessment: definition,
        mode: "quick",
        primaryAnswers: {},
        partnerAnswers: {},
        creatorSharing: sharing,
        partnerSharing: sharing,
      });
      expect(report.overallScore, definition.slug).toBe(0);
      expect(report.bothAnsweredCount, definition.slug).toBe(0);
      expect(
        report.dimensionScores.every((d) => d.score === null),
        definition.slug,
      ).toBe(true);
    }
  });
  it("does not count answers to different questions as a shared pair", () => {
    const definition = {
      ...assessment,
      questions: [
        assessment.questions[0],
        { ...assessment.questions[0], id: "other" },
      ],
    };
    const report = computeCoupleCompatibility({
      compatibilityId: "disjoint",
      inviteId: "invite",
      assessment: definition,
      mode: "quick",
      primaryAnswers: answer(5),
      partnerAnswers: {
        other: { questionId: "other", customValue: 5, updatedAt: "" },
      },
      creatorSharing: sharing,
      partnerSharing: sharing,
    });
    expect(report.overallScore).toBe(0);
    expect(report.bothAnsweredCount).toBe(0);
  });
  it("does not turn unanswered category defaults into perfect compatibility", () => {
    const report = computeCoupleCompatibility({
      compatibilityId: "empty",
      inviteId: "invite",
      assessment,
      mode: "quick",
      primaryAnswers: {},
      partnerAnswers: {},
      creatorSharing: sharing,
      partnerSharing: sharing,
    });
    expect(report.overallScore).toBe(0);
    expect(report.dimensionScores.every((d) => d.score === null)).toBe(true);
    expect(report.provisional).toBe(true);
  });
  it("does not leak hidden category values in explanations or highlights", () => {
    const privateSharing = {
      ...sharing,
      shareCategoryScores: false,
      shareAlignedHighlights: false,
      shareComplementaryHighlights: false,
    };
    const report = computeCoupleCompatibility({
      compatibilityId: "private",
      inviteId: "invite",
      assessment,
      mode: "quick",
      primaryAnswers: answer(5),
      partnerAnswers: answer(1),
      creatorSharing: privateSharing,
      partnerSharing: sharing,
    });
    expect(report.dimensionScores[0].note).toBe(
      "Hidden by participant sharing preferences.",
    );
    expect(report.whereYouDiffer).toEqual([]);
    expect(report.coupleInsights).toEqual([]);
  });
});
