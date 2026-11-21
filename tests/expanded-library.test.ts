import { describe, it, expect } from "vitest";
import {
  builtInAssessments,
  coreAssessments,
  legacyAssessments,
  versionTwoAssessments,
} from "@/data/assessments/catalog";
import { majorAssessmentSlugs } from "@/data/assessments/refinements";
import {
  inspectAssessmentDefinition,
  validateAssessmentAnswers,
} from "@/lib/assessment/definition";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import type {
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";
const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};
describe("Expanded library measurement contracts", () => {
  for (const assessment of builtInAssessments)
    it(`${assessment.shortTitle} has a valid measured quick and deep form`, () => {
      expect(inspectAssessmentDefinition(assessment).errors).toEqual([]);
      expect(assessment.purpose).toBeTruthy();
      expect(assessment.scoringNotes?.length).toBeGreaterThan(0);
      if (majorAssessmentSlugs.has(assessment.slug)) {
        expect(assessment.supportsQuickMode).toBe(
          assessment.questions.length > 50,
        );
        expect(assessment.estimatedMinutesQuick).toBeGreaterThanOrEqual(3);
        expect(assessment.estimatedMinutesQuick).toBeLessThanOrEqual(15);
        expect(assessment.estimatedMinutesComplete).toBeGreaterThanOrEqual(10);
        expect(assessment.estimatedMinutesComplete).toBeLessThanOrEqual(35);
      }
      for (const mode of ["quick", "complete"] as const) {
        const answers: Record<string, QuestionAnswer> = Object.fromEntries(
          assessment.questions
            .filter((q) => mode === "complete" || q.quickDiscovery)
            .map((q) => [
              q.id,
              {
                questionId: q.id,
                updatedAt: "",
                ...(q.inputType === "curiosity_map"
                  ? { curiosityLevel: "interested" as const }
                  : q.inputType === "enjoyment_scale" || (q.inputType === "intimacy_profile" && !q.options)
                    ? { enjoyment: 4 as const }
                    : q.inputType === "rating_scale"
                      ? { customValue: q.scaleConfig!.max }
                      : q.inputType === "slider"
                        ? { customValue: q.sliderConfig!.max }
                        : q.options
                          ? {
                              customValue: ["ranking", "multi_select"].includes(
                                q.inputType,
                              )
                                ? q.options.map((o) => o.value)
                                : q.options[0].value,
                            }
                          : {}),
              },
            ]),
        );
        validateAssessmentAnswers(assessment, answers);
        const result = scoreAssessmentSubmission({
          assessment,
          mode,
          perspective: "primary",
          resultId: "fixture",
          answers,
          createdAt: "",
        });
        expect(
          result.radar.every(
            (d) => Number.isFinite(d.score) && d.score >= 0 && d.score <= 100,
          ),
        ).toBe(true);
        expect(result.answeredCount).toBeGreaterThan(0);
      }
    });
  it("retains every original measurement definition", () => {
    expect(legacyAssessments).toHaveLength(30);
    expect(legacyAssessments.every((a) => a.version === "1.0.0")).toBe(true);
    expect(versionTwoAssessments).toHaveLength(31);
    expect(versionTwoAssessments.every((a) => a.version === "2.0.0")).toBe(
      true,
    );
    expect(coreAssessments.every((a) => a.version === "4.0.0")).toBe(true);
  });
  it("rejects forged scales and unknown choices", () => {
    const a = builtInAssessments.find(
      (a) => a.slug === "emotional-availability-reflection",
    )!;
    expect(() =>
      validateAssessmentAnswers(a, {
        [a.questions[0].id]: {
          questionId: a.questions[0].id,
          customValue: 99,
          updatedAt: "",
        },
      }),
    ).toThrow(/scale/);
    expect(() =>
      validateAssessmentAnswers(a, {
        alien: { questionId: "alien", customValue: 3, updatedAt: "" },
      }),
    ).toThrow(/version/);
  });
  it("requires both participants to opt into individual game answer disclosure", () => {
    const assessment = versionTwoAssessments.find(
        (a) => a.slug === "how-well-do-you-know-your-partner",
      )!,
      q = assessment.questions[0];
    const answers = {
      [q.id]: {
        questionId: q.id,
        customValue: q.options![0].value,
        updatedAt: "",
      },
    };
    const base = {
      assessment,
      primaryAnswers: answers,
      partnerAnswers: answers,
      mode: "quick" as const,
      compatibilityId: "comparison",
      inviteId: "invitation",
    };
    expect(
      computeCoupleCompatibility({
        ...base,
        creatorSharing: sharing,
        partnerSharing: sharing,
      }).predictionSummary!.nailedIt,
    ).toEqual([]);
    expect(
      computeCoupleCompatibility({
        ...base,
        creatorSharing: { ...sharing, shareGameAnswerDetails: true },
        partnerSharing: { ...sharing, shareGameAnswerDetails: true },
      }).predictionSummary!.nailedIt,
    ).toHaveLength(1);
  });
});
