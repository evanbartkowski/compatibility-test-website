import { brandConfig } from "@/config/brand";
import { isNumericEnjoyment } from "./scoring";
import type {
  AssessmentDefinition,
  CommunityComparisonItem,
  CommunityQuestionAggregate,
  ConsentSettings,
  QuestionAnswer,
} from "./types";

export interface OptedInSubmissionRecord {
  submissionId: string;
  assessmentSlug: string;
  consent: ConsentSettings;
  answers: Record<string, QuestionAnswer>;
}

export interface CohortFilter {
  ageGroup?: NonNullable<ConsentSettings["cohortMetadata"]>["ageGroup"] | "all";
  relationshipStatus?:
    | NonNullable<ConsentSettings["cohortMetadata"]>["relationshipStatus"]
    | "all";
  datingPreference?: NonNullable<ConsentSettings["cohortMetadata"]>["datingPreference"] | "all";
}

function passesCohortFilter(consent: ConsentSettings, filter?: CohortFilter): boolean {
  if (!filter) return true;
  const meta = consent.cohortMetadata;
  if (filter.ageGroup && filter.ageGroup !== "all" && meta?.ageGroup !== filter.ageGroup) {
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
  const consenting = submissions.filter(
    (s) =>
      s.assessmentSlug === assessment.slug &&
      s.consent.optInCommunityStats === true &&
      passesCohortFilter(s.consent, cohortFilter)
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
export function computeEmpiricalPercentile(userValue: number, sampleRatings: number[]): number | null {
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
  submissions: OptedInSubmissionRecord[];
  cohortFilter?: CohortFilter;
  minimumThreshold?: number;
  isSyntheticDemo?: boolean;
}): {
  items: CommunityComparisonItem[];
  eligibleCohortParticipants: number;
  suppressedByPrivacyThreshold: boolean;
  minimumThreshold: number;
} {
  const minimumThreshold = params.minimumThreshold ?? brandConfig.communityMinimumThreshold;
  const {
    aggregates,
    rawRatingsByQuestion,
    eligibleCohortParticipants,
    suppressedByPrivacyThreshold,
  } = computeCommunityAggregates({
    assessment: params.assessment,
    submissions: params.submissions,
    cohortFilter: params.cohortFilter,
    minimumThreshold,
    isSyntheticDemo: params.isSyntheticDemo,
  });

  const items: CommunityComparisonItem[] = [];
  for (const q of params.assessment.questions) {
    const ans = params.userAnswers[q.id];
    const userRating = ans && !ans.skipped && isNumericEnjoyment(ans.enjoyment) ? ans.enjoyment : null;
    const agg = aggregates[q.id];
    const available = Boolean(agg?.available);

    const difference =
      available && userRating !== null && agg.meanEnjoyment !== null
        ? Number((userRating - agg.meanEnjoyment).toFixed(2))
        : null;

    const percentile =
      available && userRating !== null
        ? computeEmpiricalPercentile(userRating, rawRatingsByQuestion[q.id] || [])
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

  return {
    items,
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
  count = 80
): OptedInSubmissionRecord[] {
  const ageGroups: Array<NonNullable<ConsentSettings["cohortMetadata"]>["ageGroup"]> = [
    "18-24",
    "25-34",
    "35-44",
    "45+",
  ];
  const statuses: Array<NonNullable<ConsentSettings["cohortMetadata"]>["relationshipStatus"]> = [
    "single",
    "dating",
    "partnered",
    "married",
  ];
  const records: OptedInSubmissionRecord[] = [];

  for (let i = 0; i < count; i++) {
    const answers: Record<string, QuestionAnswer> = {};
    for (let qIdx = 0; qIdx < assessment.questions.length; qIdx++) {
      const q = assessment.questions[qIdx];
      // Deterministic pseudo-random spread grounded by category tendencies
      const seed = ((i + 1) * 37 + (qIdx + 1) * 19) % 100;
      let rating: 1 | 2 | 3 | 4 | 5 = 3;
      if (q.sectionId === "communication" || q.sectionId === "boundaries-comfort") {
        rating = seed < 6 ? 2 : seed < 20 ? 3 : seed < 58 ? 4 : 5;
      } else if (q.sectionId === "foreplay-pacing") {
        rating = seed < 8 ? 2 : seed < 28 ? 3 : seed < 68 ? 4 : 5;
      } else if (q.sectionId === "exploration-novelty") {
        rating = seed < 18 ? 1 : seed < 40 ? 2 : seed < 62 ? 3 : seed < 84 ? 4 : 5;
      } else {
        rating = seed < 10 ? 1 : seed < 24 ? 2 : seed < 46 ? 3 : seed < 78 ? 4 : 5;
      }
      answers[q.id] = {
        questionId: q.id,
        enjoyment: rating,
        importance: seed % 4 === 0 ? "essential" : "important",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
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
