import { describe, expect, it } from "vitest";
import {
  coreAssessments as builtInAssessments,
  getArchivedAssessmentBySlug,
} from "@/data/assessments/catalog";
import {
  inspectAssessmentDefinition,
  selectAssessmentQuestions,
} from "@/lib/assessment/definition";

describe("Substantial assessment question banks", () => {
  it("offers 50–150 useful, distinct questions for every published test", () => {
    for (const assessment of builtInAssessments) {
      expect(assessment.version).toBe("6.0.0");
      expect(assessment.questions.length).toBeGreaterThanOrEqual(50);
      expect(assessment.questions.length).toBeLessThanOrEqual(150);
      expect(inspectAssessmentDefinition(assessment).errors).toEqual([]);
      expect(selectAssessmentQuestions(assessment, "quick", {})).toHaveLength(
        assessment.dimensions!.length * 2,
      );
      const prompts = assessment.questions.map((q) =>
        q.prompt.toLowerCase().replace(/[^a-z0-9]/g, ""),
      );
      expect(new Set(prompts).size).toBe(prompts.length);
      for (const dimension of assessment.dimensions!) {
        const questions = assessment.questions.filter(
          (q) => q.sectionId === dimension.key,
        );
        expect(questions.length).toBeGreaterThanOrEqual(10);
        expect(questions.filter((q) => q.quickDiscovery)).toHaveLength(2);
        if (assessment.slug === "sexual-interests-curiosity-map") {
          expect(questions.every((q) => !q.reverseScored)).toBe(true);
        } else {
          expect(questions.filter((q) => q.reverseScored).length).toBeGreaterThanOrEqual(2);
        }
        expect(
          questions.every(
            (q) =>
              Object.keys(q.dimensionWeights).length === 1 &&
              q.dimensionWeights[dimension.key] === 1,
          ),
        ).toBe(true);
      }
    }
  });

  it("retains the original 30-question definitions for saved results and existing invitations", () => {
    for (const assessment of builtInAssessments) {
      const original = getArchivedAssessmentBySlug(assessment.slug, "3.0.0");
      expect(original?.questions).toHaveLength(assessment.dimensions!.length * 6);
      expect(original?.questions.filter((q) => q.quickDiscovery)).toHaveLength(
        assessment.dimensions!.length * 3,
      );
      expect(original?.questions[0].id).not.toBe(assessment.questions[0].id);
      const v4 = getArchivedAssessmentBySlug(assessment.slug, "4.0.0")!;
      expect(v4.questions[0].id).toBe(original!.questions[0].id);
      expect(v4.questions.length).toBeGreaterThanOrEqual(50);
    }
  });
});
