import { describe, expect, it } from "vitest";
import { builtInAssessments, getArchivedAssessmentBySlug } from "@/data/assessments/catalog";
import { inspectAssessmentDefinition } from "@/lib/assessment/definition";

describe("Focused assessment library", () => {
  it("publishes the core tests and the intimacy collection without dropping archived versions", () => {
    expect(builtInAssessments).toHaveLength(16);
    expect(builtInAssessments.filter((a) => a.collection)).toHaveLength(5);
    for (const a of builtInAssessments) {
      expect(a.questions.length).toBeGreaterThanOrEqual(a.slug === "aftercare-recovery-style" || a.slug === "spicy-would-you-rather" ? 15 : 50);
      expect(a.questions.length).toBeLessThanOrEqual(150);
      expect(inspectAssessmentDefinition(a).errors, a.slug).toEqual([]);
      expect(a.adviceProfile).toBeTruthy();
    }
  });
  it("preserves earlier measurement versions for results and invitations", () => {
    expect(getArchivedAssessmentBySlug("orgasm-pacing-control", "2.0.0")?.questions).toHaveLength(50);
    expect(getArchivedAssessmentBySlug("emotional-availability-reflection", "5.0.0")?.questions).toHaveLength(50);
    expect(getArchivedAssessmentBySlug("orgasm-pacing-control", "3.0.0")).toBeDefined();
    expect(getAssessmentVersion("bdsm-power-dynamics-test")).toBe("6.0.0");
  });
});

function getAssessmentVersion(slug: string) {
  return builtInAssessments.find((a) => a.slug === slug)?.version;
}
