import { brandConfig } from "@/config/brand";
import { selectAssessmentQuestions } from "./definition";
import { formatIntimacyAnswer, scoreIntimacyProfile } from "./intimacy-profile";
import { attachPersonalizedAdvice } from "./advice";
import type {
  AssessmentDefinition,
  AssessmentMode,
  CuriosityGroupSummary,
  CuriosityLevel,
  DimensionDefinition,
  DimensionInteractionInsight,
  DualChannelScore,
  EnjoymentResponse,
  ExperienceFrequencyResponse,
  IdealPartnerReport,
  ImportanceLevel,
  IntoDimensionLink,
  IntoEvidenceItem,
  IntoItemTag,
  MultiRaterSubmissionRecord,
  PersonalProfileSummary,
  PriorityRankItem,
  QaSummaryEntry,
  QuestionAnswer,
  QuestionAnswerSummary,
  QuestionDefinition,
  RadarDimensionKey,
  RadarDimensionScore,
  ScatterPoint,
  ScoredAssessmentResult,
  UnmetPreferenceInsight,
  WhatYouAreIntoSummary,
} from "./types";

const RADAR_LABELS: Record<RadarDimensionKey, string> = {
  communication: "Communication",
  sensuality: "Sensuality",
  exploration: "Exploration",
  assertiveness: "Assertiveness",
  emotionalConnection: "Emotional Connection",
  playfulness: "Playfulness",
  mutualAttentiveness: "Mutual Attentiveness",
};

const IMPORTANCE_MULTIPLIER: Record<ImportanceLevel, number> = {
  essential: 1.5,
  important: 1.2,
  nice_to_have: 1.0,
  not_important: 0.65,
};

const CURIOSITY_LABELS: Record<CuriosityLevel, string> = {
  very_interested: "Very Interested",
  interested: "Interested",
  curious_uncertain: "Curious / Uncertain",
  not_interested: "Not Interested",
  firm_boundary: "Hard Boundary",
  havent_considered: "Haven't Considered",
};

export function isNumericEnjoyment(
  val: EnjoymentResponse | undefined,
): val is 1 | 2 | 3 | 4 | 5 {
  return typeof val === "number" && val >= 1 && val <= 5;
}

export function isNumericExperience(
  val: ExperienceFrequencyResponse | undefined,
): val is 1 | 2 | 3 | 4 | 5 {
  return typeof val === "number" && val >= 1 && val <= 5;
}

export function formatEnjoymentLabel(
  val: EnjoymentResponse | undefined,
): string {
  switch (val) {
    case 1:
      return "Strongly dislike";
    case 2:
      return "Dislike";
    case 3:
      return "Neutral";
    case 4:
      return "Like";
    case 5:
      return "Strongly like";
    case "haven_t_experienced":
      return "Haven't experienced";
    case "curious":
      return "Curious about trying";
    case "depends":
      return "Depends on situation";
    case "prefer_not_to_answer":
      return "Prefer not to answer";
    default:
      return "Unanswered";
  }
}

export function formatImportanceLabel(
  importance: ImportanceLevel | undefined,
): string {
  switch (importance) {
    case "essential":
      return "Essential";
    case "important":
      return "Important";
    case "nice_to_have":
      return "Nice to have";
    case "not_important":
      return "Low priority";
    default:
      return "Nice to have";
  }
}

export function formatCuriosityLabel(
  level: CuriosityLevel | undefined,
): string {
  return level ? CURIOSITY_LABELS[level] : "Unanswered";
}

export function formatAnswerDisplayLabel(
  q: QuestionDefinition,
  ans: QuestionAnswer | undefined,
): string {
  if (q.inputType === "intimacy_profile") return formatIntimacyAnswer(q, ans);
  if (!ans || ans.skipped) return "Skipped";
  if (ans.curiosityLevel) return formatCuriosityLabel(ans.curiosityLevel);
  if (ans.firmBoundary && q.inputType === "enjoyment_scale") {
    return "Firm boundary (do not want)";
  }
  if (ans.partnerWillingness) {
    switch (ans.partnerWillingness) {
      case "enthusiastically_enjoy":
        return "Enthusiastically enjoy";
      case "willing_if_partner_enjoys":
        return "Willing if partner enjoys";
      case "curious_to_explore":
        return "Curious to explore";
      case "depends_on_context":
        return "Depends on context";
      case "prefer_not_to":
        return "Prefer not to";
      case "firm_boundary":
        return "Firm boundary";
    }
  }
  if (ans.customValue !== undefined) {
    if (Array.isArray(ans.customValue)) {
      const labels = ans.customValue.map(
        (v) => q.options?.find((o) => o.value === v)?.label || v,
      );
      return labels.length > 0 ? labels.join(", ") : "None selected";
    }
    if (typeof ans.customValue === "string") {
      const match = q.options?.find((o) => o.value === ans.customValue);
      return match ? match.label : ans.customValue;
    }
    if (typeof ans.customValue === "number") {
      if (q.sliderConfig?.unit) {
        return `${ans.customValue} ${q.sliderConfig.unit}`;
      }
      if (q.scaleConfig) {
        if (
          q.scaleConfig.min === 1 &&
          q.scaleConfig.max === 7 &&
          q.scaleConfig.maxLabel === "Strongly agree"
        ) {
          return (
            [
              "Strongly disagree",
              "Disagree",
              "Somewhat disagree",
              "Neither agree nor disagree",
              "Somewhat agree",
              "Agree",
              "Strongly agree",
            ][ans.customValue - 1] ?? String(ans.customValue)
          );
        }
        return `${ans.customValue} / ${q.scaleConfig.max}`;
      }
      return String(ans.customValue);
    }
  }
  if (ans.enjoyment !== undefined) {
    return formatEnjoymentLabel(ans.enjoyment);
  }
  if (ans.firmBoundary) return "Marked as boundary";
  return "Unanswered";
}

function getEffectiveRatingForScoring(
  _question: QuestionDefinition,
  answer: QuestionAnswer,
): number | null {
  if (answer.skipped) return null;
  if (answer.firmBoundary) return 1;
  if (isNumericEnjoyment(answer.enjoyment)) {
    return answer.enjoyment;
  }
  if (answer.partnerWillingness === "enthusiastically_enjoy") return 5;
  if (answer.partnerWillingness === "willing_if_partner_enjoys") return 3.8;
  if (answer.partnerWillingness === "prefer_not_to") return 1.5;
  if (answer.partnerWillingness === "firm_boundary") return 1;
  return null;
}

function normalizeQuestionAnswer0to100(
  q: QuestionDefinition,
  ans: QuestionAnswer,
): number | null {
  if (ans.skipped) return null;
  if (ans.firmBoundary || ans.curiosityLevel === "firm_boundary") return 0;
  if (ans.curiosityLevel) {
    switch (ans.curiosityLevel) {
      case "very_interested":
        return 95;
      case "interested":
        return 78;
      case "curious_uncertain":
        return 58;
      case "not_interested":
        return 18;
      case "havent_considered":
        return null;
    }
  }
  if (q.inputType === "slider" && typeof ans.customValue === "number") {
    const min = q.sliderConfig?.min ?? 0;
    const max = q.sliderConfig?.max ?? 100;
    const ratio = max > min ? (ans.customValue - min) / (max - min) : 0.5;
    const raw = Math.max(0, Math.min(1, ratio)) * 100;
    return q.reverseScored ? 100 - raw : raw;
  }
  if (q.inputType === "rating_scale") {
    const min = q.scaleConfig?.min ?? 1;
    const max = q.scaleConfig?.max ?? 5;
    const val =
      typeof ans.customValue === "number"
        ? ans.customValue
        : isNumericEnjoyment(ans.enjoyment)
          ? ans.enjoyment
          : null;
    if (val === null) return null;
    const ratio = max > min ? (val - min) / (max - min) : 0.5;
    const raw = Math.max(0, Math.min(1, ratio)) * 100;
    return q.reverseScored ? 100 - raw : raw;
  }
  const eff = getEffectiveRatingForScoring(q, ans);
  if (eff !== null) {
    const raw = ((eff - 1) / 4) * 100;
    return q.reverseScored ? 100 - raw : raw;
  }
  return null;
}

export function shortenPromptLabel(prompt: string): string {
  return prompt
    .replace(
      /^How (much|important|strongly|deeply|central|open|firm|uncomfortable|disruptive|negatively) (do you|is it|are you|does|to|would)\s+/i,
      "",
    )
    .replace(/\?$/, "")
    .slice(0, 62)
    .trim();
}

function classifyQuadrant(
  enjoyment: number,
  experience: number,
): ScatterPoint["quadrant"] {
  if (enjoyment >= 3.5 && experience <= 2.5)
    return "high_desire_low_experience";
  if (enjoyment >= 3.5 && experience >= 3.0)
    return "high_desire_high_experience";
  if (enjoyment <= 2.5 && experience >= 3.0)
    return "low_desire_high_experience";
  if (enjoyment <= 2.5 && experience <= 2.5) return "low_desire_low_experience";
  return "neutral";
}

function hasAnyResponse(
  q: QuestionDefinition,
  ans: QuestionAnswer | undefined,
): boolean {
  if (!ans || ans.skipped) return false;
  if (ans.enjoyment === "prefer_not_to_answer") return false;
  if (ans.curiosityLevel !== undefined) return true;
  if (ans.firmBoundary) return true;
  if (ans.partnerWillingness !== undefined) return true;
  if (ans.enjoyment !== undefined) return true;
  if (ans.customValue !== undefined) {
    if (Array.isArray(ans.customValue)) {
      return q.inputType === "multi_select" ? true : ans.customValue.length > 0;
    }
    if (typeof ans.customValue === "string")
      return ans.customValue.trim().length > 0;
    return typeof ans.customValue === "number";
  }
  return false;
}

function prettifyDimensionKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function buildDimensionLabelMap(
  assessment: AssessmentDefinition,
  radarDimensions?: RadarDimensionScore[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(RADAR_LABELS)) {
    map.set(k, v);
  }
  for (const d of assessment.dimensions || []) {
    map.set(d.key, d.label);
  }
  for (const r of radarDimensions || []) {
    map.set(r.dimension, r.label);
  }
  return map;
}

function getQuestionLinkedDimensions(
  q: QuestionDefinition,
  ans: QuestionAnswer | undefined,
  dimLabelMap: Map<string, string>,
): IntoDimensionLink[] {
  const links = new Map<string, { label: string; weight: number }>();

  for (const [dKey, rawW] of Object.entries(q.dimensionWeights || {})) {
    if (!rawW) continue;
    links.set(dKey, {
      label: dimLabelMap.get(dKey) || prettifyDimensionKey(dKey),
      weight: rawW,
    });
  }

  if (ans && typeof ans.customValue === "string" && q.options) {
    const opt = q.options.find((o) => o.value === ans.customValue);
    if (opt?.dimensionWeights) {
      for (const [dKey, rawW] of Object.entries(opt.dimensionWeights)) {
        if (!rawW) continue;
        if (
          !links.has(dKey) ||
          Math.abs(rawW) > Math.abs(links.get(dKey)!.weight)
        ) {
          links.set(dKey, {
            label: dimLabelMap.get(dKey) || prettifyDimensionKey(dKey),
            weight: rawW,
          });
        }
      }
    }
  }

  if (links.size === 0 && dimLabelMap.has(q.sectionId)) {
    links.set(q.sectionId, {
      label: dimLabelMap.get(q.sectionId)!,
      weight: 1,
    });
  }

  return Array.from(links.entries())
    .sort(
      (a, b) =>
        Math.abs(b[1].weight) - Math.abs(a[1].weight) ||
        a[0].localeCompare(b[0]),
    )
    .slice(0, 4)
    .map(([dimension, info]) => ({
      dimension,
      label: info.label,
      direction: info.weight >= 0 ? "positive" : "inverse",
    }));
}

function computeQaItemScore0to100(
  q: QuestionDefinition,
  ans: QuestionAnswer,
): number | null {
  if (ans.skipped) return null;
  if (ans.firmBoundary || ans.curiosityLevel === "firm_boundary") return 0;

  const norm = normalizeQuestionAnswer0to100(q, ans);
  if (norm !== null) return Math.round(norm);

  if (q.inputType === "multi_select" && Array.isArray(ans.customValue)) {
    const totalOpts = q.options?.length ?? 0;
    if (totalOpts === 0) return ans.customValue.length > 0 ? 85 : 20;
    return Math.round((ans.customValue.length / totalOpts) * 100);
  }

  if (
    q.inputType === "ranking" &&
    Array.isArray(ans.customValue) &&
    ans.customValue.length > 0
  ) {
    return 100;
  }

  if (typeof ans.customValue === "string" && q.options) {
    const opt = q.options.find((o) => o.value === ans.customValue);
    if (opt?.dimensionWeights) {
      const vals = Object.values(opt.dimensionWeights);
      if (vals.length > 0) {
        const avg =
          vals.reduce((sum, v) => sum + Math.max(0, v), 0) / vals.length;
        return Math.max(0, Math.min(100, Math.round(avg * 100)));
      }
    }
  }

  return null;
}

function computeImpactMetric(
  directedScore0to100: number,
  absWeight: number,
): number {
  const extremity = 50 + Math.abs(Math.round(directedScore0to100) - 50);
  return Math.round(absWeight * extremity);
}

