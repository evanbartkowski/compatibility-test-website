import { selectAssessmentQuestions } from "./definition";
import type {
  AdviceEvidence,
  AdviceExperiment,
  AssessmentAdviceProfile,
  AssessmentDefinition,
  CompatibilityReport,
  PersonalizedAdvice,
  QuestionAnswer,
  QuestionDefinition,
  ScoredAssessmentResult,
} from "./types";

export const ADVICE_VERSION = "1.0.0";
const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isLimit = (a?: QuestionAnswer) =>
  a?.firmBoundary === true || a?.partnerWillingness === "firm_boundary";
const freelyWilling = (a?: QuestionAnswer) =>
  ["enthusiastically_enjoy", "willing_if_partner_enjoys"].includes(
    a?.partnerWillingness || "",
  );
const explicitDesire = (a?: QuestionAnswer) =>
  a && !a.skipped && isNumber(a.enjoyment) ? (a.enjoyment - 1) * 25 : null;
const fallback: AssessmentAdviceProfile = {
  theme: "your measured preferences",
  seek: "Someone willing to discuss the specific preferences you choose to share",
  friction:
    "A category average cannot establish another person's needs, behavior or compatibility.",
  optimize:
    "Turn one measured preference into a clear request and ask whether it fits the other person.",
  solo: [
    "Name one useful condition",
    "Write one condition that would make this preference feel comfortable, and one that would not.",
  ],
  together: [
    "Ask one clear question",
    "If both people welcome the conversation, discuss one preference without making a promise to act on it.",
  ],
  curiosity: [
    "Consider the context",
    "Privately imagine how a different setting or pace might change your preference; doing nothing is also an option.",
  ],
  ask: "What would you freely enjoy offering, and what would you rather leave out?",
};

function evidenceFor(
  result: ScoredAssessmentResult,
  q?: QuestionDefinition,
  dimension?: string,
): AdviceEvidence[] {
  const d = result.radar.find(
    (row) =>
      row.dimension === (q?.sectionId || dimension) && row.answeredCount > 0,
  );
  return d
    ? [
        {
          dimension: d.dimension,
          label: d.label,
          score: d.score,
          answeredCount: d.answeredCount,
          ...(q ? { questionId: q.id, prompt: q.prompt } : {}),
        },
      ]
    : [];
}

function rankStyles(
  result: ScoredAssessmentResult,
  assessment: AssessmentDefinition,
) {
  if (!assessment.styleRankingEnabled) return;
  const ranked = result.radar
    .filter((d) => d.answeredCount > 0)
    .map((d) => ({
      key: d.dimension,
      label: d.label,
      score: d.score,
      answeredCount: d.answeredCount,
    }))
    .sort((a, b) => b.score - a.score);
  const covered =
    ranked.length === assessment.dimensions?.length &&
    ranked.every((d) => d.answeredCount >= 2);
  const tied =
    covered && ranked.length > 1 && ranked[0].score === ranked[1].score;
  const secondaryTied =
    covered &&
    !tied &&
    ranked.length > 2 &&
    ranked[1].score === ranked[2].score;
  result.styleRanking = {
    ranked,
    tied,
    provisional: !covered || ranked.some((d) => d.answeredCount < 5),
    ...(covered && !tied
      ? {
          primary: ranked[0],
          ...(!secondaryTied ? { secondary: ranked[1] } : {}),
        }
      : {}),
    note: !covered
      ? "Rate at least two items in every style before naming a primary and secondary. Missing styles are not assumed low."
      : tied
        ? "Your leading styles are tied. There is no single primary, and a tie does not automatically mean Shapeshifter."
        : secondaryTied
          ? "Your primary preference leads, but your secondary preferences are tied. No single secondary is assigned. These are relative, exploratory preferences, not fixed identities."
          : "Primary and secondary describe relative preferences in this attempt, not fixed identities, diagnoses or a compatibility prediction. Teaser rankings are provisional.",
  };
}

