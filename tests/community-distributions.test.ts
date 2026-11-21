import { describe, expect, it } from "vitest";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import {
  compareUserWithCommunity,
  type OptedInSubmissionRecord,
} from "@/lib/assessment/community";
import type { AssessmentDefinition } from "@/lib/assessment/types";
const original = getAssessmentBySlug("big-five-personality-profile")!;
const assessment: AssessmentDefinition = {
  ...original,
  slug: "distribution-test",
  dimensions: [
    { key: "openness", label: "Openness", description: "Novelty preference" },
  ],
  questions: [
    {
      ...original.questions[0],
      id: "q",
      dimensionWeights: { openness: 1 },
      scaleConfig: { min: 1, max: 5, minLabel: "Low", maxLabel: "High" },
    },
  ],
};
const answers = (value: number) => ({
  q: { questionId: "q", customValue: value, updatedAt: "" },
});
const samples: OptedInSubmissionRecord[] = [1, 3, 5].map((v, i) => ({
  submissionId: String(i),
  assessmentSlug: assessment.slug,
  answers: answers(v),
  consent: {
    confirmedAdult18Plus: true,
    acceptedPrivacyTerms: true,
    optInCommunityStats: true,
    consentedAt: "",
  },
}));
describe("Measured community distributions", () => {
  it("reports a real histogram and distinguishes strict-below percentage from midrank", () => {
    const comparison = compareUserWithCommunity({
      assessment,
      userAnswers: answers(3),
      submissions: samples,
      minimumThreshold: 3,
    });
    const d = comparison.dimensions[0];
    expect(d.higherThanPercent).toBe(33);
    expect(d.percentile).toBe(50);
    expect(d.histogram?.reduce((n, b) => n + b.count, 0)).toBe(3);
    expect(d.histogram?.[5].count).toBe(1);
    expect(d.histogram?.[9].count).toBe(1);
    expect(comparison.archetypes.reduce((n, a) => n + a.count, 0)).toBe(3);
  });
  it("suppresses distributions and archetype counts when the cohort is too small", () => {
    const comparison = compareUserWithCommunity({
      assessment,
      userAnswers: answers(3),
      submissions: samples,
      minimumThreshold: 50,
    });
    expect(comparison.dimensions[0].histogram).toBeNull();
    expect(comparison.dimensions[0].higherThanPercent).toBeNull();
    expect(comparison.archetypes).toEqual([]);
  });
});
