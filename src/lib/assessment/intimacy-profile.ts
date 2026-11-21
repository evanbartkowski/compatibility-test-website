import { brandConfig } from "@/config/brand";
import { selectAssessmentQuestions } from "./definition";
import type {
  AssessmentDefinition,
  AssessmentMode,
  CompatibilityPairItem,
  CompatibilityReport,
  QuestionAnswer,
  QuestionDefinition,
  ScoredAssessmentResult,
  SharingPreferences,
} from "./types";

const willingness: Record<
  NonNullable<QuestionAnswer["partnerWillingness"]>,
  number
> = {
  enthusiastically_enjoy: 100,
  willing_if_partner_enjoys: 75,
  curious_to_explore: 50,
  depends_on_context: 40,
  prefer_not_to: 0,
  firm_boundary: 0,
};
const mean = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
const numeric = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const boundary = (answer?: QuestionAnswer) =>
  answer?.firmBoundary === true ||
  answer?.partnerWillingness === "firm_boundary";
export function intimacyDesire(
  question: QuestionDefinition,
  answer?: QuestionAnswer,
): number | null {
  if (!answer || answer.skipped) return null;
  if (!numeric(answer.enjoyment)) return null;
  const score = Math.max(0, Math.min(100, (answer.enjoyment - 1) * 25));
  return question.reverseScored ? 100 - score : score;
}
function categoryPosition(
  question: QuestionDefinition,
  answer?: QuestionAnswer,
): number | null {
  if (!answer || answer.skipped) return null;
  if (question.options && typeof answer.customValue === "string") {
    const option = question.options.find(
      (item) => item.value === answer.customValue,
    );
    const value = option?.dimensionWeights?.[question.sectionId];
    return numeric(value) ? Math.round(value * 100) : null;
  }
  return question.options ? null : intimacyDesire(question, answer);
}
export function formatIntimacyAnswer(
  question: QuestionDefinition,
  answer?: QuestionAnswer,
): string {
  if (!answer || answer.skipped) return "Skipped";
  const desire = intimacyDesire(question, answer);
  const choice = question.options?.find(
    (option) => option.value === answer.customValue,
  )?.label;
  const label = `${choice ? `${choice} · ` : ""}${desire === null ? "Desire not rated" : `Desire: ${answer.enjoyment}/5`}`;
  const willing = answer.partnerWillingness
    ? {
        enthusiastically_enjoy: "Freely interested",
        willing_if_partner_enjoys: "Willing for a partner",
        curious_to_explore: "Curious to discuss",
        depends_on_context: "Depends on conditions",
        prefer_not_to: "Not willing",
        firm_boundary: "Hard limit",
      }[answer.partnerWillingness]
    : "Willingness not stated";
  return `${label} · ${boundary(answer) ? "Hard limit" : willing}${numeric(answer.experienceFrequency) ? ` · Experience: ${answer.experienceFrequency === 1 ? "Never" : `${answer.experienceFrequency}/5`}` : ""}`;
}

