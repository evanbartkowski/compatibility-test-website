import type { ScoredAssessmentResult } from "@/lib/assessment/types";

export function ExtraResultNote({ result }: { result: ScoredAssessmentResult }) {
  const score = (key: string) => result.radar.find((d) => d.dimension === key)?.score ?? 50;
  if (result.assessmentSlug === "myers-briggs-type-test") {
    const code = `${score("extraversion") >= 50 ? "E" : "I"}${score("intuition") >= 50 ? "N" : "S"}${score("thinking") >= 50 ? "T" : "F"}${score("judging") >= 50 ? "J" : "P"}`;
    return <p>Your pattern reads {code}. The letters nickname these four scores. They are not a clinical type.</p>;
  }
  if (result.assessmentSlug === "gay-lgbt-attraction-test") {
    const same = score("same_gender");
    const line = same >= 70 ? "mostly same-gender attraction" : same >= 45 ? "a real same-gender pull, mixed with other answers" : "little same-gender attraction in these answers";
    return <p>Same-gender attraction: {same}%. That reads as {line}. This is not a diagnosis.</p>;
  }
  if (result.assessmentSlug === "bias-self-check") {
    return <p>Racial prejudice {score("racial_bias")}%. Anti-gay prejudice {score("anti_gay_bias")}%. A high number means more prejudiced answers, not a type to match on.</p>;
  }
  return null;
}
