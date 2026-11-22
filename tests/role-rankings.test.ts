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

  it("calculates multi-category influences and synthesis for the kink test", () => {
    const assessment = getAssessmentBySlug("sexual-interests-curiosity-map")!;
    expect(assessment).toBeDefined();

    // Affirm spanking, brat taming, impact, and dominant items
    const answers = Object.fromEntries(
      assessment.questions.map((q) => {
        const isImpact = q.topicTags?.some((t) => t.includes("impact") || t.includes("spanking"));
        const isTamer = q.topicTags?.some((t) => t.includes("brat_tamer"));
        const isDominant = q.topicTags?.some((t) => t.includes("dominant"));
        const value = isTamer || isImpact || isDominant ? 7 : 2;
        return [q.id, { questionId: q.id, customValue: value, updatedAt: "" }];
      })
    );

    const ranked = rankAssessmentRoles(assessment, answers);
    expect(ranked.length).toBeGreaterThan(15);

    // Brat tamer, impact, dominant, and bdsm should all score high
    const bratTamer = ranked.find((r) => r.key === "brat_tamer");
    const impact = ranked.find((r) => r.key === "impact");
    const dominant = ranked.find((r) => r.key === "dominant");
    const bdsm = ranked.find((r) => r.key === "bdsm");

    expect(bratTamer).toBeDefined();
    expect(impact).toBeDefined();
    expect(dominant).toBeDefined();
    expect(bdsm).toBeDefined();

    expect(bratTamer!.percent).toBeGreaterThanOrEqual(75);
    expect(impact!.percent).toBeGreaterThanOrEqual(75);
    expect(dominant!.percent).toBeGreaterThanOrEqual(75);
    expect(bdsm!.percent).toBeGreaterThanOrEqual(70);

    // Masochist and submissive should be low
    const sub = ranked.find((r) => r.key === "submissive");
    if (sub) {
      expect(sub.percent).toBeLessThan(35);
    }
  });

  it("calculates multi-category influences and synthesis for the BDSM test", () => {
    const assessment = getAssessmentBySlug("bdsm-power-dynamics-test")!;
    expect(assessment).toBeDefined();

    // Affirm brat tamer, sadist, dominant, impact
    const answers = Object.fromEntries(
      assessment.questions.map((q) => {
        const isTarget = q.topicTags?.some(
          (t) =>
            t.includes("brat_tamer") ||
            t.includes("sadist") ||
            t.includes("dominant") ||
            t.includes("impact")
        );
        const value = isTarget ? 7 : 1;
        return [q.id, { questionId: q.id, customValue: value, updatedAt: "" }];
      })
    );

    const ranked = rankAssessmentRoles(assessment, answers);
    const bratTamer = ranked.find((r) => r.key === "brat_tamer")!;
    const sadist = ranked.find((r) => r.key === "sadist")!;
    const dominant = ranked.find((r) => r.key === "dominant")!;
    const bdsm = ranked.find((r) => r.key === "bdsm")!;

    expect(bratTamer.percent).toBeGreaterThanOrEqual(75);
    expect(sadist.percent).toBeGreaterThanOrEqual(75);
    expect(dominant.percent).toBeGreaterThanOrEqual(75);
    expect(bdsm.percent).toBeGreaterThanOrEqual(75);
  });
});
