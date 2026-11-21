import { describe, expect, it } from "vitest";
import {
  builtInAssessments,
  getAssessmentBySlug,
  getArchivedAssessmentBySlug,
} from "@/data/assessments/catalog";
import { inspectAssessmentDefinition } from "@/lib/assessment/definition";

const vague =
  /\b(?:private time|intimate time|private evening|private plans|a shared experience|a chosen activity|a familiar activity|ordinary comfort|something unfamiliar|preferred closeness)\b/i;
describe("Candid, specific published question banks", () => {
  it("removes euphemisms and template filler from every live question and its helper", () => {
    const offenders: string[] = [];
    for (const a of builtInAssessments)
      for (const q of a.questions) {
        if (vague.test(`${q.prompt} ${q.partnerPrompt} ${q.helperText}`))
          offenders.push(`${a.slug}: ${q.prompt}`);
        expect(q.prompt).not.toMatch(
          /\b(?:Placeholder|imaginary event curator|fictional pen pal|ordinary role|shared moment)\b/i,
        );
      }
    expect(offenders).toEqual([]);
  });
  it("asks directly about sex, kissing and aftercare instead of using coded phrases", () => {
    const map = getAssessmentBySlug("desire-reality-map")!;
    expect(
      map.questions.filter((q) =>
        /\b(?:sex|kissing|foreplay)\b/i.test(q.prompt),
      ).length,
    ).toBeGreaterThanOrEqual(30);
    const care = getAssessmentBySlug("aftercare-recovery-style")!;
    expect(
      care.questions.every((q) => /\b(?:sex|aftercare)\b/i.test(q.prompt)),
    ).toBe(true);
    expect(
      getAssessmentBySlug("erotic-blueprint-style")!.questions.some((q) =>
        /\bsex\b/i.test(q.prompt),
      ),
    ).toBe(true);
  });
  it("publishes new measurement versions, keeps old definitions pinned, and does not reuse old answer IDs", () => {
    for (const a of builtInAssessments) {
      const previousVersion = a.collection ? "1.0.0" : "4.0.0";
      const old = getArchivedAssessmentBySlug(a.slug, previousVersion);
      expect(old, a.slug).toBeTruthy();
      expect(a.version).not.toBe(previousVersion);
      expect(
        a.questions.every(
          (q) => !old!.questions.some((previous) => previous.id === q.id),
        ),
      ).toBe(true);
      expect(inspectAssessmentDefinition(a).errors, a.slug).toEqual([]);
    }
    expect(
      getArchivedAssessmentBySlug("desire-reality-map", "1.0.0")!.questions[0]
        .prompt,
    ).toBe("Being invited into unhurried intimate time.");
  });
  it("keeps receive/offer counterparts and substantially distinct topics in every revised test", () => {
    const allPrompts = builtInAssessments.flatMap((a) =>
      a.questions.map((q) => q.prompt.toLowerCase()),
    );
    expect(new Set(allPrompts).size).toBe(allPrompts.length);
    for (const a of builtInAssessments) {
      expect(a.questions.length).toBeGreaterThanOrEqual(50);
      expect(a.questions.length).toBeLessThanOrEqual(150);
      expect(new Set(a.questions.map((q) => q.prompt.toLowerCase())).size).toBe(
        a.questions.length,
      );
      expect(
        a.questions.every(
          (q) => !/^(Receiving|Giving your partner) a partner /i.test(q.prompt),
        ),
      ).toBe(true);
      for (const q of a.questions.filter(
        (item) => item.complementaryPartnerId,
      )) {
        const counterpart = a.questions.find(
          (other) => other.id === q.complementaryPartnerId,
        )!;
        expect(counterpart.complementaryPartnerId).toBe(q.id);
        expect(counterpart.intimacyRole).not.toBe(q.intimacyRole);
        expect(counterpart.prompt).not.toBe(q.prompt);
      }
    }
  });
});
