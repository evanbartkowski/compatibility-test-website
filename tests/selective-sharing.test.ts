import { describe, expect, it } from "vitest";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import {
  projectResultForSharing,
  type ResultShareSelection,
} from "@/lib/assessment/sharing";
const definition = getAssessmentBySlug("intimacy-partner-preferences")!;
const question = definition.questions[0];
const result = scoreAssessmentSubmission({
  assessment: definition,
  mode: "quick",
  perspective: "primary",
  resultId: "private-id",
  createdAt: "",
  answers: {
    [question.id]: { questionId: question.id, customValue: 7, updatedAt: "" },
  },
});
const selection: ResultShareSelection = {
  dimensionKeys: [],
  includeArchetype: false,
  includeAssessmentTitle: false,
  allowSensitive: false,
};
describe("Explicit result sharing", () => {
  it("requires an explicit selection instead of automatically exporting private results", () => {
    expect(() => projectResultForSharing(result, selection)).toThrow(/select/i);
  });
  it("requires an explicit mature-result acknowledgement", () => {
    expect(() =>
      projectResultForSharing(result, { ...selection, includeArchetype: true }),
    ).toThrow(/sensitive/i);
  });
  it("contains only selected measured dimensions and never private answer material", () => {
    const projection = projectResultForSharing(result, {
      ...selection,
      allowSensitive: true,
      dimensionKeys: [Object.keys(question.dimensionWeights)[0]],
    });
    expect(projection.archetype).toBeUndefined();
    expect(projection.assessmentTitle).toBeUndefined();
    expect(projection.dimensions.map((d) => d.key)).toEqual([
      Object.keys(question.dimensionWeights)[0],
    ]);
    expect(JSON.stringify(projection)).not.toContain(question.prompt);
    expect(JSON.stringify(projection)).not.toContain("private-id");
  });
  it("refuses unmeasured dimensions instead of exporting neutral defaults", () => {
    const unknown = result.radar.find((d) => d.answeredCount === 0)!;
    expect(() =>
      projectResultForSharing(result, {
        ...selection,
        allowSensitive: true,
        dimensionKeys: [unknown.dimension],
      }),
    ).toThrow(/measured/i);
  });
});
