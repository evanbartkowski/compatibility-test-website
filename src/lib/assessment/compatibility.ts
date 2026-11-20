import { brandConfig } from "@/config/brand";
import {
  formatAnswerDisplayLabel,
  isNumericEnjoyment,
  scoreAssessmentSubmission,
  shortenPromptLabel,
} from "./scoring";
import type {
  AssessmentDefinition,
  AssessmentMode,
  CompatibilityDimensionBreakdown,
  CompatibilityPairItem,
  CompatibilityReport,
  CuriosityLevel,
  ImportanceLevel,
  QuestionAnswer,
  QuestionDefinition,
  RadarDimensionKey,
  SharingPreferences,
} from "./types";

const IMPORTANCE_WEIGHT: Record<ImportanceLevel, number> = {
  essential: 1.6,
  important: 1.25,
  nice_to_have: 1.0,
  not_important: 0.65,
};

function shortLabel(text: string): string {
  return shortenPromptLabel(text);
}

function partnerEffectiveEnthusiasm(ans: QuestionAnswer): {
  numeric: number | null;
  isWillingOnly: boolean;
  isCurious: boolean;
  isDepends: boolean;
  isBoundary: boolean;
} {
  if (ans.skipped || ans.enjoyment === "prefer_not_to_answer") {
    return {
      numeric: null,
      isWillingOnly: false,
      isCurious: false,
      isDepends: false,
      isBoundary: false,
    };
  }

  const isBoundary = Boolean(ans.firmBoundary || ans.partnerWillingness === "firm_boundary");
  if (isBoundary) {
    return {
      numeric: 1,
      isWillingOnly: false,
      isCurious: false,
      isDepends: false,
      isBoundary: true,
    };
  }

  if (ans.partnerWillingness === "curious_to_explore" || ans.enjoyment === "curious") {
    return {
      numeric: null,
      isWillingOnly: false,
      isCurious: true,
      isDepends: false,
      isBoundary: false,
    };
  }

  if (ans.partnerWillingness === "depends_on_context" || ans.enjoyment === "depends") {
    return {
      numeric: null,
      isWillingOnly: false,
      isCurious: false,
      isDepends: true,
      isBoundary: false,
    };
  }

  if (ans.partnerWillingness === "willing_if_partner_enjoys") {
    const base = isNumericEnjoyment(ans.enjoyment) ? ans.enjoyment : 3.8;
    return {
      numeric: Math.max(base, 3.6),
      isWillingOnly: true,
      isCurious: false,
      isDepends: false,
      isBoundary: false,
    };
  }

  if (ans.partnerWillingness === "enthusiastically_enjoy") {
    return {
      numeric: isNumericEnjoyment(ans.enjoyment) ? Math.max(ans.enjoyment, 4.5) : 5,
      isWillingOnly: false,
      isCurious: false,
      isDepends: false,
      isBoundary: false,
    };
  }

  if (ans.partnerWillingness === "prefer_not_to") {
    return {
      numeric: 1.5,
      isWillingOnly: false,
      isCurious: false,
      isDepends: false,
      isBoundary: false,
    };
  }

  if (isNumericEnjoyment(ans.enjoyment)) {
    return {
      numeric: ans.enjoyment,
      isWillingOnly: false,
      isCurious: false,
      isDepends: false,
      isBoundary: false,
    };
  }

  return {
    numeric: null,
    isWillingOnly: false,
    isCurious: false,
    isDepends: false,
    isBoundary: false,
  };
}

interface PairEval {
  question: QuestionDefinition;
  score: number | null;
  weight: number;
  classification: CompatibilityPairItem["classification"] | "excluded";
  explanation: string;
  boundaryConflict: boolean;
}

function evaluateCuriosityPair(
  q: QuestionDefinition,
  aLvl: CuriosityLevel,
  bLvl: CuriosityLevel,
  weight: number
): PairEval {
  if (aLvl === "firm_boundary" || bLvl === "firm_boundary") {
    const otherInterested =
      (aLvl === "firm_boundary" &&
        (bLvl === "very_interested" || bLvl === "interested")) ||
      (bLvl === "firm_boundary" &&
        (aLvl === "very_interested" || aLvl === "interested"));
    return {
      question: q,
      score: otherInterested ? 15 : 80,
      weight: weight * (otherInterested ? 1.4 : 0.9),
      classification: "boundary_protected",
      explanation: otherInterested
        ? "One partner holds a hard boundary here while the other expressed interest. Boundaries always take priority."
        : "Hard boundary clearly documented and respected between partners.",
      boundaryConflict: otherInterested,
    };
  }

  if (aLvl === "havent_considered" && bLvl === "havent_considered") {
    return {
      question: q,
      score: null,
      weight: 0,
      classification: "excluded",
      explanation: "Neither partner has formed a preference here yet.",
      boundaryConflict: false,
    };
  }

  const positive = (l: CuriosityLevel) => l === "very_interested" || l === "interested";

  if (positive(aLvl) && positive(bLvl)) {
    return {
      question: q,
      score: aLvl === "very_interested" && bLvl === "very_interested" ? 98 : 90,
      weight,
      classification: "strong_align",
      explanation: "Strong mutual enthusiasm or shared interest in exploring this together.",
      boundaryConflict: false,
    };
  }

  if (aLvl === "curious_uncertain" || bLvl === "curious_uncertain") {
    const otherPositive = positive(aLvl) || positive(bLvl);
    return {
      question: q,
      score: otherPositive || (aLvl === "curious_uncertain" && bLvl === "curious_uncertain") ? 82 : 64,
      weight,
      classification:
        otherPositive || (aLvl === "curious_uncertain" && bLvl === "curious_uncertain")
          ? "shared_curiosity"
          : "needs_discussion",
      explanation: "Curiosity and openness for a calm, pressure-free conversation.",
      boundaryConflict: false,
    };
  }

  if (aLvl === "not_interested" && bLvl === "not_interested") {
    return {
      question: q,
      score: 90,
      weight: weight * 0.85,
      classification: "strong_align",
      explanation: "Aligned in preferring to skip this activity.",
      boundaryConflict: false,
    };
  }

  return {
    question: q,
    score: aLvl === "very_interested" || bLvl === "very_interested" ? 38 : 56,
    weight,
    classification:
      aLvl === "very_interested" || bLvl === "very_interested"
        ? "potential_mismatch"
        : "needs_discussion",
    explanation:
      "Different interest levels here: worth talking through gently with zero expectation.",
    boundaryConflict: false,
  };
}

