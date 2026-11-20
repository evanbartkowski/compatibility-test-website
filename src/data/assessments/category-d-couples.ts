import type { AssessmentDefinition } from "@/lib/assessment/types";
import { makeSection, qChoice, qCuriosity, qScale } from "./builders";

// ===========================================================================
// TEST 23: How Well Do You Know Your Partner? (12 partner prediction trivia items)
// ===========================================================================
const test23Sections = [
  makeSection("daily-favorites", "Everyday Joys & Comforts", "Round 1", "Mornings, favorite treats, and easy relaxation."),
  makeSection("stress-soothing", "Stress, Pet Peeves & Recharging", "Round 2", "What drains you and what helps you reset."),
  makeSection("romance-dreams", "Affection & Secret Dreams", "Round 3", "Romantic surprises and favorite touches."),
];

const triviaItems: Array<{
  id: string;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt: string;
  helper: string;
  quick: boolean;
  weights: Record<string, number>;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    id: "kp_1", sectionId: "daily-favorites", sectionTitle: "Everyday Joys & Comforts", quick: true,
    prompt: "On an unhurried Sunday morning with no alarm, what makes me happiest first?",
    partnerPrompt: "Guess your partner's answer: On an unhurried Sunday morning, what makes them happiest first?",
    helper: "Partner predicts your favorite morning vibe.",
    weights: { everyday_knowledge: 1 },
    options: [
      { value: "lingering_coffee", label: "Warm coffee or tea lingering quietly in bed before getting dressed" },
      { value: "bakery_walk", label: "Stepping out early for fresh pastries and an outdoor walk" },
      { value: "big_breakfast", label: "Music playing while cooking a big relaxed brunch together" },
      { value: "solo_scroll", label: "A quiet hour alone with a book or shows before talking" },
    ],
  },
  {
    id: "kp_2", sectionId: "daily-favorites", sectionTitle: "Everyday Joys & Comforts", quick: true,
    prompt: "Which small surprise treat makes me smile most when I get home after a long day?",
    partnerPrompt: "Guess your partner's answer: Which small surprise treat makes them smile most after work?",
    helper: "Everyday thoughtfulness check.",
    weights: { everyday_knowledge: 1 },
    options: [
      { value: "fav_drink", label: "My exact favorite coffee, tea, or cold drink handed to me silently" },
      { value: "snack_craving", label: "Chocolate, bakery sweet, or favorite savory snack I ran out of" },
      { value: "fresh_flowers", label: "Fresh flowers, a handwritten sticky note, or a small plant" },
      { value: "chore_done", label: "Seeing an annoying errand or sink full of dishes already cleared" },
    ],
  },
  {
    id: "kp_3", sectionId: "daily-favorites", sectionTitle: "Everyday Joys & Comforts", quick: true,
    prompt: "When picking a comfort movie on takeout night, which genre wins first?",
    partnerPrompt: "Guess your partner's favorite comfort watch genre:",
    helper: "Cozy movie taste.",
    weights: { everyday_knowledge: 1 },
    options: [
      { value: "comedy_warm", label: "Smart comedy or heartfelt uplifting ensemble film" },
      { value: "mystery_thriller", label: "Gripping mystery, crime doc, or sharp psychological thriller" },
      { value: "scifi_fantasy", label: "Rich science fiction, fantasy, or sweeping historical drama" },
      { value: "romance_indie", label: "Warm romance or character centered independent film" },
    ],
  },
  {
    id: "kp_4", sectionId: "daily-favorites", sectionTitle: "Everyday Joys & Comforts", quick: true,
    prompt: "What time of day is my social energy and humor naturally at its peak?",
    partnerPrompt: "Guess when your partner's social energy and humor peak:",
    helper: "Natural daily energy clock.",
    weights: { everyday_knowledge: 1 },
    options: [
      { value: "early_bird", label: "Bright crisp mornings between 8 AM and 11 AM" },
      { value: "midday", label: "Steady afternoon momentum between 1 PM and 4 PM" },
      { value: "evening_glow", label: "Cozy golden hour and dinner evenings between 6 PM and 9 PM" },
      { value: "night_owl", label: "Late night second wind after 9:30 PM" },
    ],
  },
  {
    id: "kp_5", sectionId: "stress-soothing", sectionTitle: "Stress, Pet Peeves & Recharging", quick: true,
    prompt: "When I feel overwhelmed after an awful day, what genuinely calms me fastest?",
    partnerPrompt: "Guess what genuinely calms your partner fastest on an awful day:",
    helper: "How to comfort me right.",
    weights: { emotional_tuning: 1 },
    options: [
      { value: "silent_hold", label: "Just hold me quietly for five full minutes with zero advice yet" },
      { value: "vent_listen", label: "Let me vent uninterrupted while nodding completely on my side" },
      { value: "laugh_distract", label: "Crack a gentle joke, grab comfort food, and take my mind right off it" },
      { value: "quiet_alone", label: "Give me 30 peaceful minutes alone to unwind, then hug warmly" },
    ],
  },
  {
    id: "kp_6", sectionId: "stress-soothing", sectionTitle: "Stress, Pet Peeves & Recharging", quick: true,
    prompt: "Which tiny everyday habit irritates me faster than I usually admit out loud?",
    partnerPrompt: "Guess which everyday habit silently annoys your partner most:",
    helper: "Playful pet peeve check.",
    weights: { emotional_tuning: 1 },
    options: [
      { value: "running_late", label: "Running late or vague last minute schedule changes" },
      { value: "clutter", label: "Kitchen or table clutter piling up and things left out" },
      { value: "interrupted", label: "Being interrupted mid story or scrolling phones during dinner" },
      { value: "noise_rush", label: "Loud rushing first thing in the morning before I wake up" },
    ],
  },
  {
    id: "kp_7", sectionId: "stress-soothing", sectionTitle: "Stress, Pet Peeves & Recharging", quick: false,
    prompt: "After an intense social weekend with big groups, how do I secretly recharge?",
    partnerPrompt: "Guess how your partner recharges after heavy socializing:",
    helper: "Social battery reset.",
    weights: { emotional_tuning: 1 },
    options: [
      { value: "deep_silence", label: "Total quiet at home in comfy clothes doing zero talking for an afternoon" },
      { value: "two_person", label: "Curled up just the two of us watching comfort TV and ordering delivery" },
      { value: "movement_out", label: "A long solo run, gym sweat, or brisk nature walk with headphones" },
      { value: "still_buzzing", label: "Still energized and happy to plan another relaxed hang soon" },
    ],
  },
  {
    id: "kp_8", sectionId: "stress-soothing", sectionTitle: "Stress, Pet Peeves & Recharging", quick: false,
    prompt: "When I apologize after a misunderstanding, how can you tell I mean it most deeply?",
    partnerPrompt: "Guess your partner's sincerest apology style:",
    helper: "Apology signal recognition.",
    weights: { emotional_tuning: 1 },
    options: [
      { value: "verbal_own", label: "Naming plainly what I misunderstood and saying sorry directly" },
      { value: "physical_pull", label: "Softening physically, reaching for a long hug, and asking to reset" },
      { value: "fix_action", label: "Quietly doing something thoughtful right afterward to repair" },
      { value: "written_thought", label: "Following up later with a thoughtful text or note once settled" },
    ],
  },
  {
    id: "kp_9", sectionId: "romance-dreams", sectionTitle: "Affection & Secret Dreams", quick: true,
    prompt: "Out of these four compliments, which one hits deepest for me?",
    partnerPrompt: "Guess which compliment hits deepest for your partner:",
    helper: "Favorite kind of praise.",
    weights: { romantic_tuning: 1 },
    options: [
      { value: "safe_peace", label: "'Being next to you makes my whole life feel calm and lucky.'" },
      { value: "attractive_crave", label: "'I genuinely cannot keep my eyes or hands off you.'" },
      { value: "proud_mind", label: "'I admire how your mind works and how deeply you care.'" },
      { value: "laugh_joy", label: "'You make literally every boring day funnier with you in it.'" },
    ],
  },
  {
    id: "kp_10", sectionId: "romance-dreams", sectionTitle: "Affection & Secret Dreams", quick: true,
    prompt: "If you planned a surprise getaway weekend strictly for my soul, where are we waking up?",
    partnerPrompt: "Guess your partner's dream surprise weekend destination:",
    helper: "Dream escape intuition.",
    weights: { romantic_tuning: 1 },
    options: [
      { value: "cozy_cabin", label: "Woodsy cabin with fireplace, porch coffee, and misty hiking trails" },
      { value: "coastal_salt", label: "Breezy oceanfront boutique inn with late walks on the sand" },
      { value: "city_arts", label: "Walkable lively city with boutique hotels, wine bars, and museums" },
      { value: "wellness_villa", label: "Warm spa sanctuary with pools, massages, and sunny lounge chairs" },
    ],
  },
  {
    id: "kp_11", sectionId: "romance-dreams", sectionTitle: "Affection & Secret Dreams", quick: false,
    prompt: "Which everyday physical touch from you gives me an instant rush every single time?",
    partnerPrompt: "Guess which everyday touch gives your partner an instant rush:",
    helper: "Everyday affection favorite.",
    weights: { romantic_tuning: 1 },
    options: [
      { value: "hair_scalp", label: "Slow fingers through my hair or scratching my neck while watching TV" },
      { value: "back_hug", label: "Warm arms wrapping around my waist unexpectedly from behind in the kitchen" },
      { value: "cheek_face", label: "Gentle hand cupping my cheek or thumb stroking my hand" },
      { value: "shoulder_squeeze", label: "Firm shoulder massage right when tension builds" },
    ],
  },
  {
    id: "kp_12", sectionId: "romance-dreams", sectionTitle: "Affection & Secret Dreams", quick: false,
    prompt: "Which celebration milestone matters more to me than most people realize?",
    partnerPrompt: "Guess which milestone matters more to your partner:",
    helper: "Celebration tuning.",
    weights: { romantic_tuning: 1 },
    options: [
      { value: "birthday_week", label: "Making my birthday feel deeply personal and thoughtfully planned" },
      { value: "our_anniversary", label: "Marking our relationship anniversary creatively each year" },
      { value: "small_wins", label: "Toasting sudden career, personal, or quiet life wins on random Tuesdays" },
      { value: "cozy_seasonal", label: "Seasonal holiday traditions like autumn markets and New Year reflections" },
    ],
  },
];

