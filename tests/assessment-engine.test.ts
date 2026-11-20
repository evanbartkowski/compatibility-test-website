import { describe, expect, it } from "vitest";
import { builtInAssessments, getAssessmentBySlug } from "@/data/assessments/catalog";
import { intimacyPartnerPreferencesAssessment } from "@/data/assessments/intimacy-partner-preferences";
import { referenceChartAuditItems } from "@/data/reference-chart-audit";
import {
  compareUserWithCommunity,
  computeCommunityAggregates,
  computeEmpiricalPercentile,
  type OptedInSubmissionRecord,
} from "@/lib/assessment/community";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { computeMultiRaterSummary, scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import type { QuestionAnswer, QuestionDefinition, SharingPreferences } from "@/lib/assessment/types";

const fullSharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};

function makeAnswer(
  questionId: string,
  partial: Partial<QuestionAnswer>
): QuestionAnswer {
  return {
    questionId,
    updatedAt: "2026-11-08T00:00:00.000Z",
    ...partial,
  };
}

describe("Reference Chart Audit & Question Bank Integrity", () => {
  it("contains 62 audited reference points and flags obscured labels without guessing", () => {
    expect(referenceChartAuditItems.length).toBe(62);
    const flagged = referenceChartAuditItems.filter(
      (i) => i.editorialStatus === "flagged_obscured"
    );
    expect(flagged.length).toBeGreaterThan(20);
    for (const item of flagged) {
      expect(item.hasObscuredText).toBe(true);
      expect(item.exactReadableTranscription).toContain("[OBSCURED]");
    }
  });

  it("provides 56 original questions across 6 sections with 14 quick-discovery items", () => {
    const qs = intimacyPartnerPreferencesAssessment.questions;
    expect(qs.length).toBe(56);
    expect(qs.filter((q) => q.quickDiscovery).length).toBe(14);
    for (const q of qs) {
      expect(q.prompt).not.toContain("[OBSCURED]");
      expect(q.partnerPrompt.length).toBeGreaterThan(15);
    }
  });
});

