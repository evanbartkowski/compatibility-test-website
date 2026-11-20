import type { AssessmentDefinition } from "@/lib/assessment/types";
import { makeSection, qChoice, qScale } from "./builders";

// ===========================================================================
// TEST 18: Big Five Personality Profile (25 items)
// ===========================================================================
const test18Sections = [
  makeSection("openness-energy", "Curiosity & Imagination (Openness)", "Trait O", "Appetite for ideas, art, novelty, and fresh perspectives."),
  makeSection("conscientious-order", "Follow Through & Structure (Conscientiousness)", "Trait C", "Planning habits, reliability, and composure in commitments."),
  makeSection("extraversion-social", "Social Vitality & Energy (Extraversion)", "Trait E", "Where energy rises or drains around social groups."),
  makeSection("agreeableness-care", "Warmth & Cooperation (Agreeableness)", "Trait A", "Empathy, diplomacy, trust, and concern for harmony."),
  makeSection("neuroticism-calm", "Emotional Sensitivity (Reactivity)", "Trait N", "Stress intensity, overthinking speed, and baseline calm."),
];

export const bigFivePersonalityAssessment: AssessmentDefinition = {
  id: "big-five-personality-profile-v1",
  slug: "big-five-personality-profile",
  version: "1.0.0",
  title: "Big Five Personality Profile",
  shortTitle: "Big Five (OCEAN)",
  category: "personality",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  audienceNote: "Maps Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Sensitivity.",
  futureExtensibilityNote: "Feeds directly into your Discovery Profile and partner comparison overlays.",
  scientificDisclaimer: "Self reflection questionnaire inspired by Big Five trait concepts. Not a clinical diagnosis.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 6,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  visualizationTypes: ["radar", "personality_spectrum"],
  discoverPoints: [
    "All five OCEAN personality traits scored 0 to 100 with clear low and high anchors.",
    "Shows how your temperament interacts with a partner's daily rhythm and stress style.",
  ],
  recommendedNextSlugs: ["how-others-really-see-you", "conflict-communication-personality", "emotional-intelligence-self-awareness"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "openness", label: "Openness to Experience", lowLabel: "Grounded & Traditional", highLabel: "Curious & Inventive", description: "Curiosity, imagination, and excitement for new ideas and art." },
    { key: "conscientiousness", label: "Conscientiousness", lowLabel: "Flexible & Improvisational", highLabel: "Structured & Reliable", description: "Self discipline, planning, tidiness, and dependable follow through." },
    { key: "extraversion", label: "Extraversion", lowLabel: "Quiet & Solitude Restored", highLabel: "Expressive & Outwardly Energized", description: "Social energy, boldness, and excitement from lively gatherings." },
    { key: "agreeableness", label: "Agreeableness", lowLabel: "Direct & Analytical", highLabel: "Warm & Collaborative", description: "Empathy, trust, gentleness during debate, and teamwork." },
    { key: "emotional_sensitivity", label: "Emotional Sensitivity", lowLabel: "Steady & Unflappable", highLabel: "Deeply Sensitive & Reactive", description: "Intensity of stress response and tendency to replay uncertainty." },
  ],
  sections: test18Sections,
  questions: [
    // Openness (3 quick, 2 deep)
    qScale({ id: "bf_o1", order: 1, sectionId: "openness-energy", sectionTitle: "Curiosity & Imagination (Openness)", prompt: "I get excited diving into unfamiliar ideas, art styles, or deep what if talks.", helperText: "Mental and creative curiosity.", dimensionWeights: { openness: 1 } }),
    qScale({ id: "bf_o2", order: 2, sectionId: "openness-energy", sectionTitle: "Curiosity & Imagination (Openness)", prompt: "Trying unfamiliar foods, cities, or unconventional perspectives energizes me.", helperText: "Experiential curiosity.", dimensionWeights: { openness: 1 } }),
    qScale({ id: "bf_o3", order: 3, sectionId: "openness-energy", sectionTitle: "Curiosity & Imagination (Openness)", prompt: "I prefer proven practical routines over abstract daydreaming.", helperText: "Preference for grounded routine.", reverseScored: true, dimensionWeights: { openness: 1 } }),
    qScale({ id: "bf_o4", order: 4, sectionId: "openness-energy", sectionTitle: "Curiosity & Imagination (Openness)", prompt: "Moody lighting, music, design, and poetry move me strongly.", helperText: "Sensitivity to art and mood.", dimensionWeights: { openness: 0.9 }, quick: false }),
    qScale({ id: "bf_o5", order: 5, sectionId: "openness-energy", sectionTitle: "Curiosity & Imagination (Openness)", prompt: "Long abstract philosophical chats rarely hold my attention.", helperText: "Practical focus over theory.", reverseScored: true, dimensionWeights: { openness: 0.9 }, quick: false }),

    // Conscientiousness
    qScale({ id: "bf_c1", order: 6, sectionId: "conscientious-order", sectionTitle: "Follow Through & Structure (Conscientiousness)", prompt: "When I promise something, people can completely count on my follow through.", helperText: "Personal dependability.", dimensionWeights: { conscientiousness: 1 } }),
    qScale({ id: "bf_c2", order: 7, sectionId: "conscientious-order", sectionTitle: "Follow Through & Structure (Conscientiousness)", prompt: "Keeping shared spaces tidy and finishing errands early keeps my mind calm.", helperText: "Order and preparation.", dimensionWeights: { conscientiousness: 1 } }),
    qScale({ id: "bf_c3", order: 8, sectionId: "conscientious-order", sectionTitle: "Follow Through & Structure (Conscientiousness)", prompt: "I often put off annoying chores or bills until the very last second.", helperText: "Procrastination tendency.", reverseScored: true, dimensionWeights: { conscientiousness: 1 } }),
    qScale({ id: "bf_c4", order: 9, sectionId: "conscientious-order", sectionTitle: "Follow Through & Structure (Conscientiousness)", prompt: "Before trips or big money choices, I plan the details rather than winging it.", helperText: "Careful forethought.", dimensionWeights: { conscientiousness: 0.9 }, quick: false }),
    qScale({ id: "bf_c5", order: 10, sectionId: "conscientious-order", sectionTitle: "Follow Through & Structure (Conscientiousness)", prompt: "Rigid schedules feel stifling; I strongly prefer deciding in the moment.", helperText: "Spontaneity over structure.", reverseScored: true, dimensionWeights: { conscientiousness: 0.85 }, quick: false }),

    // Extraversion
    qScale({ id: "bf_e1", order: 11, sectionId: "extraversion-social", sectionTitle: "Social Vitality & Energy (Extraversion)", prompt: "Lively dinners with friends leave me buzzing with energy rather than worn out.", helperText: "Social battery boost.", dimensionWeights: { extraversion: 1 } }),
    qScale({ id: "bf_e2", order: 12, sectionId: "extraversion-social", sectionTitle: "Social Vitality & Energy (Extraversion)", prompt: "In new social crowds, I naturally break the ice and strike up conversations.", helperText: "Social confidence.", dimensionWeights: { extraversion: 1 } }),
    qScale({ id: "bf_e3", order: 13, sectionId: "extraversion-social", sectionTitle: "Social Vitality & Energy (Extraversion)", prompt: "After busy days, I need real quiet time alone before I feel like myself again.", helperText: "Need for solo recharge.", reverseScored: true, dimensionWeights: { extraversion: 1 } }),
    qScale({ id: "bf_e4", order: 14, sectionId: "extraversion-social", sectionTitle: "Social Vitality & Energy (Extraversion)", prompt: "I love being right in the animated center of laughter and group stories.", helperText: "Crowd energy.", dimensionWeights: { extraversion: 0.9 }, quick: false }),
    qScale({ id: "bf_e5", order: 15, sectionId: "extraversion-social", sectionTitle: "Social Vitality & Energy (Extraversion)", prompt: "I prefer listening quietly in groups and keeping excitement low key.", helperText: "Quiet social style.", reverseScored: true, dimensionWeights: { extraversion: 0.9 }, quick: false }),

    // Agreeableness
    qScale({ id: "bf_a1", order: 16, sectionId: "agreeableness-care", sectionTitle: "Warmth & Cooperation (Agreeableness)", prompt: "A friend's hard week moves me deeply, and I check in tenderly right away.", helperText: "Natural empathy and care.", dimensionWeights: { agreeableness: 1 } }),
    qScale({ id: "bf_a2", order: 17, sectionId: "agreeableness-care", sectionTitle: "Warmth & Cooperation (Agreeableness)", prompt: "I assume good intentions in people unless clear actions prove otherwise.", helperText: "Warm baseline trust.", dimensionWeights: { agreeableness: 1 } }),
    qScale({ id: "bf_a3", order: 18, sectionId: "agreeableness-care", sectionTitle: "Warmth & Cooperation (Agreeableness)", prompt: "Blunt truth matters more to me than softening words to protect feelings.", helperText: "Direct bluntness vs gentle tact.", reverseScored: true, dimensionWeights: { agreeableness: 0.9 } }),
    qScale({ id: "bf_a4", order: 19, sectionId: "agreeableness-care", sectionTitle: "Warmth & Cooperation (Agreeableness)", prompt: "Preserving mutual warmth and dignity matters more to me than winning a debate.", helperText: "Cooperation focus.", dimensionWeights: { agreeableness: 0.95 }, quick: false }),
    qScale({ id: "bf_a5", order: 20, sectionId: "agreeableness-care", sectionTitle: "Warmth & Cooperation (Agreeableness)", prompt: "I spot logic flaws quickly and point them out right away even unasked.", helperText: "Critical analytical reflex.", reverseScored: true, dimensionWeights: { agreeableness: 0.85 }, quick: false }),

    // Emotional Sensitivity
    qScale({ id: "bf_n1", order: 21, sectionId: "neuroticism-calm", sectionTitle: "Emotional Sensitivity (Reactivity)", prompt: "Unresolved tension or vague messages replay in my head late at night.", helperText: "Mental rumination under uncertainty.", dimensionWeights: { emotional_sensitivity: 1 } }),
    qScale({ id: "bf_n2", order: 22, sectionId: "neuroticism-calm", sectionTitle: "Emotional Sensitivity (Reactivity)", prompt: "When sudden setbacks hit, my stress spikes noticeably faster than people around me.", helperText: "Acute stress reactivity.", dimensionWeights: { emotional_sensitivity: 1 } }),
    qScale({ id: "bf_n3", order: 23, sectionId: "neuroticism-calm", sectionTitle: "Emotional Sensitivity (Reactivity)", prompt: "My daily mood stays remarkably steady; small frustrations roll right off me.", helperText: "Baseline emotional calm.", reverseScored: true, dimensionWeights: { emotional_sensitivity: 1 } }),
    qScale({ id: "bf_n4", order: 24, sectionId: "neuroticism-calm", sectionTitle: "Emotional Sensitivity (Reactivity)", prompt: "Sharp criticism stings emotionally for days even when I agree with it logically.", helperText: "Sensitivity to sharp critique.", dimensionWeights: { emotional_sensitivity: 0.9 }, quick: false }),
    qScale({ id: "bf_n5", order: 25, sectionId: "neuroticism-calm", sectionTitle: "Emotional Sensitivity (Reactivity)", prompt: "During stressful emergencies, friends lean on me for calm level headed poise.", helperText: "Composure under pressure.", reverseScored: true, dimensionWeights: { emotional_sensitivity: 0.95 }, quick: false }),
  ],
};