export const howWellKnowPartnerAssessment: AssessmentDefinition = {
  id: "how-well-do-you-know-your-partner-v1",
  slug: "how-well-do-you-know-your-partner",
  version: "1.0.0",
  title: "How Well Do You Know Your Partner?",
  shortTitle: "Partner Trivia",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  isCouplesFocused: true,
  audienceNote: "Answer about yourself first, then invite your partner to guess every pick and see your exact accuracy.",
  futureExtensibilityNote: "Compares self ground truth against partner guesses.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 5,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: false,
  scoringStrategy: "prediction_accuracy",
  compatibilityStrategy: "prediction_game",
  visualizationTypes: ["prediction_reveal", "radar"],
  discoverPoints: [
    "Exact accuracy % across Everyday Joys, Stress Soothing, and Romantic Dreams.",
    "Fun Surprises highlight list showing hidden preferences.",
  ],
  recommendedNextSlugs: ["who-is-more-likely-to", "couples-bucket-list-matcher", "love-affection-preferences"],
  supportedExports: ["pdf", "json", "share_card"],
  dimensions: [
    { key: "everyday_knowledge", label: "Everyday Comforts", description: "Morning pace, treats, and easy relaxation." },
    { key: "emotional_tuning", label: "Stress & Apology Tuning", description: "How you unwind, handle annoyance, and make up." },
    { key: "romantic_tuning", label: "Affection & Escape Dreams", description: "Favorite compliments, touch shortcuts, and dream trips." },
  ],
  sections: test23Sections,
  questions: triviaItems.map((it, idx) =>
    qChoice({
      id: it.id,
      order: idx + 1,
      sectionId: it.sectionId,
      sectionTitle: it.sectionTitle,
      inputType: "partner_prediction",
      prompt: it.prompt,
      partnerPrompt: it.partnerPrompt,
      helperText: it.helper,
      quick: it.quick,
      dimensionWeights: it.weights,
      options: it.options.map((o) => ({
        ...o,
        dimensionWeights: {
          everyday_knowledge: 0.75,
          emotional_tuning: 0.75,
          romantic_tuning: 0.75,
        },
      })),
    })
  ),
};