describe("Scoring Engine & Determinism", () => {
  it("scores deterministically, computes profile archetype, and excludes unrated experience items from scatterplot", () => {
    const answers: Record<string, QuestionAnswer> = {
      comm_ask_preferences_before: makeAnswer("comm_ask_preferences_before", {
        enjoyment: 5,
        experienceFrequency: 2,
        importance: "essential",
      }),
      comm_verbal_checkin: makeAnswer("comm_verbal_checkin", {
        enjoyment: 5,
        experienceFrequency: 3,
        importance: "important",
      }),
      comm_explicit_dirty_talk: makeAnswer("comm_explicit_dirty_talk", {
        enjoyment: "haven_t_experienced",
        importance: "nice_to_have",
      }),
      pace_extended_foreplay: makeAnswer("pace_extended_foreplay", {
        enjoyment: 5,
        experienceFrequency: 1,
        importance: "essential",
      }),
      pace_aftercare_affection: makeAnswer("pace_aftercare_affection", {
        enjoyment: 5,
        importance: "essential",
      }),
      exp_trying_new_things: makeAnswer("exp_trying_new_things", {
        enjoyment: "curious",
        importance: "nice_to_have",
      }),
      bound_finishing_before_satisfied: makeAnswer("bound_finishing_before_satisfied", {
        enjoyment: 5,
        firmBoundary: true,
        importance: "essential",
      }),
    };

    const resA = scoreAssessmentSubmission({
      resultId: "r1",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "quick",
      perspective: "primary",
      answers,
      createdAt: "2026-11-08T12:00:00.000Z",
    });

    const resB = scoreAssessmentSubmission({
      resultId: "r1",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "quick",
      perspective: "primary",
      answers,
      createdAt: "2026-11-08T12:00:00.000Z",
    });

    expect(resA).toEqual(resB);
    expect(resA.profile.archetypeName.length).toBeGreaterThan(3);
    // Only 3 items had BOTH numeric enjoyment & numeric experienceFrequency
    expect(resA.scatterPoints.length).toBe(3);
    expect(resA.experienceUnratedCount).toBe(1); // pace_aftercare_affection had enjoyment=5 but no experience
    expect(resA.unmetPreferences.length).toBe(2); // comm_ask_preferences_before (5/2) & pace_extended_foreplay (5/1)
    expect(resA.buckets.curiousAbout.map((c) => c.questionId)).toContain("exp_trying_new_things");
    expect(resA.buckets.firmBoundaries.map((b) => b.questionId)).toContain(
      "bound_finishing_before_satisfied"
    );

    // Interconnected What You Are Into & Dimension Interactions
    expect(resA.whatYouAreInto).toBeDefined();
    expect(resA.whatYouAreInto!.headline.length).toBeGreaterThan(5);
    expect(resA.whatYouAreInto!.coreTurnOns.map((t) => t.questionId)).toContain(
      "pace_extended_foreplay"
    );
    expect(resA.whatYouAreInto!.wantMoreOf.map((w) => w.questionId)).toContain(
      "pace_extended_foreplay"
    );
    expect(resA.whatYouAreInto!.dealbreakersAndLimits.map((d) => d.questionId)).toContain(
      "bound_finishing_before_satisfied"
    );
    expect(resA.whatYouAreInto!.coreTurnOns.map((t) => t.questionId)).not.toContain(
      "bound_finishing_before_satisfied"
    );
    expect(resA.whatYouAreInto!.wantMoreOf.map((w) => w.questionId)).not.toContain(
      "bound_finishing_before_satisfied"
    );
    expect(resA.whatYouAreInto!.curiousExplorations.map((c) => c.questionId)).toContain(
      "exp_trying_new_things"
    );
    expect(resA.dimensionInteractions?.length).toBeGreaterThan(0);

    const qaForeplay = resA.qaSummary?.find((q) => q.questionId === "pace_extended_foreplay");
    expect(qaForeplay?.sectionId).toBe("foreplay-pacing");
    expect(qaForeplay?.score0to100).toBe(100);
    expect(qaForeplay?.linkedDimensions?.length).toBeGreaterThan(0);
    expect(qaForeplay?.intoTag).toBe("want_more");
  });

  it("keeps all contributors unclipped (>6) and enriches multi_select contributor attribution", () => {
    const allIntimacyAnswers: Record<string, QuestionAnswer> = {};
    for (const q of intimacyPartnerPreferencesAssessment.questions) {
      allIntimacyAnswers[q.id] = makeAnswer(q.id, {
        enjoyment: q.sectionId === "boundaries-comfort" ? 2 : 5,
        experienceFrequency: 3,
        importance: "essential",
      });
    }
    const fullRes = scoreAssessmentSubmission({
      resultId: "r-full",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "complete",
      perspective: "primary",
      answers: allIntimacyAnswers,
      createdAt: "2026-11-08T12:00:00.000Z",
    });

    const maxContributors = Math.max(...fullRes.radar.map((d) => d.contributors.length));
    expect(maxContributors).toBeGreaterThan(6);
    for (const dim of fullRes.radar) {
      if (dim.answeredCount > 0) {
        expect(dim.contributors.length).toBeGreaterThan(0);
        expect(dim.contributors[0].weightedImpact).toBeDefined();
      }
    }
  });
});

