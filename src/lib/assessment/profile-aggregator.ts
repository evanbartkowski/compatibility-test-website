import { builtInAssessments, getAssessmentBySlug, getCategoryMeta } from "@/data/assessments/catalog";
import type { ScoredAssessmentResult } from "./types";

export interface DiscoveryDomainSummary {
  domainKey: string;
  title: string;
  description: string;
  averageScore: number | null;
  completedSlugs: string[];
  targetSlugs: string[];
  contributors: Array<{
    assessmentSlug: string;
    assessmentTitle: string;
    resultId: string;
    archetypeName: string;
    topDimensionScore: number;
  }>;
}

export interface WhatYouAreIntoDigestItem {
  questionId: string;
  shortLabel: string;
  answerLabel: string;
  detail?: string;
  assessmentSlug: string;
  assessmentTitle: string;
  resultId: string;
  linkedDimension?: string;
}

export interface AggregatedDiscoveryProfile {
  totalAssessmentsInPlatform: number;
  completedUniqueCount: number;
  completenessPercent: number;
  domains: DiscoveryDomainSummary[];
  crossTestInsights: Array<{
    title: string;
    detail: string;
    sources: string[];
  }>;
  whatYouAreIntoDigest?: {
    topTurnOns: WhatYouAreIntoDigestItem[];
    curiousExplorations: WhatYouAreIntoDigestItem[];
    wantMoreOf: WhatYouAreIntoDigestItem[];
    firmLimits: WhatYouAreIntoDigestItem[];
    roleLeans: Array<{
      label: string;
      detail: string;
      assessmentSlug: string;
      assessmentTitle: string;
      resultId: string;
    }>;
  };
  recommendedNext: Array<{
    slug: string;
    title: string;
    categoryTitle: string;
    estimatedMinutesQuick: number;
    reason: string;
  }>;
}

const DOMAIN_DEFS: Array<{
  domainKey: string;
  title: string;
  description: string;
  targetSlugs: string[];
}> = [
  {
    domainKey: "emotional-needs",
    title: "Emotional Needs & Attachment",
    description: "Security rhythms, emotional responsiveness, and repair safety.",
    targetSlugs: [
      "attachment-style-discovery",
      "emotional-intelligence-self-awareness",
      "emotional-support-compatibility",
    ],
  },
  {
    domainKey: "communication",
    title: "Communication & Repair",
    description: "Directness around desires, timing, and conflict de-escalation.",
    targetSlugs: [
      "conflict-communication-personality",
      "couples-communication-conflict-matching",
      "intimacy-communication-aftercare",
      "intimacy-partner-preferences",
    ],
  },
  {
    domainKey: "romance-affection",
    title: "Romance & Affection Style",
    description: "How you feel desired, give warmth, and experience courtship.",
    targetSlugs: [
      "love-affection-preferences",
      "what-makes-you-feel-desired",
      "what-kind-of-lover-are-you",
      "romantic-dreams-ideal-dates",
    ],
  },
  {
    domainKey: "desire-passion",
    title: "Desire & Passion Profile",
    description: "Erotic pacing, chemistry triggers, sensory focus, and initiation.",
    targetSlugs: [
      "intimacy-partner-preferences",
      "desire-frequency-initiation",
      "sexual-chemistry-compatibility",
      "sensuality-physical-affection",
    ],
  },
  {
    domainKey: "curiosity",
    title: "Curiosity & Kink Exploration",
    description: "Novelty appetite, kink & fetish menus, fantasy overlap, and shared adventure.",
    targetSlugs: [
      "kink-exploration-map",
      "sexual-interests-curiosity-map",
      "private-fantasy-matcher",
      "couples-bucket-list-matcher",
    ],
  },
  {
    domainKey: "initiative-dynamics",
    title: "Power Exchange & Dynamics",
    description: "Dominance & submission polarity, leadership comfort, flirting signals, and relational choreography.",
    targetSlugs: [
      "bdsm-power-dynamics-test",
      "dominance-submission-initiative",
      "flirting-attraction-style",
      "who-is-more-likely-to",
    ],
  },
  {
    domainKey: "temperament",
    title: "Personality & Temperament",
    description: "Core Big Five traits and how trusted people perceive you.",
    targetSlugs: ["big-five-personality-profile", "how-others-really-see-you"],
  },
  {
    domainKey: "boundaries",
    title: "Boundaries & Discernment",
    description: "Green flags, firm limits, and non-negotiable relationship standards.",
    targetSlugs: [
      "relationship-dealbreakers-boundaries",
      "dating-red-green-flags",
      "ideal-partner-blueprint",
    ],
  },
  {
    domainKey: "values",
    title: "Values & Life Priorities",
    description: "Tradeoffs between autonomy, devotion, family, and ambition.",
    targetSlugs: [
      "your-hidden-relationship-priorities",
      "long-term-relationship-compatibility",
    ],
  },
  {
    domainKey: "relationship-vision",
    title: "Shared Future Vision",
    description: "Long-horizon compatibility on money, home, and mutual knowledge.",
    targetSlugs: [
      "ideal-partner-blueprint",
      "long-term-relationship-compatibility",
      "how-well-do-you-know-your-partner",
    ],
  },
  {
    domainKey: "self-regulation",
    title: "Emotional Regulation",
    description: "How stress reshapes your closeness, voice, and reassurance needs.",
    targetSlugs: [
      "conflict-communication-personality",
      "attachment-style-discovery",
      "emotional-intelligence-self-awareness",
    ],
  },
  {
    domainKey: "playfulness",
    title: "Couples Synergy & Play",
    description: "Humor, spontaneity, prediction attunement, and shared novelty.",
    targetSlugs: [
      "who-is-more-likely-to",
      "how-well-do-you-know-your-partner",
      "couples-bucket-list-matcher",
    ],
  },
];

