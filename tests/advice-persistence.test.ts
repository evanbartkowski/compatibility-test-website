import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "truth-desire-advice-"),
);
let store: typeof import("@/lib/server/store");
beforeAll(async () => {
  vi.stubEnv("BETWEEN_US_DATA_DIR", directory);
  store = await import("@/lib/server/store");
});
afterAll(() => {
  vi.unstubAllEnvs();
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith("truth-desire-advice-")
  )
    fs.rmSync(directory, { recursive: true, force: true });
});
it("adds advice to an existing owned result in memory without rewriting its scores or private file", () => {
  const a = getAssessmentBySlug("aftercare-recovery-style")!,
    q = a.questions[0];
  const sub = store.saveAssessmentSubmission({
    sessionKey: "owner",
    assessmentSlug: a.slug,
    mode: "complete",
    perspective: "primary",
    consent: {
      confirmedAdult18Plus: true,
      acceptedPrivacyTerms: true,
      optInCommunityStats: false,
      consentedAt: "",
    },
    answers: { [q.id]: { questionId: q.id, enjoyment: 5, updatedAt: "" } },
  });
  const file = path.join(directory, "store.json"),
    fixture = JSON.parse(fs.readFileSync(file, "utf8"));
  delete fixture.submissions[sub.submissionId].result.advice;
  delete fixture.submissions[sub.submissionId].assessmentSnapshot.adviceProfile;
  fs.writeFileSync(file, JSON.stringify(fixture));
  const before = fs.readFileSync(file, "utf8");
  const read = store.getSubmissionResult(sub.submissionId)!;
  expect(read.result.advice?.status).toBe("ready");
  expect(read.result.radar).toEqual(sub.result.radar);
  expect(fs.readFileSync(file, "utf8")).toBe(before);
});