function determineProfileArchetype(
  radarMap: Record<RadarDimensionKey, number>,
  buckets: ScoredAssessmentResult["buckets"],
): PersonalProfileSummary {
  const comm = radarMap.communication;
  const sens = radarMap.sensuality;
  const exp = radarMap.exploration;
  const assert = radarMap.assertiveness;
  const emo = radarMap.emotionalConnection;
  const play = radarMap.playfulness;
  const mut = radarMap.mutualAttentiveness;

  let archetypeName = "The Thoughtful Harmonist";
  let archetypeTagline =
    "Grounded in mutual attentiveness, clear emotional safety, and balanced reciprocity.";

  if (comm >= 72 && mut >= 72 && exp >= 62) {
    archetypeName = "The Passionate Communicator";
    archetypeTagline =
      "Energized by verbal clarity, mutual responsiveness, and open curiosity with an attentive partner.";
  } else if (exp >= 70 && play >= 65) {
    archetypeName = "The Attentive Explorer";
    archetypeTagline =
      "Drawn to playful experimentation and novel shared experiences rooted in trust and communication.";
  } else if (sens >= 72 && emo >= 70) {
    archetypeName = "The Slow-Burn Romantic";
    archetypeTagline =
      "Thrives on unhurried pacing, deep physical warmth, extended buildup, and lingering aftercare.";
  } else if (assert >= 66 && mut >= 62) {
    archetypeName = "The Confident Collaborator";
    archetypeTagline =
      "Comfortable taking initiative or guiding shared pace while staying closely tuned to partner cues.";
  } else if (play >= 68 && emo >= 60) {
    archetypeName = "The Playful Romantic";
    archetypeTagline =
      "Blends lighthearted ease and spontaneous energy with affectionate emotional closeness.";
  }

  const strongestPreferences = buckets.stronglyDesired
    .filter((b) => b.sectionId !== "boundaries-comfort")
    .slice(0, 5)
    .map((b) => shortenPromptLabel(b.prompt));

  const importantNeeds = buckets.importantQualities
    .slice(0, 5)
    .map((b) => shortenPromptLabel(b.prompt));

  const noveltyComfort =
    exp >= 70
      ? "High curiosity for thoughtful novelty and open fantasy sharing when introduced with clear consent."
      : exp >= 48
        ? "Balanced openness: receptive to occasional new ideas while valuing comforting familiarity."
        : "Grounded in steady, familiar intimacy rather than frequent novelty or unconventional dynamics.";

  const communicationStyle =
    comm >= 72
      ? "Values explicit verbal check-ins, pre-intimacy alignment, and open feedback afterward."
      : comm >= 50
        ? "Appreciates clear baseline communication paired with responsive body awareness."
        : "Prefers understated, low-chatter presence once trust and boundaries are established.";

  const paceAndEnergy =
    sens >= 70
      ? "Drawn toward deliberate buildup, sustained sensual touch, and unhurried aftercare."
      : play >= 65
        ? "Enjoys responsive momentum blending affectionate warmth with spontaneous chemistry."
        : "Prefers steady, adaptable pacing shaped around mutual readiness in the moment.";

  const initiativeBalance =
    assert >= 65
      ? "Enjoys actively steering, initiating, or sharing lead rather than staying purely passive."
      : assert <= 38
        ? "Prefers a partner who confidently initiates and leads within agreed limits."
        : "Appreciates shared, flexible initiative that shifts naturally between partners.";

  const topBoundaries = buckets.firmBoundaries
    .slice(0, 5)
    .map((b) => shortenPromptLabel(b.prompt));

  const summaryParagraph = `${archetypeName}: ${
    comm >= 65
      ? `Communication (${comm}/100) and mutual responsiveness (${mut}/100) anchor your closeness, `
      : `Comfort and steady presence (${mut}/100 responsiveness) shape your ease, `
  }${
    sens >= 65
      ? `paired with strong sensual pacing (${sens}/100) and ${exp >= 65 ? `bold curiosity (${exp}/100)` : "warm physical buildup"}.`
      : `paired with ${exp >= 65 ? `high exploration appetite (${exp}/100)` : "clear boundaries around comfort and pace"}.`
  }`;

  return {
    archetypeName,
    archetypeTagline,
    disclaimer:
      "Descriptive profile built directly from your answers. Private self reflection only, not a clinical diagnosis.",
    summaryParagraph,
    strongestPreferences,
    importantNeeds,
    noveltyComfort,
    communicationStyle,
    paceAndEnergy,
    initiativeBalance,
    topBoundaries,
  };
}

function buildGroundedInsights(
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
  unmetPreferences: UnmetPreferenceInsight[],
  radarMap: Record<RadarDimensionKey, number>,
): string[] {
  const insights: string[] = [];

  const getNum = (id: string) => {
    const a = answers[id];
    if (!a || a.skipped || a.firmBoundary) return null;
    return isNumericEnjoyment(a.enjoyment) ? a.enjoyment : null;
  };

  const lead = getNum("dyn_partner_takes_lead");
  const selfLead = getNum("dyn_taking_lead_self");
  const checkIn = getNum("comm_verbal_checkin");
  const askBefore = getNum("comm_ask_preferences_before");

  if (
    lead !== null &&
    lead >= 4 &&
    ((checkIn ?? 0) >= 4 || (askBefore ?? 0) >= 4)
  ) {
    insights.push(
      `You rated a partner taking confident lead at ${lead}/5 alongside high verbal check-ins (${
        checkIn ?? askBefore
      }/5): you thrive when direction feels bold yet safe.`,
    );
  } else if (selfLead !== null && selfLead >= 4 && lead !== null && lead >= 4) {
    insights.push(
      `Both taking the lead (${selfLead}/5) and letting your partner lead (${lead}/5) appeal to you, pointing toward fluid Switch energy.`,
    );
  }

  const extForeplay = getNum("pace_extended_foreplay");
  const aftercare = getNum("pace_aftercare_affection");
  if ((extForeplay ?? 0) >= 4 && (aftercare ?? 0) >= 4) {
    insights.push(
      `Extended foreplay (${extForeplay}/5) and unhurried aftercare (${aftercare}/5) both scored high: warm buildup and gentle landing afterward amplify the whole experience.`,
    );
  }

  const novel = getNum("exp_trying_new_things");
  const boundaryClarity = getNum("bound_boundary_clarity_requirement");
  if ((novel ?? 0) >= 4 && (boundaryClarity ?? 0) >= 4) {
    insights.push(
      `Openness to trying new things (${novel}/5) is anchored by strong boundary clarity (${boundaryClarity}/5): trust first makes bolder play easy.`,
    );
  }

  const finishEarly = getNum("bound_finishing_before_satisfied");
  const mutualSat = getNum("comm_mutual_satisfaction_priority");
  if ((finishEarly ?? 0) >= 4 || (mutualSat ?? 0) >= 4) {
    insights.push(
      "Mutual satisfaction is a clear non-negotiable in your answers: partners who stay engaged past their own climax earn deeper trust and heat.",
    );
  }

  if (unmetPreferences.length > 0) {
    const top = unmetPreferences[0];
    insights.push(
      `Top untapped desire: "${shortenPromptLabel(top.prompt)}" (rated ${top.enjoymentScore}/5, experienced ${top.experienceScore}/5). Worth voicing directly next time.`,
    );
  }

  if (insights.length === 0) {
    insights.push(
      `Your highest weighted trait centers on ${
        radarMap.mutualAttentiveness >= radarMap.sensuality
          ? `Mutual Attentiveness (${radarMap.mutualAttentiveness}/100)`
          : `Sensuality (${radarMap.sensuality}/100)`
      } alongside Communication (${radarMap.communication}/100).`,
    );
  }

  const answered = Object.values(answers).filter(
    (a) => !a.skipped && (a.enjoyment || a.firmBoundary),
  ).length;
  if (answered < assessment.questions.length && answered < 14) {
    insights.push(
      "Complete mode unlocks finer weightings across niche acts and deeper partner matching.",
    );
  }

  return insights;
}

function buildIdealPartnerReport(
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
  buckets: ScoredAssessmentResult["buckets"],
  radarMap: Record<RadarDimensionKey, number>,
): IdealPartnerReport {
  const characteristics: string[] = [];

  if (radarMap.communication >= 65) {
    characteristics.push(
      `Communicates openly before and after intimacy without defensiveness (matches your ${radarMap.communication}/100 Communication score).`,
    );
  }
  if (radarMap.mutualAttentiveness >= 65) {
    characteristics.push(
      `Prioritizes your pleasure and comfort equally alongside their own (${radarMap.mutualAttentiveness}/100 Mutual Attentiveness).`,
    );
  }
  if (radarMap.sensuality >= 65) {
    characteristics.push(
      `Values unhurried buildup, whole body touch, and close aftercare (${radarMap.sensuality}/100 Sensuality).`,
    );
  }
  if (radarMap.exploration >= 65) {
    characteristics.push(
      `Enjoys exploring new fantasies and playful ideas at a mutual, relaxed pace (${radarMap.exploration}/100 Exploration).`,
    );
  } else {
    characteristics.push(
      "Values steady comfort and deepens what already works without pressuring unwanted novelty.",
    );
  }

  const leadAns = answers["dyn_partner_takes_lead"]?.enjoyment;
  const selfLeadAns = answers["dyn_taking_lead_self"]?.enjoyment;
  if (
    isNumericEnjoyment(leadAns) &&
    leadAns >= 4 &&
    (!isNumericEnjoyment(selfLeadAns) || selfLeadAns <= 3)
  ) {
    characteristics.push(
      "Confidently steps into lead energy while staying closely tuned to your cues.",
    );
  } else if (isNumericEnjoyment(selfLeadAns) && selfLeadAns >= 4) {
    characteristics.push(
      "Responds enthusiastically when you take charge, set tempo, or guide them.",
    );
  }

  const whatMattersMost = buckets.importantQualities
    .slice(0, 6)
    .map((item) => ({
      title: shortenPromptLabel(item.prompt),
      detail: `Marked ${formatImportanceLabel(item.importance).toLowerCase()} with ${formatEnjoymentLabel(item.enjoyment).toLowerCase()}.`,
      weight: item.importance,
    }));

  const earlyDatingSignals: Array<{
    signal: string;
    conversationPrompt: string;
  }> = [
    {
      signal: "Receptiveness to small preferences outside the bedroom",
      conversationPrompt:
        '"I relax fastest when we share honest preferences early. How do you usually like feedback?"',
    },
  ];

  if (radarMap.sensuality >= 60) {
    earlyDatingSignals.push({
      signal: "Comfort with slow, tactile affection and unhurried pacing",
      conversationPrompt:
        '"What kind of pace feels most natural to you when physical chemistry starts building?"',
    });
  }

  if (buckets.curiousAbout.length > 0 || radarMap.exploration >= 60) {
    earlyDatingSignals.push({
      signal: "Able to talk calmly about fantasies with zero pressure to rush",
      conversationPrompt:
        '"Are there curiosities you enjoy just fantasizing about out loud before deciding to try them?"',
    });
  }

  const potentialMismatches: Array<{ area: string; note: string }> = [];
  if (
    (answers["bound_finishing_before_satisfied"]?.enjoyment as number) >= 4 ||
    answers["bound_finishing_before_satisfied"]?.firmBoundary
  ) {
    potentialMismatches.push({
      area: "Stopping as soon as they finish",
      note: "Partners who lose focus before making sure you feel satisfied will create recurring friction.",
    });
  }
  if (radarMap.communication >= 70) {
    potentialMismatches.push({
      area: "Closed-off or awkward about verbal feedback",
      note: "Partners who shut down around direct check-ins or gentle guidance miss what you value most.",
    });
  }
  for (const bound of buckets.firmBoundaries.slice(0, 4)) {
    potentialMismatches.push({
      area: shortenPromptLabel(bound.prompt),
      note: "Firm boundary: a compatible partner respects this completely with zero pushback.",
    });
  }

  const explorationOpportunities = buckets.curiousAbout
    .filter((item) => {
      const q = assessment.questions.find((qq) => qq.id === item.questionId);
      return !q?.safetySensitive || item.enjoyment === "curious";
    })
    .slice(0, 5)
    .map((item) => ({
      topic: shortenPromptLabel(item.prompt),
      framing:
        "Marked as curious to try: start with an easy, pressure-free talk before bringing it to the bedroom.",
    }));

  const communicationNeeds: string[] = [];
  if ((answers["comm_ask_preferences_before"]?.enjoyment as number) >= 4) {
    communicationNeeds.push(
      "Clear talk about likes and limits before heat escalates.",
    );
  }
  if ((answers["comm_verbal_checkin"]?.enjoyment as number) >= 4) {
    communicationNeeds.push(
      "Warm verbal check-ins during new or intense moments.",
    );
  }
  if ((answers["comm_feedback_after"]?.enjoyment as number) >= 4) {
    communicationNeeds.push(
      "Relaxed honesty afterward about what hit the mark.",
    );
  }
  if (communicationNeeds.length === 0) {
    communicationNeeds.push(
      "Mutual respect for body cues, comfort shifts, and agreed firm limits.",
    );
  }

  return {
    characteristics,
    whatMattersMost,
    earlyDatingSignals,
    potentialMismatches,
    explorationOpportunities,
    communicationNeeds,
  };
}

