import type { AssessmentDefinition } from "@/lib/assessment/types";
import { qScale, makeSection } from "./builders";

/** Hand-authored follow-ups examine a different context; none are random quick-form filler. */
const deepContexts: Record<string, Array<[string, string, boolean?]>> = {
  "ideal-partner-blueprint": [
    [
      "emotional_maturity",
      "How important is a partner who can hear that they hurt you without asking you to comfort them first?",
    ],
    [
      "emotional_maturity",
      "How important is a partner who can disagree with you respectfully in front of other people?",
    ],
    [
      "warmth_affection",
      "How important is affection that continues during busy periods, even when dates are less frequent?",
    ],
    [
      "reliability_shared_life",
      "How important is agreeing on what counts as a fair division of invisible planning work?",
    ],
    [
      "curiosity_growth",
      "How important is a partner who shows interest in a hobby they do not personally share?",
    ],
    [
      "autonomy_space",
      "How important is a partner who supports changing your mind about an established routine?",
    ],
  ],
  "attachment-style-discovery": [
    [
      "anxiety",
      "When a partner asks for an evening alone, I look for signs that they are losing interest.",
    ],
    [
      "avoidance",
      "When someone offers support after a setback, I prefer to manage alone even if I want comfort.",
    ],
    [
      "security",
      "I can ask when we will reconnect after a break without treating the break as rejection.",
    ],
    [
      "anxiety",
      "A clear explanation for a delayed reply usually helps me settle.",
      true,
    ],
    [
      "avoidance",
      "I can name a vulnerable feeling without immediately making a joke or changing the subject.",
      true,
    ],
    [
      "security",
      "After a misunderstanding, I can consider both my needs and the other person’s perspective.",
    ],
  ],
  "love-affection-preferences": [
    [
      "rec_words",
      "Specific appreciation for something I worked hard on helps me feel noticed.",
    ],
    [
      "exp_words",
      "I naturally tell a partner which small things I appreciate about them.",
    ],
    [
      "rec_time",
      "A short conversation with phones put away matters more to me than a distracted evening together.",
    ],
    [
      "exp_time",
      "I protect time for a partner even when my schedule becomes crowded.",
    ],
    [
      "rec_acts",
      "Taking one agreed task off my plate feels caring when I am overwhelmed.",
    ],
    ["exp_acts", "I ask which practical task would help before stepping in."],
    [
      "rec_touch",
      "When we both want it, a quiet hug helps me feel connected after time apart.",
    ],
    [
      "exp_touch",
      "I enjoy offering affectionate touch after checking that it is welcome.",
    ],
    [
      "rec_gifts",
      "A small object connected to a shared memory can feel especially meaningful.",
    ],
    [
      "exp_gifts",
      "I notice small things a partner might enjoy and save them for a thoughtful surprise.",
    ],
    [
      "rec_validation",
      "Having my feelings understood matters even when my partner sees the situation differently.",
    ],
    [
      "exp_validation",
      "I can acknowledge a partner’s feelings before explaining my own view.",
    ],
    [
      "rec_play",
      "A shared private joke helps me feel close during an ordinary week.",
    ],
    [
      "exp_play",
      "I enjoy creating small moments of fun without expecting a big response.",
    ],
  ],
  "dating-red-green-flags": [
    [
      "boundary_vigilance",
      "I notice how someone responds to a small “no” before making larger commitments.",
    ],
    [
      "accountability_radar",
      "I look for changed behavior after an apology rather than relying on the apology alone.",
    ],
    [
      "pacing_patience",
      "I am comfortable taking time to learn whether someone is consistent across situations.",
    ],
    [
      "repair_optimism",
      "A respectful first disagreement can help me learn how we handle differences.",
    ],
    [
      "boundary_vigilance",
      "I would pause dating someone who pressures me to share passwords.",
    ],
    [
      "accountability_radar",
      "I pay attention to whether someone takes responsibility when plans go wrong.",
    ],
    [
      "pacing_patience",
      "I can enjoy strong attraction without assuming we already know each other well.",
    ],
    [
      "repair_optimism",
      "I can discuss a concern directly when I feel safe enough to do so.",
    ],
    [
      "boundary_vigilance",
      "I distinguish a personal preference from behavior that threatens my safety.",
    ],
    [
      "accountability_radar",
      "How someone treats people they do not need to impress affects my interest.",
    ],
  ],
  "what-kind-of-lover-are-you": [
    [
      "passion_romance",
      "I enjoy expressing affection through deliberate romantic gestures.",
    ],
    [
      "steady_anchor",
      "I show care through consistency when life becomes less exciting.",
    ],
    [
      "playful_spark",
      "I look for small ways to make an ordinary evening together feel fun.",
    ],
    [
      "deep_confidant",
      "I enjoy conversations about how our experiences have shaped us.",
    ],
    [
      "passion_romance",
      "I like planning something intimate that reflects my partner’s particular tastes.",
    ],
    [
      "steady_anchor",
      "I feel satisfied when we solve a practical problem as a team.",
    ],
    [
      "playful_spark",
      "I can adapt a date when the original plan goes wrong and still enjoy it.",
    ],
    [
      "deep_confidant",
      "I make room for a partner’s uncertain feelings without rushing to resolve them.",
    ],
    ["steady_anchor", "I express commitment through keeping small promises."],
    [
      "deep_confidant",
      "Learning something new about a longtime partner can renew my sense of closeness.",
    ],
  ],
  "flirting-attraction-style": [
    [
      "playful_banter",
      "A light shared joke is often how I test whether someone wants to keep talking.",
    ],
    [
      "direct_bold",
      "When interest seems mutual, I am comfortable suggesting a specific date.",
    ],
    [
      "warm_sincere",
      "I show interest by remembering and following up on details someone shares.",
    ],
    [
      "cerebral_intrigue",
      "An unexpected perspective in a conversation can increase my attraction.",
    ],
    [
      "playful_banter",
      "I enjoy teasing only when the other person is clearly enjoying it too.",
    ],
    [
      "direct_bold",
      "I would rather state my interest clearly than rely on ambiguous hints.",
    ],
    [
      "warm_sincere",
      "I often build attraction through relaxed, attentive conversation.",
    ],
    [
      "cerebral_intrigue",
      "I enjoy exchanging ideas before moving toward romantic conversation.",
    ],
    [
      "warm_sincere",
      "I am comfortable letting attraction build slowly without forcing momentum.",
    ],
    [
      "direct_bold",
      "If interest is not returned, I can step back without trying to persuade someone.",
    ],
  ],
  "relationship-dealbreakers-boundaries": [
    [
      "trust_exclusivity",
      "How important is an explicit agreement about what exclusivity means to each of you?",
    ],
    [
      "respect_tone",
      "How important is avoiding insults even when a disagreement is intense?",
    ],
    [
      "privacy_autonomy",
      "How important is keeping access to your own money and private communication?",
    ],
    [
      "life_compatibility",
      "How important is discussing children or a future without children before making lasting commitments?",
    ],
    [
      "trust_exclusivity",
      "How important is honesty about a broken agreement, even before it is discovered?",
    ],
    [
      "respect_tone",
      "How important is being able to leave a conversation temporarily without being followed or cornered?",
    ],
    [
      "privacy_autonomy",
      "How important is maintaining friendships independently of a partner?",
    ],
    [
      "life_compatibility",
      "How important is reaching a workable agreement about substance use at home?",
    ],
    [
      "respect_tone",
      "How important is having your stated limits respected without repeated negotiation?",
    ],
    [
      "life_compatibility",
      "How important is discussing caregiving responsibilities before they become urgent?",
    ],
  ],
  "emotional-intelligence-self-awareness": [
    [
      "trigger_insight",
      "I can distinguish the current event from an older experience it reminds me of.",
    ],
    [
      "self_regulation",
      "When I notice tension building, I can ask for a pause before saying something hurtful.",
    ],
    [
      "empathy_accuracy",
      "I check whether I understood someone’s feelings rather than assuming I know.",
    ],
    [
      "graceful_repair",
      "I can name a specific action I will change after apologizing.",
    ],
    [
      "trigger_insight",
      "I notice physical signs of stress before I can explain the feeling.",
    ],
    [
      "self_regulation",
      "After calming down, I return to a conversation I asked to pause.",
    ],
    [
      "empathy_accuracy",
      "I can take another person’s concern seriously without agreeing with every conclusion.",
    ],
    [
      "graceful_repair",
      "I can accept a correction without turning it into a judgment of my entire character.",
    ],
    [
      "trigger_insight",
      "I can tell when tiredness is making a disagreement feel larger.",
    ],
    [
      "graceful_repair",
      "I ask what repair would be useful rather than assuming a gesture is enough.",
    ],
  ],
  "conflict-communication-personality": [
    [
      "direct_clarity",
      "I prefer discussing one specific behavior rather than making broad claims about someone’s character.",
    ],
    [
      "reflective_pacing",
      "I often need a short period to organize my thoughts before resolving a disagreement.",
    ],
    [
      "harmony_repair",
      "Acknowledging something I understand in the other person’s view helps me restart a tense conversation.",
    ],
    [
      "empathy_vs_logic",
      "Feeling understood is usually more helpful to me initially than receiving a proposed solution.",
    ],
    [
      "direct_clarity",
      "I can state what I need without expecting my partner to infer it.",
    ],
    [
      "reflective_pacing",
      "A planned time to return to a conversation helps me use a break constructively.",
    ],
    [
      "harmony_repair",
      "I notice and respond when someone makes a sincere attempt to soften tension.",
    ],
    [
      "empathy_vs_logic",
      "I prefer a partner to ask whether I want listening or problem solving.",
    ],
  ],
  "long-term-relationship-compatibility": [
    [
      "financial_philosophy",
      "I prefer discussing a shared spending limit before making major purchases.",
    ],
    [
      "domestic_teamwork",
      "I want recurring household responsibilities agreed explicitly rather than handled whenever someone notices.",
    ],
    [
      "social_kin_boundaries",
      "I prefer that we agree together before extended family make plans involving our home.",
    ],
    [
      "future_trajectory",
      "I want a concrete conversation about where we hope to live within the next five years.",
    ],
    [
      "financial_philosophy",
      "I value a financial buffer more than frequent expensive experiences.",
    ],
    [
      "domestic_teamwork",
      "I prefer redistributing tasks when one person’s workload or health changes.",
    ],
    [
      "social_kin_boundaries",
      "I want regular time for my own friends alongside our shared social life.",
    ],
    [
      "future_trajectory",
      "I am comfortable revisiting a long term plan when our priorities change.",
    ],
  ],
  "sensuality-physical-affection": [
    [
      "everyday_touch",
      "Small, mutually welcome touches during daily routines help me feel connected.",
    ],
    [
      "sensory_depth",
      "An unhurried setting with comfortable lighting changes how much I enjoy physical affection.",
    ],
    [
      "pda_comfort",
      "I enjoy holding hands in public when we both feel comfortable.",
    ],
    [
      "pressure_intensity",
      "I prefer firmer pressure to a very light touch when receiving a shoulder massage.",
    ],
    [
      "everyday_touch",
      "I like checking whether a hug or some space would feel better after a stressful day.",
    ],
    [
      "sensory_depth",
      "I enjoy noticing which textures or kinds of touch feel pleasant rather than rushing.",
    ],
    [
      "pda_comfort",
      "I am comfortable showing affection around friends who know us well.",
    ],
    [
      "pressure_intensity",
      "I like being asked to guide the pressure and pace of affectionate touch.",
    ],
  ],
  "dominance-submission-initiative": [
    [
      "guiding_drive",
      "Within explicitly agreed limits, I enjoy proposing the direction of an intimate experience.",
    ],
    [
      "receptive_pull",
      "Within agreed limits, I enjoy letting a trusted partner guide the pace.",
    ],
    [
      "switching_fluidity",
      "My preference for guiding or following can change with my mood and partner.",
    ],
    [
      "structure_ritual",
      "Agreeing on a clear stop signal helps me feel more comfortable exploring a dynamic.",
    ],
    [
      "guiding_drive",
      "If I am guiding, I enjoy inviting feedback and adjusting to it.",
    ],
    [
      "receptive_pull",
      "Choosing to follow feels different to me from feeling obligated to comply.",
    ],
  ],
};