// ===========================================================================
// TEST 19: How Others Really See You (14 items)
// ===========================================================================
export const howOthersSeeYouAssessment: AssessmentDefinition = {
  id: "how-others-really-see-you-v1",
  slug: "how-others-really-see-you",
  version: "1.0.0",
  title: "How Others Really See You",
  shortTitle: "Self vs. Others",
  category: "personality",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  audienceNote: "Rate yourself first, then share an anonymous link with 3+ friends or partners to reveal blind spots.",
  futureExtensibilityNote: "Requires at least 3 anonymous reviewers before displaying averages so feedback stays private.",
  scientificDisclaimer: "Anonymous peer perception check for self reflection and honest insight.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 5,
  supportsQuickMode: false,
  supportsPartnerMatching: false,
  supportsCommunityComparison: false,
  supportsMultiRater: true,
  minMultiRaterRespondents: 3,
  scoringStrategy: "multi_rater_perception",
  compatibilityStrategy: "none",
  visualizationTypes: ["radar", "multi_rater_comparison"],
  discoverPoints: [
    "Self rating across Warmth, Calm Dependability, Candid Directness, Playful Spark, and Present Listening.",
    "Unlocks an interactive Self vs Peers gap chart once 3+ anonymous responses arrive.",
  ],
  recommendedNextSlugs: ["big-five-personality-profile", "emotional-intelligence-self-awareness", "conflict-communication-personality"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "warmth_approach", label: "Warmth & Approachability", description: "How fast people feel relaxed, welcomed, and comfortable around you." },
    { key: "calm_dependable", label: "Calm Dependability", description: "Seen steadiness, punctuality, and follow through under stress." },
    { key: "candid_direct", label: "Candid Directness", description: "How clear and honest your everyday boundaries feel to others." },
    { key: "playful_charm", label: "Lightness & Play", description: "How much wit, humor, and levity others feel from you." },
    { key: "deep_listening", label: "Present Listening", description: "Whether people walk away feeling truly heard by you." },
  ],
  sections: [
    makeSection("impression-core", "Everyday Social & Relational Presence", "Mirror", "Rate yourself honestly first; invited friends answer matching observer items anonymously."),
  ],
  questions: [
    qScale({ id: "mr_1", order: 1, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "When someone meets me for the first time, I put them at ease within minutes.", observerPrompt: "When people first meet them, they make others feel relaxed quickly.", helperText: "First impression warmth.", dimensionWeights: { warmth_approach: 1 } }),
    qScale({ id: "mr_2", order: 2, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "In stressful crunch times, people experience my energy as calm and reassuring.", observerPrompt: "During stressful moments, they bring reassuring, steady calm.", helperText: "Perceived calm under stress.", dimensionWeights: { calm_dependable: 1 } }),
    qScale({ id: "mr_3", order: 3, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "People close to me never have to guess where they stand; I speak clearly and kindly.", observerPrompt: "With them, you rarely have to guess what they think; they speak clearly.", helperText: "Clarity and candor.", dimensionWeights: { candid_direct: 1 } }),
    qScale({ id: "mr_4", order: 4, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "Friends know I bring easy humor and spontaneous levity into ordinary hangouts.", observerPrompt: "They naturally bring fun humor and lightness into hangouts.", helperText: "Social playfulness.", dimensionWeights: { playful_charm: 1 } }),
    qScale({ id: "mr_5", order: 5, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "When friends vent to me, I listen deeply instead of pulling focus onto myself.", observerPrompt: "When you talk with them about something tough, you feel genuinely heard.", helperText: "Attentive listening presence.", dimensionWeights: { deep_listening: 1 } }),
    qScale({ id: "mr_6", order: 6, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "If I promise a favor, errand, or call, people consider it locked in.", observerPrompt: "When they promise to follow through on something, you completely count on it.", helperText: "Everyday reliability.", dimensionWeights: { calm_dependable: 1 } }),
    qScale({ id: "mr_7", order: 7, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "I celebrate friends' good news warmly with zero subtle envy.", observerPrompt: "They celebrate others' good news with unmistakable warmth.", helperText: "Sincere cheerfulness.", dimensionWeights: { warmth_approach: 0.9, deep_listening: 0.6 } }),
    qScale({ id: "mr_8", order: 8, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "I voice disagreement cleanly instead of going silent and pretending everything is fine.", observerPrompt: "When something bothers them, they raise it cleanly rather than shutting down.", helperText: "Direct honesty.", dimensionWeights: { candid_direct: 1 } }),
    qScale({ id: "mr_9", order: 9, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "My playful teasing lands as warm affection rather than sharp stings.", observerPrompt: "Their teasing feels affectionate and fun rather than biting.", helperText: "Humor warmth balance.", dimensionWeights: { playful_charm: 0.9, warmth_approach: 0.6 } }),
    qScale({ id: "mr_10", order: 10, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "People trust me with messy, embarrassing secrets without fearing judgment.", observerPrompt: "People feel safe sharing messy struggles with them without judgment.", helperText: "Emotional safety aura.", dimensionWeights: { deep_listening: 1, warmth_approach: 0.8 } }),
    qScale({ id: "mr_11", order: 11, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "I show up on time and respect other people's schedules.", observerPrompt: "They are punctual and consistently respectful of others' time.", helperText: "Time respectfulness.", dimensionWeights: { calm_dependable: 0.9 } }),
    qScale({ id: "mr_12", order: 12, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "I apologize cleanly when I mess up instead of getting defensive.", observerPrompt: "When they hurt someone by accident, they apologize cleanly without excuses.", helperText: "Humility during feedback.", dimensionWeights: { candid_direct: 0.8, deep_listening: 0.8 } }),
    qScale({ id: "mr_13", order: 13, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "When someone sits quietly on the edges at dinner, I notice and draw them in.", observerPrompt: "In group settings, they notice quieter people and bring them gently into talks.", helperText: "Warm awareness of others.", dimensionWeights: { warmth_approach: 0.9, deep_listening: 0.7 } }),
    qScale({ id: "mr_14", order: 14, sectionId: "impression-core", sectionTitle: "Everyday Social & Relational Presence", prompt: "People find it fun and effortless to be spontaneous around me.", observerPrompt: "It feels effortless and fun to be spontaneous around them.", helperText: "Spontaneous ease.", dimensionWeights: { playful_charm: 0.95 } }),
  ],
};