function buildWhatYouAreInto(params: {
  assessment: AssessmentDefinition;
  modeQuestions: QuestionDefinition[];
  answers: Record<string, QuestionAnswer>;
  perspective: "primary" | "partner";
  radar: RadarDimensionScore[];
  unmetPreferences: UnmetPreferenceInsight[];
  dualChannelScores?: DualChannelScore[];
  attachmentCoordinates?: ScoredAssessmentResult["attachmentCoordinates"];
  dimLabelMap: Map<string, string>;
}): {
  summary: WhatYouAreIntoSummary;
  intoTagByQuestionId: Map<string, IntoItemTag>;
  scoreByQuestionId: Map<string, number | null>;
  linksByQuestionId: Map<string, IntoDimensionLink[]>;
} {
  const {
    assessment,
    modeQuestions,
    answers,
    perspective,
    radar,
    unmetPreferences,
    dualChannelScores,
    attachmentCoordinates,
    dimLabelMap,
  } = params;

  const isIntimacyWeighted = assessment.scoringStrategy === "intimacy_weighted";
  const isRomanticOrIntimate =
    assessment.category === "sexuality-intimacy" ||
    assessment.category === "romance";
  const isAttachmentTest = assessment.slug === "attachment-style-discovery";
  const isTriviaOrVote =
    assessment.scoringStrategy === "prediction_accuracy" ||
    assessment.scoringStrategy === "would_rather";

  const coreTurnOns: IntoEvidenceItem[] = [];
  const curiousExplorations: IntoEvidenceItem[] = [];
  const wantMoreOf: IntoEvidenceItem[] = [];
  const dealbreakersAndLimits: IntoEvidenceItem[] = [];
  const intoTagByQuestionId = new Map<string, IntoItemTag>();
  const scoreByQuestionId = new Map<string, number | null>();
  const linksByQuestionId = new Map<string, IntoDimensionLink[]>();

  const importanceRank: Record<ImportanceLevel, number> = {
    essential: 4,
    important: 3,
    nice_to_have: 2,
    not_important: 1,
  };

  for (const q of modeQuestions) {
    const ans = answers[q.id];
    if (!hasAnyResponse(q, ans)) continue;

    const prompt =
      perspective === "partner" && q.partnerPrompt ? q.partnerPrompt : q.prompt;
    const links = getQuestionLinkedDimensions(q, ans, dimLabelMap);
    const sc = computeQaItemScore0to100(q, ans);
    scoreByQuestionId.set(q.id, sc);
    linksByQuestionId.set(q.id, links);

    const imp: ImportanceLevel =
      ans.importance || (isIntimacyWeighted ? "nice_to_have" : "important");

    const buildItem = (
      tag: IntoItemTag,
      detail?: string,
    ): IntoEvidenceItem => ({
      questionId: q.id,
      shortLabel: shortenPromptLabel(prompt),
      prompt,
      sectionTitle: q.sectionTitle,
      answerLabel: formatAnswerDisplayLabel(q, ans),
      ...(detail ? { detail } : {}),
      importance: imp,
      score0to100: sc,
      ...(ans.desireDelta ? { desireDelta: ans.desireDelta } : {}),
      tag,
      linkedDimensions: links,
    });

    const isBipolarRoleSlider =
      q.inputType === "slider" &&
      Object.values(q.dimensionWeights || {}).some((w) => w < 0) &&
      Object.values(q.dimensionWeights || {}).some((w) => w > 0);

    const isLimitFlag = Boolean(
      ans.firmBoundary ||
        ans.curiosityLevel === "firm_boundary" ||
        ans.partnerWillingness === "firm_boundary",
    );

    // Boundaries-comfort on Test 1: rating 4-5 OR firmBoundary means strict avoid / limit
    if (q.sectionId === "boundaries-comfort") {
      if (
        isLimitFlag ||
        (isNumericEnjoyment(ans.enjoyment) && ans.enjoyment >= 4)
      ) {
        const detail = isLimitFlag
          ? "Firm boundary"
          : `Strong comfort limit (${ans.enjoyment}/5)`;
        dealbreakersAndLimits.push(buildItem("limit", detail));
        intoTagByQuestionId.set(q.id, "limit");
      }
      continue;
    }

    if (isLimitFlag) {
      dealbreakersAndLimits.push(buildItem("limit", "Firm boundary"));
      intoTagByQuestionId.set(q.id, "limit");
      continue;
    }

    if (
      ans.curiosityLevel === "curious_uncertain" ||
      ans.enjoyment === "curious" ||
      ans.partnerWillingness === "curious_to_explore"
    ) {
      curiousExplorations.push(
        buildItem("curious", "Open to exploring with trust"),
      );
      intoTagByQuestionId.set(q.id, "curious");
      continue;
    }

    if (isBipolarRoleSlider) {
      intoTagByQuestionId.set(q.id, "role_signal");
      continue;
    }

    if (
      ans.curiosityLevel === "not_interested" ||
      ans.partnerWillingness === "prefer_not_to" ||
      (sc !== null &&
        sc <= 25 &&
        (isRomanticOrIntimate || isIntimacyWeighted) &&
        !isAttachmentTest)
    ) {
      dealbreakersAndLimits.push(
        buildItem(
          "limit",
          ans.curiosityLevel === "not_interested"
            ? "Not interested"
            : "Low interest / prefer to avoid",
        ),
      );
      intoTagByQuestionId.set(q.id, "limit");
      continue;
    }

    // Attachment anxiety/avoidance items should not appear as erotic "Turn-Ons"
    const isAttachmentDistressItem =
      isAttachmentTest &&
      !q.reverseScored &&
      ((q.dimensionWeights.anxiety ?? 0) > 0 ||
        (q.dimensionWeights.avoidance ?? 0) > 0);

    if (isAttachmentDistressItem) {
      if (sc !== null && sc >= 70) {
        dealbreakersAndLimits.push(
          buildItem("limit", "Heightened sensitivity trigger"),
        );
        intoTagByQuestionId.set(q.id, "limit");
      }
      continue;
    }

    // Choice / Situational / Forced Choice / Multi-Select / Ranking anchors
    if (
      !isTriviaOrVote &&
      (q.inputType === "forced_choice" ||
        q.inputType === "situational" ||
        q.inputType === "multiple_choice") &&
      typeof ans.customValue === "string"
    ) {
      const pickedOpt = q.options?.find((o) => o.value === ans.customValue);
      if (pickedOpt && (pickedOpt.dimensionWeights || isRomanticOrIntimate)) {
        coreTurnOns.push(buildItem("turn_on", `Picked: ${pickedOpt.label}`));
        intoTagByQuestionId.set(q.id, "turn_on");
      }
      continue;
    }

    if (
      q.inputType === "ranking" &&
      Array.isArray(ans.customValue) &&
      ans.customValue.length > 0
    ) {
      const topValue = ans.customValue[0];
      const topOpt = q.options?.find((o) => o.value === topValue);
      coreTurnOns.push(
        buildItem(
          "turn_on",
          `Ranked #1 priority: ${topOpt?.label || topValue}`,
        ),
      );
      intoTagByQuestionId.set(q.id, "turn_on");
      continue;
    }

    if (
      q.inputType === "multi_select" &&
      Array.isArray(ans.customValue) &&
      ans.customValue.length > 0
    ) {
      coreTurnOns.push(
        buildItem(
          "turn_on",
          `Selected ${ans.customValue.length} high-interest item${ans.customValue.length === 1 ? "" : "s"}`,
        ),
      );
      intoTagByQuestionId.set(q.id, "turn_on");
      continue;
    }

    if (
      (sc !== null && sc >= 66) ||
      ans.curiosityLevel === "very_interested" ||
      ans.curiosityLevel === "interested" ||
      ans.partnerWillingness === "enthusiastically_enjoy"
    ) {
      coreTurnOns.push(buildItem("turn_on"));
      intoTagByQuestionId.set(q.id, "turn_on");
    }
  }

  // Build "Want More Of" from unmetPreferences, explicit desireDelta === "want_more", or dual-channel gaps
  const wantMoreIds = new Set<string>();
  for (const unmet of unmetPreferences) {
    const q = modeQuestions.find((qq) => qq.id === unmet.questionId);
    const ans = answers[unmet.questionId];
    if (!q || !ans) continue;
    wantMoreIds.add(q.id);
    const links =
      linksByQuestionId.get(q.id) ||
      getQuestionLinkedDimensions(q, ans, dimLabelMap);
    const prompt =
      perspective === "partner" && q.partnerPrompt ? q.partnerPrompt : q.prompt;
    wantMoreOf.push({
      questionId: q.id,
      shortLabel: shortenPromptLabel(prompt),
      prompt,
      sectionTitle: q.sectionTitle,
      answerLabel: formatAnswerDisplayLabel(q, ans),
      detail: `High desire (${unmet.enjoymentScore}/5) vs. rare frequency (${unmet.experienceScore}/5)`,
      importance: unmet.importance,
      score0to100: scoreByQuestionId.get(q.id) ?? 90,
      ...(unmet.desireDelta ? { desireDelta: unmet.desireDelta } : {}),
      tag: "want_more",
      linkedDimensions: links,
    });
    intoTagByQuestionId.set(q.id, "want_more");
  }

  for (const q of modeQuestions) {
    if (wantMoreIds.has(q.id) || q.sectionId === "boundaries-comfort") continue;
    const ans = answers[q.id];
    if (!ans || ans.skipped || ans.desireDelta !== "want_more") continue;
    wantMoreIds.add(q.id);
    const prompt =
      perspective === "partner" && q.partnerPrompt ? q.partnerPrompt : q.prompt;
    wantMoreOf.push({
      questionId: q.id,
      shortLabel: shortenPromptLabel(prompt),
      prompt,
      sectionTitle: q.sectionTitle,
      answerLabel: formatAnswerDisplayLabel(q, ans),
      detail: "Explicitly marked as wanting more often",
      importance: ans.importance || "important",
      score0to100:
        scoreByQuestionId.get(q.id) ?? computeQaItemScore0to100(q, ans),
      desireDelta: "want_more",
      tag: "want_more",
      linkedDimensions:
        linksByQuestionId.get(q.id) ||
        getQuestionLinkedDimensions(q, ans, dimLabelMap),
    });
    intoTagByQuestionId.set(q.id, "want_more");
  }

  if (wantMoreOf.length === 0 && dualChannelScores) {
    for (const ch of dualChannelScores.filter(
      (d) => d.receiveOrNeedScore >= 68 && d.gap >= 15,
    )) {
      const recDim = (assessment.dimensions || []).find(
        (d) =>
          d.channelPairKey === ch.channelKey && d.channelRole === "receive",
      );
      if (!recDim) continue;
      const linkedQ = modeQuestions.find(
        (q) =>
          (q.dimensionWeights[recDim.key] ?? 0) > 0 &&
          hasAnyResponse(q, answers[q.id]),
      );
      if (!linkedQ || wantMoreIds.has(linkedQ.id)) continue;
      const ans = answers[linkedQ.id]!;
      wantMoreIds.add(linkedQ.id);
      const prompt =
        perspective === "partner" && linkedQ.partnerPrompt
          ? linkedQ.partnerPrompt
          : linkedQ.prompt;
      wantMoreOf.push({
        questionId: linkedQ.id,
        shortLabel: shortenPromptLabel(prompt),
        prompt,
        sectionTitle: linkedQ.sectionTitle,
        answerLabel: formatAnswerDisplayLabel(linkedQ, ans),
        detail: `Strong receiving need (${ch.receiveOrNeedScore}/100) with a ${ch.gap} point contrast`,
        importance: ans.importance || "important",
        score0to100: ch.receiveOrNeedScore,
        tag: "want_more",
        linkedDimensions:
          linksByQuestionId.get(linkedQ.id) ||
          getQuestionLinkedDimensions(linkedQ, ans, dimLabelMap),
      });
    }
  }

  coreTurnOns.sort(
    (a, b) =>
      (b.score0to100 ?? 0) - (a.score0to100 ?? 0) ||
      importanceRank[b.importance || "nice_to_have"] -
        importanceRank[a.importance || "nice_to_have"] ||
      a.questionId.localeCompare(b.questionId),
  );
  wantMoreOf.sort(
    (a, b) =>
      (b.score0to100 ?? 0) - (a.score0to100 ?? 0) ||
      a.questionId.localeCompare(b.questionId),
  );
  dealbreakersAndLimits.sort(
    (a, b) =>
      (b.detail?.startsWith("Firm boundary") ? 1 : 0) -
        (a.detail?.startsWith("Firm boundary") ? 1 : 0) ||
      a.questionId.localeCompare(b.questionId),
  );

  // Derive Role or Dynamic Lean with direct question links
  let roleOrDynamicLean: WhatYouAreIntoSummary["roleOrDynamicLean"];
  if (assessment.slug === "intimacy-partner-preferences") {
    const partnerLead = answers["dyn_partner_takes_lead"]?.enjoyment;
    const selfLead = answers["dyn_taking_lead_self"]?.enjoyment;
    const switchRole = answers["dyn_switching_roles"]?.enjoyment;
    const linkedQuestionIds = [
      "dyn_partner_takes_lead",
      "dyn_taking_lead_self",
      "dyn_switching_roles",
    ].filter((id) => Boolean(answers[id] && !answers[id].skipped));
    if (linkedQuestionIds.length > 0) {
      const pNum = isNumericEnjoyment(partnerLead) ? partnerLead : 3;
      const sNum = isNumericEnjoyment(selfLead) ? selfLead : 3;
      const swNum = isNumericEnjoyment(switchRole) ? switchRole : 3;
      let label = "Balanced & Mood Responsive Flow";
      if (swNum >= 4 || (pNum >= 4 && sNum >= 4)) {
        label = "Dynamic Switch / Shared Initiative";
      } else if (pNum >= 4 && sNum <= 3) {
        label = "Leans Partner-Led / Receiving Control";
      } else if (sNum >= 4 && pNum <= 3) {
        label = "Leans Taking Control / Initiating";
      }
      const parts: string[] = [];
      if (answers["dyn_partner_takes_lead"]) {
        parts.push(
          `partner leading: ${formatAnswerDisplayLabel(modeQuestions.find((q) => q.id === "dyn_partner_takes_lead") || modeQuestions[0], answers["dyn_partner_takes_lead"])}`,
        );
      }
      if (answers["dyn_taking_lead_self"]) {
        parts.push(
          `taking charge yourself: ${formatAnswerDisplayLabel(modeQuestions.find((q) => q.id === "dyn_taking_lead_self") || modeQuestions[0], answers["dyn_taking_lead_self"])}`,
        );
      }
      if (answers["dyn_switching_roles"]) {
        parts.push(
          `switching roles: ${formatAnswerDisplayLabel(modeQuestions.find((q) => q.id === "dyn_switching_roles") || modeQuestions[0], answers["dyn_switching_roles"])}`,
        );
      }
      roleOrDynamicLean = {
        label,
        detail: `Based on your answers (${parts.join(", ")}).`,
        linkedQuestionIds,
      };
    }
  } else if (
    assessment.slug === "bdsm-power-dynamics-test" ||
    assessment.slug === "dominance-submission-initiative"
  ) {
    const domDim =
      radar.find(
        (r) => r.dimension === "dominance_top" || r.dimension === "initiative",
      ) ?? radar[0];
    const subDim =
      radar.find(
        (r) =>
          r.dimension === "submission_bottom" ||
          r.dimension === "receptive_surrender",
      ) ?? radar[1];
    const swDim = radar.find(
      (r) =>
        r.dimension === "switch_versatility" ||
        r.dimension === "switch_flexibility",
    );
    const linkedQuestionIds = [
      "bdsm_1",
      "bdsm_2",
      "bdsm_3",
      "bdsm_4",
      "bdsm_7",
    ].filter((id) => Boolean(answers[id] && !answers[id].skipped));
    const dScore = domDim?.score ?? 50;
    const sScore = subDim?.score ?? 50;
    const swScore = swDim?.score ?? 50;

    let label = "Balanced & Spontaneous";
    if (dScore >= 65 && sScore >= 62 && swScore >= 60) {
      label = "Versatile Switch";
    } else if (dScore - sScore >= 18) {
      label = "Dominant / Top Lean";
    } else if (sScore - dScore >= 18) {
      label = "Submissive / Bottom Lean";
    } else if (swScore >= 65) {
      label = "Switch / Role Fluid";
    }
    roleOrDynamicLean = {
      label,
      detail: `${domDim?.label || "Command"} ${dScore}/100 vs. ${
        subDim?.label || "Surrender"
      } ${sScore}/100${swDim ? `, Switch ${swScore}/100` : ""}.`,
      linkedQuestionIds:
        linkedQuestionIds.length > 0
          ? linkedQuestionIds
          : radar
              .flatMap((r) =>
                r.contributors.slice(0, 2).map((c) => c.questionId),
              )
              .slice(0, 4),
    };
  } else if (attachmentCoordinates) {
    roleOrDynamicLean = {
      label: attachmentCoordinates.quadrantLabel.split(" (")[0],
      detail: `Reassurance vigilance ${attachmentCoordinates.anxiety}/100, autonomy reflex ${attachmentCoordinates.avoidance}/100.`,
      linkedQuestionIds: ["att_1", "att_6", "att_9", "att_11"].filter((id) =>
        Boolean(answers[id]),
      ),
    };
  } else if (dualChannelScores && dualChannelScores.length > 0) {
    const topRec = [...dualChannelScores].sort(
      (a, b) => b.receiveOrNeedScore - a.receiveOrNeedScore,
    )[0];
    const topExp = [...dualChannelScores].sort(
      (a, b) => b.expressOrOfferScore - a.expressOrOfferScore,
    )[0];
    roleOrDynamicLean = {
      label: `Craves ${topRec.label} · Gives ${topExp.label}`,
      detail: `You soak up ${topRec.label.toLowerCase()} strongest (${topRec.receiveOrNeedScore}/100) while showing love most naturally through ${topExp.label.toLowerCase()} (${topExp.expressOrOfferScore}/100).`,
      linkedQuestionIds: coreTurnOns.slice(0, 3).map((c) => c.questionId),
    };
  }

  const topDim = [...radar].sort((a, b) => b.score - a.score)[0];
  const styleSummary: string[] = [];
  if (coreTurnOns.length > 0) {
    styleSummary.push(
      `Your ${coreTurnOns.length} standout turn on${
        coreTurnOns.length === 1 ? "" : "s"
      } cluster most heavily around ${coreTurnOns
        .slice(0, 2)
        .map((c) => c.linkedDimensions[0]?.label || c.sectionTitle)
        .join(" and ")}.`,
    );
  }
  if (wantMoreOf.length > 0) {
    styleSummary.push(
      `${wantMoreOf.length} high desire item${
        wantMoreOf.length === 1 ? " is" : "s are"
      } marked as untapped or wanted more often, giving you instant clarity on what to invite next.`,
    );
  }
  if (curiousExplorations.length > 0) {
    styleSummary.push(
      `${curiousExplorations.length} open curiosit${
        curiousExplorations.length === 1 ? "y sits" : "ies sit"
      } ready for relaxed, honest conversation.`,
    );
  }
  if (dealbreakersAndLimits.length > 0) {
    styleSummary.push(
      `${dealbreakersAndLimits.length} boundary or avoid item${
        dealbreakersAndLimits.length === 1
          ? " acts as a clear guardrail that stays"
          : "s act as clear guardrails that stay"
      } protected in partner matching.`,
    );
  }
  if (styleSummary.length === 0 && topDim) {
    styleSummary.push(
      `Your strongest theme is ${topDim.label} (${topDim.score}/100) across ${radar.reduce(
        (sum, r) => sum + r.answeredCount,
        0,
      )} weighted signals.`,
    );
  }

  const headline =
    assessment.category === "sexuality-intimacy"
      ? "Direct desires, wanted upgrades, open curiosities, and firm boundaries mapped from your answers."
      : assessment.category === "romance"
        ? "Romantic turn ons, relational needs, and dealbreakers traced back to what you chose."
        : assessment.category === "personality"
          ? "Core tendencies, behavioral preferences, and high leverage drivers behind your score."
          : "Top shared priorities, curiosities, and firm limits highlighted directly below.";

  return {
    summary: {
      headline,
      ...(roleOrDynamicLean ? { roleOrDynamicLean } : {}),
      coreTurnOns: coreTurnOns.slice(0, 14),
      curiousExplorations: curiousExplorations.slice(0, 10),
      wantMoreOf: wantMoreOf.slice(0, 10),
      dealbreakersAndLimits: dealbreakersAndLimits.slice(0, 10),
      styleSummary,
    },
    intoTagByQuestionId,
    scoreByQuestionId,
    linksByQuestionId,
  };
}

