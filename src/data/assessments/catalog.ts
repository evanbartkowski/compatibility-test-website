import {
  refineAssessment,
  emotionalAvailabilityAssessment,
} from "./refinements";
import type {
  AssessmentCategorySlug,
  AssessmentDefinition,
} from "@/lib/assessment/types";
import { categoryAIntimacyAssessments } from "./category-a-intimacy";
import { categoryBRomanceAssessments } from "./category-b-romance";
import { categoryCPersonalityAssessments } from "./category-c-personality";
import { categoryDCouplesAssessments } from "./category-d-couples";
import { intimacyPartnerPreferencesAssessment } from "./intimacy-partner-preferences";
import { curatedAssessments, versionThreeAssessments } from "./curated";
import { intimacyAssessments } from "./intimacy";
import { withAdviceProfile } from "./advice-profiles";
import { publishLegacyCandid } from "./candid/legacy-publish";
import { focusedAssessments, focusedCoreAssessments, focusedRedirects } from "./focused";
export { focusedRedirects };

export interface AssessmentCategoryMeta {
  slug: AssessmentCategorySlug;
  title: string;
  description: string;
  subtopics: string[];
  accentVar: string;
  accentLabel: string;
  adultsOnlyDefault: boolean;
}

export const assessmentCategories: AssessmentCategoryMeta[] = [
  {
    slug: "sexuality-intimacy",
    title: "Sexuality & Intimacy",
    description:
      "Desire, sensory pacing, BDSM dynamics, kinks, communication, and mutual pleasure.",
    subtopics: [
      "Desire, sensory pacing and aftercare",
      "Initiative, chosen roles and negotiation",
      "Fantasy, sensory curiosity and comfort",
      "Dominance, submission, and initiative styles",
      "Sexual chemistry, arousal, and initiation",
      "Sensuality, touch, aftercare, and private fantasies",
    ],
    accentVar: "var(--accent-burgundy, #B31D4E)",
    accentLabel: "Noir Rose · 18+",
    adultsOnlyDefault: true,
  },
  {
    slug: "romance",
    title: "Romance & Attraction",
    description:
      "Affection styles, attachment patterns, flirting cues, green and red flags, and dealbreakers.",
    subtopics: [
      "Everyday affection and practical care",
      "Attachment rhythms (reassurance and autonomy)",
      "Emotional awareness and capacity",
      "Dating discernment, green and red flags",
      "Reassurance, trust and independence",
      "Romantic dates and shared dreaming",
    ],
    accentVar: "var(--accent-plum)",
    accentLabel: "Dusty Rose & Plum",
    adultsOnlyDefault: false,
  },
  {
    slug: "personality",
    title: "Personality & Temperament",
    description:
      "Everyday patterns in curiosity, structure, social energy, cooperation and stress.",
    subtopics: [
      "Big Five (OCEAN) balanced trait profile",
      "How others see you vs. self view",
      "Emotional intelligence and repair habits",
      "Conflict tempo and cooling preferences",
      "Hidden relationship value tradeoffs",
    ],
    accentVar: "var(--accent-slate, #5c5470)",
    accentLabel: "Muted Slate Plum",
    adultsOnlyDefault: false,
  },
  {
    slug: "compatibility",
    title: "Couples & Compatibility",
    description:
      "Communication, repair, relationship priorities and long-term agreements.",
    subtopics: [
      "Listening, clarity and difficult conversations",
      "Long term money, home, and future alignment",
      "Couples communication and apology matching",
      "Shared growth and exploration",
      "Fairness, privacy and future expectations",
      "Need vs. offer emotional support match",
    ],
    accentVar: "var(--accent-sage)",
    accentLabel: "Warm Sage & Ochre",
    adultsOnlyDefault: false,
  },
];

export const legacyAssessments: AssessmentDefinition[] = [
  // Category A — Sexuality & Intimacy (11 tests: #1 flagship + #2-#9 + #29 BDSM + #30 Kink)
  intimacyPartnerPreferencesAssessment,
  ...categoryAIntimacyAssessments,
  // Category B — Romance & Attraction (#10-#17)
  ...categoryBRomanceAssessments,
  // Category C — Personality & Self-Knowledge (#18-#22)
  ...categoryCPersonalityAssessments,
  // Category D — Couples & Compatibility (#23-#28)
  ...categoryDCouplesAssessments,
];

export const versionTwoAssessments: AssessmentDefinition[] = [
  ...legacyAssessments.map(refineAssessment),
  emotionalAvailabilityAssessment,
];

export const archivedAssessments: AssessmentDefinition[] = [
  ...legacyAssessments,
  ...versionTwoAssessments,
  ...versionThreeAssessments,
  ...curatedAssessments,
  ...intimacyAssessments,
  ...curatedAssessments.map(publishLegacyCandid),
  ...intimacyAssessments.map(publishLegacyCandid),
];
export const coreAssessments = focusedCoreAssessments;
export const builtInAssessments = focusedAssessments.map(withAdviceProfile);

export function getArchivedAssessmentBySlug(slug: string, version = "2.0.0") {
  return archivedAssessments.find(
    (a) => a.slug === slug && a.version === version,
  );
}

export function getAssessmentBySlug(
  slug: string,
): AssessmentDefinition | undefined {
  return builtInAssessments.find((a) => a.slug === slug);
}

export function getCategoryMeta(
  slug: AssessmentCategorySlug,
): AssessmentCategoryMeta | undefined {
  return assessmentCategories.find((c) => c.slug === slug);
}
