import type { AssessmentDefinition } from "@/lib/assessment/types";
import { makeSection, qChoice, qCuriosity, qRanking, qScale, qSlider } from "./builders";

// ===========================================================================
// TEST 29: BDSM Roles, Power Exchange & Dynamics Test (22 items)
// ===========================================================================
const bdsmSections = [
  makeSection(
    "ds-command",
    "Command, Surrender & Power Exchange",
    "Scene 1",
    "Taking charge, surrendering control, and trading dominance."
  ),
  makeSection(
    "bondage-edge",
    "Restraint, Impact & Sensation",
    "Scene 2",
    "Bondage, spanking, blindfolds, temperature contrast, and physical edge."
  ),
  makeSection(
    "roles-ritual",
    "Protocols, Tease & Switch Contrast",
    "Scene 3",
    "Praise, playful defiance, rituals, and switching roles."
  ),
  makeSection(
    "safety-aftercare",
    "Consent Guardrails & Aftercare Rituals",
    "Scene 4",
    "Limit talks, safewords, and warm aftercare afterward."
  ),
];

export const bdsmPowerDynamicsAssessment: AssessmentDefinition = {
  id: "bdsm-power-dynamics-test-v1",
  slug: "bdsm-power-dynamics-test",
  version: "1.0.0",
  title: "BDSM Roles, Power Exchange & Dynamics Test",
  shortTitle: "BDSM Roles & Dynamics",
  category: "sexuality-intimacy",
  status: "published",
  adultsOnly: true,
  isFeatured: true,
  audienceNote:
    "For adults 18+ to map Dominant, Submissive, Switch, Rigger, Impact, and Aftercare preferences.",
  futureExtensibilityNote:
    "Matches Top and Bottom polarities alongside Switch flexibility, edge intensity, and aftercare.",
  scientificDisclaimer:
    "Private preference map for consenting adults exploring BDSM dynamics. Not a clinical diagnosis.",
  estimatedMinutesQuick: 4,
  estimatedMinutesComplete: 8,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  visualizationTypes: ["blended_archetype", "radar", "personality_spectrum"],
  discoverPoints: [
    "Scores five BDSM traits: Dominant Energy, Submissive Pull, Switch Fluidity, Sensation Edge, and Protocol.",
    "Reveals whether you lean Sovereign Dominant, Devoted Surrenderer, Velvet Switch, Sensation Architect, or Equal.",
    "Matches Top energy complementarily with a partner's Submissive pull.",
  ],
  recommendedNextSlugs: [
    "kink-exploration-map",
    "dominance-submission-initiative",
    "private-fantasy-matcher",
  ],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    {
      key: "dominance_top",
      label: "Dominant & Top Energy",
      shortLabel: "Dominant / Top",
      lowLabel: "Reluctant to command",
      highLabel: "Thrives guiding & commanding",
      description:
        "Turn on from taking control, setting the pace, giving orders, and holding a partner's surrender.",
    },
    {
      key: "submission_bottom",
      label: "Submissive & Bottom Energy",
      shortLabel: "Submissive / Bottom",
      lowLabel: "Prefers steering",
      highLabel: "Craves deep surrender",
      description:
        "Heat and relief felt when yielding control, obeying firm direction, and trusting a partner to lead.",
    },
    {
      key: "switch_versatility",
      label: "Switch & Fluid Versatility",
      shortLabel: "Switch Versatility",
      lowLabel: "Fixed role preference",
      highLabel: "Loves trading roles",
      description:
        "Excitement from trading control, taking charge one night and surrendering the next.",
    },
    {
      key: "bondage_sensation",
      label: "Restraint, Impact & Sensation",
      shortLabel: "Bondage & Sensation",
      lowLabel: "Soft & unrestrained",
      highLabel: "Loves ties, bite & edge",
      description:
        "Interest in wrist cuffs, silk rope, spanking, temperature contrast, and intense sensation.",
    },
    {
      key: "protocol_aftercare",
      label: "Protocol, Safety & Aftercare",
      shortLabel: "Protocol & Aftercare",
      lowLabel: "Loose & spontaneous",
      highLabel: "Craves ritual, checks & care",
      description:
        "Importance of clear green, yellow, and red limits, praise rituals, and warm aftercare.",
    },
  ],
  archetypes: [
    {
      id: "sovereign_dominant",
      name: "The Attentive Sovereign",
      tagline: "Calm command paired with sharp focus on your partner's breathless reactions.",
      summary:
        "You thrive setting the tempo, gripping a willing wrist, and watching your partner melt because they trust your lead.",
      weights: { dominance_top: 1, protocol_aftercare: 0.7, bondage_sensation: 0.5, submission_bottom: -0.5 },
    },
    {
      id: "devoted_submissive",
      name: "The Devoted Surrenderer",
      tagline: "Quiet control melts the second a trusted voice tells you not to move.",
      summary:
        "Surrender feels electric rather than passive: being claimed, guided, praised, and held afterward unlocks your boldest side.",
      weights: { submission_bottom: 1, protocol_aftercare: 0.75, bondage_sensation: 0.5, dominance_top: -0.5 },
    },
    {
      id: "velvet_switch",
      name: "The Velvet Switch",
      tagline: "Equally thrilled tying up a partner's wrists or arching under their commanding weight.",
      summary:
        "Chemistry burns brightest when power trades hands, taking charge when bold and yielding when hunger shifts.",
      weights: { switch_versatility: 1, dominance_top: 0.65, submission_bottom: 0.65 },
    },
    {
      id: "sensation_architect",
      name: "The Sensation Architect",
      tagline: "Drawn to contrast: blindfolds, silk ties, edge control, stinging heat, and warm breath.",
      summary:
        "You love layering restraint, teasing denial, sharp impact, and sudden tenderness so every nerve wakes up.",
      weights: { bondage_sensation: 1, protocol_aftercare: 0.6, switch_versatility: 0.4 },
    },
    {
      id: "playful_equal",
      name: "The Passionate Equal",
      tagline: "Fueled by playful heat, bold teasing, and fierce urgency without strict hierarchy.",
      summary:
        "While occasional wrist pinning or spanking can spice up a night, your natural groove is equal, instinctive fire.",
      weights: { protocol_aftercare: 0.4, switch_versatility: 0.35, dominance_top: -0.45, submission_bottom: -0.45 },
    },
  ],
  sections: bdsmSections,
  questions: [
    qSlider({
      id: "bdsm_1",
      order: 1,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt: "When a bedroom scene heats up, where does your erotic hunger naturally pull?",
      partnerPrompt:
        "Where does your energy sit between taking command and surrendering control?",
      minLabel: "Craving surrender (Bottom / Sub)",
      maxLabel: "Craving command (Top / Dom)",
      helperText: "0 means full surrender, 50 means switch balance, 100 means full command.",
      dimensionWeights: { dominance_top: 1, submission_bottom: -1 },
      quick: true,
    }),
    qScale({
      id: "bdsm_2",
      order: 2,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt:
        "Telling a partner 'Hands behind your back, stay quiet unless I ask' and watching them obey sends heat straight through me.",
      partnerPrompt:
        "How strongly does giving crisp commands like 'hands behind your back' turn you on?",
      helperText: "Measures Dominant verbal authority and control.",
      dimensionWeights: { dominance_top: 1, protocol_aftercare: 0.35 },
      min: 1,
      max: 7,
      minLabel: "Not my vibe",
      maxLabel: "Deeply thrilling",
      quick: true,
    }),
    qScale({
      id: "bdsm_3",
      order: 3,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt:
        "Letting a partner pin me against the headboard and make every choice for the next hour feels deeply freeing.",
      partnerPrompt:
        "How deeply do you crave being pinned down while a trusted partner takes full charge?",
      helperText: "Measures mental release inside trusting surrender.",
      dimensionWeights: { submission_bottom: 1, bondage_sensation: 0.45 },
      min: 1,
      max: 7,
      minLabel: "Unappealing",
      maxLabel: "Pure release",
      quick: true,
    }),
    qScale({
      id: "bdsm_4",
      order: 4,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt:
        "I crave both taking over a partner fiercely and begging under their hands on a different night.",
      partnerPrompt:
        "How important is trading both commanding and surrendering roles across nights?",
      helperText: "Measures Switch flexibility across changing moods.",
      dimensionWeights: { switch_versatility: 1 },
      min: 1,
      max: 7,
      minLabel: "Strictly one side",
      maxLabel: "True Switch at heart",
      quick: true,
    }),
    qScale({
      id: "bdsm_5",
      order: 5,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt:
        "Controlling a partner's orgasm by teasing them right to the edge and deciding when they finish excites me.",
      partnerPrompt:
        "How exciting is commanding your partner's pleasure tempo and holding back their climax?",
      helperText: "Dominant edging and climax control.",
      dimensionWeights: { dominance_top: 0.95, bondage_sensation: 0.5 },
      min: 1,
      max: 7,
      quick: false,
    }),
    qScale({
      id: "bdsm_6",
      order: 6,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      prompt:
        "Having to ask nicely ('Please may I?') while breathless and tied up makes my arousal spike.",
      partnerPrompt:
        "How strongly does asking a commanding partner for permission turn you on?",
      helperText: "Verbal submission and permission rituals.",
      dimensionWeights: { submission_bottom: 0.95, protocol_aftercare: 0.6 },
      min: 1,
      max: 7,
      quick: false,
    }),
    qChoice({
      id: "bdsm_7",
      order: 7,
      sectionId: "ds-command",
      sectionTitle: "Command, Surrender & Power Exchange",
      inputType: "situational",
      prompt:
        "It is midnight, a silk blindfold rests beside the bed, and anything consensual goes tonight. Which opening move pulls you hardest?",
      partnerPrompt:
        "With a silk blindfold and an open green light tonight, which move excites you most?",
      helperText: "Reveals your instinctive role when tension rises.",
      dimensionWeights: {
        dominance_top: 1,
        submission_bottom: 1,
        switch_versatility: 1,
        bondage_sensation: 1,
      },
      options: [
        {
          value: "take_charge",
          label: "Slide the blindfold over their eyes, tie their wrists loosely, and take slow command",
          dimensionWeights: { dominance_top: 1.0, submission_bottom: 0.15, switch_versatility: 0.4, bondage_sensation: 0.95 },
        },
        {
          value: "offer_wrists",
          label: "Step closer, hold out my wrists, and whisper 'Use this tonight however you want'",
          dimensionWeights: { dominance_top: 0.15, submission_bottom: 1.0, switch_versatility: 0.4, bondage_sensation: 0.95 },
        },
        {
          value: "coin_flip",
          label: "Pin them playfully first, take control for act one, then dare them to tie me down for act two",
          dimensionWeights: { dominance_top: 0.7, submission_bottom: 0.7, switch_versatility: 1.0, bondage_sensation: 0.85 },
        },
        {
          value: "mutual_equal",
          label: "Skip restraints entirely and trade turns using just the blindfold for pure bare skin touch",
          dimensionWeights: { dominance_top: 0.3, submission_bottom: 0.3, switch_versatility: 0.55, bondage_sensation: 0.6 },
        },
      ],
      quick: true,
    }),
    qScale({
      id: "bdsm_8",
      order: 8,
      sectionId: "bondage-edge",
      sectionTitle: "Restraint, Impact & Sensation",
      prompt:
        "Physical restraint like leather cuffs, bed straps, or rope ties that hold you still turns helplessness into pure electricity.",
      partnerPrompt:
        "How exciting is physical bondage like cuffs, silk ties, or ropework inside trust?",
      helperText: "Always keep circulation safe and fast release nearby.",
      dimensionWeights: { bondage_sensation: 1.0 },
      min: 1,
      max: 7,
      minLabel: "Zero interest",
      maxLabel: "Essential turn on",
      supportsBoundaryFlag: true,
      safetySensitive: true,
      quick: true,
    }),
    qScale({
      id: "bdsm_9",
      order: 9,
      sectionId: "bondage-edge",
      sectionTitle: "Restraint, Impact & Sensation",
      prompt:
        "Sharp stinging spanks, a smooth paddle, or a flogger paired right next to soft slow touch excites me deeply.",
      partnerPrompt:
        "How curious or excited are you about consensual spanking or impact play with soft contrast?",
      helperText: "Build intensity gradually with check ins.",
      dimensionWeights: { bondage_sensation: 1.0 },
      min: 1,
      max: 7,
      supportsBoundaryFlag: true,
      safetySensitive: true,
      quick: false,
    }),
    qScale({
      id: "bdsm_10",
      order: 10,
      sectionId: "bondage-edge",
      sectionTitle: "Restraint, Impact & Sensation",
      prompt:
        "Primal urgency with hot breath on the neck, tight waist grips, and raw force hits faster than polished choreography.",
      partnerPrompt:
        "How strongly does primal grabbing and raw physical hunger ignite your arousal?",
      helperText: "Earthy passion versus formal ritual scenes.",
      dimensionWeights: { bondage_sensation: 0.85, dominance_top: 0.4, submission_bottom: 0.4 },
      min: 1,
      max: 7,
      supportsBoundaryFlag: true,
      safetySensitive: true,
      quick: false,
    }),
    qScale({
      id: "bdsm_11",
      order: 11,
      sectionId: "bondage-edge",
      sectionTitle: "Restraint, Impact & Sensation",
      prompt:
        "Sensory overload using a blackout blindfold, cool ice, and warm low heat candle wax makes every nerve surge.",
      partnerPrompt:
        "How exciting is blindfolded temperature contrast using ice or body safe wax?",
      helperText: "Use only low heat soy or paraffin body candles if trying wax.",
      dimensionWeights: { bondage_sensation: 0.95 },
      min: 1,
      max: 7,
      supportsBoundaryFlag: true,
      safetySensitive: true,
      quick: false,
    }),
    qChoice({
      id: "bdsm_12",
      order: 12,
      sectionId: "bondage-edge",
      sectionTitle: "Restraint, Impact & Sensation",
      inputType: "forced_choice",
      prompt: "Inside an intense power dynamic, which emotional tone flips your switch faster?",
      partnerPrompt: "Which dominant or submissive tone pulls you strongest?",
      helperText: "Distinguishes warm affectionate power from darker edge play.",
      dimensionWeights: {
        dominance_top: 1,
        submission_bottom: 1,
        bondage_sensation: 1,
        protocol_aftercare: 1,
      },
      options: [
        {
          value: "velvet_protect",
          label: "Confident velvet warmth with possessive claiming, adoration, and sexy praise",
          dimensionWeights: { dominance_top: 0.75, submission_bottom: 0.75, bondage_sensation: 0.65, protocol_aftercare: 1.0 },
        },
        {
          value: "intense_edge",
          label: "Stark razor edge with strict rules, blunt commands, and sharp physical intensity",
          dimensionWeights: { dominance_top: 0.9, submission_bottom: 0.9, bondage_sensation: 1.0, protocol_aftercare: 0.7 },
        },
      ],
      quick: false,
    }),
    qScale({
      id: "bdsm_13",
      order: 13,
      sectionId: "roles-ritual",
      sectionTitle: "Protocols, Tease & Switch Contrast",
      prompt:
        "Hearing or speaking possessive praise ('such a good girl', 'look how effortlessly you take that') makes me melt.",
      partnerPrompt:
        "How hot is possessive praising language during power play?",
      helperText: "Praise connects tenderness directly with hierarchy.",
      dimensionWeights: { protocol_aftercare: 0.95, submission_bottom: 0.65, dominance_top: 0.55 },
      min: 1,
      max: 7,
      quick: true,
    }),
    qScale({
      id: "bdsm_14",
      order: 14,
      sectionId: "roles-ritual",
      sectionTitle: "Protocols, Tease & Switch Contrast",
      prompt:
        "Playful bratty teasing, smirking back just to make a Dominant partner pin me down and tame me, shoots tension through the roof.",
      partnerPrompt:
        "How much do you enjoy playful brat and tamer pushback during a scene?",
      helperText: "Playful defiance compared with smooth obedience.",
      dimensionWeights: { switch_versatility: 0.85, submission_bottom: 0.6, dominance_top: 0.6 },
      min: 1,
      max: 7,
      quick: false,
    }),
    qScale({
      id: "bdsm_15",
      order: 15,
      sectionId: "roles-ritual",
      sectionTitle: "Protocols, Tease & Switch Contrast",
      prompt:
        "Indoors rituals like wearing a discreet collar, kneeling by the bed, or serving quietly deepen the heat.",
      partnerPrompt:
        "How exciting are symbolic protocols like wearing a collar or kneeling indoors?",
      helperText: "Rituals can stay light and playful or carry deeper devotion.",
      dimensionWeights: { protocol_aftercare: 0.9, submission_bottom: 0.7, dominance_top: 0.7 },
      min: 1,
      max: 7,
      quick: false,
    }),
    qScale({
      id: "bdsm_16",
      order: 16,
      sectionId: "roles-ritual",
      sectionTitle: "Protocols, Tease & Switch Contrast",
      prompt:
        "Even when exploring strict command fantasies, harsh insults or degradation stay firmly off limits for me.",
      partnerPrompt:
        "How strictly do you avoid humiliation or insults in favor of uplifting power dynamics?",
      helperText: "Separates sensual power exchange from verbal degradation.",
      dimensionWeights: { protocol_aftercare: 0.8 },
      supportsBoundaryFlag: true,
      quick: false,
    }),
    qScale({
      id: "bdsm_17",
      order: 17,
      sectionId: "roles-ritual",
      sectionTitle: "Protocols, Tease & Switch Contrast",
      prompt:
        "Stepping into a Service Top role and using hands, mouth, and toys purely to make a partner fall apart feels intoxicating.",
      partnerPrompt:
        "How rewarding is using Dominant control to engineer waves of pleasure for your partner?",
      helperText: "Pleasure focused Dominant energy.",
      dimensionWeights: { dominance_top: 0.95, switch_versatility: 0.5 },
      min: 1,
      max: 7,
      quick: false,
    }),
    qScale({
      id: "bdsm_18",
      order: 18,
      sectionId: "safety-aftercare",
      sectionTitle: "Consent Guardrails & Aftercare Rituals",
      prompt:
        "Talking clear over green, yellow, and red limits beforehand actually builds excitement instead of killing the mood.",
      partnerPrompt:
        "How much does upfront limit talk increase boldness once the scene begins?",
      helperText: "Clear guardrails let both people push further with total trust.",
      dimensionWeights: { protocol_aftercare: 1.0 },
      min: 1,
      max: 7,
      quick: true,
    }),
    qScale({
      id: "bdsm_19",
      order: 19,
      sectionId: "safety-aftercare",
      sectionTitle: "Consent Guardrails & Aftercare Rituals",
      prompt:
        "Using a clear traffic light safeword ('Green' for more, 'Yellow' to slow down, 'Red' to stop now) is essential.",
      partnerPrompt:
        "How vital is agreeing on a clear safeword or tap signal before intense scenes?",
      helperText: "Every healthy kink scene relies on instant pause signals.",
      dimensionWeights: { protocol_aftercare: 1.0 },
      supportsBoundaryFlag: true,
      min: 1,
      max: 7,
      quick: false,
    }),
    qRanking({
      id: "bdsm_20",
      order: 20,
      sectionId: "safety-aftercare",
      sectionTitle: "Consent Guardrails & Aftercare Rituals",
      prompt: "Rank what makes an intense BDSM night truly unforgettable from #1 to #5:",
      helperText: "Drag or move your #1 priority to the very top.",
      dimensionWeights: {
        dominance_top: 1,
        submission_bottom: 1,
        switch_versatility: 1,
        bondage_sensation: 1,
        protocol_aftercare: 1,
      },
      options: [
        {
          value: "command_control",
          label: "Holding confident charge, directing pace, and reading every gasp",
          dimensionWeights: { dominance_top: 1 },
        },
        {
          value: "deep_surrender",
          label: "Dropping every decision and surrendering safely in trusted hands",
          dimensionWeights: { submission_bottom: 1 },
        },
        {
          value: "role_flip",
          label: "Trading control and flipping roles cleanly mid evening",
          dimensionWeights: { switch_versatility: 1 },
        },
        {
          value: "sensory_edge",
          label: "Physical edge with ropes, blindfolds, stinging spanks, and hot or cold tease",
          dimensionWeights: { bondage_sensation: 1 },
        },
        {
          value: "safe_aftercare",
          label: "Ironclad trust, unhurried debriefing, water, blankets, and warm cuddling afterward",
          dimensionWeights: { protocol_aftercare: 1 },
        },
      ],
      quick: false,
    }),
    qScale({
      id: "bdsm_21",
      order: 21,
      sectionId: "safety-aftercare",
      sectionTitle: "Consent Guardrails & Aftercare Rituals",
      prompt:
        "Unhurried aftercare with slow untying, soft kisses on flushed skin, heavy blankets, and close holding matters deeply.",
      partnerPrompt:
        "How vital is caring aftercare for both Top and Bottom once a wild scene settles?",
      helperText: "Both partners need gentle grounding after intense adrenaline.",
      dimensionWeights: { protocol_aftercare: 1.0 },
      min: 1,
      max: 7,
      quick: true,
    }),
    qScale({
      id: "bdsm_22",
      order: 22,
      sectionId: "safety-aftercare",
      sectionTitle: "Consent Guardrails & Aftercare Rituals",
      prompt:
        "A warm text the next afternoon ('Still thinking about last night, how are you feeling?') builds lasting trust.",
      partnerPrompt:
        "How thoughtful does a gentle next day check in feel after heavy kink play?",
      helperText: "Checking in the next day prevents post scene drop.",
      dimensionWeights: { protocol_aftercare: 0.95 },
      min: 1,
      max: 7,
      quick: false,
    }),
  ],
};

