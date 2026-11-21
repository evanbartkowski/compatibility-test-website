import { z } from "zod";
import type {
  AssessmentDefinition,
  AssessmentMode,
  BranchCondition,
  QuestionAnswer,
  QuestionDefinition,
  ScoredAssessmentResult,
} from "./types";

const weights = z.record(
  z.string().min(1).max(80),
  z.number().finite().min(-10).max(10),
);
const text = z.string().trim().min(1).max(1600);
const categoryReading = z.object({
  meaning: text,
  possibleTradeoff: text,
  experiment: text,
  reflection: text,
});
const exercise = z.tuple([text, text]);
const adviceProfile = z.object({
  wording: text.optional(),
  theme: text,
  seek: text,
  friction: text,
  optimize: text,
  solo: exercise,
  together: exercise,
  curiosity: exercise,
  ask: text,
  dimensionCoaching: z
    .record(
      z.string().min(1).max(80),
      z.object({
        wording: text.optional(),
        seek: text,
        friction: text,
        optimize: text,
        solo: exercise.optional(),
        together: exercise.optional(),
        curiosity: exercise.optional(),
      }),
    )
    .optional(),
});
const option = z
  .object({
    value: z.string().min(1).max(120),
    label: text,
    description: z.string().max(1000).optional(),
    dimensionWeights: weights.optional(),
  })
  .passthrough();
