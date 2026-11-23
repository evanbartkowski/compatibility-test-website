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
  it("keeps the previous candid wording resolvable and the live bank sharper", () => {
    const live = getAssessmentBySlug("bdsm-power-dynamics-test")!;
    const previous = getArchivedAssessmentBySlug("bdsm-power-dynamics-test", "5.0.0")!;
    expect(live.version).toBe("6.0.0");
    expect(live.shortTitle).toBe("The BDSM Test");
    expect(previous.version).toBe("5.0.0");
    expect(previous.questions[0].id).not.toBe(live.questions[0].id);
    expect(live.questions.filter((q) => /dominat|submissive|rope|CNC|sadist|impact/i.test(q.prompt)).length).toBeGreaterThanOrEqual(12);
    expect(live.questions.some((q) => q.topicTags?.includes("role:dominant"))).toBe(true);
    expect(live.questions.some((q) => /childlike|age-regress|ageplayer/i.test(q.prompt))).toBe(false);
    expect(getAssessmentBySlug("sexual-interests-curiosity-map")!.shortTitle).toBe("The Freak Test (kinks)");
    expect(getAssessmentBySlug("relationship-dealbreakers-boundaries")!.shortTitle).toBe("The Icks Test");
    expect(getAssessmentBySlug("love-affection-preferences")!.shortTitle).toBe("The Love Language Test");
    expect(getAssessmentBySlug("big-five-personality-profile")!.shortTitle).toBe("The IQ Test");
    expect(getAssessmentBySlug("emotional-availability-reflection")!.shortTitle).toBe("The Friendship Test");
    expect(getAssessmentBySlug("attachment-style-discovery")!.shortTitle).toBe("Partner Compatibility Test");
    expect(getAssessmentBySlug("long-term-dynamic-vision")!.shortTitle).toBe("The Husband / Wife Test");
    expect(getAssessmentBySlug("spicy-would-you-rather")!.shortTitle).toBe("would you rather (spicy) test");
    expect(getAssessmentBySlug("big-five-personality-profile")!.questions.some((q) => /42|percent|analogy|argument/i.test(q.prompt))).toBe(true);
    expect(getAssessmentBySlug("emotional-availability-reflection")!.questions.filter((q) => /friend/i.test(q.prompt)).length).toBeGreaterThanOrEqual(20);
    expect(getAssessmentBySlug("sexual-interests-curiosity-map")!.questions.some((q) => /bondage|watersports|cuckold|CNC/i.test(q.prompt))).toBe(true);
  });
  it("asks directly about sex, kissing and aftercare instead of using coded phrases", () => {
    const map = getAssessmentBySlug("attachment-style-discovery")!;
    expect(
      map.questions.filter((q) =>
        /\b(?:sex|kissing|foreplay|fuck)\b/i.test(q.prompt),
      ).length,
    ).toBeGreaterThanOrEqual(15);
    const care = getAssessmentBySlug("aftercare-recovery-style")!;
    expect(
      care.questions.every((q) => /\b(?:sex|aftercare)\b/i.test(q.prompt)),
    ).toBe(true);
    expect(
      getAssessmentBySlug("attachment-style-discovery")!.questions.some((q) =>
        /\bsex\b/i.test(q.prompt),
      ),
    ).toBe(true);
  });
  it("publishes new measurement versions, keeps old definitions pinned, and does not reuse old answer IDs", () => {
    for (const a of builtInAssessments) {
      const previousVersion = a.collection ? "1.0.0" : "4.0.0";
      const old = getArchivedAssessmentBySlug(a.slug, previousVersion);
      if (!old) continue;
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
      expect(a.questions.length).toBeGreaterThanOrEqual(a.slug === "aftercare-recovery-style" || a.slug === "spicy-would-you-rather" ? 15 : 50);
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
