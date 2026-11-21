import { describe, expect, it, vi, afterEach } from "vitest";
import {
  signUidCookie,
  verifySignedUidCookie,
} from "@/lib/server/firebase-auth";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";

afterEach(() => vi.unstubAllEnvs());
describe("Production identity", () => {
  it("does not accept a known development signing secret in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("BETWEEN_US_UID_SECRET", "");
    vi.stubEnv("BETWEEN_US_ADMIN_KEY", "");
    const forged = signUidCookie("another-person");
    vi.stubEnv("NODE_ENV", "production");
    expect(verifySignedUidCookie(forged)).toBeNull();
  });
});
describe("Measured profile integrity", () => {
  it("does not assign an archetype or partner traits to an unanswered test", () => {
    const assessment = getAssessmentBySlug("attachment-style-discovery")!;
    const result = scoreAssessmentSubmission({
      assessment,
      mode: "quick",
      perspective: "primary",
      resultId: "empty",
      createdAt: "",
      answers: {},
    });
    expect(result.profile.archetypeName).toBe("Not enough answers yet");
    expect(result.attachmentCoordinates).toBeUndefined();
    expect(result.idealPartner.characteristics).toEqual([]);
  });
});