export function scoreIntimacyProfile(params: {
  assessment: AssessmentDefinition;
  resultId: string;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  answers: Record<string, QuestionAnswer>;
  createdAt: string;
}): ScoredAssessmentResult {
  const { assessment, answers } = params,
    questions = selectAssessmentQuestions(assessment, params.mode, answers);
  const answered = questions.filter((q) => {
    const a = answers[q.id];
    return (
      a &&
      !a.skipped &&
      (intimacyDesire(q, a) !== null ||
        categoryPosition(q, a) !== null ||
        a.partnerWillingness !== undefined ||
        numeric(a.experienceFrequency) ||
        boundary(a))
    );
  });
  const radar = (assessment.dimensions || []).map((d) => {
    const eligible = questions.filter((q) => q.sectionId === d.key);
    const contributors = eligible.flatMap((q) => {
      const score = categoryPosition(q, answers[q.id]);
      return score === null
        ? []
        : [
            {
              questionId: q.id,
              prompt: q.prompt,
              normalizedContribution: score,
              enjoymentLabel: formatIntimacyAnswer(q, answers[q.id]),
              importance: "nice_to_have" as const,
              direction: q.reverseScored
                ? ("inverse" as const)
                : ("positive" as const),
            },
          ];
    });
    const score =
      mean(contributors.map((row) => row.normalizedContribution)) ?? 0;
    const band =
      score < 40
        ? ("low" as const)
        : score > 60
          ? ("high" as const)
          : ("balanced" as const);
    return {
      dimension: d.key,
      label: d.label,
      score,
      answeredCount: contributors.length,
      eligibleCount: eligible.length,
      contributors,
      description: d.description,
      lowLabel: d.lowLabel,
      highLabel: d.highLabel,
      ...(contributors.length && d.interpretations
        ? { interpretation: { ...d.interpretations[band], band } }
        : {}),
    };
  });
  const channels = (assessment.dimensions || []).map((d) => {
    const rows = questions
      .filter((q) => q.sectionId === d.key)
      .map((q) => ({ q, a: answers[q.id] }))
      .filter((row) => row.a && !row.a.skipped);
    const desires = rows.flatMap(({ q, a }) => {
      const value = intimacyDesire(q, a);
      return value === null ? [] : [value];
    });
    return {
      dimension: d.key,
      label: d.label,
      desireScore: mean(desires),
      willingnessScore: mean(
        rows.flatMap(({ a }) =>
          boundary(a)
            ? [0]
            : a.partnerWillingness
              ? [willingness[a.partnerWillingness]]
              : [],
        ),
      ),
      experienceScore: mean(
        rows.flatMap(({ a }) =>
          numeric(a.experienceFrequency)
            ? [(a.experienceFrequency - 1) * 25]
            : [],
        ),
      ),
      desireCount: desires.length,
      experienceCount: rows.filter(({ a }) => numeric(a.experienceFrequency))
        .length,
      receiveScore: mean(
        rows
          .filter(({ q }) => q.intimacyRole === "receive")
          .flatMap(({ q, a }) => {
            const v = intimacyDesire(q, a);
            return v === null ? [] : [v];
          }),
      ),
      offerScore: mean(
        rows
          .filter(({ q }) => q.intimacyRole === "offer")
          .flatMap(({ q, a }) => {
            const v = intimacyDesire(q, a);
            return v === null ? [] : [v];
          }),
      ),
    };
  });
  const scatterPoints = questions.flatMap((q) => {
    const a = answers[q.id];
    if (
      intimacyDesire(q, a) === null ||
      !numeric(a?.enjoyment) ||
      !numeric(a.experienceFrequency) ||
      a.skipped
    )
      return [];
    const highDesire = a.enjoyment >= 4,
      highExperience = a.experienceFrequency >= 3;
    return [
      {
        questionId: q.id,
        shortLabel: q.prompt.replace(/[.!?]$/, "").slice(0, 62),
        prompt: q.prompt,
        sectionId: q.sectionId,
        sectionTitle: q.sectionTitle,
        enjoymentScore: a.enjoyment,
        experienceScore: a.experienceFrequency,
        importance: "nice_to_have" as const,
        quadrant: highDesire
          ? highExperience
            ? ("high_desire_high_experience" as const)
            : ("high_desire_low_experience" as const)
          : highExperience
            ? ("low_desire_high_experience" as const)
            : ("low_desire_low_experience" as const),
      },
    ];
  });
  const summary = (q: QuestionDefinition) => ({
    ...answers[q.id],
    questionId: q.id,
    prompt: q.prompt,
    sectionId: q.sectionId,
    sectionTitle: q.sectionTitle,
    importance: "nice_to_have" as const,
    firmBoundary: boundary(answers[q.id]),
    answerLabel: formatIntimacyAnswer(q, answers[q.id]),
  });
  const measured = radar.filter((d) => d.answeredCount),
    strongest = [...measured].sort((a, b) => b.score - a.score)[0];
  const coverage = questions.length
    ? Math.round((answered.length / questions.length) * 100)
    : 0;
  const note =
    assessment.scientificDisclaimer ||
    "An exploratory self-report. Interest is not consent.";
  return {
    resultId: params.resultId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentCategory: assessment.category,
    adultsOnly: true,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    scoringStrategy: "intimacy_profile",
    mode: params.mode,
    perspective: params.perspective,
    createdAt: params.createdAt,
    answeredCount: answered.length,
    totalEligibleInMode: questions.length,
    coveragePercent: coverage,
    provisional:
      measured.length < radar.length ||
      measured.some((d) => d.answeredCount < 3) ||
      coverage < 35,
    profile: {
      archetypeName: strongest
        ? assessment.shortTitle
        : "Your preferences are still taking shape",
      archetypeTagline: strongest
        ? `${assessment.slug === "spicy-would-you-rather" ? "Most pronounced preference direction" : "Strongest measured interest"}: ${strongest.label}`
        : "Unrated categories stay unmeasured.",
      disclaimer: note,
      summaryParagraph:
        measured
          .map(
            (d) =>
              `${d.label}: ${d.interpretation?.meaning || "Measured from your explicit preferences."}`,
          )
          .join(" ") ||
        "Choose a desire rating to begin a category profile. Willingness and experience are separate.",
      strongestPreferences: measured
        .filter((d) => d.score > 60)
        .map((d) => d.label),
      importantNeeds: [],
      noveltyComfort:
        "See the category-specific context in your private answers.",
      communicationStyle: "An explicit conversation is still needed.",
      paceAndEnergy: "No pace is inferred from experience alone.",
      initiativeBalance: "Receiving and offering are measured separately.",
      topBoundaries: answered
        .filter((q) => boundary(answers[q.id]))
        .map((q) => q.prompt),
    },
    radar,
    buckets: {
      stronglyDesired: answered
        .filter(
          (q) =>
            (intimacyDesire(q, answers[q.id]) ?? -1) >= 75 &&
            !boundary(answers[q.id]),
        )
        .map(summary),
      importantQualities: [],
      curiousAbout: answered
        .filter(
          (q) =>
            answers[q.id].partnerWillingness === "curious_to_explore" &&
            !boundary(answers[q.id]),
        )
        .map(summary),
      situational: answered
        .filter(
          (q) =>
            answers[q.id].partnerWillingness === "depends_on_context" &&
            !boundary(answers[q.id]),
        )
        .map(summary),
      preferToAvoid: answered
        .filter(
          (q) =>
            answers[q.id].partnerWillingness === "prefer_not_to" &&
            !boundary(answers[q.id]),
        )
        .map(summary),
      firmBoundaries: answered
        .filter((q) => boundary(answers[q.id]))
        .map(summary),
    },
    scatterPoints,
    experienceUnratedCount: answered.filter(
      (q) => !numeric(answers[q.id].experienceFrequency),
    ).length,
    unmetPreferences: scatterPoints
      .filter(
        (point) =>
          point.quadrant === "high_desire_low_experience" &&
          !boundary(answers[point.questionId]) &&
          ["enthusiastically_enjoy", "willing_if_partner_enjoys"].includes(
            answers[point.questionId].partnerWillingness || "",
          ),
      )
      .map((point) => ({
        ...point,
        enjoymentScore: point.enjoymentScore,
        experienceScore: point.experienceScore,
        message:
          "Interest and experience differ here. This is a private reflection, not a recommendation to act.",
      })),
    groundedInsights: channels
      .filter((d) => d.desireScore !== null)
      .map(
        (d) =>
          `${d.label}: desire ${d.desireScore}/100; willingness ${d.willingnessScore === null ? "not stated" : `${d.willingnessScore}/100`}; experience ${d.experienceScore === null ? "not rated" : `${d.experienceScore}/100`}.`,
      ),
    growthReflections: measured.map(
      (d) => d.interpretation?.reflection || "Which conditions matter to you?",
    ),
    idealPartner: {
      characteristics: [],
      whatMattersMost: [],
      earlyDatingSignals: [],
      potentialMismatches: [],
      explorationOpportunities: [],
      communicationNeeds: [
        "Ask about current willingness, conditions and limits; a profile never supplies consent.",
      ],
    },
    qaSummary: answered.map((q) => ({
      questionId: q.id,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      prompt: q.prompt,
      answerLabel: formatIntimacyAnswer(q, answers[q.id]),
      importance: "nice_to_have",
      firmBoundary: boundary(answers[q.id]),
      experienceFrequency: answers[q.id].experienceFrequency,
      score0to100: intimacyDesire(q, answers[q.id]),
    })),
    intimacyProfile: {
      channels,
      hardLimits: answered
        .filter((q) => boundary(answers[q.id]))
        .map((q) => ({ questionId: q.id, label: q.prompt })),
      privateCount: answered.filter(
        (q) => answers[q.id].revealRule === "private_never_share",
      ).length,
      contextOnlyCount: questions.filter(
        (q) =>
          answers[q.id] &&
          !answers[q.id].skipped &&
          intimacyDesire(q, answers[q.id]) === null &&
          numeric(answers[q.id].experienceFrequency),
      ).length,
    },
    recommendedNextSlugs: assessment.recommendedNextSlugs || [],
  };
}

