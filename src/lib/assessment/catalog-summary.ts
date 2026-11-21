import type { AssessmentDefinition } from "./types";
export type AssessmentSummary = Pick<
  AssessmentDefinition,
  | "slug"
  | "title"
  | "shortTitle"
  | "category"
  | "status"
  | "audienceNote"
  | "adultsOnly"
  | "supportsQuickMode"
  | "estimatedMinutesQuick"
  | "estimatedMinutesComplete"
  | "supportsPartnerMatching"
  | "discoverPoints"
  | "sections"
  | "collection"
  | "marketingBlurb"
> & { questionCount?: number; standardQuestionCount?: number };
export function summarizeAssessment(
  a: AssessmentDefinition,
): AssessmentSummary {
  return {
    questionCount: a.questions.length,
    collection: a.collection,
    marketingBlurb: a.marketingBlurb,
    standardQuestionCount:
      a.supportsQuickMode === false
        ? a.questions.length
        : a.questions.filter((q) => q.quickDiscovery).length,
    slug: a.slug,
    title: a.title,
    shortTitle: a.shortTitle,
    category: a.category,
    status: a.status,
    audienceNote: a.audienceNote,
    adultsOnly: a.adultsOnly,
    supportsQuickMode: a.supportsQuickMode,
    estimatedMinutesQuick: a.estimatedMinutesQuick,
    estimatedMinutesComplete: a.estimatedMinutesComplete,
    supportsPartnerMatching: a.supportsPartnerMatching,
    discoverPoints: a.discoverPoints,
    sections: a.sections.map((s) => ({ ...s, description: "", subtitle: "" })),
  };
}
