import { expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/assessments/submit/route";

it("rejects a new short-test submission with a useful full-test message", async () => {
  const response = await POST(new NextRequest("http://localhost/api/assessments/submit", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assessmentSlug: "emotional-availability-reflection", mode: "quick", perspective: "primary",
      consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: "2026-11-21T00:00:00Z" },
      answers: {},
    }),
  }));
  expect(response.status).toBe(400);
  expect((await response.json()).error).toMatch(/only full tests.*reload/i);
});