function buildDimensionInteractions(params: {
  assessment: AssessmentDefinition;
  radar: RadarDimensionScore[];
  whatYouAreInto: WhatYouAreIntoSummary;
  dualChannelScores?: DualChannelScore[];
}): DimensionInteractionInsight[] {
  const { assessment, radar, whatYouAreInto, dualChannelScores } = params;
  const activeDims = [...radar]
    .filter((d) => d.answeredCount > 0)
    .sort(
      (a, b) => b.score - a.score || a.dimension.localeCompare(b.dimension),
    );
  const insights: DimensionInteractionInsight[] = [];

  const pickEvidence = (
    dim: RadarDimensionScore,
    limit = 2,
    preferLow = false,
  ): DimensionInteractionInsight["evidence"] => {
    const pool = preferLow
      ? [...dim.contributors].sort(
          (a, b) =>
            a.normalizedContribution - b.normalizedContribution ||
            a.questionId.localeCompare(b.questionId),
        )
      : dim.contributors;
    return pool.slice(0, limit).map((c) => ({
      questionId: c.questionId,
      shortLabel: shortenPromptLabel(c.prompt),
      answerLabel: c.enjoymentLabel,
      dimensionLabel: dim.label,
    }));
  };

  const dedupeEvidence = (
    items: DimensionInteractionInsight["evidence"],
  ): DimensionInteractionInsight["evidence"] => {
    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.questionId)) return false;
      seen.add(it.questionId);
      return true;
    });
  };

  // 1. Top Synergy Pairing
  if (activeDims.length >= 2) {
    const first = activeDims[0];
    const second = activeDims[1];
    insights.push({
      id: "top-synergy",
      title: `${first.label} Meets ${second.label}`,
      summary: `Your two highest dimensions work side by side: ${first.label} (${first.score}/100) sets your primary pull while ${second.label} (${second.score}/100) shapes how it plays out in practice.`,
      dimensions: [
        { dimension: first.dimension, label: first.label, score: first.score },
        {
          dimension: second.dimension,
          label: second.label,
          score: second.score,
        },
      ],
      evidence: dedupeEvidence([
        ...pickEvidence(first, 2),
        ...pickEvidence(second, 2),
      ]),
    });
  }

  // 2. BDSM / Power Polarity Contrast
  if (
    assessment.slug === "bdsm-power-dynamics-test" ||
    assessment.slug === "dominance-submission-initiative"
  ) {
    const dom = activeDims.find(
      (d) => d.dimension === "dominance_top" || d.dimension === "initiative",
    );
    const sub = activeDims.find(
      (d) =>
        d.dimension === "submission_bottom" ||
        d.dimension === "receptive_surrender",
    );
    const care = activeDims.find(
      (d) =>
        d.dimension === "protocol_aftercare" ||
        d.dimension === "bondage_sensation",
    );
    if (dom && sub) {
      const gap = Math.abs(dom.score - sub.score);
      insights.push({
        id: "power-polarity",
        title:
          gap >= 22 ? "Focused Power Polarity" : "Dual-Role Switch Contrast",
        summary:
          gap >= 22
            ? `Your ${dom.score - sub.score > 0 ? dom.label : sub.label} score runs ${gap} points higher, giving partners an unmistakable signal of which side of the dynamic excites you more.`
            : `Both ${dom.label} (${dom.score}/100) and ${sub.label} (${sub.score}/100) stay active together, creating genuine flexibility across moods and nights.`,
        dimensions: [
          { dimension: dom.dimension, label: dom.label, score: dom.score },
          { dimension: sub.dimension, label: sub.label, score: sub.score },
          ...(care
            ? [
                {
                  dimension: care.dimension,
                  label: care.label,
                  score: care.score,
                },
              ]
            : []),
        ],
        evidence: dedupeEvidence([
          ...pickEvidence(dom, 2),
          ...pickEvidence(sub, 2),
          ...(care ? pickEvidence(care, 1) : []),
        ]),
      });
    }
  }

  // 3. Untapped Desire + Exploration Connection
  if (whatYouAreInto.wantMoreOf.length > 0 && activeDims.length >= 1) {
    const topWant = whatYouAreInto.wantMoreOf[0];
    const linkedDimKey = topWant.linkedDimensions[0]?.dimension;
    const matchedDim =
      activeDims.find((d) => d.dimension === linkedDimKey) || activeDims[0];
    insights.push({
      id: "untapped-hunger",
      title: `Untapped Appetite Inside ${matchedDim.label}`,
      summary: `Even though ${matchedDim.label} sits at ${matchedDim.score}/100, "${topWant.shortLabel}" highlights a gap between what turns you on and how often you get it.`,
      dimensions: [
        {
          dimension: matchedDim.dimension,
          label: matchedDim.label,
          score: matchedDim.score,
        },
      ],
      evidence: whatYouAreInto.wantMoreOf.slice(0, 3).map((w) => ({
        questionId: w.questionId,
        shortLabel: w.shortLabel,
        answerLabel: w.detail || w.answerLabel,
        dimensionLabel: w.linkedDimensions[0]?.label || matchedDim.label,
      })),
    });
  } else if (dualChannelScores && dualChannelScores.length > 0) {
    const widest = [...dualChannelScores].sort((a, b) => b.gap - a.gap)[0];
    if (widest && widest.gap >= 15) {
      insights.push({
        id: "dual-channel-contrast",
        title: `Give vs. Receive Contrast in ${widest.label}`,
        summary: `You need ${widest.label.toLowerCase()} at ${widest.receiveOrNeedScore}/100 while expressing it at ${widest.expressOrOfferScore}/100 (${widest.gap} point difference). Sharing this explicitly stops a partner from misreading your cues.`,
        dimensions: activeDims.slice(0, 2).map((d) => ({
          dimension: d.dimension,
          label: d.label,
          score: d.score,
        })),
        evidence: whatYouAreInto.coreTurnOns.slice(0, 2).map((c) => ({
          questionId: c.questionId,
          shortLabel: c.shortLabel,
          answerLabel: c.answerLabel,
          dimensionLabel: c.linkedDimensions[0]?.label || widest.label,
        })),
      });
    }
  }

  // 4. High vs. Low Priority Contrast
  if (activeDims.length >= 3) {
    const top = activeDims[0];
    const bottom = activeDims[activeDims.length - 1];
    if (top.score - bottom.score >= 22) {
      insights.push({
        id: "high-low-contrast",
        title: `Strong Pull vs. Lower Priority`,
        summary: `${top.score - bottom.score} points separate your peak pull (${top.label}: ${top.score}/100) from your quietest area (${bottom.label}: ${bottom.score}/100), showing clearly where your energy concentrates.`,
        dimensions: [
          { dimension: top.dimension, label: top.label, score: top.score },
          {
            dimension: bottom.dimension,
            label: bottom.label,
            score: bottom.score,
          },
        ],
        evidence: dedupeEvidence([
          ...pickEvidence(top, 1),
          ...pickEvidence(bottom, 2, true),
        ]),
      });
    }
  }

  return insights.slice(0, 4);
}