const importanceSlugs = new Set([
  "ideal-partner-blueprint",
  "relationship-dealbreakers-boundaries",
]);
export const majorAssessmentSlugs = new Set([
  "intimacy-partner-preferences",
  "sexual-interests-curiosity-map",
  "bdsm-power-dynamics-test",
  "kink-exploration-map",
  "big-five-personality-profile",
  ...Object.keys(deepContexts),
  "emotional-availability-reflection",
]);
export function refineAssessment(
  original: AssessmentDefinition,
): AssessmentDefinition {
  const a = structuredClone(original);
  a.version = "2.0.0";
  a.id = `${a.slug}-v2`;
  if (a.slug === "sexual-interests-curiosity-map")
    for (const q of a.questions) {
      for (const [from, to] of Object.entries({
        spontaneity: "novelty",
        playfulness: "novelty",
        intensity: "trust_dynamics",
      }))
        if (q.dimensionWeights[from] !== undefined) {
          q.dimensionWeights[to] =
            (q.dimensionWeights[to] || 0) + q.dimensionWeights[from];
          delete q.dimensionWeights[from];
        }
    }
  if (
    a.slug === "private-fantasy-matcher" &&
    !a.dimensions?.some((d) => d.key === "trust")
  )
    a.dimensions?.push({
      key: "trust",
      label: "Trust & negotiated dynamics",
      description:
        "Interest in explicitly negotiated trust-based scenarios; interest never implies consent.",
      lowLabel: "Less interest",
      highLabel: "More interest",
    });
  const contexts = deepContexts[a.slug];
  if (contexts) {
    a.supportsQuickMode = true;
    a.sections.push(
      makeSection(
        "everyday-context",
        "Patterns across situations",
        "Deep reflection",
        "Consider these situations separately. You can skip any that do not fit your experience.",
      ),
    );
    contexts.forEach(([dimension, prompt, reverse], i) =>
      a.questions.push(
        qScale({
          id: `${a.slug}-context-${i + 1}`,
          order: a.questions.length + 1,
          sectionId: "everyday-context",
          sectionTitle: "Patterns across situations",
          prompt,
          partnerPrompt: prompt,
          helperText: importanceSlugs.has(a.slug)
            ? "Rate its importance to you. Use the optional dealbreaker flag only when it is a firm limit."
            : "Think about your usual pattern over the past few months, rather than one unusually good or difficult day.",
          dimensionWeights: { [dimension]: 1 },
          quick: false,
          reverseScored: reverse,
          min: 1,
          max: 5,
          minLabel: importanceSlugs.has(a.slug)
            ? "Not important"
            : "Strongly disagree",
          maxLabel: importanceSlugs.has(a.slug)
            ? "Essential"
            : "Strongly agree",
          supportsBoundaryFlag: importanceSlugs.has(a.slug),
        }),
      ),
    );
  }
  const knownDim = a.dimensions || [];
  const quickKeys = new Set(
    a.questions
      .filter((q) => q.quickDiscovery)
      .flatMap((q) => [
        ...Object.keys(q.dimensionWeights),
        ...(q.options || []).flatMap((o) =>
          Object.keys(o.dimensionWeights || {}),
        ),
      ]),
  );
  for (const d of knownDim)
    if (!quickKeys.has(d.key)) {
      const q = a.questions.find(
        (q) => q.dimensionWeights[d.key] && !q.branchingCondition,
      );
      if (q) q.quickDiscovery = true;
    }
  const quickCount = a.questions.filter((q) => q.quickDiscovery).length;
  a.estimatedMinutesQuick = Math.max(2, Math.ceil((quickCount * 18) / 60));
  a.estimatedMinutesComplete = Math.max(
    a.estimatedMinutesQuick,
    Math.ceil(
      (a.questions.length *
        (a.slug === "intimacy-partner-preferences"
          ? 20
          : majorAssessmentSlugs.has(a.slug)
            ? 25
            : 18)) /
        60,
    ),
  );
  a.purpose = a.audienceNote;
  a.quickDescription = `${quickCount} deliberately selected questions cover the core dimensions. Useful for an initial reflection; skipped categories stay unmeasured.`;
  a.deepDescription = `${a.questions.length} questions explore the same scales across more situations. Existing equivalent quick answers are preserved when you upgrade.`;
  a.scoringNotes = [
    "Scores are normalized from each answer scale to 0–100; reverse-coded items are inverted.",
    "Each question contributes only to its declared dimensions. Weighted means exclude skipped and inactive adaptive questions.",
    "Higher means more of the named tendency or preference, never better. Archetypes require measured dimensions and their declared conditions.",
    "Quick and deep forms use the same dimensional definitions but distinct participant cohorts. History comparisons require the same test, engine, version and form.",
  ];
  if (a.questions.length === quickCount) {
    a.supportsQuickMode = false;
    a.estimatedMinutesQuick = a.estimatedMinutesComplete;
    a.quickDescription =
      "This focused reflection has one form; no redundant longer version is offered.";
  }
  return a;
}

