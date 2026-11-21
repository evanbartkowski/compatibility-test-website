import { describe, expect, it } from "vitest";
import {
  builtInAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
import { inspectAssessmentDefinition } from "@/lib/assessment/definition";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { projectPrivateExport } from "@/lib/exports/private-export";
import { projectResultForSharing } from "@/lib/assessment/sharing";
import type {
  AssessmentDefinition,
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";

const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};
const answer = (
  id: string,
  patch: Partial<QuestionAnswer> = {},
): QuestionAnswer => ({
  questionId: id,
  updatedAt: "",
  enjoyment: 5,
  partnerWillingness: "enthusiastically_enjoy",
  ...patch,
});

function definition(): AssessmentDefinition {
  const value = getAssessmentBySlug("desire-reality-map");
  expect(
    value,
    "New collection is registered in the live data layer",
  ).toBeTruthy();
  return value!;
}
function compare(
  a: Record<string, QuestionAnswer>,
  b: Record<string, QuestionAnswer>,
  assessment = definition(),
) {
  return computeCoupleCompatibility({
    compatibilityId: "test",
    inviteId: "test",
    assessment,
    mode: "complete",
    primaryAnswers: a,
    partnerAnswers: b,
    creatorSharing: sharing,
    partnerSharing: sharing,
    createdAt: "2026-11-20T00:00:00Z",
  });
}

describe("New intimacy collection", () => {
  it("leaves an experience-only complete form provisional and strips private channels from summary sharing", () => {
    const a = definition();
    const result = scoreAssessmentSubmission({
      assessment: a,
      resultId: "context-only",
      mode: "complete",
      perspective: "primary",
      answers: Object.fromEntries(
        a.questions.map((q) => [
          q.id,
          { questionId: q.id, experienceFrequency: 5, updatedAt: "" },
        ]),
      ),
    });
    expect(result.answeredCount).toBe(a.questions.length);
    expect(result.radar.every((d) => d.answeredCount === 0)).toBe(true);
    expect(result.provisional).toBe(true);
    const rated = scoreAssessmentSubmission({
      assessment: a,
      resultId: "rated",
      mode: "quick",
      perspective: "primary",
      answers: {
        [a.questions[0].id]: answer(a.questions[0].id, {
          firmBoundary: true,
          experienceFrequency: 1,
        }),
      },
    });
    for (const summary of [
      projectPrivateExport(rated, {
        includeAnswers: false,
        includeSensitive: true,
      }),
      projectResultForSharing(rated, {
        dimensionKeys: [a.questions[0].sectionId],
        includeArchetype: false,
        includeAssessmentTitle: true,
        allowSensitive: true,
      }),
    ]) {
      expect(summary).not.toHaveProperty("intimacyProfile");
      expect(summary).not.toHaveProperty("intimacyBlueprint");
      expect(JSON.stringify(summary)).not.toContain(a.questions[0].prompt);
    }
  });
  it("registers eleven curated adult-only assessments with real teaser and deep forms", () => {
    const suite = builtInAssessments.filter(
      (a) => a.collection === "intimacy-suite",
    );
    expect(suite).toHaveLength(10);
    for (const a of suite) {
      expect(a.adultsOnly).toBe(true);
      expect(a.questions.length).toBeGreaterThanOrEqual(50);
      expect(
        a.questions.filter((q) => q.quickDiscovery).length,
      ).toBeGreaterThan(0);
      expect(a.questions.filter((q) => q.quickDiscovery).length).toBeLessThan(
        a.questions.length,
      );
      expect(inspectAssessmentDefinition(a).errors, a.slug).toEqual([]);
      expect(a.marketingBlurb).toBeTruthy();
      expect(a.matchingNotes?.length).toBeGreaterThan(0);
      expect(
        a.questions.every((q) => q.defaultRevealRule === "mutual_only"),
      ).toBe(true);
      for (const q of a.questions.filter((q) => q.complementaryPartnerId)) {
        const other = a.questions.find(
          (candidate) => candidate.id === q.complementaryPartnerId,
        );
        expect(other?.complementaryPartnerId).toBe(q.id);
        expect(other?.intimacyRole).not.toBe(q.intimacyRole);
      }
    }
    expect(
      getAssessmentBySlug("fantasy-catalog")?.questions.length,
    ).toBe(100);
  });

  it("keeps desire separate from willingness, experience and hard limits", () => {
    const a = definition(),
      q = a.questions[0];
    const result = scoreAssessmentSubmission({
      assessment: a,
      resultId: "self",
      mode: "complete",
      perspective: "primary",
      answers: {
        [q.id]: answer(q.id, {
          partnerWillingness: "prefer_not_to",
          firmBoundary: true,
          experienceFrequency: 1,
        }),
      },
    });
    expect(result.radar.find((d) => d.answeredCount)?.score).toBe(100);
    expect(result.scatterPoints[0].experienceScore).toBe(1);
    expect(result.intimacyProfile?.hardLimits).toHaveLength(1);
    expect(result.intimacyProfile?.channels[0].willingnessScore).toBe(0);
    expect(result.unmetPreferences).toEqual([]);
  });

  it("does not invent desire from an experience-only or willingness-only response", () => {
    const a = definition(),
      q = a.questions[0];
    const result = scoreAssessmentSubmission({
      assessment: a,
      resultId: "self",
      mode: "complete",
      perspective: "primary",
      answers: {
        [q.id]: {
          questionId: q.id,
          updatedAt: "",
          experienceFrequency: 5,
          partnerWillingness: "willing_if_partner_enjoys",
        },
      },
    });
    expect(result.radar.every((d) => d.answeredCount === 0)).toBe(true);
    expect(result.scatterPoints).toEqual([]);
    expect(result.intimacyProfile?.channels[0].experienceScore).toBe(100);
  });

  it("matches receiving with freely offered counterparts, rather than requiring identical answers", () => {
    const a = definition(),
      receive = a.questions.find((q) => q.intimacyRole === "receive")!,
      offer = a.questions.find((q) => q.id === receive.complementaryPartnerId)!;
    const report = compare(
      { [receive.id]: answer(receive.id) },
      {
        [offer.id]: answer(offer.id, {
          enjoyment: 2,
          partnerWillingness: "willing_if_partner_enjoys",
        }),
      },
      a,
    );
    expect(report.whereYouComplement).toHaveLength(1);
    expect(report.whereYouComplement[0].explanation).toContain("Willingness");
    expect(report.radarOverlay).toEqual([]);
    expect(report.whereYouDiffer).toEqual([]);
  });

  it("does not change a partner report when hidden answers or private limits change", () => {
    const a = definition(),
      q = a.questions[0],
      other = a.questions.find((item) => item.id === q.complementaryPartnerId)!;
    const baseline = compare({}, {}, a);
    for (const hidden of [
      answer(q.id),
      answer(q.id, { firmBoundary: true }),
      answer(q.id, { enjoyment: 1, experienceFrequency: 5 }),
      answer(q.id, { revealRule: "private_never_share" }),
    ]) {
      expect(compare({ [q.id]: hidden }, {}, a)).toEqual(baseline);
      expect(
        compare(
          { [q.id]: { ...hidden, revealRule: "private_never_share" } },
          { [other.id]: answer(other.id) },
          a,
        ),
      ).toEqual(baseline);
    }
    expect(JSON.stringify(baseline)).not.toContain(q.prompt);
  });

  it("blocks a matched suggestion if either person marks a limit or withdraws willingness", () => {
    const a = definition(),
      q = a.questions[0],
      other = a.questions.find((item) => item.id === q.complementaryPartnerId)!;
    for (const patch of [
      { firmBoundary: true },
      { partnerWillingness: "firm_boundary" as const },
      { partnerWillingness: "prefer_not_to" as const },
      { skipped: true },
    ]) {
      const report = compare(
        { [q.id]: answer(q.id) },
        { [other.id]: answer(other.id, patch) },
        a,
      );
      expect(report.whereYouComplement).toEqual([]);
      expect(report.boundaryConsiderations).toEqual([]);
      expect(report.overallScore).toBe(0);
    }
  });

  it("treats a forced choice as direction, not as desire or permission", () => {
    const a = getAssessmentBySlug("spicy-would-you-rather")!,
      q = a.questions[0];
    const choice = { questionId: q.id, customValue: "b", updatedAt: "" };
    const result = scoreAssessmentSubmission({
      assessment: a,
      resultId: "choice",
      mode: "quick",
      perspective: "primary",
      answers: { [q.id]: choice },
    });
    expect(result.radar[0].score).toBe(100);
    expect(result.intimacyProfile?.channels[0].desireScore).toBeNull();
    expect(
      compare({ [q.id]: choice }, { [q.id]: choice }, a).whereYouAlign,
    ).toEqual([]);
    expect(
      compare(
        { [q.id]: answer(q.id, { customValue: "a" }) },
        { [q.id]: answer(q.id, { customValue: "b" }) },
        a,
      ).whereYouAlign,
    ).toEqual([]);
    expect(
      compare(
        { [q.id]: answer(q.id, { customValue: "a" }) },
        { [q.id]: answer(q.id, { customValue: "a" }) },
        a,
      ).whereYouAlign,
    ).toHaveLength(1);
  });
});