function scoreIntimacyWeighted(params: {
  resultId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  answers: Record<string, QuestionAnswer>;
  createdAt: string;
}): ScoredAssessmentResult {
  const { resultId, assessment, mode, perspective, answers, createdAt } =
    params;

  const modeQuestions = selectAssessmentQuestions(assessment, mode, answers);

  const dimensionTotals: Record<
    RadarDimensionKey,
    {
      weightedSum: number;
      weightDenom: number;
      contributors: RadarDimensionScore["contributors"];
    }
  > = {
    communication: { weightedSum: 0, weightDenom: 0, contributors: [] },
    sensuality: { weightedSum: 0, weightDenom: 0, contributors: [] },
    exploration: { weightedSum: 0, weightDenom: 0, contributors: [] },
    assertiveness: { weightedSum: 0, weightDenom: 0, contributors: [] },
    emotionalConnection: { weightedSum: 0, weightDenom: 0, contributors: [] },
    playfulness: { weightedSum: 0, weightDenom: 0, contributors: [] },
    mutualAttentiveness: { weightedSum: 0, weightDenom: 0, contributors: [] },
  };

  const buckets: ScoredAssessmentResult["buckets"] = {
    stronglyDesired: [],
    importantQualities: [],
    curiousAbout: [],
    situational: [],
    preferToAvoid: [],
    firmBoundaries: [],
  };

  const scatterPoints: ScatterPoint[] = [];
  const unmetPreferences: UnmetPreferenceInsight[] = [];
  const qaSummary: QaSummaryEntry[] = [];
  let experienceUnratedCount = 0;
  let answeredCount = 0;

  for (const q of modeQuestions) {
    const ans = answers[q.id];
    if (!ans || ans.skipped) continue;
    const hasMeaningfulAnswer =
      ans.enjoyment !== undefined ||
      ans.firmBoundary ||
      ans.partnerWillingness !== undefined;
    if (!hasMeaningfulAnswer) continue;

    if (ans.enjoyment !== "prefer_not_to_answer") {
      answeredCount += 1;
    }

    const importance: ImportanceLevel = ans.importance || "nice_to_have";
    const summary: QuestionAnswerSummary = {
      questionId: q.id,
      prompt: perspective === "partner" ? q.partnerPrompt : q.prompt,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      enjoyment: ans.enjoyment,
      experienceFrequency: ans.experienceFrequency,
      ...(ans.desireDelta ? { desireDelta: ans.desireDelta } : {}),
      importance,
      firmBoundary: Boolean(
        ans.firmBoundary || ans.partnerWillingness === "firm_boundary",
      ),
      partnerWillingness: ans.partnerWillingness,
    };

    qaSummary.push({
      questionId: q.id,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      prompt: summary.prompt,
      answerLabel: formatAnswerDisplayLabel(q, ans),
      importance,
      experienceFrequency: ans.experienceFrequency,
      desireDelta: ans.desireDelta,
      firmBoundary: summary.firmBoundary,
    });

    if (summary.firmBoundary) {
      buckets.firmBoundaries.push(summary);
    } else if (
      ans.enjoyment === "curious" ||
      ans.partnerWillingness === "curious_to_explore"
    ) {
      buckets.curiousAbout.push(summary);
    } else if (
      ans.enjoyment === "depends" ||
      ans.partnerWillingness === "depends_on_context"
    ) {
      buckets.situational.push(summary);
    } else if (
      (isNumericEnjoyment(ans.enjoyment) && ans.enjoyment <= 2) ||
      ans.partnerWillingness === "prefer_not_to"
    ) {
      if (q.sectionId !== "boundaries-comfort") {
        buckets.preferToAvoid.push(summary);
      }
    } else if (
      (isNumericEnjoyment(ans.enjoyment) && ans.enjoyment >= 4) ||
      ans.partnerWillingness === "enthusiastically_enjoy"
    ) {
      if (q.sectionId !== "boundaries-comfort") {
        buckets.stronglyDesired.push(summary);
      }
    }

    if (
      (importance === "essential" || importance === "important") &&
      !summary.firmBoundary &&
      ans.enjoyment !== "prefer_not_to_answer"
    ) {
      buckets.importantQualities.push(summary);
    }

    const effective = getEffectiveRatingForScoring(q, ans);
    if (effective !== null) {
      const impWeight = IMPORTANCE_MULTIPLIER[importance];
      for (const [dimKey, rawWeight] of Object.entries(
        q.dimensionWeights,
      ) as Array<[RadarDimensionKey, number]>) {
        if (!rawWeight || !dimensionTotals[dimKey]) continue;
        const normalized0to100 =
          rawWeight >= 0
            ? ((effective - 1) / 4) * 100
            : ((5 - effective) / 4) * 100;
        const absW = Math.abs(rawWeight) * impWeight;
        dimensionTotals[dimKey].weightedSum += normalized0to100 * absW;
        dimensionTotals[dimKey].weightDenom += absW;
        dimensionTotals[dimKey].contributors.push({
          questionId: q.id,
          prompt: perspective === "partner" ? q.partnerPrompt : q.prompt,
          normalizedContribution: Math.round(normalized0to100),
          enjoymentLabel: formatEnjoymentLabel(ans.enjoyment),
          importance,
          direction: rawWeight >= 0 ? "positive" : "inverse",
          weightedImpact: computeImpactMetric(normalized0to100, absW),
          rawWeight,
        });
      }
    }

    if (isNumericEnjoyment(ans.enjoyment)) {
      if (isNumericExperience(ans.experienceFrequency)) {
        const quadrant = classifyQuadrant(
          ans.enjoyment,
          ans.experienceFrequency,
        );
        scatterPoints.push({
          questionId: q.id,
          shortLabel: shortenPromptLabel(
            perspective === "partner" ? q.partnerPrompt : q.prompt,
          ),
          prompt: perspective === "partner" ? q.partnerPrompt : q.prompt,
          sectionId: q.sectionId,
          sectionTitle: q.sectionTitle,
          enjoymentScore: ans.enjoyment,
          experienceScore: ans.experienceFrequency,
          ...(ans.desireDelta ? { desireDelta: ans.desireDelta } : {}),
          importance,
          quadrant,
        });

        if (
          q.sectionId !== "boundaries-comfort" &&
          ((ans.enjoyment >= 4 && ans.experienceFrequency <= 2) ||
            ans.desireDelta === "want_more")
        ) {
          unmetPreferences.push({
            questionId: q.id,
            prompt: perspective === "partner" ? q.partnerPrompt : q.prompt,
            sectionTitle: q.sectionTitle,
            enjoymentScore: ans.enjoyment,
            experienceScore: ans.experienceFrequency,
            ...(ans.desireDelta ? { desireDelta: ans.desireDelta } : {}),
            importance,
            message:
              ans.desireDelta === "want_more"
                ? `Rated "${shortenPromptLabel(
                    perspective === "partner" ? q.partnerPrompt : q.prompt,
                  )}" positively (${ans.enjoyment}/5) and marked wanting more of it.`
                : `Rated "${shortenPromptLabel(
                    perspective === "partner" ? q.partnerPrompt : q.prompt,
                  )}" positively (${ans.enjoyment}/5) while experiencing it rarely (${ans.experienceFrequency}/5). Worth asking for openly.`,
          });
        }
      } else if (q.supportsExperienceFrequency && !ans.firmBoundary) {
        experienceUnratedCount += 1;
      }
    }
  }

  const importanceRank: Record<ImportanceLevel, number> = {
    essential: 4,
    important: 3,
    nice_to_have: 2,
    not_important: 1,
  };
  buckets.stronglyDesired.sort((a, b) => {
    const scoreDiff =
      (typeof b.enjoyment === "number" ? b.enjoyment : 0) -
      (typeof a.enjoyment === "number" ? a.enjoyment : 0);
    if (scoreDiff !== 0) return scoreDiff;
    return importanceRank[b.importance] - importanceRank[a.importance];
  });
  buckets.importantQualities.sort(
    (a, b) => importanceRank[b.importance] - importanceRank[a.importance],
  );
  unmetPreferences.sort(
    (a, b) =>
      b.enjoymentScore - a.enjoymentScore ||
      a.experienceScore - b.experienceScore,
  );

  const radar: RadarDimensionScore[] = (
    Object.keys(RADAR_LABELS) as RadarDimensionKey[]
  ).map((dim) => {
    const bucket = dimensionTotals[dim];
    const score =
      bucket.weightDenom > 0
        ? Math.round(bucket.weightedSum / bucket.weightDenom)
        : 50;
    const sortedContributors = [...bucket.contributors].sort(
      (a, b) =>
        (b.weightedImpact ?? 0) - (a.weightedImpact ?? 0) ||
        a.questionId.localeCompare(b.questionId),
    );
    return {
      dimension: dim,
      label: RADAR_LABELS[dim],
      score: Math.max(0, Math.min(100, score)),
      answeredCount: sortedContributors.length,
      contributors: sortedContributors,
    };
  });

  const radarMap = radar.reduce(
    (acc, item) => {
      acc[item.dimension as RadarDimensionKey] = item.score;
      return acc;
    },
    {} as Record<RadarDimensionKey, number>,
  );

  const totalEligibleInMode = modeQuestions.length;
  const coveragePercent =
    totalEligibleInMode > 0
      ? Math.round((answeredCount / totalEligibleInMode) * 100)
      : 0;
  const provisional = coveragePercent < 35 || answeredCount < 5;

  const profile = determineProfileArchetype(radarMap, buckets);
  const groundedInsights = buildGroundedInsights(
    assessment,
    answers,
    unmetPreferences,
    radarMap,
  );
  const idealPartner = buildIdealPartnerReport(
    assessment,
    answers,
    buckets,
    radarMap,
  );
  const dimLabelMap = buildDimensionLabelMap(assessment, radar);
  const intoBundle = buildWhatYouAreInto({
    assessment,
    modeQuestions,
    answers,
    perspective,
    radar,
    unmetPreferences,
    dimLabelMap,
  });
  const dimensionInteractions = buildDimensionInteractions({
    assessment,
    radar,
    whatYouAreInto: intoBundle.summary,
  });
  const enrichedQaSummary: QaSummaryEntry[] = qaSummary.map((row) => ({
    ...row,
    score0to100: intoBundle.scoreByQuestionId.get(row.questionId) ?? null,
    linkedDimensions: intoBundle.linksByQuestionId.get(row.questionId) || [],
    ...(intoBundle.intoTagByQuestionId.has(row.questionId)
      ? { intoTag: intoBundle.intoTagByQuestionId.get(row.questionId) }
      : {}),
  }));

  return {
    resultId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentCategory: assessment.category,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    scoringStrategy: "intimacy_weighted",
    mode,
    perspective,
    createdAt,
    answeredCount,
    totalEligibleInMode,
    coveragePercent,
    provisional,
    profile,
    radar,
    buckets,
    scatterPoints,
    experienceUnratedCount,
    unmetPreferences,
    groundedInsights,
    whatYouAreInto: intoBundle.summary,
    dimensionInteractions,
    idealPartner,
    recommendedNextSlugs: assessment.recommendedNextSlugs || [
      "sexual-interests-curiosity-map",
      "intimacy-communication-aftercare",
      "what-makes-you-feel-desired",
    ],
    qaSummary: enrichedQaSummary,
  };
}

function deriveDimensions(
  assessment: AssessmentDefinition,
): DimensionDefinition[] {
  if (assessment.dimensions && assessment.dimensions.length > 0) {
    return assessment.dimensions;
  }
  const seen = new Map<string, DimensionDefinition>();
  for (const q of assessment.questions) {
    for (const k of Object.keys(q.dimensionWeights || {})) {
      if (!seen.has(k)) {
        seen.set(k, {
          key: k,
          label: k
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim(),
          description: `Measured across items weighted toward ${k}.`,
        });
      }
    }
  }
  if (seen.size === 0) {
    return assessment.sections.map((s) => ({
      key: s.id,
      label: s.title,
      description: s.description,
    }));
  }
  return Array.from(seen.values());
}

