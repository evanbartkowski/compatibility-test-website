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
    standardQuestionCount: a.questions.length,
    slug: a.slug,
    title: a.title,
    shortTitle: a.shortTitle,
    category: a.category,
    status: a.status,
    audienceNote: a.audienceNote,
    adultsOnly: a.adultsOnly,
    supportsQuickMode: false,
    estimatedMinutesQuick: a.estimatedMinutesComplete,
    estimatedMinutesComplete: a.estimatedMinutesComplete,
    supportsPartnerMatching: a.supportsPartnerMatching,
    discoverPoints: a.discoverPoints,
    sections: a.sections.map((s) => ({ ...s, description: "", subtitle: "" })),
  };
}

export const standardsCard: AssessmentSummary = {
  slug: "population-standards",
  title: "The Delusion Test",
  shortTitle: "The Delusion Test",
  category: "romance",
  status: "published",
  audienceNote: "Set age, height, money, body, and the rest. See what share of adult men or women actually match.",
  adultsOnly: true,
  supportsQuickMode: false,
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 3,
  supportsPartnerMatching: false,
  discoverPoints: ["Age", "Height", "Income"],
  sections: [],
  marketingBlurb: "A population filter, not a personality score.",
};