// ===========================================================================
// TEST 30: Kink & Fetish Exploration Map (24 items — STRICT mutual reveal)
// ===========================================================================
const kinkSections = [
  makeSection(
    "restraint-bondage",
    "Silk Restraints & Bondage",
    "Deck 1",
    "Soft scarf ties, wrist cuffs, rope harnesses, and pinned helplessness."
  ),
  makeSection(
    "impact-sensation",
    "Impact, Temperature & Bite",
    "Deck 2",
    "Spanking, paddles, ice and wax contrast, primal biting, and skin heat."
  ),
  makeSection(
    "roleplay-taboo",
    "Roleplay, Personas & Scene Heat",
    "Deck 3",
    "Secret personas, strict mentors, hotel strangers, and taboo scenes."
  ),
  makeSection(
    "exhibition-watching",
    "Mirrors, Thrills & Visual Heat",
    "Deck 4",
    "Bedside mirrors, daring hidden lingerie out at dinner, and private filming."
  ),
  makeSection(
    "praise-control",
    "Orgasm Control, Edging & Orders",
    "Deck 5",
    "Denial countdowns, overstimulation tease, begging to finish, and verbal command."
  ),
  makeSection(
    "sensory-textures",
    "Sensory Deprivation & Fetish Textures",
    "Deck 6",
    "Blindfolds, collars, fetish leather or lace, and sharp contrast touch."
  ),
];