function scoreGeneralAssessment(params: {
  resultId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  answers: Record<string, QuestionAnswer>;
  createdAt: string;
}): ScoredAssessmentResult {
  const { resultId, assessment, mode, perspective, answers, createdAt } =
    params;
  const strategy = assessment.scoringStrategy || "dimension_average";
  const activeQuestions = selectAssessmentQuestions(assessment, mode, answers);

  const dimensions = deriveDimensions(assessment);
  const dimTotals = new Map<
    string,
    {
      weightedSum: number;
      weightDenom: number;
      contributors: RadarDimensionScore["contributors"];
    }
  >();
  for (const d of dimensions) {
    dimTotals.set(d.key, { weightedSum: 0, weightDenom: 0, contributors: [] });
  }

  const buckets: ScoredAssessmentResult["buckets"] = {
    stronglyDesired: [],
    importantQualities: [],
    curiousAbout: [],
    situational: [],
    preferToAvoid: [],
    firmBoundaries: [],
  };

  const curiosityBucketMap: Record<
    CuriosityLevel,
    Array<{ questionId: string; prompt: string; sectionTitle: string }>
  > = {
    very_interested: [],
    interested: [],
    curious_uncertain: [],
    not_interested: [],
    firm_boundary: [],
    havent_considered: [],
  };

  const priorityTagScores = new Map<
    string,
    { label: string; scoreSum: number; hits: number; boundary: boolean }
  >();
  const qaSummary: QaSummaryEntry[] = [];
  let answeredCount = 0;

  for (const q of activeQuestions) {
    const ans = answers[q.id];
    if (!hasAnyResponse(q, ans)) continue;
    answeredCount += 1;

    const importance: ImportanceLevel =
      q.supportsImportance === false
        ? "nice_to_have"
        : ans.importance || "important";
    const impMult = IMPORTANCE_MULTIPLIER[importance];
    const prompt =
      perspective === "partner" ? q.partnerPrompt || q.prompt : q.prompt;
    const answerLabel = formatAnswerDisplayLabel(q, ans);
    const isBoundary = Boolean(
      ans.firmBoundary || ans.curiosityLevel === "firm_boundary",
    );

    qaSummary.push({
      questionId: q.id,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      prompt,
      answerLabel,
      importance,
      experienceFrequency: ans.experienceFrequency,
      desireDelta: ans.desireDelta,
      firmBoundary: isBoundary,
    });

    const summary: QuestionAnswerSummary = {
      questionId: q.id,
      prompt,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      enjoyment: ans.enjoyment,
      experienceFrequency: ans.experienceFrequency,
      desireDelta: ans.desireDelta,
      importance,
      firmBoundary: isBoundary,
      partnerWillingness: ans.partnerWillingness,
      curiosityLevel: ans.curiosityLevel,
      answerLabel,
    };

    if (isBoundary) {
      buckets.firmBoundaries.push(summary);
    } else if (
      ans.curiosityLevel === "curious_uncertain" ||
      ans.enjoyment === "curious"
    ) {
      buckets.curiousAbout.push(summary);
    } else if (ans.enjoyment === "depends") {
      buckets.situational.push(summary);
    }

    if (ans.curiosityLevel) {
      curiosityBucketMap[ans.curiosityLevel].push({
        questionId: q.id,
        prompt,
        sectionTitle: q.sectionTitle,
      });
      if (
        ans.curiosityLevel === "very_interested" ||
        ans.curiosityLevel === "interested"
      ) {
        buckets.stronglyDesired.push(summary);
      } else if (ans.curiosityLevel === "not_interested") {
        buckets.preferToAvoid.push(summary);
      }
    }

    // Score choice/option-based items (forced_choice, multiple_choice, situational, would_rather_vote)
    if (
      (q.inputType === "multiple_choice" ||
        q.inputType === "forced_choice" ||
        q.inputType === "situational" ||
        q.inputType === "would_rather_vote" ||
        q.inputType === "partner_prediction") &&
      typeof ans.customValue === "string"
    ) {
      const pickedOpt = q.options?.find((o) => o.value === ans.customValue);
      if (pickedOpt) {
        const pTag = pickedOpt.priorityTag || q.priorityId;
        if (pTag) {
          const prev = priorityTagScores.get(pTag) || {
            label: pickedOpt.label,
            scoreSum: 0,
            hits: 0,
            boundary: isBoundary,
          };
          priorityTagScores.set(pTag, {
            label: pickedOpt.priorityTag
              ? pickedOpt.label
              : q.priorityLabel || pickedOpt.label,
            scoreSum: prev.scoreSum + 100 * impMult,
            hits: prev.hits + 1,
            boundary: prev.boundary || isBoundary,
          });
        }

        const qDimKeys = Object.keys(q.dimensionWeights || {});
        if (qDimKeys.length > 0 && pickedOpt.dimensionWeights) {
          for (const dKey of qDimKeys) {
            const rawQWeight = q.dimensionWeights[dKey] || 1;
            const qWeight = Math.abs(rawQWeight) * impMult;
            const optWeight = pickedOpt.dimensionWeights[dKey] ?? 0;
            const norm = Math.max(
              0,
              Math.min(100, Math.round(optWeight * 100)),
            );
            const bucket = dimTotals.get(dKey);
            if (bucket) {
              bucket.weightedSum += norm * qWeight;
              bucket.weightDenom += qWeight;
              bucket.contributors.push({
                questionId: q.id,
                prompt,
                normalizedContribution: norm,
                enjoymentLabel: pickedOpt.label,
                importance,
                direction: optWeight >= 0 ? "positive" : "inverse",
                weightedImpact: computeImpactMetric(norm, qWeight),
                rawWeight: rawQWeight,
              });
            }
          }
        } else if (pickedOpt.dimensionWeights) {
          for (const [dKey, optVal] of Object.entries(
            pickedOpt.dimensionWeights,
          )) {
            const bucket = dimTotals.get(dKey);
            if (bucket) {
              const norm = Math.max(0, Math.min(100, Math.round(optVal * 100)));
              bucket.weightedSum += norm * impMult;
              bucket.weightDenom += impMult;
              bucket.contributors.push({
                questionId: q.id,
                prompt,
                normalizedContribution: norm,
                enjoymentLabel: pickedOpt.label,
                importance,
                direction: optVal >= 0 ? "positive" : "inverse",
                weightedImpact: computeImpactMetric(norm, impMult),
                rawWeight: optVal,
              });
            }
          }
        }
      }
      continue;
    }

    // Score ranking items (customValue: string[])
    if (q.inputType === "ranking" && Array.isArray(ans.customValue)) {
      const list = ans.customValue;
      const total = Math.max(list.length, 1);
      list.forEach((optVal, idx) => {
        const rankScore =
          total > 1 ? Math.round(((total - 1 - idx) / (total - 1)) * 100) : 100;
        const opt = q.options?.find((o) => o.value === optVal);
        if (opt?.priorityTag || optVal) {
          const tagKey = opt?.priorityTag || optVal;
          const prev = priorityTagScores.get(tagKey) || {
            label: opt?.label || optVal,
            scoreSum: 0,
            hits: 0,
            boundary: false,
          };
          priorityTagScores.set(tagKey, {
            label: opt?.label || optVal,
            scoreSum: prev.scoreSum + rankScore * impMult,
            hits: prev.hits + 1,
            boundary: prev.boundary,
          });
        }
        if (opt?.dimensionWeights) {
          for (const [dKey, weightVal] of Object.entries(
            opt.dimensionWeights,
          )) {
            const bucket = dimTotals.get(dKey);
            if (bucket) {
              const w = Math.abs(weightVal) * impMult;
              bucket.weightedSum += rankScore * w;
              bucket.weightDenom += w;
              bucket.contributors.push({
                questionId: q.id,
                prompt,
                normalizedContribution: rankScore,
                enjoymentLabel: `Rank #${idx + 1}: ${opt.label}`,
                importance,
                direction: weightVal >= 0 ? "positive" : "inverse",
                weightedImpact: computeImpactMetric(rankScore, w),
                rawWeight: weightVal,
              });
            }
          }
        }
      });
      continue;
    }

    // Score multi_select (curated items, bucket list, fantasies)
    if (q.inputType === "multi_select" && Array.isArray(ans.customValue)) {
      const selected = new Set(ans.customValue);
      const qOpts = q.options || [];
      const selectedLabels = qOpts
        .filter((o) => selected.has(o.value))
        .map((o) => o.label);
      if (selected.size > 0) {
        buckets.stronglyDesired.push({
          ...summary,
          answerLabel: selectedLabels.join(", "),
        });
      }
      const multiDimAcc = new Map<
        string,
        { scoreSum: number; wSum: number; rawWeight: number }
      >();
      for (const opt of qOpts) {
        const isPicked = selected.has(opt.value);
        if (isPicked && (opt.priorityTag || opt.value)) {
          const key = opt.priorityTag || opt.value;
          const prev = priorityTagScores.get(key) || {
            label: opt.label,
            scoreSum: 0,
            hits: 0,
            boundary: false,
          };
          priorityTagScores.set(key, {
            label: opt.label,
            scoreSum: prev.scoreSum + 95,
            hits: prev.hits + 1,
            boundary: prev.boundary,
          });
        }
        if (opt.dimensionWeights) {
          for (const [dKey, weightVal] of Object.entries(
            opt.dimensionWeights,
          )) {
            const bucket = dimTotals.get(dKey);
            if (bucket) {
              const scoreVal = isPicked ? 92 : 18;
              const w = Math.abs(weightVal) * 0.5;
              bucket.weightedSum += scoreVal * w;
              bucket.weightDenom += w;
              const prevAcc = multiDimAcc.get(dKey) || {
                scoreSum: 0,
                wSum: 0,
                rawWeight: weightVal,
              };
              multiDimAcc.set(dKey, {
                scoreSum: prevAcc.scoreSum + scoreVal * w,
                wSum: prevAcc.wSum + w,
                rawWeight: weightVal,
              });
            }
          }
        }
      }
      // Also distribute question-level dimension weights proportionally by selection ratio
      const ratio =
        qOpts.length > 0
          ? Math.round((selected.size / qOpts.length) * 100)
          : 50;
      for (const [dKey, weightVal] of Object.entries(
        q.dimensionWeights || {},
      )) {
        const bucket = dimTotals.get(dKey);
        if (bucket) {
          const w = Math.abs(weightVal) * impMult;
          bucket.weightedSum += ratio * w;
          bucket.weightDenom += w;
          const prevAcc = multiDimAcc.get(dKey) || {
            scoreSum: 0,
            wSum: 0,
            rawWeight: weightVal,
          };
          multiDimAcc.set(dKey, {
            scoreSum: prevAcc.scoreSum + ratio * w,
            wSum: prevAcc.wSum + w,
            rawWeight: weightVal,
          });
        }
      }
      for (const [dKey, acc] of multiDimAcc.entries()) {
        const bucket = dimTotals.get(dKey);
        if (!bucket || acc.wSum <= 0) continue;
        const norm = Math.round(acc.scoreSum / acc.wSum);
        bucket.contributors.push({
          questionId: q.id,
          prompt,
          normalizedContribution: norm,
          enjoymentLabel:
            selectedLabels.length > 0
              ? selectedLabels.slice(0, 3).join(", ")
              : "None selected",
          importance,
          direction: acc.rawWeight >= 0 ? "positive" : "inverse",
          weightedImpact: computeImpactMetric(norm, acc.wSum),
          rawWeight: acc.rawWeight,
        });
      }
      continue;
    }

    // Standard numeric scales: rating_scale, slider, curiosity_map, enjoyment_scale
    const norm0to100 = normalizeQuestionAnswer0to100(q, ans);
    if (norm0to100 !== null) {
      if (norm0to100 >= 75 && !isBoundary) {
        buckets.stronglyDesired.push(summary);
      } else if (norm0to100 <= 25 && !isBoundary) {
        buckets.preferToAvoid.push(summary);
      }
      if (importance === "essential" || importance === "important") {
        buckets.importantQualities.push(summary);
      }
      if (q.priorityId || q.priorityLabel) {
        const pKey = q.priorityId || q.id;
        const prev = priorityTagScores.get(pKey) || {
          label: q.priorityLabel || shortenPromptLabel(prompt),
          scoreSum: 0,
          hits: 0,
          boundary: isBoundary,
        };
        priorityTagScores.set(pKey, {
          label: q.priorityLabel || prev.label,
          scoreSum: prev.scoreSum + norm0to100 * impMult,
          hits: prev.hits + 1,
          boundary: prev.boundary || isBoundary,
        });
      }

      const entries = Object.entries(q.dimensionWeights || {});
      if (entries.length > 0) {
        for (const [dKey, rawW] of entries) {
          if (!rawW) continue;
          const bucket = dimTotals.get(dKey);
          if (!bucket) continue;
          const directedScore = rawW >= 0 ? norm0to100 : 100 - norm0to100;
          const w = Math.abs(rawW) * impMult;
          bucket.weightedSum += directedScore * w;
          bucket.weightDenom += w;
          bucket.contributors.push({
            questionId: q.id,
            prompt,
            normalizedContribution: Math.round(directedScore),
            enjoymentLabel: answerLabel,
            importance,
            direction: rawW >= 0 ? "positive" : "inverse",
            weightedImpact: computeImpactMetric(directedScore, w),
            rawWeight: rawW,
          });
        }
      } else {
        const secBucket = dimTotals.get(q.sectionId);
        if (secBucket) {
          secBucket.weightedSum += norm0to100 * impMult;
          secBucket.weightDenom += impMult;
          secBucket.contributors.push({
            questionId: q.id,
            prompt,
            normalizedContribution: Math.round(norm0to100),
            enjoymentLabel: answerLabel,
            importance,
            direction: "positive",
            weightedImpact: computeImpactMetric(norm0to100, impMult),
            rawWeight: 1,
          });
        }
      }
    }
  }

  const radar: RadarDimensionScore[] = dimensions.map((d) => {
    const b = dimTotals.get(d.key);
    const score =
      b && b.weightDenom > 0 ? Math.round(b.weightedSum / b.weightDenom) : 50;
    const sortedContributors = b
      ? [...b.contributors].sort(
          (x, y) =>
            (y.weightedImpact ?? 0) - (x.weightedImpact ?? 0) ||
            x.questionId.localeCompare(y.questionId),
        )
      : [];
    return {
      dimension: d.key,
      label: d.label,
      score: Math.max(0, Math.min(100, score)),
      answeredCount: sortedContributors.length,
      description: d.description,
      lowLabel: d.lowLabel,
      highLabel: d.highLabel,
      contributors: sortedContributors,
    };
  });

  const sortedDims = radar
    .filter((d) => d.answeredCount > 0)
    .sort(
      (a, b) => b.score - a.score || a.dimension.localeCompare(b.dimension),
    );
  const topDim = sortedDims[0];
  const secondDim = sortedDims[1];

  // Dual channel matrix (for Tests 6, 12, 28)
  let dualChannelScores: DualChannelScore[] | undefined;
  const pairGroups = new Map<
    string,
    { label: string; receive?: number; express?: number }
  >();
  for (const d of dimensions) {
    if (
      d.channelPairKey &&
      d.channelRole &&
      (radar.find((r) => r.dimension === d.key)?.answeredCount || 0) > 0
    ) {
      const score = radar.find((r) => r.dimension === d.key)?.score ?? 50;
      const entry = pairGroups.get(d.channelPairKey) || {
        label:
          d.shortLabel ||
          d.label.replace(/^(Receiving|Expressing|Offering|Needing)\s+/i, ""),
      };
      if (d.channelRole === "receive") entry.receive = score;
      else entry.express = score;
      pairGroups.set(d.channelPairKey, entry);
    }
  }
  if (pairGroups.size > 0) {
    dualChannelScores = Array.from(pairGroups.entries())
      .filter(
        ([, info]) => info.receive !== undefined && info.express !== undefined,
      )
      .map(([channelKey, info]) => {
        const r = info.receive ?? 50;
        const e = info.express ?? 50;
        return {
          channelKey,
          label: info.label,
          receiveOrNeedScore: r,
          expressOrOfferScore: e,
          gap: Math.abs(r - e),
        };
      });
  }

  // Attachment quadrant coordinates (Test 11)
  let attachmentCoordinates: ScoredAssessmentResult["attachmentCoordinates"];
  if (
    strategy === "attachment_quadrant" &&
    ["anxiety", "avoidance"].every(
      (key) => (radar.find((r) => r.dimension === key)?.answeredCount || 0) > 0,
    )
  ) {
    const anxiety = radar.find((r) => r.dimension === "anxiety")?.score ?? 45;
    const avoidance =
      radar.find((r) => r.dimension === "avoidance")?.score ?? 45;
    let quadrantLabel = "Steadily Connected (Balanced Anxiety & Avoidance)";
    if (anxiety >= 55 && avoidance < 55) {
      quadrantLabel =
        "Reassurance Seeking Leanings (Higher Anxiety, Lower Avoidance)";
    } else if (anxiety < 55 && avoidance >= 55) {
      quadrantLabel =
        "Autonomy Protective Leanings (Lower Anxiety, Higher Avoidance)";
    } else if (anxiety >= 55 && avoidance >= 55) {
      quadrantLabel =
        "Mixed Push Pull Leanings (Higher Anxiety & Higher Avoidance)";
    }
    attachmentCoordinates = { anxiety, avoidance, quadrantLabel };
  }

  // Blended Archetype calculation (when archetypes defined on assessment)
  let blendedArchetype: ScoredAssessmentResult["blendedArchetype"];
  let archetypeSummary = "";
  let archetypeName = topDim ? `${topDim.label} Focus` : assessment.shortTitle;
  let archetypeTagline = topDim
    ? `Anchored most strongly by ${topDim.label.toLowerCase()} (${topDim.score}/100)${
        secondDim
          ? ` and ${secondDim.label.toLowerCase()} (${secondDim.score}/100)`
          : ""
      }.`
    : assessment.audienceNote;

  const dimLookup = new Map(
    radar.filter((r) => r.answeredCount > 0).map((r) => [r.dimension, r.score]),
  );
  const eligibleArchetypes = (assessment.archetypes || []).filter(
    (a) =>
      Object.keys(a.weights).every((key) => dimLookup.has(key)) &&
      (a.conditions || []).every(
        (c) =>
          dimLookup.has(c.dimension) &&
          (c.min === undefined || dimLookup.get(c.dimension)! >= c.min) &&
          (c.max === undefined || dimLookup.get(c.dimension)! <= c.max),
      ),
  );
  if (eligibleArchetypes.length > 0) {
    const blendScores = eligibleArchetypes
      .map((arch) => {
        let weighted = 0;
        let denom = 0;
        for (const [k, w] of Object.entries(arch.weights)) {
          const s = dimLookup.get(k) ?? 50;
          const contribution = w >= 0 ? s : 100 - s;
          weighted += contribution * Math.abs(w);
          denom += Math.abs(w);
        }
        return {
          id: arch.id,
          name: arch.name,
          tagline: arch.tagline,
          summary: arch.summary,
          score: denom > 0 ? Math.round(weighted / denom) : 50,
        };
      })
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

    const primary = blendScores[0];
    const secondary = blendScores[1];
    blendedArchetype = {
      primary: primary.name,
      ...(secondary && primary.score - secondary.score <= 12
        ? { secondary: secondary.name }
        : {}),
      blendScores: blendScores.map((b) => ({
        id: b.id,
        name: b.name,
        score: b.score,
      })),
    };

    archetypeName =
      secondary && primary.score - secondary.score <= 6
        ? `${primary.name} · ${secondary.name}`
        : primary.name;
    archetypeTagline = primary.tagline;
    archetypeSummary = primary.summary;
  } else if (attachmentCoordinates) {
    archetypeName = attachmentCoordinates.quadrantLabel.split(" (")[0];
    archetypeTagline = attachmentCoordinates.quadrantLabel;
  }

  // Priority ranking (Tests 10, 16, 22, 26)
  let priorityRanking: PriorityRankItem[] | undefined;
  if (priorityTagScores.size > 0) {
    const rawItems = Array.from(priorityTagScores.entries()).map(
      ([id, data]) => ({
        id,
        label: data.label,
        score: Math.round(
          Math.min(100, data.scoreSum / Math.max(data.hits, 1)),
        ),
        boundary: data.boundary,
      }),
    );
    rawItems.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    priorityRanking = rawItems.map((it, idx) => {
      const tier: PriorityRankItem["tier"] = it.boundary
        ? "boundary"
        : idx < Math.max(1, Math.ceil(rawItems.length * 0.25)) || it.score >= 82
          ? "essential"
          : it.score >= 60
            ? "strong"
            : "flexible";
      return {
        id: it.id,
        label: it.label,
        score: it.score,
        rank: idx + 1,
        tier,
      };
    });
  } else if (
    strategy === "forced_choice_priorities" ||
    strategy === "bucket_list"
  ) {
    priorityRanking = sortedDims.map((d, idx) => ({
      id: d.dimension,
      label: d.label,
      score: d.score,
      rank: idx + 1,
      tier: d.score >= 78 ? "essential" : d.score >= 58 ? "strong" : "flexible",
    }));
  }

  // Curiosity groups
  const curiosityGroups: CuriosityGroupSummary[] | undefined =
    strategy === "curiosity_map" ||
    Object.values(curiosityBucketMap).some((list) => list.length > 0)
      ? (Object.keys(CURIOSITY_LABELS) as CuriosityLevel[])
          .map((lvl) => ({
            level: lvl,
            label: CURIOSITY_LABELS[lvl],
            items: curiosityBucketMap[lvl],
          }))
          .filter((g) => g.items.length > 0)
      : undefined;

  const groundedInsights: string[] = [];
  if (topDim) {
    groundedInsights.push(
      `Top theme: ${topDim.label} (${topDim.score}/100)${
        secondDim
          ? `, followed closely by ${secondDim.label} (${secondDim.score}/100)`
          : ""
      }.`,
    );
  }
  if (dualChannelScores && dualChannelScores.length > 0) {
    const topNeed = [...dualChannelScores].sort(
      (a, b) => b.receiveOrNeedScore - a.receiveOrNeedScore,
    )[0];
    const topOffer = [...dualChannelScores].sort(
      (a, b) => b.expressOrOfferScore - a.expressOrOfferScore,
    )[0];
    if (topNeed && topOffer) {
      groundedInsights.push(
        `You feel most desired receiving ${topNeed.label.toLowerCase()} (${topNeed.receiveOrNeedScore}/100), while most naturally giving ${topOffer.label.toLowerCase()} (${topOffer.expressOrOfferScore}/100).`,
      );
    }
  }
  if (strategy === "fantasy_mutual") {
    const privateOnlyCount = Object.values(answers).filter(
      (a) => a.revealRule === "private_never_share",
    ).length;
    groundedInsights.push(
      `Mutual reveal lock active: private fantasy picks stay hidden unless your partner independently chooses the same item${
        privateOnlyCount > 0
          ? `, and your ${privateOnlyCount} 'keep completely private' choice${
              privateOnlyCount === 1 ? " never leaves" : "s never leave"
            } private view`
          : ""
      }.`,
    );
  }
  if (attachmentCoordinates) {
    groundedInsights.push(
      `Your answers place reassurance sensitivity at ${attachmentCoordinates.anxiety}/100 and autonomy protection at ${attachmentCoordinates.avoidance}/100.`,
    );
  }
  if (buckets.firmBoundaries.length > 0) {
    groundedInsights.push(
      `${buckets.firmBoundaries.length} explicit boundary item${
        buckets.firmBoundaries.length === 1 ? " stays" : "s stay"
      } highlighted and protected in partner comparisons.`,
    );
  }

  const growthReflections: string[] = [];
  if (sortedDims.length >= 2) {
    const lowest = sortedDims[sortedDims.length - 1];
    growthReflections.push(
      `${lowest.label} is ${lowest.score}/100${lowest.score <= 40 && lowest.lowLabel ? `: ${lowest.lowLabel}` : lowest.score >= 60 && lowest.highLabel ? `: ${lowest.highLabel}` : ""}. Consider a recent situation that shaped this answer pattern; a lower score is not a judgment of your worth.`,
    );
  }
  if (dualChannelScores) {
    const widestGap = [...dualChannelScores].sort((a, b) => b.gap - a.gap)[0];
    if (widestGap && widestGap.gap >= 20) {
      growthReflections.push(
        `Largest give vs receive contrast sits in ${widestGap.label} (receive ${widestGap.receiveOrNeedScore} vs express ${widestGap.expressOrOfferScore}): a helpful cue so partners match what you actually crave.`,
      );
    }
  }

  for (const dimension of [topDim, sortedDims.at(-1)].filter(
    (d, index, list) =>
      Boolean(d) &&
      list.findIndex((v) => v?.dimension === d?.dimension) === index,
  )) {
    if (!dimension) continue;
    const key = dimension.dimension;
    let suggestion =
      "Discuss one recent example of " +
      dimension.label.toLowerCase() +
      " and what felt comfortable or difficult.";
    if (/repair|conflict|harmony|regulat/.test(key))
      suggestion =
        "Agree on a pause signal and a specific time to return to a difficult conversation. Notice whether that helps your reported repair pattern.";
    else if (/autonomy|avoidance|space/.test(key))
      suggestion =
        "Describe what helpful personal space looks like and how you would like to reconnect afterward.";
    else if (/anxiety|reassurance/.test(key))
      suggestion =
        "Discuss what reliable communication means to each of you, including times when an immediate reply is not possible.";
    else if (/presence|listening|empathy/.test(key))
      suggestion =
        "Before offering support, ask whether listening, practical help or quiet company would be most welcome.";
    else if (/financial|domestic|future|life_compat/.test(key))
      suggestion =
        "Turn this preference into one concrete agreement about money, household work or future plans, then check whether both people can support it.";
    else if (/trust|boundar|respect|consent|safety/.test(key))
      suggestion =
        "Name what respecting this limit looks like in practice. Agreement and a high score never replace ongoing consent.";
    else if (/openness|explor|novel|curiosity/.test(key))
      suggestion =
        "Choose one unfamiliar experience you would actually welcome, and one limit you want respected. Compare the difference without pressure.";
    growthReflections.push(
      dimension.label + " (" + dimension.score + "/100): " + suggestion,
    );
  }
  const disclaimer =
    assessment.scientificDisclaimer ||
    "Descriptive self reflection built directly from your answers. Private guide only, not a clinical diagnosis.";

  const totalEligibleInMode = activeQuestions.length;
  const coveragePercent =
    totalEligibleInMode > 0
      ? Math.round((answeredCount / totalEligibleInMode) * 100)
      : 0;
  const provisional = coveragePercent < 35 || answeredCount < 4;

  const profile: PersonalProfileSummary = {
    archetypeName,
    archetypeTagline,
    disclaimer,
    summaryParagraph: `${archetypeSummary || archetypeTagline}${topDim ? ` Your strongest measured theme is ${topDim.label} at ${topDim.score}/100.` : ""} Built from ${answeredCount} answered question${
      answeredCount === 1 ? "" : "s"
    } (${coveragePercent}% of ${mode} mode) in ${assessment.title}.`,
    strongestPreferences: sortedDims
      .slice(0, 4)
      .map((d) => `${d.label} (${d.score}/100)`),
    importantNeeds: buckets.importantQualities
      .slice(0, 4)
      .map((b) => shortenPromptLabel(b.prompt)),
    noveltyComfort: curiosityGroups?.find(
      (g) => g.level === "curious_uncertain",
    )
      ? `${curiosityGroups.find((g) => g.level === "curious_uncertain")!.items.length} topics marked curious to explore.`
      : "Grounded in explicit answers for this test.",
    communicationStyle: groundedInsights[0] || assessment.audienceNote,
    paceAndEnergy:
      sortedDims[0]?.description || assessment.futureExtensibilityNote,
    initiativeBalance: dualChannelScores
      ? `Top receiving pull: ${
          [...dualChannelScores].sort(
            (a, b) => b.receiveOrNeedScore - a.receiveOrNeedScore,
          )[0]?.label || "Balanced"
        }`
      : topDim
        ? `Strongest pull: ${topDim.label}`
        : "Balanced profile",
    topBoundaries: buckets.firmBoundaries
      .slice(0, 5)
      .map((b) => shortenPromptLabel(b.prompt)),
  };

  const idealPartner: IdealPartnerReport = {
    characteristics: [
      ...(topDim
        ? [
            `Matches or complements your high ${topDim.label.toLowerCase()} score (${topDim.score}/100).`,
          ]
        : []),
      ...(dualChannelScores
        ? [
            `Naturally offers ${
              [...dualChannelScores]
                .sort((a, b) => b.receiveOrNeedScore - a.receiveOrNeedScore)[0]
                ?.label.toLowerCase() || "balanced care"
            } consistently.`,
          ]
        : []),
      "Talks calmly through differences in desires, timing, or habits.",
    ],
    whatMattersMost: (priorityRanking || []).slice(0, 5).map((p) => ({
      title: p.label,
      detail: `Ranked #${p.rank} (${p.score}/100 · ${p.tier})`,
      weight:
        p.tier === "essential"
          ? "essential"
          : p.tier === "strong"
            ? "important"
            : "nice_to_have",
    })),
    earlyDatingSignals: [
      {
        signal: `Clear chemistry around ${topDim?.label.toLowerCase() || "core preferences"}`,
        conversationPrompt: `"When it comes to ${
          topDim?.label.toLowerCase() || "closeness"
        }, what pace and dynamic excites you most?"`,
      },
    ],
    potentialMismatches: buckets.firmBoundaries.slice(0, 3).map((b) => ({
      area: shortenPromptLabel(b.prompt),
      note: "Firm boundary: a compatible partner respects this completely without pushing.",
    })),
    explorationOpportunities: buckets.curiousAbout.slice(0, 4).map((b) => ({
      topic: shortenPromptLabel(b.prompt),
      framing:
        "Curious to try: bring this up in relaxed conversation with zero pressure.",
    })),
    communicationNeeds: groundedInsights.slice(0, 3),
  };

  const dimLabelMap = buildDimensionLabelMap(assessment, radar);
  const intoBundle = buildWhatYouAreInto({
    assessment,
    modeQuestions: activeQuestions,
    answers,
    perspective,
    radar,
    unmetPreferences: [],
    dualChannelScores,
    attachmentCoordinates,
    dimLabelMap,
  });
  const dimensionInteractions = buildDimensionInteractions({
    assessment,
    radar,
    whatYouAreInto: intoBundle.summary,
    dualChannelScores,
  });
  const enrichedQaSummary: QaSummaryEntry[] = qaSummary.map((row) => ({
    ...row,
    score0to100: intoBundle.scoreByQuestionId.get(row.questionId) ?? null,
    linkedDimensions: intoBundle.linksByQuestionId.get(row.questionId) || [],
    ...(intoBundle.intoTagByQuestionId.has(row.questionId)
      ? { intoTag: intoBundle.intoTagByQuestionId.get(row.questionId) }
      : {}),
  }));

  return {
    resultId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentCategory: assessment.category,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    scoringStrategy: strategy,
    mode,
    perspective,
    createdAt,
    answeredCount,
    totalEligibleInMode,
    coveragePercent,
    provisional,
    profile,
    radar,
    buckets,
    scatterPoints: [],
    experienceUnratedCount: 0,
    unmetPreferences: [],
    groundedInsights,
    growthReflections,
    whatYouAreInto: intoBundle.summary,
    dimensionInteractions,
    idealPartner,
    ...(dualChannelScores ? { dualChannelScores } : {}),
    ...(priorityRanking ? { priorityRanking } : {}),
    ...(curiosityGroups ? { curiosityGroups } : {}),
    ...(blendedArchetype ? { blendedArchetype } : {}),
    ...(attachmentCoordinates ? { attachmentCoordinates } : {}),
    recommendedNextSlugs: assessment.recommendedNextSlugs || [],
    qaSummary: enrichedQaSummary,
  };
}

