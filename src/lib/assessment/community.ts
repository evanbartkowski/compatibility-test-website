import { brandConfig } from "@/config/brand";
import { isNumericEnjoyment, scoreAssessmentSubmission } from "./scoring";
import type {
  AssessmentDefinition,
  AssessmentMode,
  CommunityComparisonItem,
  CommunityQuestionAggregate,
  ConsentSettings,
  QuestionAnswer,
} from "./types";

export interface OptedInSubmissionRecord {
  submissionId: string;
  mode?: AssessmentMode;
  participantId?: string;
  assessmentVersion?: string;
  scoringEngineVersion?: string;
  createdAt?: string;
  assessmentSlug: string;
  consent: ConsentSettings;
  answers: Record<string, QuestionAnswer>;
}

export interface CommunityDimensionComparison {
  dimension: string;
  label: string;
  userScore: number | null;
  communityMean: number | null;
  percentile: number | null;
  higherThanPercent: number | null;
  histogram: Array<{
    min: number;
    max: number;
    count: number;
    percent: number;
  }> | null;
  respondentCount: number;
  available: boolean;
  isSyntheticDemo: boolean;
}
export interface CommunityArchetypeAggregate {
  name: string;
  count: number;
  percent: number;
}

function eligibleParticipants(
  assessment: AssessmentDefinition,
  submissions: OptedInSubmissionRecord[],
  filter?: CohortFilter,
  mode?: AssessmentMode,
) {
  const latest = new Map<string, OptedInSubmissionRecord>();
  for (const sub of submissions) {
    if (
      (mode && sub.mode && sub.mode !== mode) ||
      sub.assessmentSlug !== assessment.slug ||
      (sub.assessmentVersion && sub.assessmentVersion !== assessment.version) ||
      (sub.scoringEngineVersion &&
        sub.scoringEngineVersion !== brandConfig.scoringEngineVersion)
    )
      continue;
    const key = sub.participantId || sub.submissionId;
    const previous = latest.get(key);
    if (
      !previous ||
      !previous.createdAt ||
      !sub.createdAt ||
      sub.createdAt >= previous.createdAt
    )
      latest.set(key, sub);
  }
  return [...latest.values()].filter(
    (s) =>
      s.consent.optInCommunityStats && passesCohortFilter(s.consent, filter),
  );
}

export interface CohortFilter {
  ageGroup?: NonNullable<ConsentSettings["cohortMetadata"]>["ageGroup"] | "all";
  relationshipStatus?:
    | NonNullable<ConsentSettings["cohortMetadata"]>["relationshipStatus"]
    | "all";
  datingPreference?:
    NonNullable<ConsentSettings["cohortMetadata"]>["datingPreference"] | "all";
}

function passesCohortFilter(
  consent: ConsentSettings,
  filter?: CohortFilter,
): boolean {
  if (!filter) return true;
  const meta = consent.cohortMetadata;
  if (
    filter.ageGroup &&
    filter.ageGroup !== "all" &&
    meta?.ageGroup !== filter.ageGroup
  ) {
    return false;
  }
  if (
    filter.relationshipStatus &&
    filter.relationshipStatus !== "all" &&
    meta?.relationshipStatus !== filter.relationshipStatus
  ) {
    return false;
  }
  if (
    filter.datingPreference &&
    filter.datingPreference !== "all" &&
    meta?.datingPreference !== filter.datingPreference
  ) {
    return false;
  }
  return true;
}