export function compareIntimacyProfiles(params: {
  compatibilityId: string;
  inviteId: string;
  assessment: AssessmentDefinition;
  mode: AssessmentMode;
  primaryAnswers: Record<string, QuestionAnswer>;
  partnerAnswers: Record<string, QuestionAnswer>;
  creatorSharing: SharingPreferences;
  partnerSharing: SharingPreferences;
  createdAt?: string;
}): CompatibilityReport {
  const {
    assessment,
    primaryAnswers: a,
    partnerAnswers: b,
    creatorSharing: sa,
    partnerSharing: sb,
  } = params;
  const activeA = new Set(
    selectAssessmentQuestions(assessment, params.mode, a).map((q) => q.id),
  );
  const activeB = new Set(
    selectAssessmentQuestions(assessment, params.mode, b).map((q) => q.id),
  );
  const eligible = (x?: QuestionAnswer) =>
    !!x &&
    !x.skipped &&
    !boundary(x) &&
    x.revealRule !== "private_never_share" &&
    [
      "enthusiastically_enjoy",
      "willing_if_partner_enjoys",
      "curious_to_explore",
    ].includes(x.partnerWillingness || "");
  const items: CompatibilityPairItem[] = [],
    scores: number[] = [];
  const shared = new Set<string>();
  for (const q of assessment.questions) {
    if (!q.eligibleForMatching || !activeA.has(q.id) || !eligible(a[q.id]))
      continue;
    const counterpart = assessment.questions.find(
      (other) => other.id === (q.complementaryPartnerId || q.id),
    );
    if (
      !counterpart ||
      !activeB.has(counterpart.id) ||
      !eligible(b[counterpart.id])
    )
      continue;
    const av = intimacyDesire(q, a[q.id]),
      bv = intimacyDesire(counterpart, b[counterpart.id]);
    const curious =
      a[q.id].partnerWillingness === "curious_to_explore" &&
      b[counterpart.id].partnerWillingness === "curious_to_explore";
    const aWants = av !== null && av >= 75,
      bWants = bv !== null && bv >= 75;
    const opposite = q.intimacyRole !== counterpart.intimacyRole;
    const sameChoice =
      !q.options ||
      (typeof a[q.id].customValue === "string" &&
        q.options.some((option) => option.value === a[q.id].customValue) &&
        a[q.id].customValue === b[counterpart.id].customValue);
    if (!sameChoice) continue;
    const match = opposite
      ? q.intimacyRole === "receive"
        ? aWants
        : bWants
      : aWants && bWants;
    if (!match && !curious) continue;
    if (
      curious
        ? !(sa.shareSharedCuriosities && sb.shareSharedCuriosities)
        : opposite
          ? !(
              sa.shareComplementaryHighlights && sb.shareComplementaryHighlights
            )
          : !(sa.shareAlignedHighlights && sb.shareAlignedHighlights)
    )
      continue;
    if (
      !curious &&
      (a[q.id].partnerWillingness === "curious_to_explore" ||
        b[counterpart.id].partnerWillingness === "curious_to_explore")
    )
      continue;
    const item: CompatibilityPairItem = {
      questionId: q.id,
      sectionTitle: q.sectionTitle,
      promptSummary:
        q.options?.find((option) => option.value === a[q.id].customValue)
          ?.label || q.prompt,
      classification: curious
        ? "shared_curiosity"
        : opposite
          ? "complementary"
          : "strong_align",
      explanation: curious
        ? "Both people chose curiosity about this mutual topic. A conversation is welcome; no activity is agreed."
        : opposite
          ? "A receiving preference has a freely offered counterpart. Willingness is separate from personal desire, and either person can change their mind."
          : "Both people chose this option, rated it appealing and explicitly stated willingness. Neither choice is better, and this match is only an invitation to talk.",
      safetySensitive: true,
    };
    items.push(item);
    scores.push(curious ? 50 : 100);
    shared.add(q.id);
  }
  const total = assessment.questions.filter(
    (q) => params.mode !== "quick" || q.quickDiscovery,
  ).length;
  return {
    compatibilityId: params.compatibilityId,
    inviteId: params.inviteId,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentVersion: assessment.version,
    scoringEngineVersion: brandConfig.scoringEngineVersion,
    compatibilityStrategy: "consent_complementary",
    createdAt: params.createdAt || new Date().toISOString(),
    overallScore: mean(scores) ?? 0,
    label: items.length
      ? "Mutually welcome conversations"
      : "No mutual topics shared yet",
    coveragePercent: total ? Math.round((shared.size / total) * 100) : 0,
    bothAnsweredCount: shared.size,
    totalEligibleCount: total,
    provisional: shared.size < 5,
    disclaimer:
      "Shared interest is an invitation to talk, never consent or a safety guarantee.",
    methodologyNotes: [
      "Only mutually eligible counterpart topics contribute. Private and unmatched answers, limits, willingness and experience are never listed or counted.",
      "No raw rating overlay or hidden mismatch score is produced. A receiving interest is compared with a freely offered counterpart.",
    ],
    dimensionScores: (assessment.dimensions || []).map((d) => {
      const rows = items.filter((item) => item.sectionTitle === d.label);
      return {
        dimension: d.label,
        score:
          sa.shareCategoryScores && sb.shareCategoryScores && rows.length
            ? mean(
                rows.map((item) =>
                  item.classification === "shared_curiosity" ? 50 : 100,
                ),
              )
            : null,
        pairCount: rows.length,
        note: rows.length
          ? "Based only on topics both people permitted to match."
          : "No mutually shared evidence in this category.",
      };
    }),
    radarOverlay: [],
    whereYouAlign: items.filter(
      (item) => item.classification === "strong_align",
    ),
    whereYouComplement: items.filter(
      (item) => item.classification === "complementary",
    ),
    whereYouDiffer: [],
    sharedCuriosities: items.filter(
      (item) => item.classification === "shared_curiosity",
    ),
    boundaryConsiderations: [],
    coupleInsights: [],
    conversationStarters: items.length
      ? [
          "Which conditions would make one of these topics feel freely chosen today?",
        ]
      : [],
  };
}

