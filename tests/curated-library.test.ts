import { describe, expect, it } from "vitest";
import { coreAssessments as builtInAssessments } from "@/data/assessments/catalog";
import {
  formatAnswerDisplayLabel,
  scoreAssessmentSubmission,
} from "@/lib/assessment/scoring";

describe("Focused agreement-scale library", () => {
  it("replaces overlapping surveys with nine distinct, substantial assessments", () => {
    expect(builtInAssessments).toHaveLength(9);
    for (const a of builtInAssessments) {
      expect(a.version).toBe("4.0.0");
      expect(a.dimensions!.length).toBeGreaterThanOrEqual(5);
      for (const d of a.dimensions!) {
        const questions = a.questions.filter((q) => q.dimensionWeights[d.key]);
        expect(questions).toHaveLength(
          a.questions.length / a.dimensions!.length,
        );
        expect(questions.filter((q) => q.quickDiscovery)).toHaveLength(10);
        expect(questions.some((q) => q.reverseScored)).toBe(true);
      }
      expect(
        a.questions.every(
          (q) =>
            q.inputType === "rating_scale" &&
            q.scaleConfig?.min === 1 &&
            q.scaleConfig?.max === 7,
        ),
      ).toBe(true);
      expect(new Set(a.questions.map((q) => q.prompt)).size).toBe(
        a.questions.length,
      );
    }
  });
  it("returns category-specific interpretations and evidence coverage without inventing skipped scores", () => {
    const a = builtInAssessments[0];
    const q = a.questions[0];
    const result = scoreAssessmentSubmission({
      assessment: a,
      mode: "complete",
      perspective: "primary",
      resultId: "curation",
      createdAt: "",
      answers: { [q.id]: { questionId: q.id, customValue: 7, updatedAt: "" } },
    });
    const measured = result.radar.find((d) => d.answeredCount)!;
    expect(measured.score).toBe(q.reverseScored ? 0 : 100);
    expect(measured).toHaveProperty("interpretation.meaning");
    expect(measured).toHaveProperty("interpretation.experiment");
    expect(measured).toHaveProperty("interpretation.reflection");
    expect(measured).toHaveProperty("interpretation.possibleTradeoff");
    expect(measured).toHaveProperty(
      "eligibleCount",
      a.questions.filter((item) => item.sectionId === q.sectionId).length,
    );
    expect(result.whatYouAreInto).toBeUndefined();
    expect(result.idealPartner.characteristics).toEqual([]);
    for (const missing of result.radar.filter((d) => !d.answeredCount))
      expect(missing).not.toHaveProperty("interpretation");
  });
  it("uses all seven positions consistently, reverses opposite wording and preserves meaningful answer labels", () => {
    for (const a of builtInAssessments) {
      for (const reverse of [false, true]) {
        const q = a.questions.find(
          (q) => Boolean(q.reverseScored) === reverse,
        )!;
        for (const value of [1, 2, 3, 4, 5, 6, 7]) {
          const answer = {
            questionId: q.id,
            customValue: value,
            updatedAt: "",
          };
          const result = scoreAssessmentSubmission({
            assessment: a,
            mode: "complete",
            perspective: "primary",
            resultId: "scale",
            createdAt: "",
            answers: { [q.id]: answer },
          });
          const d = result.radar.find((d) => d.answeredCount)!;
          expect(d.score).toBe(
            Math.round(((reverse ? 7 - value : value - 1) / 6) * 100),
          );
          expect(d.interpretation?.band).toBe(
            d.score < 40 ? "low" : d.score > 60 ? "high" : "balanced",
          );
          expect(formatAnswerDisplayLabel(q, answer)).not.toContain(" / ");
        }
      }
    }
  });
});