/** Deterministic owner-only coaching. It never changes scores, fills missing context or infers another person's preferences. */
export function attachPersonalizedAdvice(
  result: ScoredAssessmentResult,
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
): void {
  rankStyles(result, assessment);
  const measured = result.radar
    .filter((d) => d.answeredCount > 0)
    .sort((a, b) => b.score - a.score);
  const focus = measured[0];
  if (!focus) {
    result.advice = {
      version: ADVICE_VERSION,
      status: "needs-more-answers",
      headline: "A useful next step needs a little more evidence",
      context:
        "Rate preferences in a few categories to receive tailored suggestions. Experience, willingness and skipped answers alone do not establish desire or a partner type.",
      partnerTraits: [],
      frictionPoints: [],
      partnerSearchLine: "",
      optimizations: [],
      experiments: [],
      gaps: [],
      gapNote:
        "No desire–experience gap can be inferred from missing desire ratings.",
    };
    return;
  }
  const base = assessment.adviceProfile || fallback;
  const profile = {
    ...base,
    ...(focus.score >= 60 ? base.dimensionCoaching?.[focus.dimension] : {}),
  };
  const active = selectAssessmentQuestions(assessment, result.mode, answers);
  const hasIndependentChannels =
    assessment.scoringStrategy === "intimacy_profile";
  const eligible = active
    .filter((q) => {
      const a = answers[q.id],
        desire = explicitDesire(a);
      return (
        a &&
        !a.skipped &&
        !isLimit(a) &&
        a.revealRule !== "private_never_share" &&
        freelyWilling(a) &&
        desire !== null &&
        desire >= 75 &&
        (!q.options || q.options.some((o) => o.value === a.customValue))
      );
    })
    .sort(
      (a, b) =>
        (a.sectionId === focus.dimension ? -1 : 0) -
        (b.sectionId === focus.dimension ? -1 : 0),
    );
  const target = eligible.find((q) => q.sectionId === focus.dimension);
  const canInvitePartner = !hasIndependentChannels || Boolean(target);
  const evidence = evidenceFor(result, undefined, focus.dimension);
  const targetEvidence = target ? evidenceFor(result, target) : evidence;
  const interpretation =
    focus.interpretation?.meaning ||
    `${focus.label} is measured at ${focus.score}/100 from ${focus.answeredCount} answers.`;
  const channel = result.intimacyProfile?.channels.find(
    (d) => d.dimension === focus.dimension,
  );
  const direction = assessment.slug === "spicy-would-you-rather";
  const roleNote =
    channel && channel.receiveScore !== null && channel.offerScore !== null
      ? ` Your receiving interest is ${channel.receiveScore}/100 and offering interest is ${channel.offerScore}/100 in this category. These are different roles, not an obligation to reciprocate.`
      : "";
  const gaps: PersonalizedAdvice["gaps"] = active
    .flatMap((q) => {
      if (
        !q.supportsExperienceFrequency ||
        !["intimacy_profile", "enjoyment_scale"].includes(q.inputType)
      )
        return [];
      const a = answers[q.id],
        desire = explicitDesire(a);
      const chosen = q.options?.find((o) => o.value === a?.customValue);
      if (q.options && !chosen) return [];
      if (!a || a.skipped || desire === null || desire < 75) return [];
      const experience = isNumber(a.experienceFrequency)
        ? (a.experienceFrequency - 1) * 25
        : null;
      const gap = experience === null ? null : desire - experience;
      if (gap !== null && gap <= 0) return [];
      const path: PersonalizedAdvice["gaps"][number]["path"] = isLimit(a)
        ? "respect-limit"
        : a.revealRule === "private_never_share"
          ? "keep-private"
          : a.partnerWillingness === "prefer_not_to"
            ? "keep-as-fantasy"
            : freelyWilling(a) && experience !== null
              ? "discuss-first"
              : "needs-context";
      const explanation =
        path === "respect-limit"
          ? "Your limit takes precedence. Keep this out of experiments; high desire does not create a reason to cross it."
          : path === "keep-private"
            ? "You chose privacy. Keep this in your own reflection; no partner experiment or disclosure is suggested."
            : path === "keep-as-fantasy"
              ? "You reported interest without willingness. Leaving this as imagination is a complete, valid choice; no gap needs closing."
              : experience === null
                ? "Experience was not rated. This is a context question, not evidence that you have never done it or should try it."
                : path === "needs-context"
                  ? "Willingness or conditions are unresolved. Clarify what you want privately before considering any conversation or plan."
                  : "You rated desire higher than experience and stated willingness. If you want, discuss the appealing ingredient and conditions first. The other person still needs to choose freely; leaving it as fantasy remains an option.";
      return [
        {
          questionId: q.id,
          label: chosen?.label || q.prompt,
          desire,
          experience,
          gap,
          path,
          explanation,
        },
      ];
    })
    .sort((a, b) => (b.gap ?? -1) - (a.gap ?? -1))
    .slice(0, 5);
  const allLimited =
    hasIndependentChannels &&
    active.some(
      (q) => q.sectionId === focus.dimension && isLimit(answers[q.id]),
    ) &&
    !target;
  const partnerTrait = allLimited
    ? "Someone who is comfortable leaving the highlighted interests outside shared plans"
    : focus.score < 40
      ? `Someone comfortable with your lower interest in ${focus.label.toLowerCase()}`
      : profile.seek;
  const partnerBody = `${interpretation}${roleNote} ${target ? `If you choose to discuss it, ask about the corresponding offer or preference behind “${target.prompt}”.` : "Use this as a question about fit, not a claim about another person's character or an agreement to act."}`;
  const searchLine = direction
    ? `I tend toward ${focus.score >= 50 ? focus.highLabel || "the second direction" : focus.lowLabel || "the first direction"} in ${focus.label.toLowerCase()}. I would like to compare the context behind that choice.`
    : profile.wording ||
      `${focus.score < 40 ? "I prefer less emphasis on" : "I am drawn to"} ${focus.label.toLowerCase()}. I would like a partner who can talk about ${profile.theme.replace(/^your /, "my ")}, with room for either person to decline.`;
  const low = [...measured].sort((a, b) => a.score - b.score)[0];
  const experiments: AdviceExperiment[] = [
    {
      id: "solo-map",
      title: profile.solo[0],
      body: `Use your ${focus.label.toLowerCase()} answers as the starting point.`,
      kind: "solo",
      effort: 1,
      scope: "Private reflection; no activity or disclosure required",
      evidence,
      steps: [
        profile.solo[1],
        `Notice whether this fits the pattern you reported: ${interpretation}`,
      ],
      stopRule:
        "Skip any theme that is a limit or feels unwelcome. A private note does not need to become a plan.",
    },
    {
      id: "curiosity-context",
      title: profile.curiosity[0],
      body: "An imagination or conversation option, not an invitation to cross a boundary.",
      kind: "curiosity",
      effort: 2,
      scope: "Imagination only unless a separate conversation is freely chosen",
      evidence,
      steps: [
        "Choose only a theme you already welcome; do not revisit an unwanted or hard-limit topic for this exercise.",
        profile.curiosity[1],
      ],
      stopRule:
        "Keep it private, change the topic or stop. Curiosity supplies no permission.",
    },
    canInvitePartner
      ? {
          id: "partner-prototype",
          title: profile.together[0],
          body: target
            ? `You rated this topic appealing and stated willingness: ${target.prompt}`
            : `Based on your measured ${focus.label.toLowerCase()} pattern; ask whether a conversation is welcome first.`,
          kind: "partnered",
          effort: 2,
          scope: "A separately agreed conversation or ordinary comfort routine",
          evidence: targetEvidence,
          steps: [
            "Ask whether the conversation and its specific topic are welcome now. Either person can decline.",
            hasIndependentChannels && target
              ? `Stay with this eligible topic only: “${target.prompt}”. ${profile.ask} If both people separately want a small ordinary comfort or communication step connected to it, choose that step; no other activity is implied.`
              : profile.together[1],
            "Choose a short time window and an easy ending before beginning.",
          ],
          stopRule:
            "A pause, changed mind or no ends the invitation. No replacement activity is owed.",
          aftercare:
            "Ask whether quiet, company or a later check-in would be welcome afterward; do not assume the same care suits both people.",
        }
      : {
          id: "private-conditions",
          title: "Keep the next step private for now",
          body: "No eligible topic had both explicit appeal and freely stated willingness for a partner invitation.",
          kind: "solo",
          effort: 2,
          scope: "Private reflection only",
          evidence,
          steps: [
            `Write what would matter in a conversation about ${profile.theme}, without choosing or disclosing a specific activity.`,
            "Leave limits, private choices and unwilling topics outside any proposed experiment.",
          ],
          stopRule:
            "You can finish here. A preference does not need to turn into an experience.",
        },
  ];
  const actionableGap = gaps.find(
    (gap) =>
      gap.path === "discuss-first" &&
      eligible.some((q) => q.id === gap.questionId),
  );
  if (actionableGap) {
    const q = active.find((item) => item.id === actionableGap.questionId)!;
    experiments.push({
      id: "gap-planning",
      title: "Make a plan for one gap—or leave it as fantasy",
      body: `Your desire is ${actionableGap.desire}/100 and experience is ${actionableGap.experience}/100 for “${actionableGap.label}”.`,
      kind: "partnered",
      effort: 3,
      scope:
        "Planning only; this reflection does not provide technique instructions",
      evidence: evidenceFor(result, q),
      steps: [
        "Ask whether discussing this particular topic is welcome. Start with what appeals, not a promise to do it.",
        "Name the preferred role, setting, pace, exclusions and what would make a no easy.",
        "Choose one ordinary, reversible comfort or communication step only if both people separately want it. Otherwise keep the theme in imagination.",
        "Agree on how to stop and what follow-up, privacy and care would be welcome.",
      ],
      stopRule:
        "Any limit, uncertainty or changed mind means do not proceed. Keeping a fantasy private is a finished outcome.",
      aftercare:
        "Check how the conversation felt and whether either person wants quiet, company or no follow-up.",
    });
  }
  result.advice = {
    version: ADVICE_VERSION,
    status: "ready",
    focusDimension: focus.dimension,
    headline: `${focus.label}: turn your pattern into a clear request`,
    context: `${focus.score}/100 from ${focus.answeredCount} answers. ${interpretation}${roleNote}${direction ? " This is a choice direction, not a desire rating." : ""}${result.provisional ? " This attempt has limited evidence; treat the advice as a starting point." : ""}`,
    partnerTraits: [
      {
        id: "partner-fit",
        title: partnerTrait,
        body: partnerBody,
        evidence: target ? targetEvidence : evidence,
      },
      ...(channel &&
      channel.receiveScore !== null &&
      channel.offerScore !== null
        ? [
            {
              id: "counterpart-fit",
              title:
                "Look for a freely offered counterpart, not an identical score",
              body:
                roleNote.trim() +
                " Ask what the other person actually enjoys giving or receiving; labels alone cannot establish fit.",
              evidence,
            },
          ]
        : []),
    ],
    frictionPoints: [
      {
        id: "negotiation-friction",
        title: "A difference to discuss, not a verdict about a person",
        body: profile.friction,
        evidence,
        script: profile.ask,
      },
    ],
    partnerSearchLine: searchLine,
    optimizations: [
      {
        id: "focus-habit",
        title: `Make ${focus.label.toLowerCase()} easier to talk about`,
        body: profile.optimize,
        evidence,
        script: profile.ask,
      },
      ...(low &&
      low.dimension !== focus.dimension &&
      focus.score - low.score >= 25
        ? [
            {
              id: "contrast-habit",
              title: "Keep the contrast visible",
              body: `${focus.label} is ${focus.score}/100 while ${low.label} is ${low.score}/100. ${low.interpretation?.meaning || "These categories do not need to have the same emphasis."} Ask for each condition separately rather than averaging them into one label.`,
              evidence: [
                ...evidence,
                ...evidenceFor(result, undefined, low.dimension),
              ],
            },
          ]
        : []),
    ],
    experiments: experiments.sort((a, b) => a.effort - b.effort),
    gaps,
    gapNote: hasIndependentChannels
      ? "Gaps compare your explicit desire with explicit experience. Unknown experience stays unknown; willingness and limits determine which paths are even eligible for discussion. Nothing needs to be completed."
      : "This agreement-scale assessment does not measure item-level experience. No desire–experience gap is inferred; use an intimacy reflection with separate experience fields if that context would be useful.",
    ...(result.intimacyBlueprint
      ? {
          synthesisNote: result.intimacyBlueprint.axes.length
            ? `Your private synthesis also includes ${result.intimacyBlueprint.sources.length} owned saved reflections. Repeated measured themes include ${[
                ...result.intimacyBlueprint.axes,
              ]
                .sort((a, b) => b.score - a.score)
                .slice(0, 2)
                .map((axis) => `${axis.label} (${axis.score}/100)`)
                .join(
                  " and ",
                )}. Compare the source meanings before using an average as a partner filter; source answers remain private.`
            : "No other owned reflections contributed yet. The advice above uses this attempt only.",
        }
      : {}),
  };
  const secondary = result.styleRanking?.secondary;
  if (secondary) {
    const coaching = base.dimensionCoaching?.[secondary.key];
    if (coaching) {
      const secondaryEvidence = evidenceFor(result, undefined, secondary.key);
      result.advice.partnerTraits.push({
        id: "secondary-style-fit",
        title: `Someone who also welcomes your ${secondary.label} preferences`,
        body: `Your secondary preference is ${secondary.label} at ${secondary.score}/100. ${coaching.seek}. Ask what this means in practice; a matching label is not required and does not establish consent.`,
        evidence: secondaryEvidence,
      });
      result.advice.optimizations.push({
        id: "secondary-style-habit",
        title: `Make room for ${secondary.label} too`,
        body: coaching.optimize,
        evidence: secondaryEvidence,
      });
      result.advice.partnerSearchLine += ` My current secondary preference is ${secondary.label}; I would like to talk about what that means in practice.`;
    }
  }
}