const kinkItems: Array<[string, string, string, string, Record<string, number>, boolean, boolean?]> = [
  // 1. restraint-bondage
  [
    "kink_silk_cuffs",
    "restraint-bondage",
    "Securing wrists softly to the bedpost with satin ties or padded cuffs while kissing slowly downward",
    "Light romantic restraint with quick release.",
    { restraint_bondage: 1, sensory_textures: 0.4 },
    true,
    true,
  ],
  [
    "kink_shibari_rope",
    "restraint-bondage",
    "Artful shibari rope harnesses tied across chest and hips for weight, tension, and visual heat",
    "Decorative rope bondage with knot safety awareness.",
    { restraint_bondage: 1, sensory_textures: 0.6 },
    true,
    true,
  ],
  [
    "kink_spread_anchor",
    "restraint-bondage",
    "An under mattress anchor holding ankles and wrists wide open for unhurried full body teasing",
    "Deep open vulnerability built around playful control.",
    { restraint_bondage: 1, praise_control: 0.5 },
    false,
    true,
  ],
  [
    "kink_pinned_grip",
    "restraint-bondage",
    "Using bare body weight and one firm grip pinning both wrists above your head instead of gear",
    "Skin to skin restraint driven by raw urgency.",
    { restraint_bondage: 0.9, impact_sensation: 0.5 },
    false,
    true,
  ],
  // 2. impact-sensation
  [
    "kink_open_spank",
    "impact-sensation",
    "Warming up with firm, rhythmic open hand spanking mixed between kissing and hip grinding",
    "Classic spanking progression mixing sting and heat.",
    { impact_sensation: 1, praise_control: 0.4 },
    true,
    true,
  ],
  [
    "kink_paddle_crop",
    "impact-sensation",
    "Trading strokes with a smooth leather paddle, riding crop, or suede flogger brushed playfully across skin first",
    "Impact tool variety under clear safeword pacing.",
    { impact_sensation: 1, sensory_textures: 0.5 },
    false,
    true,
  ],
  [
    "kink_wax_ice",
    "impact-sensation",
    "Dripping warm body safe candle wax followed right after by an ice cube gliding across flushed skin",
    "High contrast hot and cold arousal play.",
    { impact_sensation: 0.9, sensory_textures: 0.9 },
    true,
    true,
  ],
  [
    "kink_primal_marks",
    "impact-sensation",
    "Breathless neck biting, nail trails down the back, and firm hip grips leaving light reminders tomorrow",
    "Primal edge rooted in clear mark limits.",
    { impact_sensation: 1 },
    false,
    true,
  ],
  // 3. roleplay-taboo
  [
    "kink_stranger_pick",
    "roleplay-taboo",
    "Meeting separately at a hotel bar, slipping room keys quietly over drinks, and flirting like strangers",
    "Exciting stranger persona roleplay.",
    { roleplay_taboo: 1, exhibition_watching: 0.4 },
    true,
  ],
  [
    "kink_power_persona",
    "roleplay-taboo",
    "Strict mentor, demanding boss, or muse fantasy where unspoken tension finally snaps behind locked doors",
    "Playful authority hierarchy inside make believe.",
    { roleplay_taboo: 1, praise_control: 0.6 },
    true,
  ],
  [
    "kink_captive_rescue",
    "roleplay-taboo",
    "Dramatic 'hands on the doorframe, do not turn around' consensual chase and capture scene",
    "Pre agreed ravishment fantasy with strict green, yellow, and red cues.",
    { roleplay_taboo: 1, restraint_bondage: 0.7 },
    false,
    true,
  ],
  [
    "kink_scripted_taboo",
    "roleplay-taboo",
    "Texting a secret forbidden affair storyline back and forth all afternoon, then playing every beat tonight",
    "Daytime scripted fantasy tension.",
    { roleplay_taboo: 1, praise_control: 0.5 },
    false,
  ],
  // 4. exhibition-watching
  [
    "kink_mirror_angle",
    "exhibition-watching",
    "Low lit bedside mirror placed close enough to watch every arch, expression, and hand slide in real time",
    "Visual intimacy amplifying shared heat.",
    { exhibition_watching: 1, sensory_textures: 0.4 },
    true,
  ],
  [
    "kink_secret_dinner",
    "exhibition-watching",
    "Wearing lacy lingerie or subtle vibrating wear underneath formal dinner outfits in a crowded restaurant",
    "Private thrill hidden in plain sight.",
    { exhibition_watching: 1, roleplay_taboo: 0.5 },
    true,
    true,
  ],
  [
    "kink_private_film",
    "exhibition-watching",
    "Filming a moody encrypted clip or silhouette photo kept strictly locked between just the two of you",
    "Requires strict mutual trust and shared deletion rules.",
    { exhibition_watching: 1 },
    false,
    true,
  ],
  [
    "kink_mutual_solo",
    "exhibition-watching",
    "Watching each other undress and touch yourselves inch by inch without helping until begging breaks the rule",
    "Eye locked voyeur and exhibition tease.",
    { exhibition_watching: 1, praise_control: 0.7 },
    false,
  ],
  // 5. praise-control
  [
    "kink_edging_denial",
    "praise-control",
    "Bringing a partner right to the edge twice, pulling back completely, and whispering 'not yet'",
    "Orgasm delay and teasing tension.",
    { praise_control: 1, restraint_bondage: 0.4 },
    true,
  ],
  [
    "kink_overstim_tease",
    "praise-control",
    "Holding thighs gently still for thrilling extra seconds of teasing touch right through climax waves",
    "Controlled post peak sensitivity play with clear safewords.",
    { praise_control: 1, impact_sensation: 0.5 },
    false,
    true,
  ],
  [
    "kink_vocal_ownership",
    "praise-control",
    "Deep praise mixed with unapologetic claiming ('Right here, say thank you', 'Tell me how badly you want it')",
    "Blends adoration with bold command.",
    { praise_control: 1, roleplay_taboo: 0.4 },
    true,
  ],
  [
    "kink_ask_to_finish",
    "praise-control",
    "Looking your partner straight in the eyes and asking out loud for permission before letting yourself come",
    "Intense focus and verbal devotion.",
    { praise_control: 1 },
    false,
  ],
  // 6. sensory-textures
  [
    "kink_sensory_blackout",
    "sensory-textures",
    "Blackout eye mask plus soft music in earbuds so every blind graze of lips or fingertips hits twice as hard",
    "Sensory deprivation without heavy restraints.",
    { sensory_textures: 1, restraint_bondage: 0.5 },
    true,
  ],
  [
    "kink_collar_leash",
    "sensory-textures",
    "Clipping a supple leather collar around your partner's neck and leading them across the bedroom by the ring",
    "Classic BDSM symbol of focus, claim, and trust.",
    { sensory_textures: 1, praise_control: 0.6 },
    true,
    true,
  ],
  [
    "kink_fetish_fabric",
    "sensory-textures",
    "Dressing in bold fetish textures like glossy latex, fitted leather harnesses, sheer lace, or slick oil",
    "Wardrobe texture and visual fetish play.",
    { sensory_textures: 1, exhibition_watching: 0.5 },
    false,
  ],
  [
    "kink_pinwheel_feather",
    "sensory-textures",
    "Rolling a cold spiky pinwheel slowly down the spine right before soothing the same track with silk or warm lips",
    "Sharp sensory contrast from prickle to velvet relief.",
    { sensory_textures: 1, impact_sensation: 0.6 },
    false,
  ],
];

