import { describe, expect, it } from "vitest";
import { hasMeaningfulAnswer } from "@/lib/assessment/answers";
describe("Assessment progress", () => {
  it("does not count importance-only, skipped, or empty selections as answers", () => {
    expect(
      hasMeaningfulAnswer({
        questionId: "q",
        updatedAt: "",
        importance: "essential",
      }),
    ).toBe(false);
    expect(
      hasMeaningfulAnswer({ questionId: "q", updatedAt: "", customValue: [] }),
    ).toBe(false);
    expect(
      hasMeaningfulAnswer({
        questionId: "q",
        updatedAt: "",
        enjoyment: 5,
        skipped: true,
      }),
    ).toBe(false);
  });
  it("accepts an explicit zero and a privacy answer without inventing a numeric score", () => {
    expect(
      hasMeaningfulAnswer({ questionId: "q", updatedAt: "", customValue: 0 }),
    ).toBe(true);
    expect(
      hasMeaningfulAnswer({
        questionId: "q",
        updatedAt: "",
        enjoyment: "prefer_not_to_answer",
      }),
    ).toBe(true);
  });
});
