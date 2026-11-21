import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getAssessmentBySlug } from "@/data/assessments/catalog";

const identity = vi.hoisted(() => ({ session: null as string | null, uid: null as string | null }));
vi.mock("@/lib/server/session", () => ({ getReadOnlySessionKey: async () => identity.session }));
vi.mock("@/lib/server/firebase-auth", () => ({ getReadOnlyVerifiedUid: async () => identity.uid }));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "soulflame-security-"));
let store: typeof import("@/lib/server/store");
let profileRoute: typeof import("@/app/api/results/[resultId]/profile/route");
let resultId: string;
beforeAll(async () => {
  vi.stubEnv("BETWEEN_US_DATA_DIR", directory);
  store = await import("@/lib/server/store");
  profileRoute = await import("@/app/api/results/[resultId]/profile/route");
  const assessment = getAssessmentBySlug("bdsm-power-dynamics-test")!;
  const question = assessment.questions[0];
  resultId = store.saveAssessmentSubmission({ sessionKey: "owner-session", assessmentSlug: assessment.slug, mode: "complete", perspective: "primary",
    consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: "" },
    answers: { [question.id]: { questionId: question.id, customValue: 5, enjoyment: 5, updatedAt: "" } },
  }).submissionId;
});
beforeEach(() => { identity.session = null; identity.uid = null; });
afterAll(() => {
  vi.unstubAllEnvs();
  if (path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith("soulflame-security-")) fs.rmSync(directory, { recursive: true, force: true });
});
const get = () => profileRoute.GET(new NextRequest(`http://localhost/api/results/${resultId}/profile`), { params: Promise.resolve({ resultId }) });
it("does not expose a private role profile to an anonymous caller with its result ID", async () => {
  const response = await get();
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: "Result not found or unauthorized." });
});
it("does not expose a private role profile to a different guest session", async () => {
  identity.session = "other-session";
  expect((await get()).status).toBe(404);
});
it("lets its owner read a measured role profile without returning raw answers", async () => {
  identity.session = "owner-session";
  const response = await get(), data = await response.json();
  expect(response.status).toBe(200);
  expect(data.resultId).toBe(resultId);
  expect(data.roles.length).toBeGreaterThan(0);
  expect(data.answers).toBeUndefined();
});