export function scoreAssessmentSubmission(params: {
  resultId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  answers: Record<string, QuestionAnswer>;
  createdAt?: string;
}): ScoredAssessmentResult {
  const createdAt = params.createdAt || new Date().toISOString();
  const strategy = params.assessment.scoringStrategy || "intimacy_weighted";
  if (strategy === "intimacy_profile") {
    const result = scoreIntimacyProfile({ ...params, createdAt });
    attachPersonalizedAdvice(result, params.assessment, params.answers);
    return result;
  }

  const result =
    strategy === "intimacy_weighted"
      ? scoreIntimacyWeighted({ ...params, createdAt })
      : scoreGeneralAssessment({ ...params, createdAt });
  result.adultsOnly = params.assessment.adultsOnly;
  const eligible = selectAssessmentQuestions(
    params.assessment,
    params.mode,
    params.answers,
  );
  for (const dimension of result.radar) {
    const definition = params.assessment.dimensions?.find(
      (d) => d.key === dimension.dimension,
    );
    if (!definition?.interpretations) continue;
    dimension.eligibleCount = eligible.filter((q) =>
      Boolean(q.dimensionWeights[dimension.dimension]),
    ).length;
    if (dimension.answeredCount > 0) {
      const band =
        dimension.score < 40
          ? "low"
          : dimension.score > 60
            ? "high"
            : "balanced";
      dimension.interpretation = { ...definition.interpretations[band], band };
    }
  }
  if (
    params.assessment.dimensions?.every((d) => Boolean(d.interpretations)) &&
    result.radar.some((d) => d.answeredCount > 0)
  ) {
    result.profile.archetypeName = params.assessment.title;
    result.profile.archetypeTagline =
      "A category profile grounded in your answers";
    result.profile.summaryParagraph = result.radar
      .filter((d) => d.answeredCount > 0)
      .map((d) => `${d.label}: ${d.score}/100. ${d.interpretation!.meaning}`)
      .join(" ");
    result.profile.strongestPreferences = result.radar
      .filter((d) => d.answeredCount >= 3 && d.score > 60)
      .map((d) => `${d.label}: ${d.interpretation!.meaning}`);
    result.whatYouAreInto = undefined;
    result.dimensionInteractions = [];
    result.idealPartner = {
      characteristics: [],
      whatMattersMost: [],
      earlyDatingSignals: [],
      potentialMismatches: [],
      explorationOpportunities: [],
      communicationNeeds: [],
    };
    result.groundedInsights = result.radar
      .filter((d) => d.answeredCount >= 3)
      .map((d) => `${d.label}: ${d.interpretation!.possibleTradeoff}`);
    result.growthReflections = result.radar
      .filter((d) => d.answeredCount >= 3)
      .map((d) => d.interpretation!.reflection);
    result.buckets = {
      stronglyDesired: [],
      importantQualities: [],
      curiousAbout: [],
      situational: [],
      preferToAvoid: [],
      firmBoundaries: [],
    };
    for (const qa of result.qaSummary ?? []) delete qa.intoTag;
  }
  const measured = result.radar.filter((d) => d.answeredCount > 0);
  result.dimensionInteractions = result.dimensionInteractions?.filter((item) =>
    item.dimensions.every((d) =>
      measured.some((m) => m.dimension === d.dimension),
    ),
  );
  const measuredKey = (pattern: RegExp) =>
    measured.some((d) => pattern.test(d.dimension + " " + d.label));
  if (!measuredKey(/novel|explor|openness|curiosity/i))
    result.profile.noveltyComfort = "Not measured in this attempt.";
  if (!measuredKey(/communicat|feedback|clarity|listening/i))
    result.profile.communicationStyle = "Not measured in this attempt.";
  if (!measuredKey(/pace|energy|sensual|cadence/i))
    result.profile.paceAndEnergy = "Not measured in this attempt.";
  if (
    !measuredKey(/initiative|assertive|guiding|receptive|dominance|submission/i)
  )
    result.profile.initiativeBalance = "Not measured in this attempt.";
  if (
    strategy === "intimacy_weighted" &&
    measured.length > 0 &&
    measured.length < result.radar.length
  ) {
    result.provisional = true;
    result.profile.archetypeName = "An emerging preference profile";
    result.profile.archetypeTagline =
      "A partial picture, grounded in your answers";
    result.profile.summaryParagraph =
      "Your measured categories are " +
      measured.map((d) => d.label + " (" + d.score + "%)").join(", ") +
      ". Other categories are unmeasured in this attempt; no broader archetype is assigned yet.";
  }
  if (!result.radar.some((d) => d.answeredCount > 0)) {
    result.provisional = true;
    result.profile = {
      archetypeName: "Not enough answers yet",
      archetypeTagline: "Your profile takes shape from measured answers.",
      disclaimer: result.profile.disclaimer,
      summaryParagraph:
        "No scored dimensions are available in this attempt. Skipped and private answers do not establish traits.",
      strongestPreferences: [],
      importantNeeds: [],
      noveltyComfort: "Not measured.",
      communicationStyle: "Not measured.",
      paceAndEnergy: "Not measured.",
      initiativeBalance: "Not measured.",
      topBoundaries: [],
    };
    result.attachmentCoordinates = undefined;
    result.blendedArchetype = undefined;
    result.dualChannelScores = [];
    result.dimensionInteractions = [];
    result.groundedInsights = [];
    result.idealPartner = {
      characteristics: [],
      whatMattersMost: [],
      earlyDatingSignals: [],
      potentialMismatches: [],
      explorationOpportunities: [],
      communicationNeeds: [],
    };
  }
  attachPersonalizedAdvice(result, params.assessment, params.answers);
  return result;
}