describe("Community Aggregation & Statistical Honesty", () => {
  it("excludes non-consenting submissions and suppresses averages below n=50", () => {
    const subs: OptedInSubmissionRecord[] = [];
    // 49 consenting + 10 non-consenting -> still below 50!
    for (let i = 0; i < 49; i++) {
      subs.push({
        submissionId: `opt-${i}`,
        assessmentSlug: intimacyPartnerPreferencesAssessment.slug,
        consent: {
          confirmedAdult18Plus: true,
          acceptedPrivacyTerms: true,
          optInCommunityStats: true,
          consentedAt: "2026-01-01T00:00:00Z",
        },
        answers: {
          comm_verbal_checkin: makeAnswer("comm_verbal_checkin", { enjoyment: 5 }),
        },
      });
    }
    for (let i = 0; i < 10; i++) {
      subs.push({
        submissionId: `priv-${i}`,
        assessmentSlug: intimacyPartnerPreferencesAssessment.slug,
        consent: {
          confirmedAdult18Plus: true,
          acceptedPrivacyTerms: true,
          optInCommunityStats: false,
          consentedAt: "2026-01-01T00:00:00Z",
        },
        answers: {
          comm_verbal_checkin: makeAnswer("comm_verbal_checkin", { enjoyment: 1 }),
        },
      });
    }

    const below = computeCommunityAggregates({
      assessment: intimacyPartnerPreferencesAssessment,
      submissions: subs,
      minimumThreshold: 50,
    });
    expect(below.eligibleCohortParticipants).toBe(49);
    expect(below.suppressedByPrivacyThreshold).toBe(true);
    expect(below.aggregates["comm_verbal_checkin"].available).toBe(false);
    expect(below.aggregates["comm_verbal_checkin"].meanEnjoyment).toBeNull();

    // Add 1 more consenting submission -> unlocks cleanly, still ignoring the 10 private ratings of 1
    subs.push({
      submissionId: "opt-50",
      assessmentSlug: intimacyPartnerPreferencesAssessment.slug,
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: true,
        consentedAt: "2026-01-01T00:00:00Z",
      },
      answers: {
        comm_verbal_checkin: makeAnswer("comm_verbal_checkin", { enjoyment: 5 }),
      },
    });

    const atThreshold = compareUserWithCommunity({
      assessment: intimacyPartnerPreferencesAssessment,
      userAnswers: { comm_verbal_checkin: makeAnswer("comm_verbal_checkin", { enjoyment: 5 }) },
      submissions: subs,
      minimumThreshold: 50,
    });
    expect(atThreshold.suppressedByPrivacyThreshold).toBe(false);
    const item = atThreshold.items.find((i) => i.questionId === "comm_verbal_checkin")!;
    expect(item.available).toBe(true);
    expect(item.communityMean).toBe(5);
    expect(item.respondentCount).toBe(50);
  });

  it("calculates exact empirical mid-rank percentiles", () => {
    expect(computeEmpiricalPercentile(4, [1, 2, 3, 4, 5])).toBe(70); // (3 + 0.5*1)/5 = 70%
    expect(computeEmpiricalPercentile(5, [1, 2, 3, 4, 5])).toBe(90); // (4 + 0.5*1)/5 = 90%
  });
});

describe("Partner Compatibility Scoring Engine", () => {
  it("rewards enthusiastic complementary alignment above mere willingness, protects firm boundaries, and avoids missing-data inflation", () => {
    const primaryAnswers: Record<string, QuestionAnswer> = {
      comm_ask_preferences_before: makeAnswer("comm_ask_preferences_before", {
        enjoyment: 5,
        importance: "essential",
      }),
      comm_verbal_checkin: makeAnswer("comm_verbal_checkin", {
        enjoyment: 5,
        importance: "important",
      }),
      dyn_partner_takes_lead: makeAnswer("dyn_partner_takes_lead", {
        enjoyment: 5,
        importance: "essential",
      }),
      phys_receiving_oral_enthusiasm: makeAnswer("phys_receiving_oral_enthusiasm", {
        enjoyment: 5,
        importance: "important",
      }),
      exp_trying_new_things: makeAnswer("exp_trying_new_things", {
        enjoyment: "curious",
      }),
    };

    const enthusiasticPartner: Record<string, QuestionAnswer> = {
      comm_ask_preferences_before: makeAnswer("comm_ask_preferences_before", {
        partnerWillingness: "enthusiastically_enjoy",
        importance: "essential",
      }),
      comm_verbal_checkin: makeAnswer("comm_verbal_checkin", {
        partnerWillingness: "enthusiastically_enjoy",
        importance: "important",
      }),
      dyn_partner_takes_lead: makeAnswer("dyn_partner_takes_lead", {
        partnerWillingness: "enthusiastically_enjoy",
        importance: "essential",
      }),
      phys_receiving_oral_enthusiasm: makeAnswer("phys_receiving_oral_enthusiasm", {
        partnerWillingness: "willing_if_partner_enjoys",
        importance: "nice_to_have",
      }),
      exp_trying_new_things: makeAnswer("exp_trying_new_things", {
        partnerWillingness: "curious_to_explore",
      }),
    };

    const boundaryConflictPartner: Record<string, QuestionAnswer> = {
      ...enthusiasticPartner,
      dyn_partner_takes_lead: makeAnswer("dyn_partner_takes_lead", {
        partnerWillingness: "firm_boundary",
        firmBoundary: true,
        importance: "essential",
      }),
    };

    const highComp = computeCoupleCompatibility({
      compatibilityId: "cmp-good",
      inviteId: "inv-1",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "quick",
      primaryAnswers,
      partnerAnswers: enthusiasticPartner,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });

    const conflictComp = computeCoupleCompatibility({
      compatibilityId: "cmp-bound",
      inviteId: "inv-2",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "quick",
      primaryAnswers,
      partnerAnswers: boundaryConflictPartner,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });

    expect(highComp.overallScore).toBeGreaterThan(85);
    expect(highComp.whereYouComplement.map((w) => w.questionId)).toContain("dyn_partner_takes_lead");
    expect(highComp.sharedCuriosities.map((c) => c.questionId)).toContain("exp_trying_new_things");
    expect(highComp.bothAnsweredCount).toBe(5);
    expect(highComp.coveragePercent).toBe(Math.round((5 / 14) * 100));

    // Boundary conflict MUST cap score and appear in boundary considerations
    expect(conflictComp.overallScore).toBeLessThanOrEqual(70);
    expect(conflictComp.boundaryConsiderations.length).toBeGreaterThan(0);

    // Sparse answers must report provisional=true
    const sparseComp = computeCoupleCompatibility({
      compatibilityId: "cmp-sparse",
      inviteId: "inv-3",
      assessment: intimacyPartnerPreferencesAssessment,
      mode: "quick",
      primaryAnswers: {
        comm_ask_preferences_before: primaryAnswers.comm_ask_preferences_before,
        comm_verbal_checkin: primaryAnswers.comm_verbal_checkin,
      },
      partnerAnswers: {
        comm_ask_preferences_before: enthusiasticPartner.comm_ask_preferences_before,
        comm_verbal_checkin: enthusiasticPartner.comm_verbal_checkin,
      },
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });
    expect(sparseComp.provisional).toBe(true);
    expect(sparseComp.bothAnsweredCount).toBe(2);
  });
});