export function computeCommunityAggregates(params: {
  assessment: AssessmentDefinition;
  submissions: OptedInSubmissionRecord[];
  cohortFilter?: CohortFilter;
  minimumThreshold?: number;
  mode?: AssessmentMode;
  isSyntheticDemo?: boolean;
}): {
  aggregates: Record<string, CommunityQuestionAggregate>;
  rawRatingsByQuestion: Record<string, number[]>;
  eligibleCohortParticipants: number;
  suppressedByPrivacyThreshold: boolean;
} {
  const {
    assessment,
    submissions,
    cohortFilter,
    minimumThreshold = brandConfig.communityMinimumThreshold,
    isSyntheticDemo = false,
  } = params;

  // Strictly exclude non-consenting submissions!
  const consenting = eligibleParticipants(
    assessment,
    submissions,
    cohortFilter,
    params.mode,
  );

  const suppressedByPrivacyThreshold = consenting.length < minimumThreshold;
  const aggregates: Record<string, CommunityQuestionAggregate> = {};
  const rawRatingsByQuestion: Record<string, number[]> = {};

  for (const q of assessment.questions) {
    const ratings: number[] = [];
    for (const sub of consenting) {
      const ans = sub.answers[q.id];
      if (!ans || ans.skipped) continue;
      if (isNumericEnjoyment(ans.enjoyment)) {
        ratings.push(ans.enjoyment);
      }
    }

    rawRatingsByQuestion[q.id] = ratings;
    const count = ratings.length;

    if (count < minimumThreshold || suppressedByPrivacyThreshold) {
      aggregates[q.id] = {
        questionId: q.id,
        respondentCount: count,
        meanEnjoyment: null,
        stdDevEnjoyment: null,
        distribution: null,
        available: false,
        isSyntheticDemo,
      };
      continue;
    }

    const sum = ratings.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const variance =
      ratings.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const r of ratings) {
      distribution[r as 1 | 2 | 3 | 4 | 5] += 1;
    }

    aggregates[q.id] = {
      questionId: q.id,
      respondentCount: count,
      meanEnjoyment: Number(mean.toFixed(2)),
      stdDevEnjoyment: Number(stdDev.toFixed(2)),
      distribution,
      available: true,
      isSyntheticDemo,
    };
  }

  return {
    aggregates,
    rawRatingsByQuestion,
    eligibleCohortParticipants: consenting.length,
    suppressedByPrivacyThreshold,
  };
}

/**
 * Calculates empirical percentile strictly from individual response distributions:
 * mid-rank formula: (countStrictlyBelow + 0.5 * countEqual) / total * 100
 */
export function computeEmpiricalPercentile(
  userValue: number,
  sampleRatings: number[],
): number | null {
  if (sampleRatings.length === 0) return null;
  let below = 0;
  let equal = 0;
  for (const val of sampleRatings) {
    if (val < userValue) below += 1;
    else if (val === userValue) equal += 1;
  }
  return Math.round(((below + 0.5 * equal) / sampleRatings.length) * 100);
}