export const kinkExplorationMapAssessment: AssessmentDefinition = {
  id: "kink-exploration-map-v1",
  slug: "kink-exploration-map",
  version: "1.0.0",
  title: "Kink & Fetish Exploration Map",
  shortTitle: "Kink Exploration",
  category: "sexuality-intimacy",
  status: "published",
  adultsOnly: true,
  isFeatured: true,
  isCouplesFocused: true,
  audienceNote:
    "For adults 18+ to privately sort 24 curated kinks with Zero Exposure reveal controls.",
  futureExtensibilityNote:
    "Builds a Mutual Kink Matchboard that reveals only overlapping choices and openly shared items.",
  scientificDisclaimer:
    "Consent first adult kink checklist. Unmatched confidential items stay hidden from partners.",
  estimatedMinutesQuick: 4,
  estimatedMinutesComplete: 8,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "fantasy_mutual",
  compatibilityStrategy: "fantasy_mutual_reveal",
  visualizationTypes: ["mutual_match_matrix", "curiosity_map", "radar"],
  discoverPoints: [
    "Maps your heat across Bondage, Impact & Wax, Taboo Roleplay, Exhibition, Orgasm Control, and Sensory Fetishes.",
    "Per item privacy controls keep unmatched picks or hard limits completely shielded from a partner.",
  ],
  recommendedNextSlugs: [
    "bdsm-power-dynamics-test",
    "private-fantasy-matcher",
    "sexual-interests-curiosity-map",
  ],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    {
      key: "restraint_bondage",
      label: "Restraint & Bondage",
      description: "Silk cuffs, rope harnesses, four point anchors, and physical pinning.",
    },
    {
      key: "impact_sensation",
      label: "Impact, Wax & Bite",
      description: "Spanking, paddles, warm wax and ice contrast, and primal intensity.",
    },
    {
      key: "roleplay_taboo",
      label: "Roleplay & Taboo Tension",
      description: "Hotel strangers, authority personas, and consensual capture scenes.",
    },
    {
      key: "exhibition_watching",
      label: "Mirrors & Exhibition",
      description: "Mirror angles, hidden date lingerie, watching, and private filming.",
    },
    {
      key: "praise_control",
      label: "Orgasm Control & Praise",
      description: "Edging countdowns, overstimulation tease, asking permission, and vocal claim.",
    },
    {
      key: "sensory_textures",
      label: "Sensory & Fetish Gear",
      description: "Sensory blackout, leather collars, fetish textures, and pinwheel contrasts.",
    },
  ],
  sections: kinkSections,
  questions: kinkItems.map(([id, sectionId, prompt, helper, weights, quick, safety], idx) => {
    const sec = kinkSections.find((s) => s.id === sectionId)!;
    return qCuriosity({
      id,
      order: idx + 1,
      sectionId,
      sectionTitle: sec.title,
      prompt,
      helperText: helper,
      dimensionWeights: weights,
      supportsRevealRule: true,
      safetySensitive: Boolean(safety),
      quick,
    });
  }),
};

export const categoryABdsmKinkAssessments: AssessmentDefinition[] = [
  bdsmPowerDynamicsAssessment,
  kinkExplorationMapAssessment,
];