// ===========================================================================
// TEST 20: Emotional Intelligence & Self Awareness (14 items)
// ===========================================================================
export const emotionalIntelligenceAssessment: AssessmentDefinition = {
  id: "emotional-intelligence-self-awareness-v1",
  slug: "emotional-intelligence-self-awareness",
  version: "1.0.0",
  title: "Emotional Intelligence & Self Awareness",
  shortTitle: "Emotional Awareness",
  category: "personality",
  status: "published",
  adultsOnly: false,
  audienceNote: "Explores pausing before reacting, reading partner emotions clearly, and owning mistakes calmly.",
  futureExtensibilityNote: "Uses realistic triggers instead of flattering abstract claims.",
  scientificDisclaimer: "Practical reflection on emotional skills in relationships. Not a clinical test.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 6,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  visualizationTypes: ["radar", "personality_spectrum"],
  discoverPoints: [
    "Highlights real habits across Impulse Pause, Empathy Accuracy, Pattern Insight, and Graceful Repair.",
  ],
  recommendedNextSlugs: ["conflict-communication-personality", "attachment-style-discovery", "emotional-support-compatibility"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "self_regulation", label: "Impulse Pause & Composure", description: "Creating a calm beat between feeling stung and firing back." },
    { key: "empathy_accuracy", label: "Cognitive Empathy", description: "Understanding what your partner feels separately from your own assumption." },
    { key: "trigger_insight", label: "Self Pattern Awareness", description: "Noticing when fatigue, hunger, or old habits spark an overreaction." },
    { key: "graceful_repair", label: "Accountability & Repair", description: "Owning impact smoothly and soothing bruised moments." },
  ],
  sections: [
    makeSection("scenarios", "Trigger Scenarios", "Part 1", "First instincts during misunderstanding and stress."),
    makeSection("reflection-habits", "Daily Self Awareness Habits", "Part 2", "Reading emotions clearly before reacting."),
  ],
  questions: [
    qChoice({
      id: "eq_1", order: 1, sectionId: "scenarios", sectionTitle: "Trigger Scenarios", inputType: "situational",
      prompt: "Your partner reads a text you sent completely the wrong way and sounds hurt. What is your first move?",
      helperText: "Balancing your intent against how your words landed.",
      dimensionWeights: { self_regulation: 1, empathy_accuracy: 1, trigger_insight: 0.7, graceful_repair: 1 },
      options: [
        { value: "ack_impact", label: "'I see why my wording looked sharp, I meant something gentler and I am sorry that stung.'", dimensionWeights: { self_regulation: 0.95, empathy_accuracy: 0.95, trigger_insight: 0.85, graceful_repair: 1.0 } },
        { value: "defend_word", label: "'Why do you always assume the worst? Read what I literally wrote again.'", dimensionWeights: { self_regulation: 0.25, empathy_accuracy: 0.2, trigger_insight: 0.3, graceful_repair: 0.2 } },
        { value: "pause_call", label: "Call gently instead of texting ('Let me hear your voice, can I clear that up?')", dimensionWeights: { self_regulation: 0.9, empathy_accuracy: 0.85, trigger_insight: 0.8, graceful_repair: 0.9 } },
      ],
    }),
    qChoice({
      id: "eq_2", order: 2, sectionId: "scenarios", sectionTitle: "Trigger Scenarios", inputType: "situational",
      prompt: "Mid evening you realize your partner did nothing wrong; you are just completely wiped out from work.",
      helperText: "Catching internal fatigue before picking a fight.",
      dimensionWeights: { trigger_insight: 1, self_regulation: 0.9, graceful_repair: 0.9 },
      options: [
        { value: "name_it", label: "Say out loud: 'Hey, I am running on empty and snapping unfairly, give me 20 minutes to reset.'", dimensionWeights: { trigger_insight: 1.0, self_regulation: 0.95, graceful_repair: 0.95 } },
        { value: "mask_push", label: "Stay quiet and try pushing through while still feeling irritable", dimensionWeights: { trigger_insight: 0.65, self_regulation: 0.5, graceful_repair: 0.45 } },
        { value: "find_fault", label: "Keep staying annoyed at whatever tiny thing they say next", dimensionWeights: { trigger_insight: 0.2, self_regulation: 0.2, graceful_repair: 0.2 } },
      ],
    }),
    qChoice({
      id: "eq_3", order: 3, sectionId: "scenarios", sectionTitle: "Trigger Scenarios", inputType: "situational",
      prompt: "Your partner admits a fear that makes zero logical sense to you. How do you handle it?",
      helperText: "Validating emotion before debating facts.",
      dimensionWeights: { empathy_accuracy: 1, self_regulation: 0.7 },
      options: [
        { value: "feel_first", label: "Listen closely to why it feels real to them first before offering calm logic later", dimensionWeights: { empathy_accuracy: 1.0, self_regulation: 0.85 } },
        { value: "fix_logic", label: "Immediately list three logical facts proving there is nothing to worry about", dimensionWeights: { empathy_accuracy: 0.4, self_regulation: 0.65 } },
      ],
    }),
    qScale({ id: "eq_4", order: 4, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "I can usually tell when anger on the surface is actually covering hurt or embarrassment.", helperText: "Spotting deeper underlying feelings.", dimensionWeights: { trigger_insight: 1 } }),
    qScale({ id: "eq_5", order: 5, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "When adrenaline spikes in a fight, I pause for a breath before firing back.", helperText: "Impulse control during tension.", dimensionWeights: { self_regulation: 1 } }),
    qScale({ id: "eq_6", order: 6, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "When someone apologizes imperfectly yet tries sincerely, I meet them halfway without keeping score.", helperText: "Forgiveness and repair warmth.", dimensionWeights: { graceful_repair: 1 } }),
    qScale({ id: "eq_7", order: 7, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "I notice old habits from my family shaping how I react when relationships feel tense.", helperText: "Self awareness of old patterns.", dimensionWeights: { trigger_insight: 1 } }),
    qScale({ id: "eq_8", order: 8, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "Criticism stings at first, yet within hours I pull out whatever fair truth helps me grow.", helperText: "Resilience under feedback.", dimensionWeights: { graceful_repair: 0.9, self_regulation: 0.85 } }),
    qScale({ id: "eq_9", order: 9, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "I ask whether my partner wants comfort, ideas, or distraction instead of guessing.", helperText: "Support accuracy.", dimensionWeights: { empathy_accuracy: 1 }, quick: false }),
    qScale({ id: "eq_10", order: 10, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "After misreading someone's mood, I circle back cleanly to own it once calm.", helperText: "Humility afterward.", dimensionWeights: { graceful_repair: 1 }, quick: false }),
    qScale({ id: "eq_11", order: 11, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "When envy pops up, I read it as a clue about what I want instead of acting bitter.", helperText: "Emotional insight.", dimensionWeights: { trigger_insight: 0.9, self_regulation: 0.8 }, quick: false }),
    qScale({ id: "eq_12", order: 12, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "I catch small shifts in body language and ask gently instead of assuming the worst.", helperText: "Curious empathy.", dimensionWeights: { empathy_accuracy: 0.95 }, quick: false }),
    qScale({ id: "eq_13", order: 13, sectionId: "scenarios", sectionTitle: "Trigger Scenarios", prompt: "Even when exhausted, biting sarcasm is rare for me during home disagreements.", helperText: "Self control when tired.", dimensionWeights: { self_regulation: 0.95 }, quick: false }),
    qScale({ id: "eq_14", order: 14, sectionId: "reflection-habits", sectionTitle: "Daily Self Awareness Habits", prompt: "Asking cleanly for what I need works way better than waiting for a partner to read my mind.", helperText: "Direct self advocacy.", dimensionWeights: { trigger_insight: 0.85, graceful_repair: 0.8 }, quick: false }),
  ],
};