export const assessmentDefinitionSchema = z
  .object({
    id: z.string().min(1).max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100)
      .refine((s) => !["constructor", "prototype", "__proto__"].includes(s)),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    title: z.string().min(3).max(160),
    shortTitle: z.string().min(2).max(80),
    category: z.enum([
      "romance",
      "personality",
      "sexuality-intimacy",
      "compatibility",
    ]),
    status: z.enum(["draft", "published", "coming_soon"]),
    adviceProfile: adviceProfile.optional(),
    styleRankingEnabled: z.boolean().optional(),
    audienceNote: text,
    futureExtensibilityNote: z.string().max(2000).default(""),
    estimatedMinutesQuick: z.number().min(1).max(60),
    estimatedMinutesComplete: z.number().finite().min(1),
    supportsPartnerMatching: z.boolean(),
    supportsCommunityComparison: z.boolean(),
    scoringStrategy: z
      .enum([
        "intimacy_profile",
        "intimacy_weighted",
        "dimension_average",
        "attachment_quadrant",
        "give_receive_dual",
        "curiosity_map",
        "forced_choice_priorities",
        "fantasy_mutual",
        "bucket_list",
        "prediction_accuracy",
        "would_rather",
        "multi_rater_perception",
      ])
      .optional(),
    compatibilityStrategy: z
      .enum([
        "consent_complementary",
        "intimacy_complementary",
        "affection_give_receive",
        "trait_similarity_complement",
        "values_alignment",
        "fantasy_mutual_reveal",
        "bucket_list_matcher",
        "prediction_game",
        "voting_game",
        "none",
      ])
      .optional(),
    adultsOnly: z.boolean().optional(),
    supportsQuickMode: z.boolean().optional(),
    collection: z.literal("intimacy-suite").optional(),
    marketingBlurb: text.optional(),
    matchingNotes: z.array(text).optional(),
    contentNote: text.optional(),
    dimensions: z
      .array(
        z
          .object({
            key: z.string().min(1).max(80),
            label: z.string().min(1).max(120),
            description: text,
            blueprintAxis: z
              .enum([
                "connection",
                "pacing",
                "sensory",
                "imagination",
                "roles",
                "autonomy",
              ])
              .optional(),
            interpretations: z
              .object({
                low: categoryReading,
                balanced: categoryReading,
                high: categoryReading,
              })
              .optional(),
          })
          .passthrough(),
      )
      .max(20)
      .optional(),
    sections: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          title: text,
          subtitle: z.string().max(1000),
          description: z.string().max(2000),
        }),
      )
      .min(1)
      .max(30),
    questions: z
      .array(
        z
          .object({
            id: z.string().min(1).max(120),
            order: z.number().int().min(1),
            sectionId: z.string(),
            sectionTitle: text,
            inputType: z.enum([
              "intimacy_profile",
              "enjoyment_scale",
              "curiosity_map",
              "multiple_choice",
              "rating_scale",
              "slider",
              "forced_choice",
              "ranking",
              "multi_select",
              "situational",
              "partner_prediction",
              "would_rather_vote",
            ]),
            prompt: text,
            partnerPrompt: text,
            helperText: z.string().max(2000),
            quickDiscovery: z.boolean(),
            defaultRevealRule: z.literal("mutual_only").optional(),
            intimacyRole: z.enum(["receive", "offer", "shared"]).optional(),
            topicTags: z.array(z.string().min(1).max(100)).optional(),
            dimensionWeights: weights,
            directionality: z.enum([
              "reciprocal",
              "receive_give",
              "give_receive",
              "shared_value",
              "boundary_sensitivity",
            ]),
            supportsExperienceFrequency: z.boolean(),
            supportsImportance: z.boolean().optional(),
            supportsBoundaryFlag: z.boolean(),
            partnerSupportsWillingness: z.boolean(),
            eligibleForMatching: z.boolean(),
            editorialStatus: z.enum(["verified", "needs_reference_review"]),
            options: z.array(option).min(2).max(20).optional(),
            scaleConfig: z
              .object({
                min: z.number().int(),
                max: z.number().int(),
                minLabel: text,
                maxLabel: text,
              })
              .passthrough()
              .optional(),
            sliderConfig: z
              .object({
                min: z.number().finite(),
                max: z.number().finite(),
                step: z.number().positive(),
                minLabel: text,
                maxLabel: text,
              })
              .passthrough()
              .optional(),
            branchingCondition: z
              .object({
                dependsOnQuestionId: z.string(),
                operator: z.enum(["equals", "not_equals", "gte", "in"]),
                value: z.union([
                  z.string(),
                  z.number(),
                  z.array(z.union([z.string(), z.number()])),
                ]),
              })
              .optional(),
          })
          .passthrough(),
      )
      .min(1),
    archetypes: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: text,
            tagline: text,
            summary: text,
            weights,
            conditions: z
              .array(
                z.object({
                  dimension: z.string(),
                  min: z.number().min(0).max(100).optional(),
                  max: z.number().min(0).max(100).optional(),
                }),
              )
              .optional(),
          })
          .passthrough(),
      )
      .max(20)
      .optional(),
  })
  .passthrough();