export const DISCOVERY_DOMAIN_DEFINITIONS = DOMAIN_DEFS;

export function aggregateDiscoveryProfile(
  submissions: Array<{
    submissionId: string;
    assessmentSlug: string;
    createdAt: string;
    result: ScoredAssessmentResult;
  }>
): AggregatedDiscoveryProfile {
  const latestBySlug = new Map<
    string,
    { submissionId: string; assessmentSlug: string; createdAt: string; result: ScoredAssessmentResult }
  >();
  for (const s of [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    if (!latestBySlug.has(s.assessmentSlug)) {
      latestBySlug.set(s.assessmentSlug, s);
    }
  }

  const completedSlugs = new Set(latestBySlug.keys());
  const totalAssessmentsInPlatform = builtInAssessments.length;
  const completedUniqueCount = completedSlugs.size;
  const completenessPercent = Math.round(
    (completedUniqueCount / Math.max(1, totalAssessmentsInPlatform)) * 100
  );

  const domains: DiscoveryDomainSummary[] = DOMAIN_DEFS.map((def) => {
    const matchingSubs = def.targetSlugs
      .map((slug) => latestBySlug.get(slug))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const contributors = matchingSubs.map((sub) => {
      const defMeta = getAssessmentBySlug(sub.assessmentSlug);
      const meanRadar =
        sub.result.radar.length > 0
          ? Math.round(
              sub.result.radar.reduce((acc, d) => acc + d.score, 0) / sub.result.radar.length
            )
          : 50;
      return {
        assessmentSlug: sub.assessmentSlug,
        assessmentTitle:
          defMeta?.title ?? sub.result.assessmentTitle ?? sub.assessmentSlug,
        resultId: sub.result.resultId,
        archetypeName: sub.result.profile.archetypeName,
        topDimensionScore: meanRadar,
      };
    });

    const averageScore =
      contributors.length > 0
        ? Math.round(
            contributors.reduce((acc, c) => acc + c.topDimensionScore, 0) /
              contributors.length
          )
        : null;

    return {
      domainKey: def.domainKey,
      title: def.title,
      description: def.description,
      averageScore,
      completedSlugs: matchingSubs.map((m) => m.assessmentSlug),
      targetSlugs: def.targetSlugs,
      contributors,
    };
  });

  const crossTestInsights: AggregatedDiscoveryProfile["crossTestInsights"] = [];
  if (completedUniqueCount >= 2) {
    const attachment = latestBySlug.get("attachment-style-discovery");
    const intimacy = latestBySlug.get("intimacy-partner-preferences");
    const bigFive = latestBySlug.get("big-five-personality-profile");
    const curiosity = latestBySlug.get("sexual-interests-curiosity-map");
    const conflict = latestBySlug.get("conflict-communication-personality");
    const affection = latestBySlug.get("love-affection-preferences");
    const desired = latestBySlug.get("what-makes-you-feel-desired");
    const bdsm = latestBySlug.get("bdsm-power-dynamics-test");
    const kink = latestBySlug.get("kink-exploration-map");

    if (bdsm && (kink || intimacy)) {
      const domScore = bdsm.result.radar.find((d) => d.dimension === "dominance_top")?.score ?? 50;
      const subScore =
        bdsm.result.radar.find((d) => d.dimension === "submission_bottom")?.score ?? 50;
      const kinkHigh =
        kink?.result.curiosityGroups?.find((g) => g.level === "very_interested")?.items.length ??
        0;
      crossTestInsights.push({
        title: "Power Polarity & Kink Appetite",
        detail: `In BDSM Roles & Dynamics, your profile anchors as "${bdsm.result.profile.archetypeName}" (Command ${domScore}/100 · Surrender ${subScore}/100)${
          kink
            ? `, paired with ${kinkHigh} high enthusiasm picks on your Kink & Fetish Exploration Map.`
            : ", giving partners a clear blueprint for negotiated scenes and aftercare."
        }`,
        sources: kink
          ? ["BDSM Roles & Dynamics", "Kink & Fetish Exploration Map"]
          : ["BDSM Roles & Dynamics", "Intimacy & Partner Preferences"],
      });
    }

    if (attachment?.result.attachmentCoordinates && intimacy) {
      const commScore =
        intimacy.result.radar.find((d) => d.dimension === "communication")?.score ?? 50;
      crossTestInsights.push({
        title: "Attachment Rhythm Meets Intimate Dialogue",
        detail: `Your Attachment Style reflects "${attachment.result.attachmentCoordinates.quadrantLabel}" (reassurance vigilance ${attachment.result.attachmentCoordinates.anxiety}/100, autonomy reflex ${attachment.result.attachmentCoordinates.avoidance}/100), alongside an Intimacy Communication score of ${commScore}/100.`,
        sources: ["Attachment Style Discovery", "Intimacy & Partner Preferences"],
      });
    }

    if (bigFive && curiosity) {
      const openness =
        bigFive.result.radar.find((d) => d.dimension === "openness")?.score ?? 50;
      const veryInterested =
        curiosity.result.curiosityGroups?.find((g) => g.level === "very_interested")?.items.length ?? 0;
      crossTestInsights.push({
        title: "Openness Across Personality & Erotic Curiosity",
        detail: `Your Big Five Openness measures ${openness}/100 while your Curiosity Map flagged ${veryInterested} high enthusiasm areas to explore.`,
        sources: ["Big Five Personality Profile", "Sexual Interests & Curiosity Map"],
      });
    }

    if (affection?.result.dualChannelScores && conflict) {
      const maxGap = [...affection.result.dualChannelScores].sort((a, b) => b.gap - a.gap)[0];
      const repair = conflict.result.radar.find((d) => d.dimension === "repair")?.score ?? 50;
      if (maxGap) {
        crossTestInsights.push({
          title: "Affection Gaps & Conflict Repair",
          detail: `In Love & Affection, your widest give vs receive asymmetry is "${maxGap.label}" (${maxGap.gap} point gap), paired with a ${repair}/100 repair readiness score in conflict settings.`,
          sources: ["Love & Affection Preferences", "Conflict & Communication Personality"],
        });
      }
    }

    if (desired?.result.dualChannelScores && intimacy) {
      const topNeed = [...desired.result.dualChannelScores].sort(
        (a, b) => b.receiveOrNeedScore - a.receiveOrNeedScore
      )[0];
      if (topNeed) {
        crossTestInsights.push({
          title: "Primary Desire Signal Paired With Core Preferences",
          detail: `Across What Makes You Feel Desired, "${topNeed.label}" leads your receiving sensitivity (${topNeed.receiveOrNeedScore}/100), reinforcing your "${intimacy.result.profile.archetypeName}" archetype.`,
          sources: ["What Makes You Feel Desired?", "Intimacy & Partner Preferences"],
        });
      }
    }

    if (crossTestInsights.length === 0) {
      const pair = Array.from(latestBySlug.values()).slice(0, 2);
      const [first, second] = pair;
      crossTestInsights.push({
        title: "Cross-Assessment Self-Portrait",
        detail: `Combining your "${first.result.profile.archetypeName}" profile (${first.result.assessmentTitle ?? first.assessmentSlug}) with "${second.result.profile.archetypeName}" (${second.result.assessmentTitle ?? second.assessmentSlug}) begins connecting how your relational habits and personal priorities interact.`,
        sources: [
          first.result.assessmentTitle ?? first.assessmentSlug,
          second.result.assessmentTitle ?? second.assessmentSlug,
        ],
      });
    }
  }

  // Aggregate "What You Are Into" across completed tests without fabricating items for incomplete tests
  let whatYouAreIntoDigest: AggregatedDiscoveryProfile["whatYouAreIntoDigest"];
  if (completedUniqueCount > 0) {
    const topTurnOns: WhatYouAreIntoDigestItem[] = [];
    const curiousExplorations: WhatYouAreIntoDigestItem[] = [];
    const wantMoreOf: WhatYouAreIntoDigestItem[] = [];
    const firmLimits: WhatYouAreIntoDigestItem[] = [];
    const roleLeans: NonNullable<AggregatedDiscoveryProfile["whatYouAreIntoDigest"]>["roleLeans"] =
      [];

    for (const sub of latestBySlug.values()) {
      const title =
        getAssessmentBySlug(sub.assessmentSlug)?.shortTitle ??
        sub.result.assessmentTitle ??
        sub.assessmentSlug;
      const into = sub.result.whatYouAreInto;
      if (into) {
        if (into.roleOrDynamicLean) {
          roleLeans.push({
            label: into.roleOrDynamicLean.label,
            detail: into.roleOrDynamicLean.detail,
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
          });
        }
        for (const t of into.coreTurnOns.slice(0, 3)) {
          topTurnOns.push({
            questionId: t.questionId,
            shortLabel: t.shortLabel,
            answerLabel: t.answerLabel,
            ...(t.detail ? { detail: t.detail } : {}),
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
            linkedDimension: t.linkedDimensions[0]?.label,
          });
        }
        for (const c of into.curiousExplorations.slice(0, 2)) {
          curiousExplorations.push({
            questionId: c.questionId,
            shortLabel: c.shortLabel,
            answerLabel: c.answerLabel,
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
            linkedDimension: c.linkedDimensions[0]?.label,
          });
        }
        for (const w of into.wantMoreOf.slice(0, 2)) {
          wantMoreOf.push({
            questionId: w.questionId,
            shortLabel: w.shortLabel,
            answerLabel: w.answerLabel,
            ...(w.detail ? { detail: w.detail } : {}),
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
            linkedDimension: w.linkedDimensions[0]?.label,
          });
        }
        for (const l of into.dealbreakersAndLimits.slice(0, 3)) {
          firmLimits.push({
            questionId: l.questionId,
            shortLabel: l.shortLabel,
            answerLabel: l.answerLabel,
            ...(l.detail ? { detail: l.detail } : {}),
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
            linkedDimension: l.linkedDimensions[0]?.label,
          });
        }
      } else {
        for (const b of sub.result.buckets.stronglyDesired.slice(0, 2)) {
          topTurnOns.push({
            questionId: b.questionId,
            shortLabel: b.prompt.slice(0, 62),
            answerLabel: b.answerLabel || "High preference",
            assessmentSlug: sub.assessmentSlug,
            assessmentTitle: title,
            resultId: sub.result.resultId,
          });
        }
      }
    }

    whatYouAreIntoDigest = {
      topTurnOns: topTurnOns.slice(0, 8),
      curiousExplorations: curiousExplorations.slice(0, 6),
      wantMoreOf: wantMoreOf.slice(0, 6),
      firmLimits: firmLimits.slice(0, 8),
      roleLeans: roleLeans.slice(0, 4),
    };
  }

  const priorityOrder = [
    "intimacy-partner-preferences",
    "bdsm-power-dynamics-test",
    "kink-exploration-map",
    "attachment-style-discovery",
    "big-five-personality-profile",
    "love-affection-preferences",
    "long-term-relationship-compatibility",
    "private-fantasy-matcher",
    "conflict-communication-personality",
    "couples-bucket-list-matcher",
  ];

  const remaining = builtInAssessments.filter((a) => !completedSlugs.has(a.slug));
  remaining.sort((a, b) => {
    const ia = priorityOrder.indexOf(a.slug);
    const ib = priorityOrder.indexOf(b.slug);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  const recommendedNext = remaining.slice(0, 4).map((a) => {
    const missingDomain = domains.find(
      (d) => d.targetSlugs.includes(a.slug) && d.completedSlugs.length === 0
    );
    return {
      slug: a.slug,
      title: a.title,
      categoryTitle: getCategoryMeta(a.category)?.title ?? a.category,
      estimatedMinutesQuick: a.estimatedMinutesQuick,
      reason: missingDomain
        ? `Unlocks insights in ${missingDomain.title}`
        : `Deepens your ${getCategoryMeta(a.category)?.title ?? "profile"} lens`,
    };
  });

  return {
    totalAssessmentsInPlatform,
    completedUniqueCount,
    completenessPercent,
    domains,
    crossTestInsights,
    ...(whatYouAreIntoDigest ? { whatYouAreIntoDigest } : {}),
    recommendedNext,
  };
}