// ===========================================================================
// TEST 21: Conflict & Communication Personality (16 items)
// ===========================================================================
export const conflictCommunicationAssessment: AssessmentDefinition = {
  id: "conflict-communication-personality-v1",
  slug: "conflict-communication-personality",
  version: "1.0.0",
  title: "Conflict & Communication Personality",
  shortTitle: "Conflict Style",
  category: "personality",
  status: "published",
  adultsOnly: false,
  isFeatured: true,
  audienceNote: "Explores whether you confront tension fast, need cooling breaks, and how you repair afterward.",
  futureExtensibilityNote: "Creates a clear Fight Fair guide showing how you and a partner handle friction.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 6,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: true,
  scoringStrategy: "dimension_average",
  compatibilityStrategy: "trait_similarity_complement",
  visualizationTypes: ["blended_archetype", "radar"],
  discoverPoints: [
    "Balances Immediate Talk Speed against Cooling Space Need during heated moments.",
    "Clarifies whether you lean toward harmony keeping or candid direct debate.",
  ],
  recommendedNextSlugs: ["couples-communication-conflict-matching", "attachment-style-discovery", "emotional-intelligence-self-awareness"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "direct_clarity", label: "Direct Confrontation Ease", description: "Raising friction early instead of bottling mild annoyance." },
    { key: "reflective_pacing", label: "Reflective Cooling Need", description: "Needing 20 to 60 minutes to settle down and think straight before speaking." },
    { key: "harmony_repair", label: "Repair & Warmth Drive", description: "Using gentleness, touch, or warmth to bring tension back down safely." },
    { key: "empathy_vs_logic", label: "Empathy First vs. Problem Solving", description: "Leading with emotional soothing before jumping to action checklists." },
  ],
  archetypes: [
    { id: "calm_mediator", name: "The Calm Mediator", tagline: "Lowers emotional heat gently while keeping focus on honest solutions.", summary: "You make hard talks feel safe by pairing sincere listening with practical steps.", weights: { harmony_repair: 1, empathy_vs_logic: 0.8, direct_clarity: 0.6 } },
    { id: "direct_resolver", name: "The Immediate Resolver", tagline: "Hates lingering tension and wants honest resolution right away so peace returns.", summary: "Leaving things unspoken drains you far faster than a frank 15 minute talk.", weights: { direct_clarity: 1, reflective_pacing: -0.6 } },
    { id: "thoughtful_processor", name: "The Thoughtful Processor", tagline: "Takes short cooling space to find fair words instead of snapping reactively.", summary: "A brief pause stops you from saying harsh things you never meant.", weights: { reflective_pacing: 1, harmony_repair: 0.7 } },
    { id: "lively_debater", name: "The Engaged Truth Seeker", tagline: "Comfortable hashing out differences directly with clear honesty and zero avoidance.", summary: "You trust relationships enough to disagree warmly in the open.", weights: { direct_clarity: 1, harmony_repair: 0.5 } },
  ],
  sections: [
    makeSection("timing-space", "Timing, Space & Directness", "Part 1", "Talk now vs. cool off briefly first."),
    makeSection("repair-tone", "Tone, Logic & Reconnection", "Part 2", "What helps tough talks finish cleanly."),
  ],
  questions: [
    qScale({ id: "cc_1", order: 1, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "When something hurts my feelings, I feel restless until we talk it through that same day.", helperText: "Urgency for fast closure.", dimensionWeights: { direct_clarity: 1, reflective_pacing: -0.7 } }),
    qScale({ id: "cc_2", order: 2, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "Taking 30 minutes apart to walk and breathe makes me far kinder when restarting tough talks.", helperText: "Value of short cooling breaks.", dimensionWeights: { reflective_pacing: 1 } }),
    qScale({ id: "cc_3", order: 3, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "I tend to bite my tongue over small issues to keep peace until everything spills out at once.", helperText: "Bottling annoyance reduces direct clarity.", dimensionWeights: { direct_clarity: 1 }, reverseScored: true }),
    qScale({ id: "cc_4", order: 4, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "When a partner asks for a 20 minute break with a warm promise to return, I respect it calmly.", helperText: "Comfort granting cooling breaks.", dimensionWeights: { reflective_pacing: 0.8, harmony_repair: 0.9 } }),
    qScale({ id: "cc_5", order: 5, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "I can bring up frustration using 'I felt hurt when...' without attacking my partner's character.", helperText: "Gentle start up habit.", dimensionWeights: { direct_clarity: 0.9, harmony_repair: 0.8 } }),
    qScale({ id: "cc_6", order: 6, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "Holding hands or soft touch during serious talks reminds me we are teammates, not enemies.", helperText: "Comfort with physical touch during talks.", dimensionWeights: { harmony_repair: 1 } }),
    qScale({ id: "cc_7", order: 7, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "In tense talks, I need empathy ('I get why you felt overwhelmed') before jumping to fix lists.", helperText: "Empathy first preference.", dimensionWeights: { empathy_vs_logic: 1 } }),
    qScale({ id: "cc_8", order: 8, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "A warm smile or tiny bit of lightness mid argument quickly melts tension for me.", helperText: "Lightness as a tension breaker.", dimensionWeights: { harmony_repair: 0.95 } }),
    qScale({ id: "cc_9", order: 9, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "During stress, jumping straight into action plans feels soothing to me rather than dismissive.", helperText: "Practical action first preference.", dimensionWeights: { empathy_vs_logic: 0.9 }, reverseScored: true, quick: false }),
    qScale({ id: "cc_10", order: 10, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "Typing long paragraphs over text during a fight usually makes things twice as messy.", helperText: "Voice or face to face clarity.", dimensionWeights: { harmony_repair: 0.7 }, quick: false }),
    qScale({ id: "cc_11", order: 11, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "Once we resolve an argument cleanly, I let it go completely instead of keeping score.", helperText: "Real forgiveness afterward.", dimensionWeights: { harmony_repair: 1 }, quick: false }),
    qScale({ id: "cc_12", order: 12, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "Hearing 'It is us against the problem, not against each other' resets my tone right away.", helperText: "Team mindset during conflict.", dimensionWeights: { harmony_repair: 0.95, empathy_vs_logic: 0.7 }, quick: false }),
    qScale({ id: "cc_13", order: 13, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "When a partner raises their voice sharply, my brain locks up and pulls into silent shell.", helperText: "Sensitivity to raised volume.", dimensionWeights: { reflective_pacing: 0.9, direct_clarity: -0.4 }, quick: false }),
    qScale({ id: "cc_14", order: 14, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "Accepting that both our memories of an argument feel real stops useless fact debates.", helperText: "Respecting dual perspectives.", dimensionWeights: { empathy_vs_logic: 0.9, harmony_repair: 0.9 }, quick: false }),
    qScale({ id: "cc_15", order: 15, sectionId: "timing-space", sectionTitle: "Timing, Space & Directness", prompt: "I bring up awkward topics like chores or spending within a day or two before resentment grows.", helperText: "Healthy early candor.", dimensionWeights: { direct_clarity: 1.0 }, quick: false }),
    qScale({ id: "cc_16", order: 16, sectionId: "repair-tone", sectionTitle: "Tone, Logic & Reconnection", prompt: "Finishing hard talks with a real hug clearly seals peace again for me.", helperText: "Closing ritual.", dimensionWeights: { harmony_repair: 1.0 }, quick: false }),
  ],
};