function evaluateQuestionPair(
  q: QuestionDefinition,
  aAns: QuestionAnswer | undefined,
  bAns: QuestionAnswer | undefined
): PairEval {
  if (!aAns || !bAns || aAns.skipped || bAns.skipped) {
    return {
      question: q,
      score: null,
      weight: 0,
      classification: "excluded",
      explanation: "Excluded because one or both participants skipped this item.",
      boundaryConflict: false,
    };
  }

  const aImp: ImportanceLevel = aAns.importance || "nice_to_have";
  const bImp: ImportanceLevel = bAns.importance || "nice_to_have";
  const weight = (IMPORTANCE_WEIGHT[aImp] + IMPORTANCE_WEIGHT[bImp]) / 2;

  if (aAns.curiosityLevel && bAns.curiosityLevel) {
    return evaluateCuriosityPair(q, aAns.curiosityLevel, bAns.curiosityLevel, weight);
  }

  if (
    aAns.enjoyment === "prefer_not_to_answer" ||
    bAns.enjoyment === "prefer_not_to_answer" ||
    aAns.enjoyment === "haven_t_experienced" ||
    bAns.enjoyment === "haven_t_experienced"
  ) {
    if (
      aAns.enjoyment === "curious" ||
      bAns.enjoyment === "curious" ||
      bAns.partnerWillingness === "curious_to_explore"
    ) {
      // Fall through to curiosity handling
    } else {
      return {
        question: q,
        score: null,
        weight: 0,
        classification: "excluded",
        explanation: "Excluded so untested or private responses are never penalized.",
        boundaryConflict: false,
      };
    }
  }

  const aBoundary = Boolean(aAns.firmBoundary);
  const bState = partnerEffectiveEnthusiasm(bAns);
  const aNum = isNumericEnjoyment(aAns.enjoyment) ? aAns.enjoyment : null;
  const aCurious = aAns.enjoyment === "curious";
  const aDepends = aAns.enjoyment === "depends";

  // 1. BOUNDARY PRECEDENCE
  if (aBoundary || bState.isBoundary) {
    const otherHighDesire =
      (aBoundary &&
        bState.numeric !== null &&
        bState.numeric >= 4 &&
        (bImp === "essential" || bImp === "important")) ||
      (bState.isBoundary &&
        aNum !== null &&
        aNum >= 4 &&
        (aImp === "essential" || aImp === "important"));

    if (otherHighDesire) {
      return {
        question: q,
        score: 12,
        weight: weight * 1.5,
        classification: "boundary_protected",
        explanation:
          "One partner holds a firm boundary here while the other rated it highly important. Boundaries always take precedence and should never be pressured.",
        boundaryConflict: true,
      };
    }

    return {
      question: q,
      score: 76,
      weight: weight * 0.85,
      classification: "boundary_protected",
      explanation:
        "A firm boundary was noted here; compatibility depends on honoring that limit with ease and zero pressure.",
      boundaryConflict: false,
    };
  }

  // 2. SHARED CURIOSITY / DISCUSSION
  if (aCurious && bState.isCurious) {
    return {
      question: q,
      score: 84,
      weight,
      classification: "shared_curiosity",
      explanation: q.safetySensitive
        ? "Both of you expressed curiosity, best approached through a calm, safety first conversation first."
        : "Both of you expressed genuine curiosity about exploring this together.",
      boundaryConflict: false,
    };
  }

  if (aCurious || bState.isCurious) {
    const otherNumeric = aCurious ? bState.numeric : aNum;
    if (otherNumeric !== null && otherNumeric >= 3.5) {
      return {
        question: q,
        score: 78,
        weight,
        classification: "needs_discussion",
        explanation:
          "One partner is curious while the other feels comfortable or enthusiastic, a supportive topic for low pressure talk.",
        boundaryConflict: false,
      };
    }
    return {
      question: q,
      score: 62,
      weight,
      classification: "needs_discussion",
      explanation:
        "Curiosity on one side paired with uncertainty on the other: worth clarifying gently without pressure.",
      boundaryConflict: false,
    };
  }

  if (aDepends || bState.isDepends) {
    return {
      question: q,
      score: 70,
      weight: weight * 0.9,
      classification: "needs_discussion",
      explanation:
        "Marked as context dependent by at least one partner; timing, mood, and trust shape how well this fits.",
      boundaryConflict: false,
    };
  }

  // Generic numeric / choice fallback when non-enjoyment_scale types appear
  if (aNum === null || bState.numeric === null) {
    if (
      typeof aAns.customValue === "number" &&
      typeof bAns.customValue === "number"
    ) {
      const span =
        q.inputType === "slider"
          ? (q.sliderConfig?.max ?? 100) - (q.sliderConfig?.min ?? 0)
          : (q.scaleConfig?.max ?? 5) - (q.scaleConfig?.min ?? 1);
      const safeSpan = span > 0 ? span : 4;
      const diffNorm = Math.abs(aAns.customValue - bAns.customValue) / safeSpan;
      const sc = Math.max(15, Math.round((1 - diffNorm) * 100));
      return {
        question: q,
        score: sc,
        weight,
        classification:
          diffNorm <= 0.25 ? "strong_align" : diffNorm >= 0.55 ? "potential_mismatch" : "needs_discussion",
        explanation:
          diffNorm <= 0.25
            ? "Closely aligned along this spectrum."
            : "Different points along this continuum: helpful to compare perspectives.",
        boundaryConflict: false,
      };
    }
    if (
      typeof aAns.customValue === "string" &&
      typeof bAns.customValue === "string"
    ) {
      const same = aAns.customValue === bAns.customValue;
      return {
        question: q,
        score: same ? 92 : 54,
        weight,
        classification: same ? "strong_align" : "needs_discussion",
        explanation: same
          ? "Both partners chose the exact same approach here."
          : "Different instinctive preferences, a constructive conversation prompt.",
        boundaryConflict: false,
      };
    }
    if (
      q.inputType === "ranking" &&
      Array.isArray(aAns.customValue) &&
      Array.isArray(bAns.customValue) &&
      aAns.customValue.length > 0 &&
      bAns.customValue.length > 0
    ) {
      const sameTop = aAns.customValue[0] === bAns.customValue[0];
      const topInTopTwo =
        bAns.customValue.slice(0, 2).includes(aAns.customValue[0]) ||
        aAns.customValue.slice(0, 2).includes(bAns.customValue[0]);
      const sc = sameTop ? 94 : topInTopTwo ? 78 : 56;
      return {
        question: q,
        score: sc,
        weight,
        classification: sameTop ? "strong_align" : "needs_discussion",
        explanation: sameTop
          ? "Both partners placed the exact same priority at #1."
          : topInTopTwo
            ? "Top priorities overlap in your top two choices."
            : "Different #1 anchors: worth comparing what drives each ranking.",
        boundaryConflict: false,
      };
    }
    return {
      question: q,
      score: null,
      weight: 0,
      classification: "excluded",
      explanation: "Excluded due to incomplete numeric preference data.",
      boundaryConflict: false,
    };
  }

  // 3. BOUNDARY-SENSITIVITY ITEMS
  if (q.directionality === "boundary_sensitivity") {
    const diff = Math.abs(aNum - bState.numeric);
    if (aNum >= 4 && bState.numeric >= 4) {
      return {
        question: q,
        score: 96,
        weight: weight * 1.25,
        classification: "strong_align",
        explanation:
          "Both of you strongly prioritize care, comfort, and avoiding this friction point.",
        boundaryConflict: false,
      };
    }
    const rawScore = Math.max(20, Math.round(100 - diff * 22));
    return {
      question: q,
      score: rawScore,
      weight,
      classification: diff >= 2 ? "needs_discussion" : "strong_align",
      explanation:
        diff >= 2
          ? "Different sensitivity levels here: worth clarifying expectations so neither partner feels dismissed."
          : "Compatible baseline sensitivity around emotional and physical comfort.",
      boundaryConflict: false,
    };
  }

  // 4. DIRECTIONAL & RECIPROCAL MATCHING
  const diff = Math.abs(aNum - bState.numeric);

  if (q.directionality === "receive_give" || q.directionality === "give_receive") {
    if (aNum >= 4 && bState.numeric >= 4) {
      return {
        question: q,
        score: bState.isWillingOnly ? 83 : 95,
        weight,
        classification: q.complementaryPartnerId ? "complementary" : "strong_align",
        explanation: bState.isWillingOnly
          ? "One partner strongly enjoys this while the other is willingly supportive, with room to stay mindful of mutual enthusiasm."
          : "Strong complementary alignment: what one partner delights in experiencing, the other genuinely enjoys offering.",
        boundaryConflict: false,
      };
    }

    if (aNum <= 2.5 && bState.numeric >= 4 && bImp !== "essential") {
      return {
        question: q,
        score: 72,
        weight: weight * 0.85,
        classification: "needs_discussion",
        explanation:
          "One partner enjoys engaging here while the other is lukewarm, not a mismatch when respected without pressure.",
        boundaryConflict: false,
      };
    }

    if (aNum >= 4 && bState.numeric <= 2.2) {
      return {
        question: q,
        score: Math.max(18, Math.round(62 - diff * 14)),
        weight: weight * 1.2,
        classification: "potential_mismatch",
        explanation:
          "Potential mismatch: one partner values this highly while the other prefers to avoid it.",
        boundaryConflict: false,
      };
    }
  }

  const baseScore = Math.max(15, Math.round(100 - diff * 20));
  if (aNum >= 4 && bState.numeric >= 4) {
    return {
      question: q,
      score: bState.isWillingOnly ? Math.min(84, baseScore) : Math.max(88, baseScore),
      weight,
      classification: "strong_align",
      explanation: bState.isWillingOnly
        ? "Aligned interest, with one partner expressing supportive willingness rather than independent eagerness."
        : "Both of you express strong shared appreciation here.",
      boundaryConflict: false,
    };
  }

  if (aNum <= 2 && bState.numeric <= 2) {
    return {
      question: q,
      score: 90,
      weight: weight * 0.85,
      classification: "strong_align",
      explanation:
        "You are aligned in preferring to leave this out of your shared intimacy.",
      boundaryConflict: false,
    };
  }

  if (diff >= 2.2) {
    return {
      question: q,
      score: baseScore,
      weight,
      classification: "potential_mismatch",
      explanation:
        "Notable preference difference: helpful to talk through openly rather than assuming alignment.",
      boundaryConflict: false,
    };
  }

  return {
    question: q,
    score: baseScore,
    weight,
    classification: diff <= 1 ? "strong_align" : "needs_discussion",
    explanation:
      diff <= 1
        ? "Generally aligned within a comfortable range."
        : "Mild variation in enthusiasm: easy to navigate through communication.",
    boundaryConflict: false,
  };
}