const availabilityPrompts: Array<[string, string, boolean?]> = [
  ["openness", "I can tell someone I trust when I feel disappointed."],
  ["presence", "During a personal conversation, I can put distractions aside."],
  [
    "reciprocity",
    "I make room for another person’s needs without losing sight of my own.",
  ],
  ["repair", "After tension, I am willing to return to the conversation."],
  ["openness", "I can ask for comfort without disguising it as a complaint."],
  [
    "presence",
    "I notice when I am too depleted to listen and suggest a better time.",
  ],
  [
    "reciprocity",
    "I can receive care without feeling I must repay it immediately.",
  ],
  ["repair", "I can acknowledge my part in a misunderstanding."],
  [
    "openness",
    "I tend to hide difficult feelings even from people who have responded kindly.",
    true,
  ],
  ["presence", "I can listen to a feeling without rushing to solve it."],
  [
    "reciprocity",
    "I am interested in a partner’s inner life even when it differs from mine.",
  ],
  [
    "repair",
    "I can explain what would help me reconnect after a disagreement.",
  ],
  ["openness", "I can name uncertainty rather than pretending to be sure."],
  [
    "presence",
    "When a conversation becomes intense, I notice whether I still have capacity to engage.",
  ],
  ["reciprocity", "I can say no to a request while still showing care."],
  [
    "repair",
    "I can hear feedback about an action without treating it as a total rejection.",
  ],
  ["openness", "I can share a need before resentment builds."],
  ["presence", "I return to a conversation after taking an agreed break."],
  ["reciprocity", "I ask what support someone wants instead of assuming."],
  ["repair", "I look for a practical change after a repeated disagreement."],
  [
    "openness",
    "I can let a trusted person see that I am affected by something.",
  ],
  [
    "presence",
    "I often stay mentally elsewhere while a partner is trying to connect.",
    true,
  ],
  [
    "reciprocity",
    "I can respect that someone may need a different kind of closeness than I do.",
  ],
  [
    "repair",
    "I am willing to revise my first interpretation after hearing more context.",
  ],
];
export const emotionalAvailabilityAssessment: AssessmentDefinition = {
  id: "emotional-availability-v2",
  slug: "emotional-availability-reflection",
  version: "2.0.0",
  title: "Emotional Availability",
  shortTitle: "Emotional Availability",
  category: "romance",
  status: "published",
  audienceNote:
    "Reflect on your current capacity to share feelings, stay present, receive care and return after tension.",
  purpose:
    "Explore capacity for connection in your current context, without labelling people as available or unavailable.",
  futureExtensibilityNote: "Versioned situational self report.",
  scientificDisclaimer:
    "An exploratory self reflection, not a diagnosis or a judgment of your capacity to love. Stress, safety and context can change these patterns.",
  adultsOnly: false,
  isFeatured: true,
  estimatedMinutesQuick: 4,
  estimatedMinutesComplete: 10,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  quickDescription:
    "12 selected questions cover sharing, presence, reciprocity and repair.",
  deepDescription:
    "24 questions explore each capacity in everyday and difficult situations.",
  scoringNotes: [
    "Four equally weighted self report scales; reverse-coded items invert the normalized score. Missing answers do not become neutral observations.",
    "Archetypes require all four measured dimensions and explicit thresholds. These describe reported tendencies in this moment.",
  ],
  dimensions: [
    {
      key: "openness",
      label: "Emotional openness",
      description: "Willingness to name feelings and needs.",
      lowLabel: "More private",
      highLabel: "More expressive",
    },
    {
      key: "presence",
      label: "Attentive presence",
      description: "Capacity to engage and communicate limits.",
      lowLabel: "Less capacity right now",
      highLabel: "More capacity right now",
    },
    {
      key: "reciprocity",
      label: "Mutual care",
      description: "Giving and receiving care while respecting autonomy.",
      lowLabel: "More difficult right now",
      highLabel: "More comfortable right now",
    },
    {
      key: "repair",
      label: "Return & repair",
      description: "Willingness to revisit tension and adjust.",
      lowLabel: "More retreat",
      highLabel: "More re-engagement",
    },
  ],
  archetypes: [
    {
      id: "deep-connector",
      name: "The Deep Connector",
      tagline: "Making room for two inner worlds",
      summary:
        "You reported relative comfort with sharing, presence, mutual care and repair. Keep checking what each person has capacity for.",
      weights: { openness: 1, presence: 1, reciprocity: 1, repair: 1 },
      conditions: [
        { dimension: "openness", min: 60 },
        { dimension: "presence", min: 60 },
        { dimension: "reciprocity", min: 60 },
        { dimension: "repair", min: 60 },
      ],
    },
    {
      id: "thoughtful-partner",
      name: "The Thoughtful Partner",
      tagline: "Connection with room to grow",
      summary:
        "Your measured pattern includes a mix of comfort and effort across emotional capacities. The individual dimensions show where connection feels easier and where context may matter.",
      weights: {
        openness: 0.25,
        presence: 0.25,
        reciprocity: 0.25,
        repair: 0.25,
      },
      conditions: [
        { dimension: "openness", min: 0, max: 59 },
        { dimension: "presence", min: 0 },
        { dimension: "reciprocity", min: 0 },
        { dimension: "repair", min: 0 },
      ],
    },
  ],
  sections: [
    makeSection(
      "emotional-capacity",
      "Your capacity for connection",
      "Self reflection",
      "Consider safe, consensual relationships over the past few months. Skip what does not fit.",
    ),
  ],
  questions: availabilityPrompts.map(([dimension, prompt, reverse], i) =>
    qScale({
      id: `ea-${i + 1}`,
      order: i + 1,
      sectionId: "emotional-capacity",
      sectionTitle: "Your capacity for connection",
      prompt,
      partnerPrompt: prompt,
      helperText:
        "Rate your usual experience in relationships where you feel safe. This is about current patterns, not a fixed identity.",
      dimensionWeights: { [dimension]: 1 },
      quick: i < 12,
      reverseScored: reverse,
      branchingCondition:
        i === 20
          ? { dependsOnQuestionId: "ea-1", operator: "gte", value: 3 }
          : undefined,
      minLabel: "Strongly disagree",
      maxLabel: "Strongly agree",
      supportsBoundaryFlag: false,
    }),
  ),
};