export function attachIntimacyBlueprint(
  result: ScoredAssessmentResult,
  sources: Array<{
    result: ScoredAssessmentResult;
    assessment: AssessmentDefinition;
  }>,
): void {
  const latest = new Map<string, (typeof sources)[number]>();
  for (const source of [...sources].sort((a, b) =>
    b.result.createdAt.localeCompare(a.result.createdAt),
  )) {
    if (
      source.result.perspective !== "primary" ||
      source.result.assessmentSlug === result.assessmentSlug ||
      source.result.assessmentVersion !== source.assessment.version ||
      !source.result.radar.some((d) => d.answeredCount)
    )
      continue;
    if (!latest.has(source.result.assessmentSlug))
      latest.set(source.result.assessmentSlug, source);
  }
  const labels = {
    connection: "Connection",
    pacing: "Pace & recovery",
    sensory: "Sensory preferences",
    imagination: "Imagination",
    roles: "Chosen roles",
    autonomy: "Autonomy & agreements",
  };
  const buckets = new Map<string, number[]>();
  for (const source of latest.values()) {
    const perSource = new Map<string, number[]>();
    for (const d of source.result.radar.filter((item) => item.answeredCount)) {
      const axis = source.assessment.dimensions?.find(
        (item) => item.key === d.dimension,
      )?.blueprintAxis;
      if (axis) perSource.set(axis, [...(perSource.get(axis) || []), d.score]);
    }
    for (const [axis, values] of perSource)
      buckets.set(axis, [...(buckets.get(axis) || []), mean(values)!]);
  }
  result.intimacyBlueprint = {
    sources: [...latest.values()].map((source) => ({
      title: source.assessment.title,
      createdAt: source.result.createdAt,
    })),
    axes: [...buckets].map(([key, values]) => ({
      key,
      label: labels[key as keyof typeof labels],
      score: mean(values)!,
      sourceCount: values.length,
    })),
    note: "This private synthesis uses your latest owned adult-collection results. Axes are exploratory summaries of declared categories, not an overall grade, diagnosis or compatibility prediction.",
  };
}
