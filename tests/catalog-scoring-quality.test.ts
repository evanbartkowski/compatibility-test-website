import { describe, expect, it } from "vitest";
import { builtInAssessments } from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import type {
  QuestionAnswer,
  QuestionDefinition,
} from "@/lib/assessment/types";

function contrastingAnswers(
  q: QuestionDefinition,
): [Partial<QuestionAnswer>, Partial<QuestionAnswer>] {
  if (q.inputType === "rating_scale")
    return [
      { customValue: q.scaleConfig?.min ?? 1 },
      { customValue: q.scaleConfig?.max ?? 5 },
    ];
  if (q.inputType === "slider")
    return [
      { customValue: q.sliderConfig?.min ?? 0 },
      { customValue: q.sliderConfig?.max ?? 100 },
    ];
  if (q.inputType === "curiosity_map")
    return [
      { curiosityLevel: "not_interested" },
      { curiosityLevel: "very_interested" },
    ];
  if (q.inputType === "ranking")
    return [
      { customValue: q.options!.map((o) => o.value) },
      { customValue: q.options!.map((o) => o.value).reverse() },
    ];
  if (q.inputType === "multi_select")
    return [
      { customValue: [q.options![0].value] },
      { customValue: q.options!.map((o) => o.value) },
    ];
  if (q.options?.length)
    return [
      { customValue: q.options[0].value },
      { customValue: q.options[q.options.length - 1].value },
    ];
  return [{ enjoyment: 1 }, { enjoyment: 5 }];
}
describe("Every scored prompt provides signal", () => {
  for (const assessment of builtInAssessments.filter(
    (a) =>
      a.scoringStrategy !== "prediction_accuracy" &&
      a.scoringStrategy !== "would_rather",
  )) {
    it(`${assessment.shortTitle}: contrasting answers change the scored profile`, () => {
      const failures: string[] = [];
      for (const q of assessment.questions) {
        const scores = contrastingAnswers(q).map((patch) =>
          scoreAssessmentSubmission({
            assessment,
            mode: "complete",
            perspective: "primary",
            resultId: "quality",
            createdAt: "2026-11-20T00:00:00Z",
            answers: {
              ...(q.branchingCondition
                ? {
                    [q.branchingCondition.dependsOnQuestionId]: {
                      questionId: q.branchingCondition.dependsOnQuestionId,
                      updatedAt: "",
                      customValue: 3,
                    },
                  }
                : {}),
              [q.id]: { questionId: q.id, updatedAt: "", ...patch },
            },
          }).radar.map((d) => d.score),
        );
        if (JSON.stringify(scores[0]) === JSON.stringify(scores[1]))
          failures.push(q.id);
      }
      expect(failures).toEqual([]);
    });
  }
});
