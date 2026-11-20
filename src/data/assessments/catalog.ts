import type { AssessmentCategorySlug, AssessmentDefinition } from "@/lib/assessment/types";
import { categoryAIntimacyAssessments } from "./category-a-intimacy";
import { categoryBRomanceAssessments } from "./category-b-romance";
import { categoryCPersonalityAssessments } from "./category-c-personality";
import { categoryDCouplesAssessments } from "./category-d-couples";
import { intimacyPartnerPreferencesAssessment } from "./intimacy-partner-preferences";

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
      "Intimacy and partner preferences (56 questions)",
      "BDSM roles, power exchange, and dynamics",
      "Kink and fetish mutual exploration map",
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
      "Ideal partner priorities and ranking",
      "Attachment rhythms (reassurance and autonomy)",
      "Give vs. receive affection styles",
      "Dating discernment, green and red flags",
      "Lover archetypes and flirting signals",
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
      "Big Five traits, emotional awareness, conflict habits, value tradeoffs, and peer perspective.",
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
      "Couples trivia, long term life alignment, conflict matching, shared bucket lists, and care style.",
    subtopics: [
      "Partner trivia prediction game",
      "Long term money, home, and future alignment",
      "Couples communication and apology matching",
      "Shared interactive couples bucket list",
      "Playful couple habits voting",
      "Need vs. offer emotional support match",
    ],
    accentVar: "var(--accent-sage)",
    accentLabel: "Warm Sage & Ochre",
    adultsOnlyDefault: false,
  },
];

export const builtInAssessments: AssessmentDefinition[] = [
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

export function getAssessmentBySlug(slug: string): AssessmentDefinition | undefined {
  return builtInAssessments.find((a) => a.slug === slug);
}

export function getCategoryMeta(slug: AssessmentCategorySlug): AssessmentCategoryMeta | undefined {
  return assessmentCategories.find((c) => c.slug === slug);
}
