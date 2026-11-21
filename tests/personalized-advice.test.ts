import { describe, expect, it } from "vitest";
import {
  builtInAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { projectPrivateExport } from "@/lib/exports/private-export";
import type {
  AssessmentDefinition,
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";
const at = "2026-11-20T00:00:00Z";
function responses(a: AssessmentDefinition, highKey = a.dimensions![0].key) {
  return Object.fromEntries(
    a.questions.map((q) => {
      const high = q.sectionId === highKey;
      return [
        q.id,
        {
          questionId: q.id,
          updatedAt: at,
          ...(q.inputType === "intimacy_profile"
            ? {
                enjoyment: high ? 5 : 2,
                partnerWillingness: "enthusiastically_enjoy",
                experienceFrequency: high ? 1 : 4,
                ...(q.options ? { customValue: "a" } : {}),
              }
            : { customValue: q.reverseScored ? (high ? 1 : 6) : high ? 7 : 2 }),
        } as QuestionAnswer,
      ];
    }),
  );
}
const score = (a: AssessmentDefinition, answers = responses(a)) =>
  scoreAssessmentSubmission({
    assessment: a,
    resultId: "advice",
    mode: "complete",
    perspective: "primary",
    answers,
    createdAt: at,
  });
const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};
describe("Evidence-based private advice", () => {
  it("does not add an unshared or limited comfort to a suggested partner routine", () => {
    const a = getAssessmentBySlug("aftercare-recovery-style")!;
    const quiet = a.questions.find(
      (q) =>
        q.prompt === "Receiving quiet shoulder-to-shoulder company afterward.",
    )!;
    const water = a.questions.find(
      (q) => q.prompt === "Having a partner offer water within easy reach.",
    )!;
    const result = score(a, {
      [quiet.id]: {
        questionId: quiet.id,
        enjoyment: 5,
        partnerWillingness: "enthusiastically_enjoy",
        experienceFrequency: 1,
        updatedAt: at,
      },
      [water.id]: {
        questionId: water.id,
        enjoyment: 5,
        firmBoundary: true,
        updatedAt: at,
      },
    });
    const partnerSteps = result
      .advice!.experiments.filter((e) => e.kind === "partnered")
      .flatMap((e) => e.steps)
      .join(" ");
    expect(partnerSteps.toLowerCase()).not.toContain("water");
    expect(
      result.advice!.gaps.some(
        (g) => g.questionId === water.id && g.path === "respect-limit",
      ),
    ).toBe(true);
  });
  it("gives every published assessment authored advice and three to eight graduated, evidenced experiments", () => {
    for (const a of builtInAssessments) {
      expect(a.adviceProfile, a.slug).toBeTruthy();
      const result = score(a);
      expect(result.advice?.status, a.slug).toBe("ready");
      expect(result.advice?.partnerTraits.length, a.slug).toBeGreaterThan(0);
      expect(result.advice?.frictionPoints.length, a.slug).toBeGreaterThan(0);
      expect(result.advice?.optimizations.length, a.slug).toBeGreaterThan(0);
      expect(result.advice?.experiments.length, a.slug).toBeGreaterThanOrEqual(
        3,
      );
      expect(result.advice!.experiments.length).toBeLessThanOrEqual(8);
      expect(result.advice!.experiments.map((e) => e.effort)).toEqual(
        [...result.advice!.experiments.map((e) => e.effort)].sort(),
      );
      expect(
        result.advice!.experiments.every(
          (e) => e.evidence.length > 0 && e.steps.length > 0 && e.stopRule,
        ),
      ).toBe(true);
      expect(result.advice!.partnerSearchLine).toBeTruthy();
    }
  });
  it("changes the actual coaching when the measured strongest category changes", () => {
    const a = getAssessmentBySlug("aftercare-recovery-style")!;
    const first = score(a, responses(a, "contact"));
    const second = score(a, responses(a, "space"));
    expect(first.advice?.focusDimension).toBe("contact");
    expect(second.advice?.focusDimension).toBe("space");
    expect(first.advice?.partnerSearchLine).not.toEqual(
      second.advice?.partnerSearchLine,
    );
    expect(first.advice?.experiments).not.toEqual(second.advice?.experiments);
  });
  it("distinguishes actionable gaps, fantasy-only interest, limits, private choices and missing context", () => {
    const a = getAssessmentBySlug("desire-reality-map")!;
    const qs = a.questions
      .filter((q) => q.intimacyRole === "receive")
      .slice(0, 5);
    const answers = Object.fromEntries(
      qs.map((q, i) => [
        q.id,
        {
          questionId: q.id,
          enjoyment: 5,
          updatedAt: at,
          ...(i === 4 ? {} : { experienceFrequency: 1 }),
          partnerWillingness:
            i === 1
              ? "prefer_not_to"
              : i === 4
                ? undefined
                : "enthusiastically_enjoy",
          firmBoundary: i === 2,
          revealRule: i === 3 ? "private_never_share" : "mutual_only",
        } as QuestionAnswer,
      ]),
    );
    const result = score(a, answers),
      advice = result.advice!;
    expect(advice.gaps.find((g) => g.questionId === qs[0].id)?.path).toBe(
      "discuss-first",
    );
    expect(advice.gaps.find((g) => g.questionId === qs[1].id)?.path).toBe(
      "keep-as-fantasy",
    );
    expect(advice.gaps.find((g) => g.questionId === qs[2].id)?.path).toBe(
      "respect-limit",
    );
    expect(advice.gaps.find((g) => g.questionId === qs[3].id)?.path).toBe(
      "keep-private",
    );
    expect(
      advice.gaps.find((g) => g.questionId === qs[4].id)?.experience,
    ).toBeNull();
    for (const experiment of advice.experiments.filter(
      (e) => e.kind === "partnered",
    )) {
      expect(
        experiment.evidence.some(
          (e) => e.questionId && qs.slice(1).some((q) => q.id === e.questionId),
        ),
      ).toBe(false);
    }
    expect(
      projectPrivateExport(result, {
        includeAnswers: false,
        includeSensitive: true,
      }),
    ).not.toHaveProperty("advice");
  });
  it("does not fabricate a style or a partner profile from skipped answers", () => {
    const a = getAssessmentBySlug("desire-reality-map")!;
    const result = score(a, {});
    expect(result.advice?.status).toBe("needs-more-answers");
    expect(result.advice?.experiments).toEqual([]);
    expect(result.advice?.partnerTraits).toEqual([]);
  });
  it("adds an original five-style reflection with evidence-based primary and secondary ranks", () => {
    const a = getAssessmentBySlug("erotic-blueprint-style")!;
    expect(a).toBeTruthy();
    expect(a.questions.length).toBeGreaterThanOrEqual(50);
    const answers = responses(a, "sensual");
    for (const q of a.questions.filter((q) => q.sectionId === "energetic"))
      answers[q.id].enjoyment = 4;
    const result = score(a, answers);
    expect(result.styleRanking?.primary?.key).toBe("sensual");
    expect(result.styleRanking?.secondary?.key).toBe("energetic");
    expect(
      result.advice?.partnerTraits.some((trait) =>
        trait.title.includes("Energetic"),
      ),
    ).toBe(true);
    const secondaryTie = score(a, responses(a, "sensual"));
    expect(secondaryTie.styleRanking?.primary?.key).toBe("sensual");
    expect(secondaryTie.styleRanking?.secondary).toBeUndefined();
    expect(secondaryTie.styleRanking?.note).toContain(
      "secondary preferences are tied",
    );
    const tied = score(
      a,
      Object.fromEntries(
        a.questions.map((q) => [
          q.id,
          { questionId: q.id, enjoyment: 3, updatedAt: at },
        ]),
      ),
    );
    expect(tied.styleRanking?.tied).toBe(true);
    expect(tied.styleRanking?.primary).toBeUndefined();
  });
});
describe("Pair advice disclosure", () => {
  it("uses only mutually shared topics and stays identical when hidden experience or limits change", () => {
    const a = getAssessmentBySlug("aftercare-recovery-style")!,
      q = a.questions[0],
      other = a.questions.find((x) => x.id === q.complementaryPartnerId)!,
      hidden = a.questions[2];
    const compare = (patch: Partial<QuestionAnswer> = {}) =>
      computeCoupleCompatibility({
        compatibilityId: "pair",
        inviteId: "pair",
        assessment: a,
        mode: "complete",
        creatorSharing: sharing,
        partnerSharing: sharing,
        createdAt: at,
        primaryAnswers: {
          [q.id]: {
            questionId: q.id,
            enjoyment: 5,
            partnerWillingness: "enthusiastically_enjoy",
            updatedAt: at,
          },
          [hidden.id]: {
            questionId: hidden.id,
            enjoyment: 5,
            revealRule: "private_never_share",
            updatedAt: at,
            ...patch,
          },
        },
        partnerAnswers: {
          [other.id]: {
            questionId: other.id,
            enjoyment: 2,
            partnerWillingness: "willing_if_partner_enjoys",
            updatedAt: at,
          },
        },
      });
    const report = compare();
    expect(report.pairAdvice?.experiments.length).toBeGreaterThan(0);
    expect(report.pairAdvice?.conversationStarters.length).toBeGreaterThan(0);
    expect(report.pairAdvice?.frictionPoints.length).toBeGreaterThan(0);
    expect(
      compare({ experienceFrequency: 5, firmBoundary: true }).pairAdvice,
    ).toEqual(report.pairAdvice);
    expect(JSON.stringify(report.pairAdvice)).not.toContain(hidden.prompt);
  });
});