function buildSampleAnswer(q: QuestionDefinition, bias: "high" | "low"): QuestionAnswer {
  const base: QuestionAnswer = {
    questionId: q.id,
    updatedAt: "2026-11-08T12:00:00.000Z",
    importance: bias === "high" ? "essential" : "nice_to_have",
  };
  switch (q.inputType) {
    case "enjoyment_scale":
      return {
        ...base,
        enjoyment: bias === "high" ? 5 : 2,
        experienceFrequency: q.supportsExperienceFrequency ? (bias === "high" ? 2 : 4) : undefined,
        desireDelta: q.supportsDesireDelta ? (bias === "high" ? "want_more" : "about_right") : undefined,
      };
    case "curiosity_map":
      return {
        ...base,
        curiosityLevel: bias === "high" ? "very_interested" : "not_interested",
        revealRule: q.supportsRevealRule ? "mutual_only" : undefined,
      };
    case "rating_scale":
      return { ...base, customValue: bias === "high" ? (q.scaleConfig?.max ?? 5) : (q.scaleConfig?.min ?? 1) };
    case "slider":
      return { ...base, customValue: bias === "high" ? (q.sliderConfig?.max ?? 100) : (q.sliderConfig?.min ?? 0) };
    case "ranking":
      return { ...base, customValue: (q.options || []).map((o) => o.value) };
    case "multi_select":
      return { ...base, customValue: (q.options || []).slice(0, 2).map((o) => o.value) };
    default:
      return { ...base, customValue: q.options?.[0]?.value ?? "me" };
  }
}

