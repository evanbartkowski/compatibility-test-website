import type { ScoredAssessmentResult } from "@/lib/assessment/types";
/** Explicit owner export selections; prevents answer-bearing detail leaking into summary downloads. */
export function projectPrivateExport(
  result: ScoredAssessmentResult,
  options: { includeAnswers: boolean; includeSensitive: boolean },
): ScoredAssessmentResult {
  const sensitive =
    result.adultsOnly || result.assessmentCategory === "sexuality-intimacy";
  if (options.includeAnswers && (!sensitive || options.includeSensitive))
    return structuredClone(result);
  const allowed = !sensitive || options.includeSensitive;
  return {
    resultId: result.resultId,
    assessmentSlug: result.assessmentSlug,
    assessmentTitle: result.assessmentTitle,
    assessmentCategory: result.assessmentCategory,
    assessmentVersion: result.assessmentVersion,
    scoringEngineVersion: result.scoringEngineVersion,
    mode: result.mode,
    perspective: result.perspective,
    createdAt: result.createdAt,
    answeredCount: result.answeredCount,
    totalEligibleInMode: result.totalEligibleInMode,
    coveragePercent: result.coveragePercent,
    provisional: result.provisional,
    profile: {
      archetypeName: allowed ? result.profile.archetypeName : "Private result",
      archetypeTagline: allowed
        ? result.profile.archetypeTagline
        : "Sensitive scores omitted by your export settings",
      summaryParagraph: allowed
        ? result.profile.summaryParagraph
        : "Choose to include sensitive result fields in your private result screen to export this profile. No private answers are included in this summary.",
      disclaimer: result.profile.disclaimer,
      strongestPreferences: [],
      importantNeeds: [],
      noveltyComfort: "Not included.",
      communicationStyle: "Not included.",
      paceAndEnergy: "Not included.",
      initiativeBalance: "Not included.",
      topBoundaries: [],
    },
    radar: allowed
      ? result.radar
          .filter((d) => d.answeredCount > 0)
          .map((d) => ({ ...d, contributors: [] }))
      : [],
    buckets: {
      stronglyDesired: [],
      importantQualities: [],
      curiousAbout: [],
      situational: [],
      preferToAvoid: [],
      firmBoundaries: [],
    },
    scatterPoints: [],
    experienceUnratedCount: 0,
    unmetPreferences: [],
    groundedInsights: [],
    idealPartner: {
      characteristics: [],
      whatMattersMost: [],
      earlyDatingSignals: [],
      potentialMismatches: [],
      explorationOpportunities: [],
      communicationNeeds: [],
    },
  };
}