export function compareUserWithCommunity(params: {
  assessment: AssessmentDefinition;
  userAnswers: Record<string, QuestionAnswer>;
  userMode?: AssessmentMode;
  submissions: OptedInSubmissionRecord[];
  cohortFilter?: CohortFilter;
  minimumThreshold?: number;
  isSyntheticDemo?: boolean;
}): {
  items: CommunityComparisonItem[];
  dimensions: CommunityDimensionComparison[];
  archetypes: CommunityArchetypeAggregate[];
  eligibleCohortParticipants: number;
  suppressedByPrivacyThreshold: boolean;
  minimumThreshold: number;
} {
  const minimumThreshold =
    params.minimumThreshold ?? brandConfig.communityMinimumThreshold;
  const {
    aggregates,
    rawRatingsByQuestion,
    eligibleCohortParticipants,
    suppressedByPrivacyThreshold,
  } = computeCommunityAggregates({
    assessment: params.assessment,
    mode: params.userMode,
    submissions: params.submissions,
    cohortFilter: params.cohortFilter,
    minimumThreshold,
    isSyntheticDemo: params.isSyntheticDemo,
  });

  const items: CommunityComparisonItem[] = [];
  for (const q of params.assessment.questions) {
    const ans = params.userAnswers[q.id];
    const userRating =
      ans && !ans.skipped && isNumericEnjoyment(ans.enjoyment)
        ? ans.enjoyment
        : null;
    const agg = aggregates[q.id];
    const available = Boolean(agg?.available);

    const difference =
      available && userRating !== null && agg.meanEnjoyment !== null
        ? Number((userRating - agg.meanEnjoyment).toFixed(2))
        : null;

    const percentile =
      available && userRating !== null
        ? computeEmpiricalPercentile(
            userRating,
            rawRatingsByQuestion[q.id] || [],
          )
        : null;

    items.push({
      questionId: q.id,
      prompt: q.prompt,
      sectionTitle: q.sectionTitle,
      userRating,
      communityMean: available ? agg.meanEnjoyment : null,
      communityStdDev: available ? agg.stdDevEnjoyment : null,
      respondentCount: agg?.respondentCount ?? 0,
      difference,
      percentile,
      available,
      isSyntheticDemo: params.isSyntheticDemo,
    });
  }

  // Score the same question subset for everyone, including full submissions in a quick cohort.
  // A neutral default from an unanswered dimension is never a measured score.
  const mode = params.userMode || "complete";
  const score = (answers: Record<string, QuestionAnswer>) =>
    scoreAssessmentSubmission({
      resultId: "community-calculation",
      assessment: params.assessment,
      mode,
      perspective: "primary",
      answers,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  const user = score(params.userAnswers);
  const peers = eligibleParticipants(
    params.assessment,
    params.submissions,
    params.cohortFilter,
    params.userMode,
  ).map((sub) => score(sub.answers));
  const dimensions: CommunityDimensionComparison[] = user.radar.map(
    (dimension) => {
      const scores = peers
        .map((peer) =>
          peer.radar.find((d) => d.dimension === dimension.dimension),
        )
        .filter((d): d is NonNullable<typeof d> =>
          Boolean(d && d.answeredCount > 0),
        )
        .map((d) => d.score);
      const available =
        scores.length >= minimumThreshold && !suppressedByPrivacyThreshold;
      const userScore = dimension.answeredCount > 0 ? dimension.score : null;
      return {
        dimension: dimension.dimension,
        label: dimension.label,
        userScore,
        communityMean: available
          ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length)
          : null,
        percentile:
          available && userScore !== null
            ? computeEmpiricalPercentile(userScore, scores)
            : null,
        higherThanPercent:
          available && userScore !== null
            ? Math.round(
                (scores.filter((s) => s < userScore).length / scores.length) *
                  100,
              )
            : null,
        histogram: available
          ? Array.from({ length: 10 }, (_, index) => {
              const min = index * 10,
                max = (index + 1) * 10;
              const count = scores.filter(
                (score) =>
                  score >= min && (index === 9 ? score <= max : score < max),
              ).length;
              return {
                min,
                max,
                count,
                percent: Number(((count / scores.length) * 100).toFixed(1)),
              };
            })
          : null,
        respondentCount: scores.length,
        available,
        isSyntheticDemo: Boolean(params.isSyntheticDemo),
      };
    },
  );
  const measuredPeers = peers.filter((peer) =>
    peer.radar.some((d) => d.answeredCount > 0),
  );
  const counts = new Map<string, number>();
  for (const peer of measuredPeers)
    counts.set(
      peer.profile.archetypeName,
      (counts.get(peer.profile.archetypeName) || 0) + 1,
    );
  const archetypes: CommunityArchetypeAggregate[] = [];
  if (
    measuredPeers.length >= minimumThreshold &&
    !suppressedByPrivacyThreshold
  ) {
    let others = 0;
    for (const [name, count] of counts)
      if (count >= Math.min(5, minimumThreshold))
        archetypes.push({
          name,
          count,
          percent: Number(((count / measuredPeers.length) * 100).toFixed(1)),
        });
      else others += count;
    if (others)
      archetypes.push({
        name: "Other measured profiles",
        count: others,
        percent: Number(((others / measuredPeers.length) * 100).toFixed(1)),
      });
  }
  return {
    items,
    dimensions,
    archetypes: archetypes.sort((a, b) => b.count - a.count),
    eligibleCohortParticipants,
    suppressedByPrivacyThreshold,
    minimumThreshold,
  };
}

/**
 * Deterministic synthetic preview dataset for demonstrating charts when real opted-in users < 50.
 * Strictly tagged as synthetic demo data and NEVER mixed into real aggregates.
 */
export function generateSyntheticDemoSubmissions(
  assessment: AssessmentDefinition,
  count = 80,
): OptedInSubmissionRecord[] {
  const ageGroups: Array<
    NonNullable<ConsentSettings["cohortMetadata"]>["ageGroup"]
  > = ["18-24", "25-34", "35-44", "45+"];
  const statuses: Array<
    NonNullable<ConsentSettings["cohortMetadata"]>["relationshipStatus"]
  > = ["single", "dating", "partnered", "married"];
  const records: OptedInSubmissionRecord[] = [];

  for (let i = 0; i < count; i++) {
    const answers: Record<string, QuestionAnswer> = {};
    for (let qIdx = 0; qIdx < assessment.questions.length; qIdx++) {
      const q = assessment.questions[qIdx];
      // Deterministic pseudo-random spread grounded by category tendencies
      const seed = ((i + 1) * 37 + (qIdx + 1) * 19) % 100;
      let rating: 1 | 2 | 3 | 4 | 5 = 3;
      if (
        q.sectionId === "communication" ||
        q.sectionId === "boundaries-comfort"
      ) {
        rating = seed < 6 ? 2 : seed < 20 ? 3 : seed < 58 ? 4 : 5;
      } else if (q.sectionId === "foreplay-pacing") {
        rating = seed < 8 ? 2 : seed < 28 ? 3 : seed < 68 ? 4 : 5;
      } else if (q.sectionId === "exploration-novelty") {
        rating =
          seed < 18 ? 1 : seed < 40 ? 2 : seed < 62 ? 3 : seed < 84 ? 4 : 5;
      } else {
        rating =
          seed < 10 ? 1 : seed < 24 ? 2 : seed < 46 ? 3 : seed < 78 ? 4 : 5;
      }
      answers[q.id] = {
        questionId: q.id,
        importance: seed % 4 === 0 ? "essential" : "important",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      const answer = answers[q.id];
      if (q.inputType === "rating_scale") {
        const min = q.scaleConfig?.min ?? 1,
          max = q.scaleConfig?.max ?? 5;
        answer.customValue = min + Math.round(((max - min) * seed) / 100);
      } else if (q.inputType === "slider") {
        const min = q.sliderConfig?.min ?? 0,
          max = q.sliderConfig?.max ?? 100,
          step = q.sliderConfig?.step ?? 5;
        answer.customValue = Math.min(
          max,
          min + Math.round(((max - min) * seed) / 100 / step) * step,
        );
      } else if (q.inputType === "curiosity_map") {
        const levels = [
          "very_interested",
          "interested",
          "curious_uncertain",
          "not_interested",
          "firm_boundary",
        ] as const;
        answer.curiosityLevel = levels[seed % levels.length];
      } else if (q.options?.length) {
        const values = q.options.map((o) => o.value);
        if (q.inputType === "ranking") {
          const offset = seed % values.length;
          answer.customValue = [
            ...values.slice(offset),
            ...values.slice(0, offset),
          ];
        } else if (q.inputType === "multi_select")
          answer.customValue = values.filter(
            (_, index) =>
              index === seed % values.length || (seed + index) % 3 === 0,
          );
        else answer.customValue = values[seed % values.length];
      } else answer.enjoyment = rating;
    }

    records.push({
      submissionId: `synthetic-demo-${i}`,
      assessmentSlug: assessment.slug,
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: true,
        cohortMetadata: {
          ageGroup: ageGroups[i % ageGroups.length],
          relationshipStatus: statuses[i % statuses.length],
          datingPreference: "men",
        },
        consentedAt: "2026-01-01T00:00:00.000Z",
      },
      answers,
    });
  }

  return records;
}