// ===========================================================================
// TEST 22: Your Hidden Relationship Priorities (12 items)
// ===========================================================================
const test22Sections = [
  makeSection("tradeoffs", "Value Tradeoff Dilemmas", "Forced Choice", "Each dilemma pairs two attractive choices so your real #1 instinct surfaces."),
];

const tradeoffs: Array<{
  id: string;
  prompt: string;
  helper: string;
  a: { value: string; label: string; tag: string; weights: Record<string, number> };
  b: { value: string; label: string; tag: string; weights: Record<string, number> };
}> = [
  {
    id: "hp_1",
    prompt: "Which feels more vital when imagining five years from now?",
    helper: "Stability vs. Intensity",
    a: { value: "safety", label: "Deep predictable emotional safety where stress melts the second you walk home", tag: "emotional_safety", weights: { safety_stability: 1, passion_novelty: 0.2 } },
    b: { value: "spark", label: "Electric chemistry, spontaneous heat, and never letting life turn stale or dull", tag: "electric_spark", weights: { passion_novelty: 1, safety_stability: 0.2 } },
  },
  {
    id: "hp_2",
    prompt: "If work pulls your schedules apart for a season, what feels healthier?",
    helper: "Togetherness vs. Autonomy",
    a: { value: "merged", label: "Protecting nightly dinners, intertwined routines, and shared hobbies first", tag: "deep_togetherness", weights: { closeness_merge: 1, autonomy_freedom: 0.2 } },
    b: { value: "autonomous", label: "Chasing independent goals eagerly while reconnecting passionately on weekends", tag: "healthy_autonomy", weights: { autonomy_freedom: 1, closeness_merge: 0.2 } },
  },
  {
    id: "hp_3",
    prompt: "With an unexpected $3,000 shared bonus, which choice fits your truest instinct?",
    helper: "Security vs. Memory Making",
    a: { value: "cushion", label: "Save or invest it right away for long term home security and peace of mind", tag: "long_horizon", weights: { safety_stability: 1, play_experience: 0.2 } },
    b: { value: "trip", label: "Book an unforgettable romantic getaway together right now while life is bright", tag: "vivid_memories", weights: { play_experience: 1, safety_stability: 0.2 } },
  },
  {
    id: "hp_4",
    prompt: "Which everyday quality earns your deepest admiration in a partner?",
    helper: "Ambition vs. Attentive Presence",
    a: { value: "present", label: "Completely unhurried presence, always making time to slow down and listen close", tag: "unhurried_presence", weights: { closeness_merge: 0.9, safety_stability: 0.8, growth_ambition: 0.2 } },
    b: { value: "driven", label: "Fierce personal drive, ambition, and restless hunger pushing both of you higher", tag: "shared_ambition", weights: { growth_ambition: 1, autonomy_freedom: 0.7, closeness_merge: 0.3 } },
  },
  {
    id: "hp_5",
    prompt: "On social weekends, what kind of home feels truest to your happiness?",
    helper: "Lively Hosts vs. Private Sanctuary",
    a: { value: "hosts", label: "Warm open doors with friends dropping by for dinner parties, laughter, and music", tag: "vibrant_community", weights: { play_experience: 0.9, closeness_merge: 0.4, autonomy_freedom: 0.5 } },
    b: { value: "sanctuary", label: "A quiet sanctuary for just the two of us with slow mornings and calm nights", tag: "private_sanctuary", weights: { safety_stability: 0.9, closeness_merge: 0.8, play_experience: 0.3 } },
  },
  {
    id: "hp_6",
    prompt: "What carries you deeper during brutal personal seasons?",
    helper: "Spoken Reassurance vs. Quiet Practical Care",
    a: { value: "words", label: "Deep expressive talks unpacking every messy feeling together close under covers", tag: "emotional_depth", weights: { emotional_honesty: 1, closeness_merge: 0.8 } },
    b: { value: "calm_action", label: "Steady drama free practical support handling chores calmly without heavy dwelling", tag: "quiet_steadiness", weights: { safety_stability: 1, autonomy_freedom: 0.6 } },
  },
  {
    id: "hp_7",
    prompt: "Between bedroom chemistry and conflict free teamwork, which missing piece hurts worse?",
    helper: "Erotic Spark vs. Home Harmony",
    a: { value: "chemistry", label: "Losing intense physical passion and feeling purely like polite roommates", tag: "physical_passion", weights: { passion_novelty: 1, safety_stability: 0.3 } },
    b: { value: "teamwork", label: "Endless household friction and daily disorganization wearing down mutual peace", tag: "domestic_peace", weights: { safety_stability: 1, passion_novelty: 0.3 } },
  },
  {
    id: "hp_8",
    prompt: "When disagreements happen, which truth reveals your real priority?",
    helper: "Raw Honesty vs. Gentle Timing",
    a: { value: "candor", label: "Give me the blunt unvarnished truth even if uncomfortable so nothing festers secretly", tag: "radical_honesty", weights: { emotional_honesty: 1, autonomy_freedom: 0.7 } },
    b: { value: "tact", label: "Lead with kindness and soft timing because hard truths land better wrapped in care", tag: "gentle_kindness", weights: { safety_stability: 0.9, emotional_honesty: 0.5 } },
  },
  {
    id: "hp_9",
    prompt: "How should big future goals (careers, moving cities) be approached together?",
    helper: "Rooted Continuity vs. Bold Reinvention",
    a: { value: "roots", label: "Put down deep stable roots near loved ones and build lasting traditions", tag: "rooted_home", weights: { safety_stability: 1, growth_ambition: 0.4 } },
    b: { value: "reinvent", label: "Stay bold enough to jump cities, switch careers, or chase new chapters together", tag: "bold_evolution", weights: { growth_ambition: 1, passion_novelty: 0.8 } },
  },
  {
    id: "hp_10",
    prompt: "Which gift from a partner stays in your heart five years later?",
    helper: "Spontaneous Thrill vs. Intimate Attention",
    a: { value: "playful", label: "A surprise impulsive weekend roadtrip full of detours and midnight laughter", tag: "vivid_memories", weights: { play_experience: 1, passion_novelty: 0.8 } },
    b: { value: "letter", label: "A handwritten 3 page love letter naming small unspoken things they adore about you", tag: "emotional_depth", weights: { emotional_honesty: 1, closeness_merge: 0.9 } },
  },
  {
    id: "hp_11",
    prompt: "What matters more around friends?",
    helper: "United Front vs. Playful Banter",
    a: { value: "united", label: "Backing each other warmly in public and saving all critiques strictly for home", tag: "emotional_safety", weights: { safety_stability: 1, closeness_merge: 0.8 } },
    b: { value: "natural", label: "Roasting and bantering playfully out loud without worrying about keeping up polish", tag: "vibrant_community", weights: { play_experience: 0.9, autonomy_freedom: 0.8 } },
  },
  {
    id: "hp_12",
    prompt: "At the end of a lifelong partnership, what single word must describe it best?",
    helper: "Your Core Relationship Anchor",
    a: { value: "alive", label: "Alive: deeply passionate, curious, laughing, and still surprising each other", tag: "electric_spark", weights: { passion_novelty: 1, play_experience: 0.9 } },
    b: { value: "home", label: "Home: unshakable refuge, kindness, fierce loyalty, and calm", tag: "emotional_safety", weights: { safety_stability: 1, closeness_merge: 0.8 } },
  },
];

