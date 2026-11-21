import { describe, expect, it } from "vitest";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { compareRoleSets, rankAssessmentRoles } from "@/lib/assessment/role-rankings";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";

describe("BDSM role rankings", () => {
  it("raises submissive and lowers dominant when the answers follow that pattern", () => {
    const assessment = getAssessmentBySlug("bdsm-power-dynamics-test")!;
    const answers = Object.fromEntries(assessment.questions.map((q) => {
      const sub = q.topicTags?.includes("role:submissive");
      const dom = q.topicTags?.includes("role:dominant");
      const value = sub ? 7 : dom ? 1 : 4;
      return [q.id, { questionId: q.id, customValue: value, updatedAt: "" }];
    }));
    const ranked = rankAssessmentRoles(assessment, answers);
    const sub = ranked.find((r) => r.key === "submissive")!;
    const dom = ranked.find((r) => r.key === "dominant")!;
    expect(sub.percent).toBeGreaterThan(80);
    expect(dom.percent).toBeLessThan(20);
    expect(sub.you.startsWith("You ")).toBe(true);
    expect(sub.try.length).toBeGreaterThanOrEqual(2);
    const result = scoreAssessmentSubmission({
      resultId: "sub_role_test",
      assessment,
      mode: "complete",
      perspective: "primary",
      answers,
    });
    expect(result.roleRankings?.[0].key).toBe("submissive");
    const fit = compareRoleSets(ranked, [
      { ...dom, percent: 90 },
      { ...sub, percent: 10 },
    ]);
    expect(fit.complements.some((line) => /Submissive/i.test(line) && /Dominant/i.test(line))).toBe(true);
  });
});
