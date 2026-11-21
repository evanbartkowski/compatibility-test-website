import { z } from "zod";

export const questionAnswerSchema = z.object({
  questionId: z.string().min(1).max(120),
  enjoyment: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal("haven_t_experienced"),
      z.literal("curious"),
      z.literal("depends"),
      z.literal("prefer_not_to_answer"),
    ])
    .optional(),
  experienceFrequency: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal("prefer_not_to_answer"),
    ])
    .optional(),
  desireDelta: z.enum(["want_more", "about_right", "want_less"]).optional(),
  importance: z
    .enum(["essential", "important", "nice_to_have", "not_important"])
    .optional(),
  firmBoundary: z.boolean().optional(),
  partnerWillingness: z
    .enum([
      "enthusiastically_enjoy",
      "willing_if_partner_enjoys",
      "curious_to_explore",
      "depends_on_context",
      "prefer_not_to",
      "firm_boundary",
    ])
    .optional(),
  curiosityLevel: z
    .enum([
      "very_interested",
      "interested",
      "curious_uncertain",
      "not_interested",
      "firm_boundary",
      "havent_considered",
    ])
    .optional(),
  revealRule: z
    .enum(["mutual_only", "always_share_with_partner", "private_never_share"])
    .optional(),
  customValue: z
    .union([
      z.string().max(120),
      z.number().finite(),
      z.array(z.string().max(120)).max(20),
    ])
    .optional(),
  skipped: z.boolean().optional(),
  updatedAt: z.string().max(80),
});

export const answersMapSchema = z.record(z.string(), questionAnswerSchema);

export const consentSettingsSchema = z.object({
  confirmedAdult18Plus: z.literal(true),
  acceptedPrivacyTerms: z.literal(true),
  optInCommunityStats: z.boolean(),
  cohortMetadata: z
    .object({
      ageGroup: z
        .enum(["18-24", "25-34", "35-44", "45+", "prefer_not"])
        .optional(),
      relationshipStatus: z
        .enum([
          "single",
          "dating",
          "partnered",
          "married",
          "other",
          "prefer_not",
        ])
        .optional(),
      datingPreference: z
        .enum(["men", "women", "all_genders", "prefer_not"])
        .optional(),
      genderIdentity: z
        .enum(["woman", "man", "nonbinary", "prefer_not"])
        .optional(),
    })
    .optional(),
  consentedAt: z.string(),
});

export const sharingPreferencesSchema = z.object({
  shareGameAnswerDetails: z.boolean().optional().default(false),
  shareCategoryScores: z.boolean(),
  shareAlignedHighlights: z.boolean(),
  shareComplementaryHighlights: z.boolean(),
  shareSharedCuriosities: z.boolean(),
  shareHighLevelBoundariesWithoutDetails: z.boolean(),
  neverExposeRawPrivateAnswers: z.literal(true),
});
