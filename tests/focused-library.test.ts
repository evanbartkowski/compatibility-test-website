import { describe, expect, it } from "vitest";
import {
  builtInAssessments,
  getArchivedAssessmentBySlug,
} from "@/data/assessments/catalog";
import { inspectAssessmentDefinition } from "@/lib/assessment/definition";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";

describe("Focused assessment library", () => {
  it("gives evidence-led decision makers specific partner language", () => {
    const a = builtInAssessments.find(
      (a) => a.slug === "big-five-personality-profile",
    )!;
    const answers = Object.fromEntries(
      a.questions.map((q) => {
        const value = q.sectionId === "logical_reasoning" ? 7 : 1;
        return [
          q.id,
          {
            questionId: q.id,
            customValue: q.reverseScored ? 8 - value : value,
            updatedAt: "",
          },
        ];
      }),
    );
    const result = scoreAssessmentSubmission({
      assessment: a,
      answers,
      resultId: "logical",
      mode: "complete",
      perspective: "primary",
    });
    expect(result.advice?.focusDimension).toBe("logical_reasoning");
    expect(result.advice?.partnerSearchLine).toMatch(/evidence/i);
  });
  it("publishes sixteen substantial tests instead of overlapping mini-tests", () => {
    expect(builtInAssessments).toHaveLength(16);
    expect(builtInAssessments.filter((a) => a.collection)).toHaveLength(10);
    for (const a of builtInAssessments) {
      expect(a.questions.length).toBeGreaterThanOrEqual(50);
      expect(a.questions.length).toBeLessThanOrEqual(150);
      expect(inspectAssessmentDefinition(a).errors, a.slug).toEqual([]);
      expect(a.adviceProfile).toBeTruthy();
    }
  });
  it("preserves retired tests and earlier measurement versions for results and invitations", () => {
    expect(
      getArchivedAssessmentBySlug("orgasm-pacing-control", "2.0.0")?.questions,
    ).toHaveLength(50);
    expect(
      getArchivedAssessmentBySlug("emotional-availability-reflection", "5.0.0")
        ?.questions,
    ).toHaveLength(50);
    expect(
      builtInAssessments.some((a) => a.slug === "orgasm-pacing-control"),
    ).toBe(false);
  });
});
