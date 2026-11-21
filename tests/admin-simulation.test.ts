import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  builtInAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
vi.mock("@/lib/server/admin-auth", () => ({
  isAdminRequest: async () => true,
}));
vi.mock("@/lib/server/store", () => ({
  resolveAssessment: (slug: string) => getAssessmentBySlug(slug),
}));
import { POST } from "@/app/api/admin/simulate/route";
describe("Synthetic scoring uses each test's actual answer scale", () => {
  for (const assessment of builtInAssessments)
    it(assessment.title, async () => {
      const response = await POST(
        new NextRequest("http://localhost/api/admin/simulate", {
          method: "POST",
          body: JSON.stringify({
            assessmentSlug: assessment.slug,
            preset: "high_exploration",
          }),
        }),
      );
      expect(response.status).toBe(200);
      const { simulatedResult } = await response.json();
      expect(simulatedResult.answeredCount).toBe(assessment.questions.length);
      expect(simulatedResult.coveragePercent).toBe(100);
      expect(
        simulatedResult.radar.every((d: { score: number }) => d.score === 100),
      ).toBe(true);
    });
});
