import type { QuestionAnswer } from "./types";
export function hasMeaningfulAnswer(
  answer: QuestionAnswer | undefined,
): boolean {
  if (!answer || answer.skipped) return false;
  return (
    answer.enjoyment !== undefined ||
    answer.curiosityLevel !== undefined ||
    answer.partnerWillingness !== undefined ||
    typeof answer.experienceFrequency === "number" ||
    answer.firmBoundary === true ||
    (Array.isArray(answer.customValue)
      ? answer.customValue.length > 0
      : answer.customValue !== undefined && answer.customValue !== "")
  );
}