export function computeMultiRaterSummary(params: {
  assessment: AssessmentDefinition;
  selfResult: ScoredAssessmentResult;
  raterSubmissions: MultiRaterSubmissionRecord[];
  minRespondents: number;
}): {
  available: boolean;
  respondentCount: number;
  minRespondents: number;
  relationshipBreakdown: Record<string, number>;
  dimensionComparison: Array<{
    dimension: string;
    label: string;
    selfScore: number;
    othersMeanScore: number | null;
    gap: number | null;
  }>;
  insights: string[];
} {
  const { assessment, selfResult, raterSubmissions, minRespondents } = params;
  const respondentCount = raterSubmissions.length;
  const relationshipBreakdown: Record<string, number> = {};
  for (const r of raterSubmissions) {
    relationshipBreakdown[r.relationshipType] =
      (relationshipBreakdown[r.relationshipType] || 0) + 1;
  }

  if (respondentCount < minRespondents) {
    return {
      available: false,
      respondentCount,
      minRespondents,
      relationshipBreakdown,
      dimensionComparison: selfResult.radar.map((d) => ({
        dimension: d.dimension,
        label: d.label,
        selfScore: d.score,
        othersMeanScore: null,
        gap: null,
      })),
      insights: [
        `At least ${minRespondents} anonymous observer responses are required before peer averages unlock (currently ${respondentCount}). This protects individual respondent anonymity.`,
      ],
    };
  }

  const raterScored = raterSubmissions.map((r) =>
    scoreAssessmentSubmission({
      resultId: r.responseId,
      assessment,
      mode: "complete",
      perspective: "partner",
      answers: r.answers,
      createdAt: r.createdAt,
    }),
  );

  const dimensionComparison = selfResult.radar.map((selfDim) => {
    const scores = raterScored
      .map(
        (rs) =>
          rs.radar.find(
            (d) => d.dimension === selfDim.dimension && d.answeredCount > 0,
          )?.score,
      )
      .filter((v): v is number => typeof v === "number");
    const mean =
      scores.length >= minRespondents
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    return {
      dimension: selfDim.dimension,
      label: selfDim.label,
      selfScore: selfDim.score,
      othersMeanScore: mean,
      gap: mean !== null ? Math.abs(selfDim.score - mean) : null,
    };
  });

  const insights: string[] = [];
  const sortedByGap = [...dimensionComparison]
    .filter((d) => d.gap !== null)
    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));

  if (sortedByGap[0] && sortedByGap[0].othersMeanScore !== null) {
    const top = sortedByGap[0];
    insights.push(
      `Largest perception contrast: on ${top.label}, you rated yourself ${top.selfScore}/100 while anonymous observers averaged ${top.othersMeanScore}/100.`,
    );
  }
  const closest = sortedByGap[sortedByGap.length - 1];
  if (closest && closest.othersMeanScore !== null) {
    insights.push(
      `Closest self-other alignment: ${closest.label} (self ${closest.selfScore}/100 vs. observers ${closest.othersMeanScore}/100).`,
    );
  }

  return {
    available: true,
    respondentCount,
    minRespondents,
    relationshipBreakdown,
    dimensionComparison,
    insights,
  };
}
