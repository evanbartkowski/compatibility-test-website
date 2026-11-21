import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { getAssessmentBySlug, getArchivedAssessmentBySlug } from "@/data/assessments/catalog";
import { attachIntimacyBlueprint } from "@/lib/assessment/intimacy-profile";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "truth-desire-blueprint-"),
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
    path.basename(directory).startsWith("truth-desire-blueprint-")
  )
    fs.rmSync(directory, { recursive: true, force: true });
});
const consent = {
  confirmedAdult18Plus: true,
  acceptedPrivacyTerms: true,
  optInCommunityStats: false,
  consentedAt: "",
};
const source = getAssessmentBySlug("aftercare-recovery-style")!;
function save(
  slug: string,
  sessionKey: string,
  ownerUid?: string,
  rating: 1 | 5 = 5,
  perspective: "primary" | "partner" = "primary",
) {
  const a = getAssessmentBySlug(slug) || getArchivedAssessmentBySlug(slug, "2.0.0")!;
  return store.saveAssessmentSubmission({
    sessionKey,
    ownerUid,
    assessmentSlug: slug,
    assessmentVersion: a.version,
    allowArchivedVersion: !getAssessmentBySlug(slug),
    mode: "complete",
    perspective,
    consent,
    answers: {
      [a.questions[0].id]: {
        questionId: a.questions[0].id,
        enjoyment: rating,
        updatedAt: "",
      },
    },
  });
}
it("synthesizes only owned primary results, never another account or partner attempt", () => {
  save(source.slug, "same-browser", "account-other", 1);
  save("fantasy-catalog", "same-browser", "account-self", 5, "partner");
  const own = save(source.slug, "different-browser", "account-self");
  const blueprint = save(
    "personal-erotic-blueprint",
    "same-browser",
    "account-self",
  );
  expect(blueprint.result.intimacyBlueprint?.sources).toEqual([
    { title: source.title, createdAt: own.createdAt },
  ]);
  expect(blueprint.result.intimacyBlueprint?.axes[0].score).toBe(100);
  const guest = save("personal-erotic-blueprint", "other-guest");
  expect(guest.result.intimacyBlueprint?.sources).toEqual([]);
});
it("uses latest current-version evidence once per assessment", () => {
  const blueprintDefinition = getArchivedAssessmentBySlug("personal-erotic-blueprint", "2.0.0")!;
  const make = (id: string, rating: 1 | 5, createdAt: string) =>
    scoreAssessmentSubmission({
      assessment: source,
      resultId: id,
      mode: "complete",
      perspective: "primary",
      answers: {
        [source.questions[0].id]: {
          questionId: source.questions[0].id,
          enjoyment: rating,
          updatedAt: "",
        },
      },
      createdAt,
    });
  const result = scoreAssessmentSubmission({
    assessment: blueprintDefinition,
    resultId: "blueprint",
    mode: "quick",
    perspective: "primary",
    answers: {},
  });
  attachIntimacyBlueprint(result, [
    { result: make("old", 1, "2026-11-01"), assessment: source },
    { result: make("latest", 5, "2026-11-20"), assessment: source },
    {
      result: {
        ...make("stale-version", 1, "2026-11-21"),
        assessmentVersion: "0.1.0",
      },
      assessment: source,
    },
  ]);
  expect(result.intimacyBlueprint?.sources).toHaveLength(1);
  expect(result.intimacyBlueprint?.axes[0].score).toBe(100);
  expect(result.intimacyBlueprint?.sources[0]).not.toHaveProperty("resultId");
});