/** This function deliberately accepts only an already-filtered report, never either person's raw answers. */
export function attachPairAdvice(
  report: CompatibilityReport,
  assessment: AssessmentDefinition,
): void {
  const shared = [
    ...report.whereYouComplement,
    ...report.whereYouAlign,
    ...report.sharedCuriosities,
  ].filter((item) => item.questionId !== "protected-limits");
  const unique = [
    ...new Map(shared.map((item) => [item.questionId, item])).values(),
  ].slice(0, 3);
  const recipe = assessment.adviceProfile || fallback;
  const evidence = (item: (typeof shared)[number]): AdviceEvidence[] => [
    {
      dimension: item.sectionTitle,
      label: item.sectionTitle,
      answeredCount: 1,
      questionId: item.questionId,
      prompt: item.promptSummary,
    },
  ];
  report.pairAdvice = {
    version: ADVICE_VERSION,
    status: unique.length ? "shared-topics" : "no-shared-topics",
    strengths: unique.map((item) => ({
      id: `shared-${item.questionId}`,
      title: item.promptSummary,
      body: item.explanation,
      evidence: evidence(item),
    })),
    frictionPoints: unique.map((item) => ({
      id: `discuss-${item.questionId}`,
      title: "Agree on the details before assuming a fit",
      body: `${recipe.friction} This is a question to discuss around your shared topic, not evidence that either person has this problem.`,
      evidence: evidence(item),
      script: recipe.ask,
    })),
    conversationStarters: unique.map(
      (item) => `For “${item.promptSummary}”: ${recipe.ask}`,
    ),
    experiments: unique.map(
      (item): AdviceExperiment => ({
        id: `pair-${item.questionId}`,
        title:
          item.classification === "shared_curiosity"
            ? "Keep this mutual curiosity imagination-only"
            : recipe.together[0],
        body: `Start only from the mutually disclosed topic: ${item.promptSummary}`,
        kind:
          item.classification === "shared_curiosity"
            ? "curiosity"
            : "partnered",
        effort: 2,
        scope:
          item.classification === "shared_curiosity"
            ? "A theme-level conversation only; no activity is suggested"
            : "A fresh, mutually chosen conversation or ordinary comfort routine",
        evidence: evidence(item),
        steps: [
          "Ask whether discussing this shared topic is welcome today. The prior result supplies no current consent.",
          item.classification === "shared_curiosity"
            ? "Each name the appealing feeling without making a plan. Either person can keep their other ideas private."
            : `Discuss this disclosed topic only: “${item.promptSummary}”. ${recipe.ask} Choose a small ordinary comfort or communication step only if it fits that topic and both people separately want it. Do not add unshared activities.`,
          "Agree on the roles, conditions, privacy and an easy ending; leave all unshared topics out.",
        ],
        stopRule:
          "Either person can decline, pause or change their mind. Do not use the report to request a reason for an omitted topic.",
        aftercare:
          "Ask whether quiet, company or a later check-in would be welcome.",
      }),
    ),
    privacyNote:
      "This advice uses only topics already mutually disclosed in this report. No private desires, limits, experience gaps, personal rankings or reasons for an unmatched item contribute. Potential friction is a conversation question, not a hidden mismatch diagnosis.",
  };
}