// ===========================================================================
// TEST 24: Long Term Relationship Compatibility (16 items)
// ===========================================================================
export const longTermCompatibilityAssessment: AssessmentDefinition = {
  id: "long-term-relationship-compatibility-v1",
  slug: "long-term-relationship-compatibility",
  version: "1.0.0",
  title: "Long Term Relationship Compatibility",
  shortTitle: "Long Term Alignment",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  isCouplesFocused: true,
  audienceNote: "Check alignment on money, household fairness, family boundaries, and shared future plans.",
  futureExtensibilityNote: "Surfaces future lifestyle friction early while habits feel easy to align.",
  estimatedMinutesQuick: 4,
  estimatedMinutesComplete: 7,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "values_alignment",
  visualizationTypes: ["radar", "couple_align_diff"],
  discoverPoints: [
    "Scores Money Rhythm, Household Teamwork, Extended Family Boundaries, and Future Vision.",
  ],
  recommendedNextSlugs: ["relationship-dealbreakers-boundaries", "couples-communication-conflict-matching", "your-hidden-relationship-priorities"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "financial_philosophy", label: "Money & Security Rhythm", description: "Shared bills, saving habits, and spending styles." },
    { key: "domestic_teamwork", label: "Household & Work Balance", description: "Fair chore standards and protecting couple time." },
    { key: "social_kin_boundaries", label: "Extended Family & Friends", description: "Holidays, unannounced visits, and personal friendships." },
    { key: "future_trajectory", label: "Long Term Vision", description: "Home setting, mobility, and keeping passion alive." },
  ],
  sections: [
    makeSection("money-chores", "Money & Daily Partnership", "Pillar 1", "Money habits and fair housework."),
    makeSection("future-family", "Family, Lifestyle & Future Path", "Pillar 2", "Family limits and where life takes you."),
  ],
  questions: [
    qScale({ id: "lt_1", order: 1, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Sharing core bills openly while keeping modest personal spending money feels healthiest.", helperText: "Hybrid shared plus personal money style.", dimensionWeights: { financial_philosophy: 1 } }),
    qScale({ id: "lt_2", order: 2, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Building a solid six month emergency fund comes well before luxury upgrades.", helperText: "Safety first versus lifestyle spending.", dimensionWeights: { financial_philosophy: 1 } }),
    qScale({ id: "lt_3", order: 3, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Major purchases over an agreed amount like $250 should always be talked over beforehand.", helperText: "Shared spending communication.", dimensionWeights: { financial_philosophy: 0.9 } }),
    qScale({ id: "lt_4", order: 4, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Sharing household planning cleanly like groceries and bills matters so neither person acts as manager.", helperText: "Fair mental load sharing.", dimensionWeights: { domestic_teamwork: 1 } }),
    qScale({ id: "lt_5", order: 5, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "I relax best in tidy common rooms rather than leaving dirty dishes overnight.", helperText: "Daily cleanliness baseline.", dimensionWeights: { domestic_teamwork: 0.9 } }),
    qScale({ id: "lt_6", order: 6, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Career drive is great as long as work rarely swallows weekends and dinners.", helperText: "Work and life boundary.", dimensionWeights: { domestic_teamwork: 0.9, future_trajectory: 0.6 } }),
    qScale({ id: "lt_7", order: 7, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Extended family should always ask before visiting rather than dropping by unannounced.", helperText: "Home privacy boundary.", dimensionWeights: { social_kin_boundaries: 1 } }),
    qScale({ id: "lt_8", order: 8, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Rotating holidays fairly or creating our own traditions feels better than mandatory travel guilt.", helperText: "Holiday planning freedom.", dimensionWeights: { social_kin_boundaries: 1 } }),
    qScale({ id: "lt_9", order: 9, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Keeping close personal friendships outside the relationship makes us happier partners.", helperText: "Independent social life.", dimensionWeights: { social_kin_boundaries: 0.9 } }),
    qScale({ id: "lt_10", order: 10, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Walkable lively neighborhoods appeal to me more long term than quiet countryside.", helperText: "Preferred home setting.", dimensionWeights: { future_trajectory: 0.9 }, quick: false }),
    qScale({ id: "lt_11", order: 11, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Keeping romance and sex intentionally exciting matters just as much in year ten as year one.", helperText: "Long term passion focus.", dimensionWeights: { future_trajectory: 1 } }),
    qScale({ id: "lt_12", order: 12, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Moving to a new city or country together sounds exciting if we both feel ready.", helperText: "Willingness to relocate.", dimensionWeights: { future_trajectory: 0.85 }, quick: false }),
    qScale({ id: "lt_13", order: 13, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Doing honest relationship check ins every few months helps keep small issues small.", helperText: "Intentional check ins.", dimensionWeights: { future_trajectory: 0.95 }, quick: false }),
    qScale({ id: "lt_14", order: 14, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "Paying occasionally for cleaning or grocery help when affordable makes sense to buy back couple time.", helperText: "Using money to save time.", dimensionWeights: { financial_philosophy: 0.6, domestic_teamwork: 0.8 }, quick: false }),
    qScale({ id: "lt_15", order: 15, sectionId: "future-family", sectionTitle: "Family, Lifestyle & Future Path", prompt: "Agreeing calmly on phone free couple time each evening protects real closeness.", helperText: "Undivided evening presence.", dimensionWeights: { future_trajectory: 0.9 }, quick: false }),
    qScale({ id: "lt_16", order: 16, sectionId: "money-chores", sectionTitle: "Money & Daily Partnership", prompt: "If one partner earns less for a season, supporting each other without keeping score matters deeply.", helperText: "Teamwork during income shifts.", dimensionWeights: { financial_philosophy: 0.95, domestic_teamwork: 0.8 }, quick: false }),
  ],
};

// ===========================================================================
// TEST 25: Couples Communication & Conflict Matching (14 items)
// ===========================================================================
export const couplesCommunicationMatchingAssessment: AssessmentDefinition = {
  id: "couples-communication-conflict-matching-v1",
  slug: "couples-communication-conflict-matching",
  version: "1.0.0",
  title: "Couples Communication & Conflict Matching",
  shortTitle: "Couples Conflict Match",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isCouplesFocused: true,
  audienceNote: "Compare how you bring up tough topics, take space, and reconnect so arguments turn into trust.",
  futureExtensibilityNote: "Contrasts talk now vs pause 20 mins timing needs cleanly.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 5,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  visualizationTypes: ["radar", "couple_align_diff"],
  discoverPoints: [
    "Highlights timing differences so one partner does not chase while the other shuts down.",
  ],
  recommendedNextSlugs: ["conflict-communication-personality", "emotional-support-compatibility", "attachment-style-discovery"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "timing_immediacy", label: "Immediate Discussion Drive", description: "Talking things out right away vs cooling off briefly." },
    { key: "soft_startup", label: "Gentle Opening Style", description: "Bringing up hard topics calmly without blame." },
    { key: "apology_expectations", label: "Explicit Apology Need", description: "Needing clear spoken sorry vs moving warmly onward." },
    { key: "touch_reconnection", label: "Warm Reconnection Ritual", description: "Using touch or sweet gestures right after making up." },
  ],
  sections: [
    makeSection("fair-fighting", "Fair Fighting & Timing Agreement", "Core", "How two partners turn friction into closer trust."),
  ],
  questions: [
    qScale({ id: "ccm_1", order: 1, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "When upset, talking things out within the hour matters so anger does not linger overnight.", helperText: "Need for quick resolution.", dimensionWeights: { timing_immediacy: 1 } }),
    qScale({ id: "ccm_2", order: 2, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Taking a reassuring 25 minute break ('I care about us, I will come back calm') helps me listen much better.", helperText: "Timeout helpfulness.", dimensionWeights: { timing_immediacy: 1 }, reverseScored: true }),
    qScale({ id: "ccm_3", order: 3, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Asking 'Can I bring up something small when you have space?' helps me listen instead of bracing.", helperText: "Gentle timing check.", dimensionWeights: { soft_startup: 1 } }),
    qScale({ id: "ccm_4", order: 4, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Brushing things off with 'it is fine' leaves me uneasy; I need clear spoken ownership like 'sorry I interrupted'.", helperText: "Clear apology need.", dimensionWeights: { apology_expectations: 1 } }),
    qScale({ id: "ccm_5", order: 5, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Holding hands or a reassuring touch during hard talks reminds me we are on the same team.", helperText: "Physical calm during tension.", dimensionWeights: { touch_reconnection: 1 } }),
    qScale({ id: "ccm_6", order: 6, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Even when frustrated, gentle affectionate touch helps soothe me rather than feeling suffocating.", helperText: "Touch comfort while upset.", dimensionWeights: { touch_reconnection: 0.9 } }),
    qScale({ id: "ccm_7", order: 7, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Saying 'I feel stressed when plans change late' lands much better than 'You always waste my time.'", helperText: "Owning feelings calmly.", dimensionWeights: { soft_startup: 1 } }),
    qScale({ id: "ccm_8", order: 8, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Repeating back what we heard ('So what hurt most was...') stops most talking past each other.", helperText: "Active listening habit.", dimensionWeights: { soft_startup: 0.9, apology_expectations: 0.5 } }),
    qScale({ id: "ccm_9", order: 9, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Trying to solve heavy arguments after 11 PM while exhausted almost always makes things worse for me.", helperText: "Late night pause rule.", dimensionWeights: { timing_immediacy: 0.8 }, reverseScored: true, quick: false }),
    qScale({ id: "ccm_10", order: 10, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Once we genuinely apologize, a sweet gesture like making coffee helps reset the mood.", helperText: "Repair gesture warmth.", dimensionWeights: { touch_reconnection: 0.8 }, quick: false }),
    qScale({ id: "ccm_11", order: 11, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Cracking jokes too fast before I feel heard makes me feel brushed aside.", helperText: "Humor timing sensitivity.", dimensionWeights: { apology_expectations: 0.9 }, quick: false }),
    qScale({ id: "ccm_12", order: 12, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Short weekly check ins about how the week felt keep small annoyances from piling up.", helperText: "Preventative check ins.", dimensionWeights: { soft_startup: 1 }, quick: false }),
    qScale({ id: "ccm_13", order: 13, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Even when we still disagree slightly, knowing my partner genuinely cared to understand me brings real peace.", helperText: "Accepting honest differences.", dimensionWeights: { soft_startup: 0.9, touch_reconnection: 0.6 }, quick: false }),
    qScale({ id: "ccm_14", order: 14, sectionId: "fair-fighting", sectionTitle: "Fair Fighting & Timing Agreement", prompt: "Asking why something felt big to me before offering solutions doubles how connected I feel.", helperText: "Understanding before fixing.", dimensionWeights: { soft_startup: 0.95 }, quick: false }),
  ],
};

// ===========================================================================
// TEST 26: Couples Bucket List Matcher (20 items -> Mutual Shared Board)
// ===========================================================================
const test26Sections = [
  makeSection("travel-adventures", "Travel & Scenic Wonders", "Chapter 1", "Trips, scenery, and wild unforgettable memories."),
  makeSection("creative-home", "Home Traditions & Shared Projects", "Chapter 2", "Warm annual rituals and shared projects."),
  makeSection("intimacy-romance-list", "Romantic & Playful Milestones", "Chapter 3", "Deep closeness, laughter, and spice."),
];

const bucketItems: Array<[string, string, string, string, Record<string, number>, boolean]> = [
  ["bl_northern_lights", "travel-adventures", "Watching the northern lights wrapped in heavy coats from a glass cabin", "Dream natural spectacle.", { wanderlust: 1, romance: 0.7 }, true],
  ["bl_train_alps", "travel-adventures", "Crossing scenic mountain valleys on a panoramic train drinking warm wine", "Slow scenic travel.", { wanderlust: 1, connection: 0.6 }, true],
  ["bl_roadtrip_coast", "travel-adventures", "Ten day convertible or campervan coastal drive stopping at random bakeries", "Classic unplanned roadtrip.", { wanderlust: 1, play: 0.7 }, true],
  ["bl_japan_autumn", "travel-adventures", "Staying in a quiet wooden ryokan with outdoor cedar hot springs", "Restorative cultural beauty.", { wanderlust: 0.9, romance: 0.8 }, false],
  ["bl_star_desert", "travel-adventures", "Camping in a dark canyon under a bright Milky Way sky", "Wonder under the stars.", { wanderlust: 1, connection: 0.7 }, false],
  ["bl_street_market", "travel-adventures", "Getting happily lost in a lively night market sampling ten unknown street dishes", "Lively food adventure.", { wanderlust: 0.8, play: 0.9 }, true],
  ["bl_cooking_series", "creative-home", "Picking a country every month all year and cooking its classic feast together", "Ongoing kitchen tradition.", { connection: 1, play: 0.8 }, true],
  ["bl_photo_yearbook", "creative-home", "Printing a linen coffee table photo book of candid moments every December", "Intentional memory keeping.", { connection: 1, romance: 0.7 }, true],
  ["bl_herb_garden", "creative-home", "Growing an aromatic herb and flower garden on a balcony or backyard together", "Shared daily nurture.", { connection: 0.9 }, false],
  ["bl_dance_class", "creative-home", "Signing up for a six week salsa, tango, or swing dance course as total beginners", "Playful rhythm together.", { play: 1, romance: 0.8 }, true],
  ["bl_blind_bookshop", "creative-home", "Rainy afternoon bookstore tradition picking a book for each other with handwritten notes inside", "Thoughtful personal curation.", { connection: 1, romance: 0.8 }, false],
  ["bl_vinyl_listening", "creative-home", "Having a cozy evening listening to a full album on the living room floor with takeout", "Unplugged music night.", { connection: 0.9 }, false],
  ["bl_dream_capsule", "creative-home", "Writing sealed letters to read together five anniversaries from tonight", "Shared future time capsule.", { connection: 1, romance: 0.9 }, false],
  ["bl_boutique_stay", "intimacy-romance-list", "Checking into a velvet draped boutique hotel downtown for 36 hours of silk sheets and total privacy", "Close to home passionate escape.", { romance: 1, wanderlust: 0.4 }, true],
  ["bl_skinny_dip", "intimacy-romance-list", "Slipping naked into warm moonlit ocean water or a secluded hot soak under open stars", "Wild sensual water memory.", { romance: 1, play: 0.8 }, true],
  ["bl_massage_workshop", "intimacy-romance-list", "Booking a private couples sensual oil massage or tantric breath workshop together", "Skillful touch connection.", { romance: 1, connection: 0.8 }, false],
  ["bl_fancy_gala", "intimacy-romance-list", "Dressing to the nines once a year purely to take each other to a formal dinner and theater", "Glamorous date contrast.", { romance: 0.9, play: 0.6 }, true],
  ["bl_karaoke_duet", "intimacy-romance-list", "Belting a ridiculous private karaoke booth duet after drinks until your voice gives out", "Pure goofy joy.", { play: 1 }, false],
  ["bl_sunrise_ocean", "intimacy-romance-list", "Sneaking out at 5:30 AM wrapped in hoodies to watch sunrise break over the ocean", "Quiet early morning magic.", { romance: 1, wanderlust: 0.7 }, false],
  ["bl_digital_detox", "intimacy-romance-list", "A full 48 hour unplugged weekend in a cabin with phones turned off", "Undivided presence together.", { connection: 1, romance: 0.9 }, true],
];

export const couplesBucketListAssessment: AssessmentDefinition = {
  id: "couples-bucket-list-matcher-v1",
  slug: "couples-bucket-list-matcher",
  version: "1.0.0",
  title: "Couples Bucket List Matcher",
  shortTitle: "Bucket List Matcher",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  isCouplesFocused: true,
  audienceNote: "Rate 20 romantic, travel, and spicy adventures to turn mutual yeses into an interactive checklist.",
  futureExtensibilityNote: "Supports live checkoffs and custom couple items right on your board.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 6,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: false,
  scoringStrategy: "bucket_list",
  compatibilityStrategy: "bucket_list_matcher",
  visualizationTypes: ["bucket_list_board", "curiosity_map", "radar"],
  discoverPoints: [
    "Highlights mutual yeses across Travel, Home Traditions, and Spicy Romance.",
    "Turns matches into an interactive board you can check off together.",
  ],
  recommendedNextSlugs: ["romantic-dreams-ideal-dates", "how-well-do-you-know-your-partner", "private-fantasy-matcher"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "wanderlust", label: "Wanderlust & Scenic Escapes", description: "Pull toward travel, starry nights, and scenic roadtrips." },
    { key: "connection", label: "Intentional Home Traditions", description: "Shared cooking projects, photo books, and unplugged nights." },
    { key: "romance", label: "Sensual & Romantic Milestones", description: "Dawn beaches, luxury hotels, and deep closeness." },
    { key: "play", label: "Playful Joy & Curiosity", description: "Dance lessons, karaoke duets, and street food markets." },
  ],
  sections: test26Sections,
  questions: bucketItems.map(([id, sectionId, prompt, helper, weights, quick], idx) => {
    const sec = test26Sections.find((s) => s.id === sectionId)!;
    return qCuriosity({
      id,
      order: idx + 1,
      sectionId,
      sectionTitle: sec.title,
      prompt,
      helperText: helper,
      dimensionWeights: weights,
      quick,
    });
  }),
};

// ===========================================================================
// TEST 27: Who Is More Likely To...? (14 playful voting items)
// ===========================================================================
const test27Sections = [
  makeSection("habits-laughter", "Daily Quirks & Love Habits", "Playful Match", "Vote 'Me', 'My Partner', or 'Both Equally' and see how often you agree."),
];

const votePrompts: Array<[string, string, string, boolean]> = [
  ["wml_1", "Who is more likely to cry happy tears at a dog video or heartwarming ad?", "Sweet emotional reflex.", true],
  ["wml_2", "Who is more likely to arrive at the airport three hours early just to be safe?", "Travel planning habit.", true],
  ["wml_3", "Who is more likely to finish their own fries and still reach for the other plate?", "Playful food dynamics.", true],
  ["wml_4", "Who is more likely to say 'I love you' randomly during errands or making toast?", "Spontaneous affection.", true],
  ["wml_5", "Who is more likely to get sidetracked exploring an interesting vintage shop or side street?", "Curious detour driver.", true],
  ["wml_6", "Who is more likely to remember small gift wishes mentioned six months earlier?", "Memory for small wishes.", true],
  ["wml_7", "Who is more likely to break an awkward silence with a laugh first during a tiny argument?", "First to lighten tension.", true],
  ["wml_8", "Who is more likely to turn a quick 20 minute nap into a two hour sleep?", "Champion napper.", true],
  ["wml_9", "Who is more likely to pull the other into a slow dance in the kitchen while dinner cooks?", "Spontaneous romance.", false],
  ["wml_10", "Who is more likely to keep 14 browser tabs open picking the best brunch spot?", "Deep researcher.", false],
  ["wml_11", "Who is more likely to say hi to a stranger's dog before greeting the owner?", "Pure animal joy.", false],
  ["wml_12", "Who is more likely to fall asleep eight minutes into the movie they begged to watch?", "Movie endurance.", false],
  ["wml_13", "Who is more likely to soften and apologize first even when both sides got snappy?", "First peace builder.", false],
  ["wml_14", "Who is more likely to stay calm and practical if a flight gets canceled?", "Calm under travel stress.", false],
];

export const whoMoreLikelyAssessment: AssessmentDefinition = {
  id: "who-is-more-likely-to-v1",
  slug: "who-is-more-likely-to",
  version: "1.0.0",
  title: "Who Is More Likely To...?",
  shortTitle: "More Likely To",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isCouplesFocused: true,
  audienceNote: "Playful couple voting game comparing who owns each sweet habit, quirk, and romantic reflex.",
  futureExtensibilityNote: "Automatically flips Me and My Partner perspectives so votes align cleanly.",
  estimatedMinutesQuick: 2,
  estimatedMinutesComplete: 4,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: false,
  scoringStrategy: "would_rather",
  compatibilityStrategy: "voting_game",
  visualizationTypes: ["vote_game_summary", "radar"],
  discoverPoints: [
    "Shows your Agreement % alongside unanimous matches and funny disagreements.",
  ],
  recommendedNextSlugs: ["how-well-do-you-know-your-partner", "couples-bucket-list-matcher", "romantic-dreams-ideal-dates"],
  supportedExports: ["pdf", "json", "share_card"],
  dimensions: [
    { key: "self_vote", label: "Owns the Habit (Me)", description: "How often you voted for yourself." },
    { key: "partner_vote", label: "Credits Partner", description: "How often you picked your partner." },
    { key: "shared_twin", label: "Both Equally", description: "How often you think both of you match." },
  ],
  sections: test27Sections,
  questions: votePrompts.map(([id, prompt, helper, quick], idx) =>
    qChoice({
      id,
      order: idx + 1,
      sectionId: "habits-laughter",
      sectionTitle: "Daily Quirks & Love Habits",
      inputType: "would_rather_vote",
      prompt,
      helperText: helper,
      quick,
      dimensionWeights: { self_vote: 1, partner_vote: 1, shared_twin: 1 },
      options: [
        { value: "me", label: "Definitely Me", dimensionWeights: { self_vote: 1, partner_vote: 0.1, shared_twin: 0.2 } },
        { value: "partner", label: "Definitely My Partner", dimensionWeights: { self_vote: 0.1, partner_vote: 1, shared_twin: 0.2 } },
        { value: "both", label: "Honestly, Both of Us Equally", dimensionWeights: { self_vote: 0.5, partner_vote: 0.5, shared_twin: 1 } },
      ],
    })
  ),
};

// ===========================================================================
// TEST 28: Emotional Support Compatibility (12 Need vs Offer items)
// ===========================================================================
export const emotionalSupportAssessment: AssessmentDefinition = {
  id: "emotional-support-compatibility-v1",
  slug: "emotional-support-compatibility",
  version: "1.0.0",
  title: "Emotional Support Compatibility",
  shortTitle: "Support Match",
  category: "compatibility",
  status: "published",
  adultsOnly: false,
  isCouplesFocused: true,
  audienceNote: "Compare the comfort you want on bad days with the support you instinctively give to others.",
  futureExtensibilityNote: "Builds a simple Comfort Playbook so partners stop guessing during hard nights.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 5,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "give_receive_dual",
  compatibilityStrategy: "affection_give_receive",
  visualizationTypes: ["give_receive_matrix", "radar"],
  discoverPoints: [
    "Contrasts What You Need vs What You Offer across Listening, Touch, Practical Help, and Lightness.",
    "Shows a partner right away when to just hold you versus jump in and fix dinner.",
  ],
  recommendedNextSlugs: ["love-affection-preferences", "attachment-style-discovery", "couples-communication-conflict-matching"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "need_listening", label: "Needing Empathic Listening", shortLabel: "Uninterrupted Listening", description: "Wanting warm validation before advice.", channelPairKey: "listen", channelRole: "receive" },
    { key: "offer_listening", label: "Offering Empathic Listening", shortLabel: "Uninterrupted Listening", description: "Holding quiet validating space easily.", channelPairKey: "listen", channelRole: "express" },
    { key: "need_holding", label: "Needing Quiet Physical Comfort", shortLabel: "Physical Soothing", description: "Melting into long silent hugs and close warmth.", channelPairKey: "hold", channelRole: "receive" },
    { key: "offer_holding", label: "Offering Quiet Physical Comfort", shortLabel: "Physical Soothing", description: "Comforting naturally through warm hugs.", channelPairKey: "hold", channelRole: "express" },
    { key: "need_practical", label: "Needing Practical Solutions or Relief", shortLabel: "Practical Load Relief", description: "Appreciating someone stepping in with dinner or errands.", channelPairKey: "practical", channelRole: "receive" },
    { key: "offer_practical", label: "Offering Practical Solutions or Relief", shortLabel: "Practical Load Relief", description: "Taking over chores, dinner, or plans automatically.", channelPairKey: "practical", channelRole: "express" },
    { key: "need_levity", label: "Needing Gentle Distraction", shortLabel: "Lightness & Perspective", description: "Feeling lifted by playful outings, comedy, or sweet banter.", channelPairKey: "levity", channelRole: "receive" },
    { key: "offer_levity", label: "Offering Gentle Distraction", shortLabel: "Lightness & Perspective", description: "Cheering loved ones up with warm humor and outings.", channelPairKey: "levity", channelRole: "express" },
  ],
  sections: [
    makeSection("when-hurt", "When You Are Carrying Stress", "Receiving Care", "What genuinely calms and comforts you."),
    makeSection("when-partner-hurts", "When Someone You Love Struggles", "Offering Care", "Your automatic way of showing up."),
  ],
  questions: [
    qScale({ id: "es_1", order: 1, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "When stressed, I just want someone to listen, agree that it sucks, and hold off on solutions.", helperText: "Need: pure listening.", dimensionWeights: { need_listening: 1 } }),
    qScale({ id: "es_2", order: 2, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "Silent affectionate touch like a head on their shoulder or slow back rub calms me faster than talking.", helperText: "Need: physical touch comfort.", dimensionWeights: { need_holding: 1 } }),
    qScale({ id: "es_3", order: 3, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "Seeing a partner pick up dinner, handle an errand, or fix a headache brings instant relief.", helperText: "Need: practical help.", dimensionWeights: { need_practical: 1 } }),
    qScale({ id: "es_4", order: 4, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "Sometimes getting kindly dragged out for ice cream and silly laughs pulls me out of gloom best.", helperText: "Need: warm distraction.", dimensionWeights: { need_levity: 1 } }),
    qScale({ id: "es_5", order: 5, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "Being asked 'Do you want comfort right now, solutions, or a distraction?' feels very thoughtful.", helperText: "Check in appreciation.", dimensionWeights: { need_listening: 0.7, need_holding: 0.5 }, quick: false }),
    qScale({ id: "es_6", order: 6, sectionId: "when-hurt", sectionTitle: "When You Are Carrying Stress", prompt: "Needing 20 quiet minutes alone first does not mean rejection; it helps me take in comfort afterward.", helperText: "Short quiet buffer.", dimensionWeights: { need_holding: 0.5 }, quick: false }),
    qScale({ id: "es_7", order: 7, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "When a partner cries or vents, I naturally pause all advice and just listen patiently.", helperText: "Offer: calm listening.", dimensionWeights: { offer_listening: 1 } }),
    qScale({ id: "es_8", order: 8, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "My first reflex when my partner hurts is walking over quietly to wrap them in a long hug.", helperText: "Offer: warm physical comfort.", dimensionWeights: { offer_holding: 1 } }),
    qScale({ id: "es_9", order: 9, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "When someone I love hurts, my brain immediately jumps into fixing things and making action plans.", helperText: "Offer: practical fixing.", dimensionWeights: { offer_practical: 1 } }),
    qScale({ id: "es_10", order: 10, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "I often bring playful jokes or fun outings to lift a heavy mood gently.", helperText: "Offer: warm lightness.", dimensionWeights: { offer_levity: 1 } }),
    qScale({ id: "es_11", order: 11, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "Making hot tea, grabbing cozy blankets, and silently tidying up is how I care during hard weeks.", helperText: "Offer: practical warmth and care.", dimensionWeights: { offer_practical: 0.8, offer_holding: 0.7 }, quick: false }),
    qScale({ id: "es_12", order: 12, sectionId: "when-partner-hurts", sectionTitle: "When Someone You Love Struggles", prompt: "Even when I cannot fix their problem, sitting calmly beside them feels deeply supportive rather than awkward.", helperText: "Calm steady presence.", dimensionWeights: { offer_listening: 0.9, offer_holding: 0.8 }, quick: false }),
  ],
};

export const categoryDCouplesAssessments: AssessmentDefinition[] = [
  howWellKnowPartnerAssessment,
  longTermCompatibilityAssessment,
  couplesCommunicationMatchingAssessment,
  couplesBucketListAssessment,
  whoMoreLikelyAssessment,
  emotionalSupportAssessment,
];