export const hiddenPrioritiesAssessment: AssessmentDefinition = {
  id: "your-hidden-relationship-priorities-v1",
  slug: "your-hidden-relationship-priorities",
  version: "1.0.0",
  title: "Your Hidden Relationship Priorities",
  shortTitle: "Hidden Priorities",
  category: "personality",
  status: "published",
  adultsOnly: false,
  audienceNote: "Twelve forced dilemmas pit two good values against each other so your true priority wins out.",
  futureExtensibilityNote: "Prevents rating everything 5/5 so real value tradeoffs emerge clearly.",
  estimatedMinutesQuick: 3,
  estimatedMinutesComplete: 5,
  supportsQuickMode: true,
  supportsPartnerMatching: true,
  supportsCommunityComparison: false,
  scoringStrategy: "forced_choice_priorities",
  compatibilityStrategy: "values_alignment",
  visualizationTypes: ["priority_ranking", "radar"],
  discoverPoints: [
    "Shows what wins when values collide across Safety, Passion, Autonomy, Closeness, and Ambition.",
  ],
  recommendedNextSlugs: ["ideal-partner-blueprint", "long-term-relationship-compatibility", "relationship-dealbreakers-boundaries"],
  supportedExports: ["pdf", "json", "csv", "share_card"],
  dimensions: [
    { key: "safety_stability", label: "Emotional Safety & Refuge", description: "Steadiness, security, and deep mutual calm." },
    { key: "passion_novelty", label: "Spark & Passion", description: "Chemistry, electric vitality, and bold variety." },
    { key: "closeness_merge", label: "Merged Togetherness", description: "Daily shared rituals and intertwined closeness." },
    { key: "autonomy_freedom", label: "Independent Autonomy", description: "Breathing room, separate hobbies, and high trust." },
    { key: "play_experience", label: "Play & Shared Memories", description: "Adventure, friends, and spontaneous fun." },
    { key: "emotional_honesty", label: "Candid Depth", description: "Raw honesty and deep emotional transparency." },
    { key: "growth_ambition", label: "Evolution & Drive", description: "Reinvention, drive, and shared momentum." },
  ],
  sections: test22Sections,
  questions: tradeoffs.map((t, idx) =>
    qChoice({
      id: t.id,
      order: idx + 1,
      sectionId: "tradeoffs",
      sectionTitle: "Value Tradeoff Dilemmas",
      inputType: "forced_choice",
      prompt: t.prompt,
      helperText: t.helper,
      quick: idx < 6,
      dimensionWeights: {
        safety_stability: 1,
        passion_novelty: 1,
        closeness_merge: 1,
        autonomy_freedom: 1,
        play_experience: 1,
        emotional_honesty: 1,
        growth_ambition: 1,
      },
      options: [
        { value: t.a.value, label: t.a.label, priorityTag: t.a.tag, dimensionWeights: t.a.weights },
        { value: t.b.value, label: t.b.label, priorityTag: t.b.tag, dimensionWeights: t.b.weights },
      ],
    })
  ),
};

export const categoryCPersonalityAssessments: AssessmentDefinition[] = [
  bigFivePersonalityAssessment,
  howOthersSeeYouAssessment,
  emotionalIntelligenceAssessment,
  conflictCommunicationAssessment,
  hiddenPrioritiesAssessment,
];
