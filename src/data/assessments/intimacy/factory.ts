import type {
  AssessmentDefinition,
  DimensionDefinition,
  QuestionDefinition,
} from "@/lib/assessment/types";
import { adviceProfiles } from "../advice-profiles";

export type PreferencePair = readonly [receive: string, offer: string];
export interface IntimacyScale {
  key: string;
  label: string;
  description: string;
  low: string;
  high: string;
  axis: NonNullable<DimensionDefinition["blueprintAxis"]>;
  pairs: readonly PreferencePair[];
}
export interface IntimacySpec {
  slug: string;
  title: string;
  hook: string;
  love: string;
  contentNote?: string;
  matchingNote: string;
  visuals?: string[];
  next: string[];
  scales: readonly IntimacyScale[];
}

export function preferenceScale(
  key: string,
  label: string,
  axis: IntimacyScale["axis"],
  low: string,
  high: string,
  pairs: readonly PreferencePair[],
): IntimacyScale {
  return {
    key,
    label,
    axis,
    low,
    high,
    pairs,
    description: `Your preferences around ${label.toLowerCase()} in freely chosen adult situations.`,
  };
}

/** Each topic is authored for this category; templates keep receiving and offering distinct. */
export function roleScale(
  key: string,
  label: string,
  axis: IntimacyScale["axis"],
  low: string,
  high: string,
  receive: string,
  offer: string,
  topics: readonly string[],
): IntimacyScale {
  return preferenceScale(
    key,
    label,
    axis,
    low,
    high,
    topics.map(
      (topic) =>
        [
          receive.replace("{topic}", topic),
          offer.replace("{topic}", topic),
        ] as const,
    ),
  );
}

export function defineIntimacyAssessment(
  spec: IntimacySpec,
): AssessmentDefinition {
  let order = 0;
  const questions: QuestionDefinition[] = spec.scales.flatMap((scale) =>
    scale.pairs.flatMap((pair, index) => {
      const baseId = `${scale.key}-${index + 1}`;
      return (["receive", "offer"] as const).map((role, side) => ({
        id: `${baseId}-${role}`,
        order: ++order,
        sectionId: scale.key,
        sectionTitle: scale.label,
        inputType: "intimacy_profile",
        prompt: pair[side],
        partnerPrompt: pair[side],
        helperText:
          "Answer for yourself in freely chosen adult situations. Interest is not agreement to act. You can rate desire without experience, mark a hard limit, or skip. Individual items are revealed only as an eligible mutual match.",
        quickDiscovery: index === 0,
        directionality: role === "receive" ? "receive_give" : "give_receive",
        complementaryPartnerId: `${baseId}-${role === "receive" ? "offer" : "receive"}`,
        intimacyRole: role,
        topicTags: [spec.slug, scale.key, role],
        defaultRevealRule: "mutual_only",
        supportsExperienceFrequency: true,
        supportsImportance: false,
        supportsDesireDelta: false,
        supportsBoundaryFlag: true,
        partnerSupportsWillingness: true,
        supportsRevealRule: true,
        safetySensitive: true,
        eligibleForMatching: true,
        dimensionWeights: { [scale.key]: 1 },
        editorialStatus: "verified",
        editorialNote:
          "Original non-graphic adult preference item; receiving and offering are separate channels.",
        scaleConfig: {
          min: 1,
          max: 5,
          minLabel: "Not appealing",
          maxLabel: "Very appealing",
          midLabel: "Mixed / unsure",
        },
      }));
    }),
  );
  return {
    id: `${spec.slug}-v1`,
    slug: spec.slug,
    version: "1.0.0",
    title: spec.title,
    shortTitle: spec.title,
    collection: "intimacy-suite",
    adviceProfile: adviceProfiles[spec.slug],
    marketingBlurb: spec.love,
    matchingNotes: [
      spec.matchingNote,
      "A receiving preference is compared with the other person's corresponding offer. Desire, willingness and experience are independent. Hard limits veto suggestions. Only mutually eligible items can appear; unmatched answers never influence shared scores.",
    ],
    contentNote: spec.contentNote,
    category: "sexuality-intimacy",
    status: "published",
    adultsOnly: true,
    audienceNote: spec.hook,
    purpose: spec.hook,
    futureExtensibilityNote:
      "A topic-based question bank with separate receive/offer items. Add authored pairs when they measure a distinct situation; there is no engine question-count cap.",
    scientificDisclaimer:
      "An original adult self-reflection, not a diagnosis, safety assessment or prediction of relationship success. Preferences and scores never supply consent.",
    estimatedMinutesQuick: Math.ceil((spec.scales.length * 2 * 25) / 60),
    estimatedMinutesComplete: Math.ceil((questions.length * 25) / 60),
    supportsQuickMode: true,
    supportsPartnerMatching: true,
    supportsCommunityComparison: false,
    scoringStrategy: "intimacy_profile",
    compatibilityStrategy: "consent_complementary",
    visualizationTypes: spec.visuals || [
      "radar",
      "desire-experience-scatter",
      "independent-channels",
      "give-receive",
    ],
    supportedExports: ["pdf", "json", "csv", "share_card"],
    quickDescription: `${spec.scales.length * 2} questions sample receiving and offering across every category.`,
    deepDescription: `${questions.length} original questions map preferences, freely chosen willingness, experience and limits separately.`,
    discoverPoints: spec.scales.map((s) => s.label),
    scoringNotes: [
      "Desire uses five explicit positions, normalized to 0–100. Missing values stay unmeasured.",
      "Willingness and experience are shown independently and never imputed as desire. A hard limit does not rewrite a private desire rating.",
      "Category scores are exploratory averages, not grades. Experience gaps are conversation prompts, never instructions to cross a limit.",
      "Partner matching reveals mutually eligible counterpart topics only. Hidden choices do not affect shared scores, counts, category overlays or mismatch lists.",
    ],
    dimensions: spec.scales.map((scale) => ({
      key: scale.key,
      label: scale.label,
      description: scale.description,
      blueprintAxis: scale.axis,
      lowLabel: "Less appealing",
      highLabel: "More appealing",
      interpretations: {
        low: {
          meaning: scale.low,
          possibleTradeoff:
            "A lower interest score does not mean a topic is a hard limit; use your explicit limit choices.",
          experiment:
            "Notice which conditions distinguish your lower and higher answers in this category.",
          reflection:
            "Which answer is a preference, and which expresses a condition you need?",
        },
        balanced: {
          meaning: `Your answers vary across ${scale.label.toLowerCase()}. ${scale.description}`,
          possibleTradeoff:
            "A category average can hide differences between receiving, offering and particular situations.",
          experiment:
            "Compare one higher and one lower answer before choosing anything to discuss.",
          reflection: "What changes when the role, person or setting changes?",
        },
        high: {
          meaning: scale.high,
          possibleTradeoff:
            "Strong interest is separate from current willingness, another person's interest and an agreement to act.",
          experiment:
            "Choose a mutually welcome topic to discuss, with room for either person to decline.",
          reflection:
            "What would need to be true for this preference to feel freely chosen?",
        },
      },
    })),
    sections: spec.scales.map((s) => ({
      id: s.key,
      title: s.label,
      subtitle: "Your preferences, at your pace",
      description: s.description,
    })),
    questions,
    recommendedNextSlugs: spec.next,
  };
}