export function inspectAssessmentDefinition(assessment: AssessmentDefinition): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [],
    warnings: string[] = [];
  const parsed = assessmentDefinitionSchema.safeParse(assessment);
  if (!parsed.success)
    return {
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      ),
      warnings,
    };
  const ids = new Set<string>(),
    prompts = new Set<string>();
  const dimensions = new Set(
    assessment.dimensions?.map((d) => d.key) ||
      assessment.questions.flatMap((q) => Object.keys(q.dimensionWeights)),
  );
  const sections = new Set(assessment.sections.map((s) => s.id));
  for (const [index, q] of assessment.questions.entries()) {
    if (ids.has(q.id)) errors.push(`Duplicate question ID ${q.id}.`);
    ids.add(q.id);
    const normalized = q.prompt
      .trim()
      .toLowerCase()
      .replace(/[.!?]+$/g, "");
    if (prompts.has(normalized)) errors.push(`Repeated question: ${q.prompt}`);
    prompts.add(normalized);
    if (!sections.has(q.sectionId))
      errors.push(`${q.id}: unknown section ${q.sectionId}.`);
    for (const key of [
      ...Object.keys(q.dimensionWeights),
      ...(q.options || []).flatMap((o) =>
        Object.keys(o.dimensionWeights || {}),
      ),
    ])
      if (!dimensions.has(key))
        errors.push(`${q.id}: unknown scoring dimension ${key}.`);
    if (
      !Object.values(q.dimensionWeights).some((w) => w !== 0) &&
      !(q.options || []).some((o) =>
        Object.values(o.dimensionWeights || {}).some((w) => w !== 0),
      )
    )
      errors.push(`${q.id}: no scoring contribution.`);
    if (
      [
        "multiple_choice",
        "forced_choice",
        "ranking",
        "multi_select",
        "situational",
        "partner_prediction",
        "would_rather_vote",
      ].includes(q.inputType) &&
      !q.options?.length
    )
      errors.push(`${q.id}: answer choices are required.`);
    if (
      q.options &&
      new Set(q.options.map((o) => o.value)).size !== q.options.length
    )
      errors.push(`${q.id}: choice values must be unique.`);
    if (
      q.inputType === "rating_scale" &&
      (!q.scaleConfig ||
        q.scaleConfig.max <= q.scaleConfig.min ||
        q.scaleConfig.max - q.scaleConfig.min > 10)
    )
      errors.push(`${q.id}: invalid rating scale.`);
    if (
      q.inputType === "slider" &&
      (!q.sliderConfig || q.sliderConfig.max <= q.sliderConfig.min)
    )
      errors.push(`${q.id}: invalid slider range.`);
    if (q.branchingCondition) {
      const parent = assessment.questions.findIndex(
        (p) => p.id === q.branchingCondition!.dependsOnQuestionId,
      );
      if (parent < 0 || parent >= index)
        errors.push(`${q.id}: branching must refer to an earlier question.`);
      else if (q.quickDiscovery && !assessment.questions[parent].quickDiscovery)
        warnings.push(`${q.id}: its parent is outside quick mode.`);
    }
  }
  if (
    assessment.dimensions &&
    new Set(assessment.dimensions.map((d) => d.key)).size !==
      assessment.dimensions.length
  )
    errors.push("Dimension keys must be unique.");
  if (assessment.supportsQuickMode !== false) {
    if (!assessment.questions.some((q) => q.quickDiscovery))
      errors.push("Quick mode needs at least one selected question.");
    for (const key of dimensions)
      if (
        !assessment.questions.some(
          (q) =>
            q.quickDiscovery &&
            (q.dimensionWeights[key] ||
              (q.options || []).some((o) => o.dimensionWeights?.[key])),
        )
      )
        warnings.push(`Quick mode does not measure ${key}.`);
  }
  for (const archetype of assessment.archetypes || []) {
    for (const key of Object.keys(archetype.weights))
      if (!dimensions.has(key))
        errors.push(`${archetype.name}: unknown dimension ${key}.`);
    for (const c of archetype.conditions || [])
      if (
        !dimensions.has(c.dimension) ||
        (c.min !== undefined && c.max !== undefined && c.min > c.max)
      )
        errors.push(`${archetype.name}: invalid archetype threshold.`);
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

export function parseAssessmentDefinition(
  input: unknown,
): AssessmentDefinition {
  const parsed = assessmentDefinitionSchema.parse(
    input,
  ) as AssessmentDefinition;
  const { errors } = inspectAssessmentDefinition(parsed);
  if (errors.length) throw new Error(errors.join(" "));
  return parsed;
}

/** Reject tampered choice IDs, impossible scales and payloads unrelated to this version. */
export function validateAssessmentAnswers(
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
): void {
  const questions = new Map(assessment.questions.map((q) => [q.id, q]));
  if (Object.keys(answers).length > assessment.questions.length)
    throw new Error("Too many answers for this assessment.");
  for (const [id, answer] of Object.entries(answers)) {
    const q = questions.get(id);
    if (!q || answer.questionId !== id)
      throw new Error("Answer does not belong to this assessment version.");
    if (q.inputType === "intimacy_profile") {
      if (answer.revealRule === "always_share_with_partner")
        throw new Error(
          "This collection supports mutual matches or fully private answers only.",
        );
      if (
        answer.enjoyment !== undefined &&
        (typeof answer.enjoyment !== "number" ||
          !Number.isInteger(answer.enjoyment) ||
          answer.enjoyment < 1 ||
          answer.enjoyment > 5)
      )
        throw new Error("Desire must be an explicit five-point response.");
    }
    if (answer.skipped || answer.customValue === undefined) continue;
    const value = answer.customValue;
    if (q.inputType === "rating_scale" || q.inputType === "slider") {
      const scale =
        q.inputType === "rating_scale" ? q.scaleConfig : q.sliderConfig;
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        !scale ||
        value < scale.min ||
        value > scale.max ||
        (q.inputType === "rating_scale" && !Number.isInteger(value))
      )
        throw new Error(`Invalid scale response for ${id}.`);
    } else if (q.options?.length) {
      const values = Array.isArray(value) ? value : [value];
      if (
        new Set(values).size !== values.length ||
        values.some((v) => !q.options!.some((o) => o.value === v))
      )
        throw new Error(`Unknown or repeated choice for ${id}.`);
      if (
        ["ranking", "multi_select"].includes(q.inputType) !==
        Array.isArray(value)
      )
        throw new Error(`Invalid choice format for ${id}.`);
    } else throw new Error(`Unexpected response type for ${id}.`);
  }
}