function isFantasyInterested(ans: QuestionAnswer | undefined): boolean {
  if (!ans || ans.skipped || ans.firmBoundary) return false;
  if (ans.revealRule === "private_never_share") return false;
  if (
    ans.curiosityLevel === "very_interested" ||
    ans.curiosityLevel === "interested" ||
    ans.curiosityLevel === "curious_uncertain"
  ) {
    return true;
  }
  if (isNumericEnjoyment(ans.enjoyment) && ans.enjoyment >= 4) return true;
  if (ans.enjoyment === "curious") return true;
  if (
    ans.partnerWillingness === "enthusiastically_enjoy" ||
    ans.partnerWillingness === "curious_to_explore" ||
    ans.partnerWillingness === "willing_if_partner_enjoys"
  ) {
    return true;
  }
  return false;
}

function computeFantasyMutualCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    creatorSharing,
    createdAt,
  } = params;

  const questions =
    mode === "quick" && assessment.supportsQuickMode !== false
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions;

  const primaryScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-a`,
    assessment,
    mode,
    perspective: "primary",
    answers: primaryAnswers,
    createdAt,
  });
  const partnerScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-b`,
    assessment,
    mode,
    perspective: "partner",
    answers: partnerAnswers,
    createdAt,
  });

  const mutuallySelected: Array<{ questionId: string; label: string; category: string }> = [];
  const openlySharedByCreatorOnly: Array<{ questionId: string; label: string; category: string }> = [];
  const openlySharedByPartnerOnly: Array<{ questionId: string; label: string; category: string }> = [];
  const categoryMatchCounts = new Map<string, number>();

  let privateProtectedCount = 0;
  let bothAnsweredCount = 0;

  for (const q of questions) {
    const aAns = primaryAnswers[q.id];
    const bAns = partnerAnswers[q.id];
    if (aAns && bAns && !aAns.skipped && !bAns.skipped) {
      bothAnsweredCount += 1;
    }

    const aPrivate = aAns?.revealRule === "private_never_share";
    const bPrivate = bAns?.revealRule === "private_never_share";
    const aOpen = isFantasyInterested(aAns) && !aPrivate;
    const bOpen = isFantasyInterested(bAns) && !bPrivate;

    if (aPrivate || bPrivate) {
      privateProtectedCount += 1;
      continue;
    }

    const cleanLabel = shortLabel(q.prompt);

    if (aOpen && bOpen) {
      mutuallySelected.push({
        questionId: q.id,
        label: cleanLabel,
        category: q.sectionTitle,
      });
      categoryMatchCounts.set(q.sectionTitle, (categoryMatchCounts.get(q.sectionTitle) || 0) + 1);
    } else if (aOpen && aAns?.revealRule === "always_share_with_partner") {
      openlySharedByCreatorOnly.push({
        questionId: q.id,
        label: cleanLabel,
        category: q.sectionTitle,
      });
    } else if (bOpen && bAns?.revealRule === "always_share_with_partner") {
      openlySharedByPartnerOnly.push({
        questionId: q.id,
        label: cleanLabel,
        category: q.sectionTitle,
      });
    } else if (
      (aOpen || bOpen) &&
      (aAns?.revealRule !== "always_share_with_partner" ||
        bAns?.revealRule !== "always_share_with_partner")
    ) {
      // Unmatched mutual-only selection stays confidential!
      privateProtectedCount += 1;
    }
  }

  const sharedCategoryHighlights = Array.from(categoryMatchCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${cat} (${count} shared match${count === 1 ? "" : "es"})`);

  const allowCategories = creatorSharing.shareCategoryScores && params.partnerSharing.shareCategoryScores;
  const dimensionScores: CompatibilityDimensionBreakdown[] = assessment.sections.map((sec) => {
    const count = categoryMatchCounts.get(sec.title) || 0;
    const secQuestions = questions.filter((q) => q.sectionTitle === sec.title).length || 1;
    return {
      dimension: sec.title,
      score: allowCategories ? Math.min(100, Math.round((count / secQuestions) * 140)) : null,
      pairCount: count,
      note: `${count} mutual match${count === 1 ? "" : "es"} in this theme.`,
    };
  });

  const radarOverlay = primaryScored.radar.map((pDim, idx) => ({
    dimension: pDim.dimension,
    label: pDim.label,
    primaryScore: allowCategories ? pDim.score : 0,
    partnerScore: allowCategories ? (partnerScored.radar[idx]?.score ?? 50) : 0,
  }));

  const overlapRatio =
    questions.length > 0 ? Math.min(100, Math.round((mutuallySelected.length / Math.max(4, Math.floor(questions.length * 0.3))) * 100)) : 0;

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "fantasy_mutual_reveal",
    createdAt,
    overallScore: Math.max(20, Math.min(98, overlapRatio)),
    label: "Mutual Fantasy Discovery",
    coveragePercent:
      questions.length > 0 ? Math.round((bothAnsweredCount / questions.length) * 100) : 0,
    bothAnsweredCount,
    totalEligibleCount: questions.length,
    provisional: bothAnsweredCount < 4,
    disclaimer:
      "Only mutually selected items and explicitly opted-in 'share openly' items are displayed. All unmatched mutual-only selections and 'keep completely private' choices remain hidden from both partners.",
    methodologyNotes: [
      "Zero-Exposure Mutual Reveal Protocol: an item marked 'Reveal only if mutual' appears ONLY when both partners independently select openness/curiosity without marking a hard boundary or private lock.",
      "Unmatched selections and 'Keep completely private' items are never listed individually to protect vulnerability and trust.",
    ],
    dimensionScores,
    radarOverlay,
    whereYouAlign: mutuallySelected.map((m) => ({
      questionId: m.questionId,
      sectionTitle: m.category,
      promptSummary: m.label,
      classification: "strong_align" as const,
      explanation: "Both partners independently expressed openness to exploring or discussing this.",
    })),
    whereYouComplement: [],
    whereYouDiffer: [],
    sharedCuriosities: [],
    boundaryConsiderations: [],
    coupleInsights: [
      mutuallySelected.length > 0
        ? `You unlocked ${mutuallySelected.length} mutual match${
            mutuallySelected.length === 1 ? "" : "es"
          } across ${Math.max(1, sharedCategoryHighlights.length)} theme${
            sharedCategoryHighlights.length === 1 ? "" : "s"
          }.`
        : "No direct mutual only fantasy items overlapped in this round, yet shared thematic openness still offers warm topics for low pressure talk.",
      "All unmatched private selections remained completely undisclosed to protect psychological safety.",
    ],
    conversationStarters:
      mutuallySelected.length > 0
        ? [
            `We mutually matched on "${mutuallySelected[0].label}". Is this something we would enjoy exploring through fantasy talk, mood setting, or trying together gently?`,
            "What kind of pacing, reassurance, or aftermath ritual makes trying something new feel relaxing for each of us?",
          ]
        : [
            "Which sensory mood (lighting, music, dirty talk, or roleplay) feels easiest and most playful for us to explore verbally first?",
          ],
    fantasyReveals: {
      mutuallySelected,
      openlySharedByCreatorOnly,
      openlySharedByPartnerOnly,
      sharedCategoryHighlights,
      privateProtectedCount: privateProtectedCount > 0 ? 1 : 0, // coarse boolean indicator avoids single-item inference
      privacyNotice:
        "Individual unmatched mutual-only picks and private items are omitted and never counted per item in shared views.",
    },
  };
}

function computeBucketListCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    createdAt,
  } = params;

  const questions = assessment.questions;
  const sharedItems: Array<{
    id: string;
    label: string;
    category: string;
    completed: boolean;
  }> = [];
  let onePartnerOpenCount = 0;
  let bothAnsweredCount = 0;

  for (const q of questions) {
    const a = primaryAnswers[q.id];
    const b = partnerAnswers[q.id];
    if (a && b && !a.skipped && !b.skipped) bothAnsweredCount += 1;

    const aOpen =
      a?.curiosityLevel === "very_interested" ||
      a?.curiosityLevel === "interested" ||
      a?.curiosityLevel === "curious_uncertain" ||
      (isNumericEnjoyment(a?.enjoyment) && a.enjoyment >= 4);
    const bOpen =
      b?.curiosityLevel === "very_interested" ||
      b?.curiosityLevel === "interested" ||
      b?.curiosityLevel === "curious_uncertain" ||
      (isNumericEnjoyment(b?.enjoyment) && b.enjoyment >= 4);

    if (aOpen && bOpen && !a?.firmBoundary && !b?.firmBoundary) {
      sharedItems.push({
        id: q.id,
        label: shortLabel(q.prompt),
        category: q.sectionTitle,
        completed: false,
      });
    } else if ((aOpen || bOpen) && !a?.firmBoundary && !b?.firmBoundary) {
      onePartnerOpenCount += 1;
    }
  }

  const primaryScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-a`,
    assessment,
    mode,
    perspective: "primary",
    answers: primaryAnswers,
    createdAt,
  });
  const partnerScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-b`,
    assessment,
    mode,
    perspective: "partner",
    answers: partnerAnswers,
    createdAt,
  });

  const overallScore = Math.min(
    99,
    Math.max(30, Math.round((sharedItems.length / Math.max(5, Math.floor(questions.length * 0.4))) * 95))
  );

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "bucket_list_matcher",
    createdAt,
    overallScore,
    label: "Shared Couples Bucket List",
    coveragePercent:
      questions.length > 0 ? Math.round((bothAnsweredCount / questions.length) * 100) : 0,
    bothAnsweredCount,
    totalEligibleCount: questions.length,
    provisional: bothAnsweredCount < 4,
    disclaimer:
      "Highlights shared goals, adventures, and experiences both partners want to prioritize together.",
    methodologyNotes: [
      "Shared Bucket List items appear when both partners indicate 'Interested', 'Very interested', or 'Curious' without marking a boundary.",
      "You can check off completed goals and add custom bucket list adventures directly on this shared board.",
    ],
    dimensionScores: assessment.sections.map((sec) => {
      const count = sharedItems.filter((i) => i.category === sec.title).length;
      const total = questions.filter((q) => q.sectionTitle === sec.title).length || 1;
      return {
        dimension: sec.title,
        score: Math.min(100, Math.round((count / total) * 120)),
        pairCount: count,
        note: `${count} mutual goal${count === 1 ? "" : "s"} matched.`,
      };
    }),
    radarOverlay: primaryScored.radar.map((d, idx) => ({
      dimension: d.dimension,
      label: d.label,
      primaryScore: d.score,
      partnerScore: partnerScored.radar[idx]?.score ?? 50,
    })),
    whereYouAlign: sharedItems.slice(0, 10).map((s) => ({
      questionId: s.id,
      sectionTitle: s.category,
      promptSummary: s.label,
      classification: "strong_align" as const,
      explanation: "Both of you picked this as an experience to share.",
    })),
    whereYouComplement: [],
    whereYouDiffer: [],
    sharedCuriosities: [],
    boundaryConsiderations: [],
    coupleInsights: [
      `You created a shared bucket list of ${sharedItems.length} mutual experiences${
        onePartnerOpenCount > 0 ? `, plus ${onePartnerOpenCount} areas where one partner is curious to pitch the idea` : ""
      }.`,
    ],
    conversationStarters: sharedItems.slice(0, 3).map((s) => `When should we plan "${s.label}" next?`),
    bucketListMatches: {
      sharedItems,
      onePartnerOpenCount,
    },
  };
}

function computePredictionGameCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    createdAt,
  } = params;

  const questions =
    mode === "quick" && assessment.supportsQuickMode !== false
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions;

  let correctCount = 0;
  let totalCompared = 0;
  const catStats = new Map<string, { correct: number; total: number }>();
  const surprises: Array<{ prompt: string; primaryActual: string; partnerGuess: string }> = [];
  const nailedIt: Array<{ prompt: string; answer: string }> = [];

  for (const q of questions) {
    const actual = primaryAnswers[q.id];
    const guess = partnerAnswers[q.id];
    if (!actual || !guess || actual.skipped || guess.skipped) continue;

    const aLabel = formatAnswerDisplayLabel(q, actual);
    const bLabel = formatAnswerDisplayLabel(q, guess);
    if (aLabel === "Unanswered" || bLabel === "Unanswered") continue;

    totalCompared += 1;
    let isMatch = false;
    if (
      typeof actual.customValue === "string" &&
      typeof guess.customValue === "string"
    ) {
      isMatch = actual.customValue === guess.customValue;
    } else if (
      typeof actual.customValue === "number" &&
      typeof guess.customValue === "number"
    ) {
      isMatch = Math.abs(actual.customValue - guess.customValue) <= 1;
    } else if (actual.enjoyment !== undefined && guess.enjoyment !== undefined) {
      isMatch = actual.enjoyment === guess.enjoyment;
    } else {
      isMatch = aLabel === bLabel;
    }

    const stat = catStats.get(q.sectionTitle) || { correct: 0, total: 0 };
    stat.total += 1;
    if (isMatch) {
      correctCount += 1;
      stat.correct += 1;
      nailedIt.push({ prompt: shortLabel(q.prompt), answer: aLabel });
    } else {
      surprises.push({
        prompt: shortLabel(q.prompt),
        primaryActual: aLabel,
        partnerGuess: bLabel,
      });
    }
    catStats.set(q.sectionTitle, stat);
  }

  const accuracyPercent = totalCompared > 0 ? Math.round((correctCount / totalCompared) * 100) : 0;

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "prediction_game",
    createdAt,
    overallScore: accuracyPercent,
    label: "Partner Knowledge & Trivia Accuracy",
    coveragePercent:
      questions.length > 0 ? Math.round((totalCompared / questions.length) * 100) : 0,
    bothAnsweredCount: totalCompared,
    totalEligibleCount: questions.length,
    provisional: totalCompared < 5,
    disclaimer:
      "Playful partner knowledge trivia comparing self answers with predictions for a fun conversation spark.",
    methodologyNotes: [
      "Primary answers capture ground-truth preferences; Partner answers capture predictions about the Primary participant.",
    ],
    dimensionScores: assessment.sections.map((sec) => {
      const s = catStats.get(sec.title) || { correct: 0, total: 0 };
      return {
        dimension: sec.title,
        score: s.total > 0 ? Math.round((s.correct / s.total) * 100) : null,
        pairCount: s.total,
        note: `${s.correct} of ${s.total} guesses matched.`,
      };
    }),
    radarOverlay: assessment.sections.map((sec) => {
      const s = catStats.get(sec.title) || { correct: 0, total: 0 };
      const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 50;
      return {
        dimension: sec.id,
        label: sec.title,
        primaryScore: 100,
        partnerScore: acc,
      };
    }),
    whereYouAlign: nailedIt.slice(0, 8).map((n, i) => ({
      questionId: `nailed-${i}`,
      sectionTitle: "Nailed It",
      promptSummary: n.prompt,
      classification: "strong_align" as const,
      explanation: `Correctly predicted: ${n.answer}`,
    })),
    whereYouComplement: [],
    whereYouDiffer: surprises.slice(0, 8).map((s, i) => ({
      questionId: `surprise-${i}`,
      sectionTitle: "Fun Surprises",
      promptSummary: s.prompt,
      classification: "needs_discussion" as const,
      explanation: `Actual answer: "${s.primaryActual}" vs. Guess: "${s.partnerGuess}"`,
    })),
    sharedCuriosities: [],
    boundaryConsiderations: [],
    coupleInsights: [
      `Your partner predicted ${correctCount} out of ${totalCompared} preferences accurately (${accuracyPercent}%), leaving ${surprises.length} playful surprise${
        surprises.length === 1 ? "" : "s"
      } to laugh about and swap stories over.`,
    ],
    conversationStarters: surprises.slice(0, 3).map(
      (s) => `What surprised you about "${s.prompt}" (guessed "${s.partnerGuess}", actual "${s.primaryActual}")?`
    ),
    predictionSummary: {
      accuracyPercent,
      correctCount,
      totalCompared,
      categoryAccuracy: Array.from(catStats.entries()).map(([category, st]) => ({
        category,
        correct: st.correct,
        total: st.total,
      })),
      surprises: surprises.slice(0, 12),
      nailedIt: nailedIt.slice(0, 12),
    },
  };
}

function normalizeVoteTarget(
  val: string,
  perspective: "primary" | "partner"
): { canonical: string; display: string } {
  if (val === "me") {
    return perspective === "primary"
      ? { canonical: "person_a", display: "Assessment Creator" }
      : { canonical: "person_b", display: "Invited Partner" };
  }
  if (val === "partner") {
    return perspective === "primary"
      ? { canonical: "person_b", display: "Invited Partner" }
      : { canonical: "person_a", display: "Assessment Creator" };
  }
  if (val === "both" || val === "both_equally") {
    return { canonical: "both", display: "Both Equally" };
  }
  return { canonical: val, display: val };
}

function computeVotingGameCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    primaryAnswers,
    partnerAnswers,
    createdAt,
  } = params;

  const items: Array<{
    questionId: string;
    prompt: string;
    primaryVote: string;
    partnerVote: string;
    agreed: boolean;
  }> = [];

  for (const q of assessment.questions) {
    const a = primaryAnswers[q.id];
    const b = partnerAnswers[q.id];
    if (!a || !b || a.skipped || b.skipped) continue;
    if (typeof a.customValue !== "string" || typeof b.customValue !== "string") continue;

    const aNorm = normalizeVoteTarget(a.customValue, "primary");
    const bNorm = normalizeVoteTarget(b.customValue, "partner");
    items.push({
      questionId: q.id,
      prompt: shortLabel(q.prompt),
      primaryVote: aNorm.display,
      partnerVote: bNorm.display,
      agreed: aNorm.canonical === bNorm.canonical,
    });
  }

  const agreedCount = items.filter((i) => i.agreed).length;
  const agreementPercent =
    items.length > 0 ? Math.round((agreedCount / items.length) * 100) : 0;

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "voting_game",
    createdAt,
    overallScore: agreementPercent,
    label: "Couple Perception Agreement",
    coveragePercent:
      assessment.questions.length > 0
        ? Math.round((items.length / assessment.questions.length) * 100)
        : 0,
    bothAnsweredCount: items.length,
    totalEligibleCount: assessment.questions.length,
    provisional: items.length < 5,
    disclaimer:
      "Playful couple comparison highlighting how similarly you view your everyday roles, habits, and shared humor.",
    methodologyNotes: [
      "Votes are normalized automatically across creator and partner perspectives so 'Me' and 'My Partner' always refer to the same person.",
    ],
    dimensionScores: assessment.sections.map((sec) => {
      const secItems = items.filter((it) => {
        const q = assessment.questions.find((qq) => qq.id === it.questionId);
        return q?.sectionTitle === sec.title;
      });
      const hits = secItems.filter((it) => it.agreed).length;
      return {
        dimension: sec.title,
        score: secItems.length > 0 ? Math.round((hits / secItems.length) * 100) : null,
        pairCount: secItems.length,
        note: `${hits}/${secItems.length} unanimous votes.`,
      };
    }),
    radarOverlay: assessment.sections.map((sec) => {
      const secItems = items.filter((it) => {
        const q = assessment.questions.find((qq) => qq.id === it.questionId);
        return q?.sectionTitle === sec.title;
      });
      const pct =
        secItems.length > 0
          ? Math.round((secItems.filter((it) => it.agreed).length / secItems.length) * 100)
          : 50;
      return {
        dimension: sec.id,
        label: sec.title,
        primaryScore: pct,
        partnerScore: pct,
      };
    }),
    whereYouAlign: items
      .filter((i) => i.agreed)
      .slice(0, 8)
      .map((i) => ({
        questionId: i.questionId,
        sectionTitle: "Unanimous Votes",
        promptSummary: i.prompt,
        classification: "strong_align" as const,
        explanation: `Both voted: ${i.primaryVote}`,
      })),
    whereYouComplement: [],
    whereYouDiffer: items
      .filter((i) => !i.agreed)
      .slice(0, 8)
      .map((i) => ({
        questionId: i.questionId,
        sectionTitle: "Split Votes",
        promptSummary: i.prompt,
        classification: "needs_discussion" as const,
        explanation: `Creator voted "${i.primaryVote}" · Partner voted "${i.partnerVote}"`,
      })),
    sharedCuriosities: [],
    boundaryConsiderations: [],
    coupleInsights: [
      `You agreed unanimously on ${agreedCount} out of ${items.length} prompts (${agreementPercent}%).`,
    ],
    conversationStarters: items
      .filter((i) => !i.agreed)
      .slice(0, 3)
      .map((i) => `Wait, why did we vote differently on "${i.prompt}"?`),
    voteGameSummary: {
      agreementPercent,
      items,
    },
  };
}

function computeGiveReceiveCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    creatorSharing,
    partnerSharing,
    createdAt,
  } = params;

  const primaryScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-a`,
    assessment,
    mode,
    perspective: "primary",
    answers: primaryAnswers,
    createdAt,
  });
  const partnerScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-b`,
    assessment,
    mode,
    perspective: "partner",
    answers: partnerAnswers,
    createdAt,
  });

  const aChannels = primaryScored.dualChannelScores || [];
  const bChannels = partnerScored.dualChannelScores || [];

  const pairings = aChannels.map((aCh) => {
    const bCh = bChannels.find((x) => x.channelKey === aCh.channelKey) || aCh;
    // How well B expresses what A needs, and how well A expresses what B needs
    const aFit = 100 - Math.max(0, aCh.receiveOrNeedScore - bCh.expressOrOfferScore);
    const bFit = 100 - Math.max(0, bCh.receiveOrNeedScore - aCh.expressOrOfferScore);
    const pairScore = Math.round((aFit + bFit) / 2);
    return {
      channel: aCh.label,
      aReceivesFromB: Math.max(0, Math.min(100, aFit)),
      bReceivesFromA: Math.max(0, Math.min(100, bFit)),
      pairScore,
      summary:
        pairScore >= 82
          ? `Strong natural synergy in ${aCh.label.toLowerCase()}.`
          : `Worth conscious effort around ${aCh.label.toLowerCase()} so neither partner assumes the other receives affection the same way.`,
    };
  });

  const overallScore =
    pairings.length > 0
      ? Math.round(pairings.reduce((s, p) => s + p.pairScore, 0) / pairings.length)
      : 70;
  const allowCategories = creatorSharing.shareCategoryScores && partnerSharing.shareCategoryScores;

  const bothAnsweredCount = Math.min(primaryScored.answeredCount, partnerScored.answeredCount);
  const totalEligibleCount = assessment.questions.length;

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "affection_give_receive",
    createdAt,
    overallScore,
    label: "Give-vs-Receive Alignment",
    coveragePercent:
      totalEligibleCount > 0 ? Math.round((bothAnsweredCount / totalEligibleCount) * 100) : 0,
    bothAnsweredCount,
    totalEligibleCount,
    provisional: bothAnsweredCount < 4,
    disclaimer:
      "Compares how each partner needs to receive care, affection, or reassurance against how naturally the other enjoys expressing it.",
    methodologyNotes: [
      "Give-vs-Receive Pairing: compares Partner A's Need/Receive score against Partner B's Express/Offer score in each channel (and vice versa).",
    ],
    dimensionScores: pairings.map((p) => ({
      dimension: p.channel,
      score: allowCategories ? p.pairScore : null,
      pairCount: 2,
      note: p.summary,
    })),
    radarOverlay: primaryScored.radar.map((d, idx) => ({
      dimension: d.dimension,
      label: d.label,
      primaryScore: allowCategories ? d.score : 0,
      partnerScore: allowCategories ? (partnerScored.radar[idx]?.score ?? 50) : 0,
    })),
    whereYouAlign: pairings
      .filter((p) => p.pairScore >= 80)
      .map((p) => ({
        questionId: p.channel,
        sectionTitle: p.channel,
        promptSummary: p.channel,
        classification: "complementary" as const,
        explanation: p.summary,
      })),
    whereYouComplement: pairings
      .filter((p) => p.pairScore >= 72)
      .map((p) => ({
        questionId: `comp-${p.channel}`,
        sectionTitle: p.channel,
        promptSummary: p.channel,
        classification: "complementary" as const,
        explanation: p.summary,
      })),
    whereYouDiffer: pairings
      .filter((p) => p.pairScore < 75)
      .map((p) => ({
        questionId: `diff-${p.channel}`,
        sectionTitle: p.channel,
        promptSummary: p.channel,
        classification: "needs_discussion" as const,
        explanation: p.summary,
      })),
    sharedCuriosities: [],
    boundaryConsiderations: [],
    coupleInsights: pairings.slice(0, 3).map((p) => p.summary),
    conversationStarters: pairings.slice(0, 2).map(
      (p) =>
        `What specific small gesture helps you feel ${p.channel.toLowerCase()} most clearly on a stressful week?`
    ),
    giveReceivePairings: pairings.map(({ channel, aReceivesFromB, bReceivesFromA, summary }) => ({
      channel,
      aReceivesFromB,
      bReceivesFromA,
      summary,
    })),
  };
}

function computeDimensionAlignmentCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt: string;
}): CompatibilityReport {
  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    creatorSharing,
    partnerSharing,
    createdAt,
  } = params;

  const primaryScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-a`,
    assessment,
    mode,
    perspective: "primary",
    answers: primaryAnswers,
    createdAt,
  });
  const partnerScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-b`,
    assessment,
    mode,
    perspective: "partner",
    answers: partnerAnswers,
    createdAt,
  });

  const allowCategories = creatorSharing.shareCategoryScores && partnerSharing.shareCategoryScores;
  const isBdsmComplementary = assessment.slug === "bdsm-power-dynamics-test";
  const aDomScore = primaryScored.radar.find((r) => r.dimension === "dominance_top")?.score ?? 50;
  const aSubScore = primaryScored.radar.find((r) => r.dimension === "submission_bottom")?.score ?? 50;
  const bDomScore = partnerScored.radar.find((r) => r.dimension === "dominance_top")?.score ?? 50;
  const bSubScore = partnerScored.radar.find((r) => r.dimension === "submission_bottom")?.score ?? 50;

  const dimensionScores: CompatibilityDimensionBreakdown[] = primaryScored.radar.map((pDim, idx) => {
    const bScore = partnerScored.radar[idx]?.score ?? 50;
    const pairCount = Math.min(
      pDim.answeredCount,
      partnerScored.radar[idx]?.answeredCount ?? pDim.answeredCount
    );

    if (isBdsmComplementary && pDim.dimension === "dominance_top") {
      // Complementary fit: Creator's Dominant/Top drive matched against Partner's Submissive/Bottom receptivity
      const diff = Math.abs(aDomScore - bSubScore);
      const fit = Math.max(15, Math.round(100 - diff * 1.05));
      return {
        dimension: "Creator Lead ↔ Partner Surrender",
        score: allowCategories ? fit : null,
        pairCount,
        note:
          diff <= 18
            ? `Strong complementary polarity (Creator Top ${aDomScore} ↔ Partner Bottom ${bSubScore}).`
            : `Gap between Creator's drive to command (${aDomScore}) and Partner's appetite to yield (${bSubScore}).`,
      };
    }

    if (isBdsmComplementary && pDim.dimension === "submission_bottom") {
      const diff = Math.abs(bDomScore - aSubScore);
      const fit = Math.max(15, Math.round(100 - diff * 1.05));
      return {
        dimension: "Partner Lead ↔ Creator Surrender",
        score: allowCategories ? fit : null,
        pairCount,
        note:
          diff <= 18
            ? `Balanced polarity when roles reverse (Partner Top ${bDomScore} ↔ Creator Bottom ${aSubScore}).`
            : `Contrast between Partner's Top drive (${bDomScore}) and Creator's Bottom pull (${aSubScore}).`,
      };
    }

    const diff = Math.abs(pDim.score - bScore);
    const dimAlign = Math.max(15, Math.round(100 - diff * 1.1));
    return {
      dimension: pDim.label,
      score: allowCategories ? dimAlign : null,
      pairCount,
      note:
        diff <= 14
          ? `Very similar baseline (${pDim.score} vs ${bScore}).`
          : `Notable contrast (${pDim.score} vs ${bScore}): helpful to discuss how you balance this.`,
    };
  });

  const questions =
    mode === "quick" && assessment.supportsQuickMode !== false
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions;

  const evals = questions
    .map((q) => evaluateQuestionPair(q, primaryAnswers[q.id], partnerAnswers[q.id]))
    .filter((e) => e.score !== null && e.classification !== "excluded");

  const validScores = dimensionScores
    .map((d) => d.score)
    .filter((s): s is number => typeof s === "number");
  const itemAvg =
    evals.length > 0
      ? evals.reduce((s, e) => s + (e.score || 0), 0) / evals.length
      : null;
  const dimAvg =
    validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 70;
  const overallScore = Math.round(itemAvg !== null ? dimAvg * 0.6 + itemAvg * 0.4 : dimAvg);

  const whereYouAlign = evals
    .filter((e) => e.classification === "strong_align")
    .slice(0, 6)
    .map((e) => ({
      questionId: e.question.id,
      sectionTitle: e.question.sectionTitle,
      promptSummary: shortLabel(e.question.prompt),
      classification: "strong_align" as const,
      explanation: e.explanation,
    }));

  const whereYouDiffer = evals
    .filter((e) => e.classification === "potential_mismatch" || e.classification === "needs_discussion")
    .slice(0, 6)
    .map((e) => ({
      questionId: e.question.id,
      sectionTitle: e.question.sectionTitle,
      promptSummary: shortLabel(e.question.prompt),
      classification:
        e.classification === "potential_mismatch"
          ? ("potential_mismatch" as const)
          : ("needs_discussion" as const),
      explanation: e.explanation,
    }));

  const boundaryConsiderations = evals
    .filter((e) => e.classification === "boundary_protected")
    .map((e) => ({
      questionId: e.question.id,
      sectionTitle: e.question.sectionTitle,
      promptSummary: shortLabel(e.question.prompt),
      classification: "boundary_protected" as const,
      explanation: e.explanation,
    }));

  const bothAnsweredCount = Math.max(
    evals.length,
    Math.min(primaryScored.answeredCount, partnerScored.answeredCount)
  );
  const totalEligibleCount = questions.length;

  const whereYouComplement: CompatibilityPairItem[] = [];
  if (isBdsmComplementary) {
    if (aDomScore >= 62 && bSubScore >= 62) {
      whereYouComplement.push({
        questionId: "bdsm-comp-a-top",
        sectionTitle: "Power Polarity",
        promptSummary: "Creator Top / Dominant energy ↔ Partner Bottom / Submissive pull",
        classification: "complementary",
        explanation: `Natural D/s fit: Creator's commanding drive (${aDomScore}/100) meets Partner's surrender appetite (${bSubScore}/100).`,
      });
    }
    if (bDomScore >= 62 && aSubScore >= 62) {
      whereYouComplement.push({
        questionId: "bdsm-comp-b-top",
        sectionTitle: "Power Polarity",
        promptSummary: "Partner Top / Dominant energy ↔ Creator Bottom / Submissive pull",
        classification: "complementary",
        explanation: `Natural D/s fit: Partner's commanding drive (${bDomScore}/100) meets Creator's surrender appetite (${aSubScore}/100).`,
      });
    }
  }

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: assessment.compatibilityStrategy || "trait_similarity_complement",
    createdAt,
    overallScore,
    label: `${assessment.shortTitle} Compatibility`,
    coveragePercent:
      totalEligibleCount > 0 ? Math.round((bothAnsweredCount / totalEligibleCount) * 100) : 0,
    bothAnsweredCount,
    totalEligibleCount,
    provisional: bothAnsweredCount < 4,
    disclaimer:
      assessment.scientificDisclaimer ||
      "Highlights similarities, complementary strengths, and conversation topics based on your answers, not a prediction of future success.",
    methodologyNotes: [
      `Compares dimensional averages and individual response alignment across ${assessment.title}.`,
    ],
    dimensionScores,
    radarOverlay: primaryScored.radar.map((d, idx) => ({
      dimension: d.dimension,
      label: d.label,
      primaryScore: allowCategories ? d.score : 0,
      partnerScore: allowCategories ? (partnerScored.radar[idx]?.score ?? 50) : 0,
    })),
    whereYouAlign,
    whereYouComplement,
    whereYouDiffer,
    sharedCuriosities: [],
    boundaryConsiderations,
    coupleInsights: [
      `Creator leans toward "${primaryScored.profile.archetypeName}" while Partner leans toward "${partnerScored.profile.archetypeName}".`,
      ...dimensionScores
        .filter((d) => d.score !== null)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 1)
        .map((d) => `Strongest shared anchor: ${d.dimension} (${d.score}/100 alignment).`),
    ],
    conversationStarters: whereYouDiffer.slice(0, 2).map(
      (w) => `We scored differently around "${w.promptSummary}". How do we each picture the best balance here?`
    ),
  };
}

export function computeCoupleCompatibility(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt?: string;
}): CompatibilityReport {
  const createdAt = params.createdAt || new Date().toISOString();
  const strategy = params.assessment.compatibilityStrategy || "intimacy_complementary";

  if (strategy === "fantasy_mutual_reveal") {
    return computeFantasyMutualCompatibility({ ...params, createdAt });
  }
  if (strategy === "bucket_list_matcher") {
    return computeBucketListCompatibility({ ...params, createdAt });
  }
  if (strategy === "prediction_game") {
    return computePredictionGameCompatibility({ ...params, createdAt });
  }
  if (strategy === "voting_game") {
    return computeVotingGameCompatibility({ ...params, createdAt });
  }
  if (strategy === "affection_give_receive") {
    return computeGiveReceiveCompatibility({ ...params, createdAt });
  }
  if (strategy === "trait_similarity_complement" || strategy === "values_alignment") {
    return computeDimensionAlignmentCompatibility({ ...params, createdAt });
  }

  const {
    compatibilityId,
    inviteId,
    assessment,
    mode,
    primaryAnswers,
    partnerAnswers,
    creatorSharing,
    partnerSharing,
  } = params;

  const eligibleQuestions = (
    mode === "quick"
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions
  ).filter((q) => q.eligibleForMatching);

  const primaryScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-a`,
    assessment,
    mode,
    perspective: "primary",
    answers: primaryAnswers,
    createdAt,
  });

  const partnerScored = scoreAssessmentSubmission({
    resultId: `${compatibilityId}-b`,
    assessment,
    mode,
    perspective: "partner",
    answers: partnerAnswers,
    createdAt,
  });

  const evals = eligibleQuestions.map((q) =>
    evaluateQuestionPair(q, primaryAnswers[q.id], partnerAnswers[q.id])
  );

  const validEvals = evals.filter((e) => e.score !== null && e.classification !== "excluded");

  let totalWeight = 0;
  let weightedSum = 0;
  let boundaryConflicts = 0;

  for (const ev of validEvals) {
    weightedSum += (ev.score as number) * ev.weight;
    totalWeight += ev.weight;
    if (ev.boundaryConflict) boundaryConflicts += 1;
  }

  let overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  if (boundaryConflicts > 0) {
    const cap = Math.max(40, 82 - boundaryConflicts * 12);
    overallScore = Math.min(overallScore, cap);
  }

  const bothAnsweredCount = validEvals.length;
  const totalEligibleCount = eligibleQuestions.length;
  const coveragePercent =
    totalEligibleCount > 0 ? Math.round((bothAnsweredCount / totalEligibleCount) * 100) : 0;
  const provisional = coveragePercent < 30 || bothAnsweredCount < 5;

  const sectionGroups = new Map<string, PairEval[]>();
  for (const ev of validEvals) {
    const title = ev.question.sectionTitle;
    if (!sectionGroups.has(title)) sectionGroups.set(title, []);
    sectionGroups.get(title)!.push(ev);
  }

  const allowCategories = creatorSharing.shareCategoryScores && partnerSharing.shareCategoryScores;
  const dimensionScores: CompatibilityDimensionBreakdown[] = assessment.sections.map((sec) => {
    const group = sectionGroups.get(sec.title) || [];
    if (!allowCategories) {
      return {
        dimension: sec.title,
        score: null,
        pairCount: group.length,
        note: "Hidden by participant sharing preferences.",
      };
    }
    if (group.length === 0) {
      return {
        dimension: sec.title,
        score: null,
        pairCount: 0,
        note: "Insufficient shared answers in this category yet.",
      };
    }
    const wSum = group.reduce((s, e) => s + (e.score as number) * e.weight, 0);
    const wDen = group.reduce((s, e) => s + e.weight, 0);
    return {
      dimension: sec.title,
      score: Math.round(wSum / wDen),
      pairCount: group.length,
      note: `Computed from ${group.length} matched question pair${group.length === 1 ? "" : "s"}.`,
    };
  });

  const radarOverlay = primaryScored.radar.map((pDim, idx) => ({
    dimension: pDim.dimension as RadarDimensionKey,
    label: pDim.label,
    primaryScore: allowCategories ? pDim.score : 0,
    partnerScore: allowCategories ? (partnerScored.radar[idx]?.score ?? 50) : 0,
  }));

  const allowAlign = creatorSharing.shareAlignedHighlights && partnerSharing.shareAlignedHighlights;
  const allowComp =
    creatorSharing.shareComplementaryHighlights && partnerSharing.shareComplementaryHighlights;
  const allowCuriosity =
    creatorSharing.shareSharedCuriosities && partnerSharing.shareSharedCuriosities;
  const allowBoundaries =
    creatorSharing.shareHighLevelBoundariesWithoutDetails &&
    partnerSharing.shareHighLevelBoundariesWithoutDetails;

  const toItem = (e: PairEval): CompatibilityPairItem => ({
    questionId: e.question.id,
    sectionTitle: e.question.sectionTitle,
    promptSummary: shortLabel(e.question.prompt),
    classification: e.classification === "excluded" ? "needs_discussion" : e.classification,
    explanation: e.explanation,
    safetySensitive: e.question.safetySensitive,
  });

  const whereYouAlign = allowAlign
    ? validEvals
        .filter((e) => e.classification === "strong_align")
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 8)
        .map(toItem)
    : [];

  const whereYouComplement = allowComp
    ? validEvals
        .filter((e) => e.classification === "complementary")
        .slice(0, 6)
        .map(toItem)
    : [];

  const whereYouDiffer = allowAlign
    ? validEvals
        .filter((e) => e.classification === "potential_mismatch" || e.classification === "needs_discussion")
        .sort((a, b) => (a.score ?? 100) - (b.score ?? 100))
        .slice(0, 6)
        .map(toItem)
    : [];

  const sharedCuriosities = allowCuriosity
    ? validEvals
        .filter((e) => e.classification === "shared_curiosity")
        .slice(0, 6)
        .map(toItem)
    : [];

  const boundaryConsiderations = allowBoundaries
    ? validEvals
        .filter((e) => e.classification === "boundary_protected")
        .map((e) => ({
          questionId: e.question.id,
          sectionTitle: e.question.sectionTitle,
          promptSummary: e.boundaryConflict
            ? `Priority boundary area (${e.question.sectionTitle})`
            : `Protected boundary (${e.question.sectionTitle})`,
          classification: "boundary_protected" as const,
          explanation: e.explanation,
          safetySensitive: e.question.safetySensitive,
        }))
    : [];

  const coupleInsights: string[] = [];
  if (whereYouComplement.length > 0) {
    coupleInsights.push(
      "Natural complementary alignment on directional desires, where what one partner enjoys receiving matches what the other genuinely loves giving."
    );
  }
  const commDim = dimensionScores.find((d) => d.dimension.includes("Communication"));
  if (commDim?.score !== null && commDim && commDim.score >= 75) {
    coupleInsights.push(
      `Communication alignment scored ${commDim.score}/100, giving you an easy baseline for talking through differences openly.`
    );
  }
  if (boundaryConflicts > 0) {
    coupleInsights.push(
      `There ${boundaryConflicts === 1 ? "is 1 high priority area" : `are ${boundaryConflicts} areas`} where a firm boundary meets a preference on the other side. Honoring those boundaries takes priority over average compatibility.`
    );
  }
  if (sharedCuriosities.length > 0) {
    coupleInsights.push(
      `You share ${sharedCuriosities.length} area${sharedCuriosities.length === 1 ? "" : "s"} of mutual curiosity to explore in relaxed conversation.`
    );
  }
  if (coupleInsights.length === 0) {
    coupleInsights.push(
      `Based on ${bothAnsweredCount} matched responses (${coveragePercent}% of eligible items), this overview summarizes shared ground and areas to talk through.`
    );
  }

  const conversationStarters = [
    "How do each of us prefer to ask when we want to change pace or try something new?",
    "What helps each of us feel most wanted, relaxed, and connected afterward?",
    ...(whereYouDiffer.length > 0
      ? [
          `We scored differently around "${whereYouDiffer[0].promptSummary}". What feels best for each of us there?`,
        ]
      : []),
    ...(sharedCuriosities.length > 0
      ? [
          `We both felt curious about "${sharedCuriosities[0].promptSummary}". Should we talk about what appeals to us about it first?`,
        ]
      : []),
  ];

  return {
    compatibilityId,
    inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: strategy,
    createdAt,
    overallScore,
    label: `${assessment.shortTitle} Compatibility`,
    coveragePercent,
    bothAnsweredCount,
    totalEligibleCount,
    provisional,
    disclaimer:
      "Measures alignment on the specific preferences assessed, not a guarantee of long term relationship fit.",
    methodologyNotes: [
      `Scoring Engine v${brandConfig.scoringEngineVersion} (deterministic, versioned).`,
      "Directional items match one partner's desire to experience with the other's enthusiasm. Willingness alone scores lower than mutual eagerness.",
      "Unanswered, skipped, 'haven't experienced', and 'prefer not to answer' items are excluded cleanly from the math.",
      "Firm boundaries always take precedence and prevent averages from hiding a non negotiable limit.",
    ],
    dimensionScores,
    radarOverlay,
    whereYouAlign,
    whereYouComplement,
    whereYouDiffer,
    sharedCuriosities,
    boundaryConsiderations,
    coupleInsights,
    conversationStarters,
  };
}