describe("30-Assessment Catalog & Multi-Format Engines", () => {
  it("contains all 30 published, original assessments across 4 categories with valid structure", () => {
    expect(builtInAssessments.length).toBe(30);
    expect(builtInAssessments.filter((a) => a.category === "sexuality-intimacy").length).toBe(11);
    expect(builtInAssessments.filter((a) => a.category === "romance").length).toBe(8);
    expect(builtInAssessments.filter((a) => a.category === "personality").length).toBe(5);
    expect(builtInAssessments.filter((a) => a.category === "compatibility").length).toBe(6);

    const slugs = new Set<string>();
    const ids = new Set<string>();
    const allMissingQuickDims: string[] = [];

    for (const a of builtInAssessments) {
      expect(a.status).toBe("published");
      expect(slugs.has(a.slug)).toBe(false);
      expect(ids.has(a.id)).toBe(false);
      slugs.add(a.slug);
      ids.add(a.id);
      expect(a.questions.length).toBeGreaterThanOrEqual(12);

      const qIds = new Set<string>();
      const sampleAns: Record<string, QuestionAnswer> = {};
      for (const q of a.questions) {
        expect(qIds.has(q.id)).toBe(false);
        qIds.add(q.id);
        expect(q.prompt).not.toContain("[OBSCURED]");
        expect(q.prompt.length).toBeGreaterThan(10);
        expect(q.partnerPrompt.length).toBeGreaterThan(10);
        sampleAns[q.id] = buildSampleAnswer(q, "high");
      }

      const scored = scoreAssessmentSubmission({
        resultId: `res-${a.slug}`,
        assessment: a,
        mode: "complete",
        perspective: "primary",
        answers: sampleAns,
        createdAt: "2026-11-08T12:00:00.000Z",
      });

      expect(scored.answeredCount).toBe(a.questions.length);
      expect(scored.radar.length).toBeGreaterThan(0);
      expect(scored.profile.archetypeName.length).toBeGreaterThan(2);

      if (a.supportsQuickMode) {
        const quickQs = a.questions.filter((q) => q.quickDiscovery);
        expect(quickQs.length).toBeGreaterThanOrEqual(6);
        const quickDims = new Set(quickQs.flatMap((q) => Object.keys(q.dimensionWeights)));
        for (const dim of a.dimensions || []) {
          if (!quickDims.has(dim.key)) {
            allMissingQuickDims.push(`${a.slug}:${dim.key}`);
          }
        }
      }
    }
    expect(allMissingQuickDims).toEqual([]);
  });

  it("contains zero dashes (-, en-dash, or em-dash) in user-facing strings across all 30 assessments", () => {
    const offending: string[] = [];
    const dashRe = /[-–—]/;
    const check = (loc: string, val?: string) => {
      if (val && dashRe.test(val)) offending.push(`${loc}: ${val}`);
    };

    for (const a of builtInAssessments) {
      check(`${a.slug}.title`, a.title);
      check(`${a.slug}.shortTitle`, a.shortTitle);
      check(`${a.slug}.audienceNote`, a.audienceNote);
      check(`${a.slug}.futureExtensibilityNote`, a.futureExtensibilityNote);
      check(`${a.slug}.scientificDisclaimer`, a.scientificDisclaimer);
      a.discoverPoints?.forEach((d, idx) => check(`${a.slug}.discover[${idx}]`, d));
      for (const s of a.sections) {
        check(`${a.slug}.sec(${s.id}).title`, s.title);
        check(`${a.slug}.sec(${s.id}).subtitle`, s.subtitle);
        check(`${a.slug}.sec(${s.id}).desc`, s.description);
      }
      for (const q of a.questions) {
        check(`${a.slug}.q(${q.id}).sectionTitle`, q.sectionTitle);
        check(`${a.slug}.q(${q.id}).prompt`, q.prompt);
        check(`${a.slug}.q(${q.id}).partnerPrompt`, q.partnerPrompt);
        check(`${a.slug}.q(${q.id}).observerPrompt`, q.observerPrompt);
        check(`${a.slug}.q(${q.id}).helperText`, q.helperText);
        check(`${a.slug}.q(${q.id}).scaleMin`, q.scaleConfig?.minLabel);
        check(`${a.slug}.q(${q.id}).scaleMid`, q.scaleConfig?.midLabel);
        check(`${a.slug}.q(${q.id}).scaleMax`, q.scaleConfig?.maxLabel);
        check(`${a.slug}.q(${q.id}).sliderMin`, q.sliderConfig?.minLabel);
        check(`${a.slug}.q(${q.id}).sliderMax`, q.sliderConfig?.maxLabel);
        q.options?.forEach((o, oi) => {
          check(`${a.slug}.q(${q.id}).opt[${oi}].label`, o.label);
          check(`${a.slug}.q(${q.id}).opt[${oi}].desc`, o.description);
        });
      }
    }

    expect(offending).toEqual([]);
  });

  it("enforces zero-leak mutual fantasy protocol across mutual_only, private_never_share, and share_openly", () => {
    const fantasyTest = getAssessmentBySlug("private-fantasy-matcher")!;
    const qs = fantasyTest.questions;
    const mutualQ = qs[0];
    const unmatchedCreatorQ = qs[1];
    const neverShareBothQ = qs[2];
    const openShareQ = qs[3];

    const primaryAnswers: Record<string, QuestionAnswer> = {
      [mutualQ.id]: makeAnswer(mutualQ.id, { curiosityLevel: "very_interested", revealRule: "mutual_only" }),
      [unmatchedCreatorQ.id]: makeAnswer(unmatchedCreatorQ.id, { curiosityLevel: "interested", revealRule: "mutual_only" }),
      [neverShareBothQ.id]: makeAnswer(neverShareBothQ.id, { curiosityLevel: "very_interested", revealRule: "private_never_share" }),
      [openShareQ.id]: makeAnswer(openShareQ.id, { curiosityLevel: "interested", revealRule: "always_share_with_partner" }),
    };
    const partnerAnswers: Record<string, QuestionAnswer> = {
      [mutualQ.id]: makeAnswer(mutualQ.id, { curiosityLevel: "curious_uncertain", revealRule: "mutual_only" }),
      [unmatchedCreatorQ.id]: makeAnswer(unmatchedCreatorQ.id, { curiosityLevel: "not_interested", revealRule: "mutual_only" }),
      [neverShareBothQ.id]: makeAnswer(neverShareBothQ.id, { curiosityLevel: "very_interested", revealRule: "private_never_share" }),
    };

    const report = computeCoupleCompatibility({
      compatibilityId: "cmp-fantasy",
      inviteId: "inv-f",
      assessment: fantasyTest,
      mode: "complete",
      primaryAnswers,
      partnerAnswers,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });

    const mutualIds = report.fantasyReveals!.mutuallySelected.map((m) => m.questionId);
    const openIds = report.fantasyReveals!.openlySharedByCreatorOnly.map((o) => o.questionId);

    expect(mutualIds).toContain(mutualQ.id);
    // Unmatched mutual-only MUST NOT appear anywhere in report
    expect(mutualIds).not.toContain(unmatchedCreatorQ.id);
    expect(openIds).not.toContain(unmatchedCreatorQ.id);
    // private_never_share MUST NOT appear even if both checked it!
    expect(mutualIds).not.toContain(neverShareBothQ.id);
    // share_openly appears in creator open shares
    expect(openIds).toContain(openShareQ.id);
  });

  it("scores partner trivia accuracy, voting normalization, and attachment coordinates accurately", () => {
    const triviaTest = getAssessmentBySlug("how-well-do-you-know-your-partner")!;
    const pA: Record<string, QuestionAnswer> = {};
    const pB: Record<string, QuestionAnswer> = {};
    triviaTest.questions.slice(0, 4).forEach((q, idx) => {
      pA[q.id] = makeAnswer(q.id, { customValue: q.options![0].value });
      pB[q.id] = makeAnswer(q.id, {
        customValue: idx < 3 ? q.options![0].value : q.options![1].value,
      });
    });

    const triviaReport = computeCoupleCompatibility({
      compatibilityId: "cmp-triv",
      inviteId: "inv-t",
      assessment: triviaTest,
      mode: "complete",
      primaryAnswers: pA,
      partnerAnswers: pB,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });
    expect(triviaReport.predictionSummary!.accuracyPercent).toBe(75);
    expect(triviaReport.predictionSummary!.nailedIt.length).toBe(3);
    expect(triviaReport.predictionSummary!.surprises.length).toBe(1);

    // Who is more likely to: Creator picks 'me', Partner picks 'partner' -> refers to Creator unanimously!
    const voteTest = getAssessmentBySlug("who-is-more-likely-to")!;
    const vQ = voteTest.questions[0];
    const voteReport = computeCoupleCompatibility({
      compatibilityId: "cmp-vote",
      inviteId: "inv-v",
      assessment: voteTest,
      mode: "complete",
      primaryAnswers: { [vQ.id]: makeAnswer(vQ.id, { customValue: "me" }) },
      partnerAnswers: { [vQ.id]: makeAnswer(vQ.id, { customValue: "partner" }) },
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });
    expect(voteReport.voteGameSummary!.agreementPercent).toBe(100);
    expect(voteReport.voteGameSummary!.items[0].agreed).toBe(true);

    // Multi-rater privacy threshold (< 3 suppressed)
    const mirrorTest = getAssessmentBySlug("how-others-really-see-you")!;
    const selfScores = scoreAssessmentSubmission({
      resultId: "mr-self",
      assessment: mirrorTest,
      mode: "complete",
      perspective: "primary",
      answers: Object.fromEntries(mirrorTest.questions.map((q) => [q.id, makeAnswer(q.id, { customValue: 5 })])),
      createdAt: "2026-11-08T12:00:00.000Z",
    });
    const belowThreshold = computeMultiRaterSummary({
      assessment: mirrorTest,
      selfResult: selfScores,
      raterSubmissions: [
        {
          responseId: "r-1",
          feedbackInviteId: "inv-mr",
          relationshipType: "friend",
          createdAt: "2026-11-08T12:00:00.000Z",
          answers: { [mirrorTest.questions[0].id]: makeAnswer(mirrorTest.questions[0].id, { customValue: 2 }) },
        },
        {
          responseId: "r-2",
          feedbackInviteId: "inv-mr",
          relationshipType: "close_friend",
          createdAt: "2026-11-08T12:00:00.000Z",
          answers: { [mirrorTest.questions[0].id]: makeAnswer(mirrorTest.questions[0].id, { customValue: 2 }) },
        },
      ],
      minRespondents: 3,
    });
    expect(belowThreshold.available).toBe(false);
    expect(belowThreshold.dimensionComparison[0].othersMeanScore).toBeNull();

    const unlocked = computeMultiRaterSummary({
      assessment: mirrorTest,
      selfResult: selfScores,
      raterSubmissions: [
        {
          responseId: "r-1",
          feedbackInviteId: "inv-mr",
          relationshipType: "friend",
          createdAt: "2026-11-08T12:00:00.000Z",
          answers: { [mirrorTest.questions[0].id]: makeAnswer(mirrorTest.questions[0].id, { customValue: 3 }) },
        },
        {
          responseId: "r-2",
          feedbackInviteId: "inv-mr",
          relationshipType: "close_friend",
          createdAt: "2026-11-08T12:00:00.000Z",
          answers: { [mirrorTest.questions[0].id]: makeAnswer(mirrorTest.questions[0].id, { customValue: 3 }) },
        },
        {
          responseId: "r-3",
          feedbackInviteId: "inv-mr",
          relationshipType: "partner",
          createdAt: "2026-11-08T12:00:00.000Z",
          answers: { [mirrorTest.questions[0].id]: makeAnswer(mirrorTest.questions[0].id, { customValue: 3 }) },
        },
      ],
      minRespondents: 3,
    });
    expect(unlocked.available).toBe(true);
    expect(unlocked.dimensionComparison.length).toBe(mirrorTest.dimensions!.length);
    expect(unlocked.dimensionComparison[0].othersMeanScore).not.toBeNull();
  });

  it("scores BDSM roles & complementary Top/Bottom compatibility accurately", () => {
    const bdsm = getAssessmentBySlug("bdsm-power-dynamics-test")!;
    expect(bdsm).toBeDefined();

    const domAnswers: Record<string, QuestionAnswer> = {
      bdsm_1: makeAnswer("bdsm_1", { customValue: 95 }),
      bdsm_2: makeAnswer("bdsm_2", { customValue: 7 }),
      bdsm_3: makeAnswer("bdsm_3", { customValue: 1 }),
      bdsm_4: makeAnswer("bdsm_4", { customValue: 2 }),
      bdsm_5: makeAnswer("bdsm_5", { customValue: 7 }),
      bdsm_6: makeAnswer("bdsm_6", { customValue: 1 }),
      bdsm_7: makeAnswer("bdsm_7", { customValue: "take_charge" }),
      bdsm_8: makeAnswer("bdsm_8", { customValue: 6 }),
      bdsm_13: makeAnswer("bdsm_13", { customValue: 6 }),
      bdsm_17: makeAnswer("bdsm_17", { customValue: 7 }),
      bdsm_18: makeAnswer("bdsm_18", { customValue: 7 }),
      bdsm_21: makeAnswer("bdsm_21", { customValue: 7 }),
    };

    const subAnswers: Record<string, QuestionAnswer> = {
      bdsm_1: makeAnswer("bdsm_1", { customValue: 5 }),
      bdsm_2: makeAnswer("bdsm_2", { customValue: 1 }),
      bdsm_3: makeAnswer("bdsm_3", { customValue: 7 }),
      bdsm_4: makeAnswer("bdsm_4", { customValue: 2 }),
      bdsm_5: makeAnswer("bdsm_5", { customValue: 1 }),
      bdsm_6: makeAnswer("bdsm_6", { customValue: 7 }),
      bdsm_7: makeAnswer("bdsm_7", { customValue: "offer_wrists" }),
      bdsm_8: makeAnswer("bdsm_8", { customValue: 6 }),
      bdsm_13: makeAnswer("bdsm_13", { customValue: 7 }),
      bdsm_17: makeAnswer("bdsm_17", { customValue: 2 }),
      bdsm_18: makeAnswer("bdsm_18", { customValue: 7 }),
      bdsm_21: makeAnswer("bdsm_21", { customValue: 7 }),
    };

    const scoredDom = scoreAssessmentSubmission({
      resultId: "bdsm-dom",
      assessment: bdsm,
      mode: "complete",
      perspective: "primary",
      answers: domAnswers,
      createdAt: "2026-11-08T12:00:00.000Z",
    });
    const scoredSub = scoreAssessmentSubmission({
      resultId: "bdsm-sub",
      assessment: bdsm,
      mode: "complete",
      perspective: "partner",
      answers: subAnswers,
      createdAt: "2026-11-08T12:00:00.000Z",
    });

    expect(scoredDom.profile.archetypeName).toBe("The Attentive Sovereign");
    expect(scoredSub.profile.archetypeName).toBe("The Devoted Surrenderer");
    expect(scoredDom.whatYouAreInto?.roleOrDynamicLean?.label).toBeTruthy();
    expect(
      scoredDom.whatYouAreInto?.dealbreakersAndLimits.map((d) => d.questionId)
    ).not.toContain("bdsm_1");
    expect(scoredDom.dimensionInteractions?.length).toBeGreaterThan(0);

    const polarityReport = computeCoupleCompatibility({
      compatibilityId: "cmp-bdsm-ds",
      inviteId: "inv-bdsm",
      assessment: bdsm,
      mode: "complete",
      primaryAnswers: domAnswers,
      partnerAnswers: subAnswers,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });

    expect(polarityReport.whereYouComplement.map((w) => w.questionId)).toContain("bdsm-comp-a-top");
    expect(polarityReport.overallScore).toBeGreaterThanOrEqual(70);
  });

  it("enforces zero-leak reveal rules on Kink & Fetish Exploration Map", () => {
    const kinkTest = getAssessmentBySlug("kink-exploration-map")!;
    expect(kinkTest).toBeDefined();
    expect(kinkTest.questions.length).toBe(24);

    const [qMutual, qHiddenCreator, qNeverBoth, qOpenCreator] = kinkTest.questions;

    const primaryAnswers: Record<string, QuestionAnswer> = {
      [qMutual.id]: makeAnswer(qMutual.id, { curiosityLevel: "very_interested", revealRule: "mutual_only" }),
      [qHiddenCreator.id]: makeAnswer(qHiddenCreator.id, { curiosityLevel: "very_interested", revealRule: "mutual_only" }),
      [qNeverBoth.id]: makeAnswer(qNeverBoth.id, { curiosityLevel: "interested", revealRule: "private_never_share" }),
      [qOpenCreator.id]: makeAnswer(qOpenCreator.id, { curiosityLevel: "curious_uncertain", revealRule: "always_share_with_partner" }),
    };
    const partnerAnswers: Record<string, QuestionAnswer> = {
      [qMutual.id]: makeAnswer(qMutual.id, { curiosityLevel: "interested", revealRule: "mutual_only" }),
      [qHiddenCreator.id]: makeAnswer(qHiddenCreator.id, { curiosityLevel: "not_interested", revealRule: "mutual_only" }),
      [qNeverBoth.id]: makeAnswer(qNeverBoth.id, { curiosityLevel: "very_interested", revealRule: "private_never_share" }),
    };

    const report = computeCoupleCompatibility({
      compatibilityId: "cmp-kink",
      inviteId: "inv-kink",
      assessment: kinkTest,
      mode: "complete",
      primaryAnswers,
      partnerAnswers,
      creatorSharing: fullSharing,
      partnerSharing: fullSharing,
    });

    const matchedIds = report.fantasyReveals!.mutuallySelected.map((m) => m.questionId);
    const openIds = report.fantasyReveals!.openlySharedByCreatorOnly.map((m) => m.questionId);

    expect(matchedIds).toContain(qMutual.id);
    expect(matchedIds).not.toContain(qHiddenCreator.id);
    expect(openIds).not.toContain(qHiddenCreator.id);
    expect(matchedIds).not.toContain(qNeverBoth.id);
    expect(openIds).toContain(qOpenCreator.id);
  });
});