export function matchesBranch(
  condition: BranchCondition | undefined,
  answers: Record<string, QuestionAnswer>,
): boolean {
  if (!condition) return true;
  const answer = answers[condition.dependsOnQuestionId];
  if (
    !answer ||
    answer.skipped ||
    answer.firmBoundary ||
    answer.enjoyment === "prefer_not_to_answer" ||
    answer.enjoyment === "haven_t_experienced" ||
    answer.curiosityLevel === "firm_boundary" ||
    answer.curiosityLevel === "havent_considered"
  )
    return false;
  const value = answer.customValue ?? answer.curiosityLevel ?? answer.enjoyment;
  if (value === undefined) return false;
  if (condition.operator === "equals") return value === condition.value;
  if (condition.operator === "not_equals") return value !== condition.value;
  if (condition.operator === "gte")
    return (
      typeof value === "number" &&
      typeof condition.value === "number" &&
      value >= condition.value
    );
  return (
    Array.isArray(condition.value) &&
    condition.value.includes(value as string | number)
  );
}

export function selectAssessmentQuestions(
  assessment: AssessmentDefinition,
  mode: AssessmentMode,
  answers: Record<string, QuestionAnswer>,
): QuestionDefinition[] {
  const base =
    mode === "quick" && assessment.supportsQuickMode !== false
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions;
  const active: QuestionDefinition[] = [];
  for (const q of base)
    if (
      (!q.branchingCondition ||
        active.some(
          (p) => p.id === q.branchingCondition!.dependsOnQuestionId,
        )) &&
      matchesBranch(q.branchingCondition, answers)
    )
      active.push(q);
  return active;
}

export function measurementSignature(assessment: AssessmentDefinition): string {
  return JSON.stringify({
    questions: assessment.questions,
    dimensions: assessment.dimensions,
    scoringStrategy: assessment.scoringStrategy,
    compatibilityStrategy: assessment.compatibilityStrategy,
    archetypes: assessment.archetypes,
    supportsQuickMode: assessment.supportsQuickMode,
  });
}
export function areHistoryResultsComparable(
  a: ScoredAssessmentResult,
  b: ScoredAssessmentResult,
): boolean {
  return (
    a.assessmentSlug === b.assessmentSlug &&
    a.assessmentVersion === b.assessmentVersion &&
    a.scoringEngineVersion === b.scoringEngineVersion &&
    a.perspective === b.perspective &&
    a.mode === b.mode
  );
}
