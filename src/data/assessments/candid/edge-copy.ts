import type { AssessmentAdviceProfile, AssessmentDefinition } from "@/lib/assessment/types";

export const liveNames: Record<string, { title: string; short: string; hook: string; adult?: boolean }> = {
  "big-five-personality-profile": {
    title: "The IQ Test",
    short: "The IQ Test",
    hook: "Patterns, spatial reasoning, verbal logic, and processing speed under pressure.",
  },
  "emotional-availability-reflection": {
    title: "The Friendship Test",
    short: "The Friendship Test",
    hook: "Friends you would sleep with, deep secrets, money, loyalty, and who you actually call at 3 AM.",
    adult: true,
  },
  "attachment-style-discovery": {
    title: "The Love Compatibility Test",
    short: "The Love Compatibility Test",
    hook: "Sex, money, fighting, emotional security, and whether you truly fit together long-term.",
    adult: true,
  },
  "love-affection-preferences": {
    title: "The Love Language Test",
    short: "The Love Language Test",
    hook: "Words, touch, gifts, service, quality time, and sex as a love language.",
    adult: true,
  },
  "conflict-communication-personality": {
    title: "The Fight Test",
    short: "The Fight Test",
    hook: "How you fight, freeze, weaponize sex, and whether your conflict repair is real.",
    adult: true,
  },
  "relationship-dealbreakers-boundaries": {
    title: "The Icks Test",
    short: "The Icks Test",
    hook: "The specific things that make you recoil. Bad sex, bad hygiene, fake moans, and habits you cannot unsee.",
    adult: true,
  },
  "intimacy-partner-preferences": {
    title: "The Sexual Desire Test",
    short: "The Sexual Desire Test",
    hook: "How often you want to have sex, what gets you aroused, and what you crave done to you.",
    adult: true,
  },
  "sexual-interests-curiosity-map": {
    title: "The Kink Test",
    short: "The Kink Test",
    hook: "A candid catalog of kinks. Bondage, CNC, group sex, feet, pain, humiliation, and beyond.",
    adult: true,
  },
  "bdsm-power-dynamics-test": {
    title: "The BDSM Test",
    short: "The BDSM Test",
    hook: "Dominance, submission, bondage, discipline, sadism, masochism, and switch dynamics in action.",
    adult: true,
  },
  "desire-reality-map": {
    title: "The Fantasy vs. Reality Test",
    short: "The Fantasy vs. Reality Test",
    hook: "What you fantasize about, what you have done, and what you would actually say yes to tonight.",
  },
  "turn-on-anatomy": {
    title: "The Turn-On Test",
    short: "The Turn-On Test",
    hook: "The grip, the mouth, the eye contact, the whispers, and the exact pace that turns you on.",
  },
  "sensory-sensation-play-map": {
    title: "The Touch & Sensation Test",
    short: "The Sensation Test",
    hook: "Impact, ice, hot wax, leather, fingernails, and the physical sensations that light up your nerves.",
  },
  "sensory-deprivation-overload": {
    title: "The Blindfold & Sensory Edge Test",
    short: "The Sensory Edge Test",
    hook: "Blindfolds, silence, sensory overload, and the safeword that must work when senses are stripped.",
  },
  "fantasy-catalog": {
    title: "The Secret Fantasies Test",
    short: "The Fantasy Test",
    hook: "Fifty secret fantasies from tender to taboo. Receiving and performing rated independently.",
  },
  "aftercare-recovery-style": {
    title: "The Aftercare Test",
    short: "The Aftercare Test",
    hook: "What your body and mind need after sex: holding, sweet praise, hydration, quiet space, or a check-in.",
  },
  "attachment-bedroom": {
    title: "The Bedroom Attachment Test",
    short: "The Bedroom Attachment Test",
    hook: "Reassurance, emotional space, and whether sex is how you check that your bond is safe.",
  },
  "post-intimacy-morning-after": {
    title: "The Morning-After Test",
    short: "The Morning-After Test",
    hook: "Stay, leave, cuddle, talk, or slip out before coffee. How you handle the morning after.",
  },
  "recovery-past-experiences": {
    title: "The Safe Space & Healing Test",
    short: "The Safety & Healing Test",
    hook: "Triggers, bodily boundaries, pacing, and what makes sex feel safe, comfortable, and restorative now.",
  },
  "fantasy-sharing-comfort": {
    title: "The Secret Confessions Test",
    short: "The Confession Test",
    hook: "How your taboo wants get confessed, heard, kept sacred, or explored with someone you trust.",
  },
  "curiosity-exploration-speed": {
    title: "The Sexual Adventure & Pace Test",
    short: "The Exploration Pace Test",
    hook: "How fast you want to try new things in bed, from slow-burn comfort to diving into the deep end.",
  },
  "communication-language-profile": {
    title: "The Dirty Talk Test",
    short: "The Dirty Talk Test",
    hook: "Orders, praise, dirty whispers, silence, and the words that take you completely over the edge.",
  },
  "service-devotion-profile": {
    title: "The Pleasure & Devotion Test",
    short: "The Devotion Test",
    hook: "Pleaser energy, oral devotion, acts of sexual service, and the thrill of getting worshipped.",
  },
  "praise-intensity-spectrum": {
    title: "The Praise Kink & Degradation Test",
    short: "The Praise & Humiliation Test",
    hook: "Good girl, good boy, verbal worship, mean teasing, and degrading dirty talk you choose.",
  },
  "orgasm-pacing-control": {
    title: "The Edging & Climax Control Test",
    short: "The Edging Test",
    hook: "Waiting, permission, edging, ruined finishes, and taking complete control over climax.",
  },
  "adult-caregiving-comfort": {
    title: "The Caregiver & Pampering Test",
    short: "The Caregiver Test",
    hook: "Being looked after, head pats, tender dominance, and feeling completely cared for and safe.",
  },
  "primal-movement-play": {
    title: "The Primal & Biting Test",
    short: "The Primal Test",
    hook: "Chase, pin, bite, scratch, growl, and uninhibited animal instincts in the bedroom.",
  },
  "power-exchange-intensity": {
    title: "The Dominance & Submission Test",
    short: "The Power Exchange Test",
    hook: "Who takes the lead, who surrenders control, protocol, kneeling, and negotiated power dynamics.",
  },
  "roleplay-scenario-explorer": {
    title: "The Taboo Roleplay Test",
    short: "The Roleplay Test",
    hook: "Strangers at a hotel bar, authority figures, secret affairs, and erotic scenarios brought to life.",
  },
  "privacy-visibility-risk-profile": {
    title: "The Exhibitionist & Public Risk Test",
    short: "The Exhibitionist Test",
    hook: "Being seen, sex outdoors, window silhouettes, and the intoxicating thrill of risk.",
  },
  "jealousy-compersion-relationship-structures": {
    title: "The Open Relationship & Jealousy Test",
    short: "The Jealousy & Openness Test",
    hook: "Monogamy, threesomes, polyamory, cuckolding, hall passes, and how you actually handle jealousy.",
  },
  "toys-tools-gear-preferences": {
    title: "The Sex Toys & Gear Test",
    short: "The Toy Test",
    hook: "Wands, handcuffs, blindfolds, paddles, ropes, and the hardware you keep in your nightstand.",
  },
  "limits-boundaries-deep-dive": {
    title: "The Hard Limits & Red Lines Test",
    short: "The Limits Test",
    hook: "Your absolute hard limits, soft limits, and the unnegotiable red lines in the bedroom.",
  },
  "partner-ideal-dealbreakers": {
    title: "The Partner Finding Test",
    short: "The Partner Finding Test",
    hook: "Who you would actually take home, sleep with, and keep. Chemistry, lifestyle, looks, and dealbreakers.",
  },
  "group-multipartner-interest": {
    title: "The Threesome & Group Sex Test",
    short: "The Group Sex Test",
    hook: "Threesomes (MFM/FFM), orgies, watching your partner, and multi-partner sexual curiosity.",
  },
  "financial-gifting-boundaries": {
    title: "The Findom & Sugar Dating Test",
    short: "The Findom Test",
    hook: "Financial domination, sugar dynamics, spending control, cash tribute, and lifestyle spoiling.",
  },
  "long-term-dynamic-vision": {
    title: "The Husband / Wife Test",
    short: "The Husband / Wife Test",
    hook: "Marriage sex, domestic life, money, emotional loyalty, and who actually calls the shots.",
  },
  "kink-compatibility-stress-test": {
    title: "The Kink Compatibility Test",
    short: "The Kink Compatibility Test",
    hook: "When fantasies clash: how you negotiate desires, deal with mismatched kinks, and find common ground.",
  },
  "spicy-would-you-rather": {
    title: "The Spicy Would You Rather Test",
    short: "The Spicy Would You Rather Test",
    hook: "Fifty spicy dilemmas. Pick the wilder option between two irresistible erotic choices.",
  },
  "personal-erotic-blueprint": {
    title: "The Master Intimacy Blueprint Test",
    short: "The Intimacy Blueprint Test",
    hook: "The comprehensive erotic map connecting your desires, kinks, romance, and communication style.",
  },
  "erotic-blueprint-style": {
    title: "The Erotic Blueprint Style Test",
    short: "The Erotic Blueprint Test",
    hook: "Sensual, Energetic, Sexual, Kinky, or Shapeshifter. Discover your dominant erotic blueprint type.",
  },
};

export const sectionLabels: Record<string, Record<string, string>> = {
  "big-five-personality-profile": {
    openness: "Patterns",
    conscientiousness: "Numbers",
    extraversion: "Words",
    agreeableness: "Logic",
    stress_sensitivity: "Under pressure",
  },
  "emotional-availability-reflection": {
    awareness: "Reading your friends",
    openness: "What you tell friends",
    presence: "Showing up",
    reciprocity: "Who carries the friendship",
    capacity: "What you have left for them",
  },
  "attachment-style-discovery": {
    reassurance: "Do they want you",
    closeness: "How fused the love is",
    autonomy: "A life outside the couple",
    trust: "Sexual and romantic trust",
    direct_needs: "The compatibility ask",
  },
  "love-affection-preferences": {
    appreciation: "Words of affirmation",
    shared_attention: "Quality time",
    practical_care: "Acts of service",
    comfort: "Physical touch",
    playful_connection: "Gifts",
  },
  "conflict-communication-personality": {
    direct_communication: "Saying the ugly sentence",
    listening: "Hearing it",
    regulation: "The brake",
    accountability: "The specific sorry",
    collaboration: "A deal that is not a surrender",
  },
  "relationship-dealbreakers-boundaries": {
    reliability: "Sex icks",
    autonomy_privacy: "Social icks",
    future_alignment: "Life icks",
    shared_responsibility: "Effort icks",
    growth: "Body icks",
  },
  "intimacy-partner-preferences": {
    spontaneous_desire: "How often you want sex",
    responsive_context: "What makes you want it",
    sensory_pacing: "How you want to be fucked",
    preference_communication: "What you want said",
    aftercare: "After you come",
  },
  "sexual-interests-curiosity-map": {
    novelty: "Kinks you want",
    imagination: "Kink fantasies",
    sensory_exploration: "Sensation kinks",
    role_imagination: "Role kinks",
    boundary_clarity: "Kinks that are a no",
  },
  "bdsm-power-dynamics-test": {
    guiding: "Dominance",
    following: "Submission",
    role_flexibility: "Switch",
    structure: "Bondage and discipline",
    checkins: "Sadism and masochism",
  },
  "desire-reality-map": {
    invitation: "How sex starts",
    conditions: "What has to be true",
    novelty: "Changing the script",
    attention: "Being met",
    voice: "What gets said",
  },
  "turn-on-anatomy": {
    contact: "Hands, mouth, grip",
    visual: "Being looked at",
    sound: "Voice and noise",
    pace: "Speed",
    recognition: "Being clocked",
  },
  "sensory-sensation-play-map": {
    texture: "Implements and skin",
    temperature: "Heat and ice",
    pressure: "Impact and grip",
    focus: "One sensation",
    planning: "Marks and stops",
  },
  "praise-intensity-spectrum": {
    praise: "Specific praise",
    spotlight: "Being the point",
    teasing: "Mean on purpose",
    intensity: "Worship and degradation",
    context: "Where it is allowed",
  },
  "power-exchange-intensity": {
    direction: "Who decides",
    structure: "Rules",
    duration: "How long",
    reciprocity: "Switching the power",
    separation: "What power does not touch",
  },
  "privacy-visibility-risk-profile": {
    discretion: "Hidden in public",
    private: "No audience",
    audience: "Consenting witnesses",
    fiction: "The risk fantasy",
    control: "Photos and exits",
  },
  "group-multipartner-interest": {
    imagination: "The group fantasy",
    social: "Meeting as people",
    attention: "Who gets looked at",
    agreements: "The rules first",
    afterward: "The next day",
  },
  "financial-gifting-boundaries": {
    symbolism: "Gifts that mean power",
    ritual: "Tribute and ceilings",
    experiences: "Generosity without debt",
    independence: "Money the scene cannot touch",
    planning: "Before anyone pays",
  },
  "long-term-dynamic-vision": {
    rhythm: "The sexual calendar",
    roles: "Roles that survive a Tuesday",
    ordinary: "The unsexy week",
    flexibility: "Changing the deal",
    independence: "A self that can leave",
  },
  "kink-compatibility-stress-test": {
    changes: "Canceled scenes",
    energy: "Uneven want",
    expectations: "A maybe treated as a yes",
    awkward: "When the scene fails",
    repair: "After a limit is missed",
  },
  "roleplay-scenario-explorer": {
    strangers: "Stranger scenes",
    guides: "Authority and capture",
    atmosphere: "The room",
    performance: "Staying in character",
    collaboration: "Writing the stop first",
  },
  "orgasm-pacing-control": {
    anticipation: "The wait",
    guidance: "Permission",
    flexibility: "Not coming",
    presence: "Dropping the target",
    debrief: "Who the control was for",
  },
};

const advicePatches: Record<string, Partial<AssessmentAdviceProfile>> = {
  "bdsm-power-dynamics-test": {
    theme: "power that can be put down",
    seek: "Someone who can lead or follow without confusing a scene with ownership of your life",
    friction: "A shared kink label does not mean you want the same cruelty, the same aftercare, or the same Tuesday.",
    optimize: "Write the role, the time window, the real stop, and the parts of life the role does not touch.",
    ask: "What do you want to decide, what do you want decided for you, and what ends the scene even if the begging says otherwise?",
    wording: "I want negotiated power, a real stop, and a return to equal footing. A scene is not a personality and not a blank check.",
  },
  "sexual-interests-curiosity-map": {
    theme: "kink without a forced graduation",
    seek: "Someone who can hear a fantasy without scheduling it, and a limit without debating it",
    friction: "Curiosity and willingness are different scores. Treating them as the same is how maybes become pressure.",
    optimize: "Mark each hot item as fantasy, a conversation, a possible scene, or a no. Do not average them.",
    ask: "Which part is the act, which part is the feeling, and which part stays imaginary?",
  },
  "intimacy-partner-preferences": {
    theme: "how want actually arrives",
    seek: "Someone who can meet sudden lust or slow-building desire without making either one a character flaw",
    friction: "A partner who only recognizes desire when it looks like theirs will miss you, or push you.",
    optimize: "Separate the setup you need, the act you want, and the care you need after. They are not one request.",
    ask: "Do you want me to start this, wait for you, or ask again after we have been kissing?",
  },
  "love-affection-preferences": {
    theme: "the gesture that actually lands",
    seek: "Someone willing to learn your specific gesture instead of repeating the one that would work on them",
    friction: "Giving the love language you prefer to receive is a common way to miss a person completely.",
    optimize: "Name one gesture that feels like being chosen and one that feels like being managed.",
    ask: "What small, specific thing makes you feel wanted, and what similar thing leaves you cold?",
  },
  "attachment-style-discovery": {
    theme: "love under uncertainty",
    seek: "Someone who can offer a clear signal and still leave you a life that is yours",
    friction: "Sex used as a reassurance test, and distance used as a punishment, will imitate compatibility until they don't.",
    optimize: "Ask for the reassurance you actually want, and name the time apart that is not a threat.",
    ask: "When you go quiet, what should I believe, and when should I ask?",
  },
  "relationship-dealbreakers-boundaries": {
    theme: "the ick that is information",
    seek: "Someone whose ordinary behavior matches the desire they perform",
    friction: "Chemistry can hide contempt, selfish sex, and a no that only counts when it is convenient.",
    optimize: "Turn one dealbreaker into a behavior you can see in the next two weeks, not a vibe.",
    ask: "What do you do when you are disappointed, horny, and the other person has said no?",
  },
  "emotional-availability-reflection": {
    theme: "friendship with the truth in it",
    seek: "Someone who can stay a friend when the feeling gets sexual, lonely, or uneven",
    friction: "Flirtation used to avoid need, and need used to avoid a no, both wreck the friendship.",
    optimize: "Name whether you want listening, advice, distance, or a confession before the night decides for you.",
    ask: "Are we telling the truth about what this friendship is allowed to be?",
  },
  "partner-ideal-dealbreakers": {
    theme: "a partner you can actually find",
    seek: "Someone whose offered habits match the heat you are screening for",
    friction: "A beautiful limit on paper means nothing if disappointment turns into punishment.",
    optimize: "Translate one ideal into a question you can ask on date three, and one behavior you will not explain away.",
    ask: "What do you do the morning after, and what do you do when I change my mind?",
  },
  "long-term-dynamic-vision": {
    theme: "a long partnership that can still be filthy",
    seek: "Someone who wants a life, not only a scene, and can revise either one",
    friction: "A role that is hot on Saturday can become unpaid labor, or a cage, if nobody reviews it.",
    optimize: "Describe one ordinary week, including low desire, and one review point.",
    ask: "What has to stay hot in year five, and what are we allowed to retire?",
  },
  "financial-gifting-boundaries": {
    theme: "money play with a ceiling",
    seek: "Someone who can eroticize tribute or control without touching rent, debt, or your ability to leave",
    friction: "A gift becomes pressure when gratitude is treated as consent or repayment.",
    optimize: "Set the ceiling, the no-spend alternative, and the accounts that are outside the scene before anyone pays.",
    ask: "Is this play, care, or a debt? What ends it?",
  },
  "group-multipartner-interest": {
    theme: "more than two, or only the idea",
    seek: "Adults who speak for themselves and can hear that a fantasy is not a booking",
    friction: "Two people's shared heat cannot consent for a third, and jealousy is not a moral failure.",
    optimize: "Separate the watcher, the watched, and the person in the middle. Then separate fantasy from a plan.",
    ask: "Is this a story, a conversation, or a night we are actually willing to design?",
  },
  "praise-intensity-spectrum": {
    theme: "praise, teasing, and chosen humiliation",
    seek: "Someone who can be precise, mean on purpose, and sincere the moment the scene ends",
    friction: "A word that is hot in a scene can be harm at breakfast. Context is the whole kink.",
    optimize: "List the words that land, the words that end it, and the rooms where none of them are allowed.",
    ask: "Do you want worship, degradation, or the switch between them — and where does it stop?",
  },
  "kink-compatibility-stress-test": {
    theme: "kink when the plan breaks",
    seek: "Someone who can be disappointed without charging you a replacement scene",
    friction: "A paid hotel, a bought toy, or a rehearsed script is not a contract for your body.",
    optimize: "Practice one canceled plan and one missed aftercare repair before you try anything heavy.",
    ask: "If I stop, what do you do with the disappointment?",
  },
  "privacy-visibility-risk-profile": {
    theme: "being seen on purpose",
    seek: "Someone who can tell a consenting witness from a bystander, and a fantasy from a street",
    friction: "Risk is hot until it includes a person who never agreed to be in the sex.",
    optimize: "Decide audience, photos, and the exit separately. Default is no audience and no recording.",
    ask: "Who is allowed to see this, who is allowed to know, and what happens if that changes?",
  },
  "roleplay-scenario-explorer": {
    theme: "fiction with a real stop",
    seek: "Someone who can play a villain, a stranger, or a captor and still hear the person underneath",
    friction: "CNC and taboo plots get dangerous when the plot is allowed to outrank the stop.",
    optimize: "Write the ending and the real-world stop before the opening line.",
    ask: "What is the story, what is off-plot, and which word belongs to us rather than the characters?",
  },
};

export function applyLiveVoice(assessment: AssessmentDefinition): void {
  const name = liveNames[assessment.slug];
  if (name) {
    assessment.title = name.title;
    assessment.shortTitle = name.short;
    assessment.marketingBlurb = name.hook;
    assessment.audienceNote = name.hook;
    assessment.purpose = name.hook;
    if (name.adult) assessment.adultsOnly = true;
  }
  const labels = sectionLabels[assessment.slug];
  if (labels) {
    for (const section of assessment.sections) if (labels[section.id]) section.title = labels[section.id];
    for (const dimension of assessment.dimensions || []) if (labels[dimension.key]) dimension.label = labels[dimension.key];
    for (const question of assessment.questions) if (labels[question.sectionId]) question.sectionTitle = labels[question.sectionId];
  }
  assessment.discoverPoints = assessment.sections.map((section) => section.title);
  for (const dimension of assessment.dimensions || []) {
    if (!dimension.interpretations) continue;
    const label = dimension.label;
    dimension.interpretations.high.meaning = `High ${label}: your answers keep landing on want, not on a polite maybe. That is an appetite. It is not consent, not a partner's job, and not a grade.`;
    dimension.interpretations.low.meaning = `Low ${label}: this is not where your heat or your need sits. That is useful. It is not a hard limit unless you marked one, and it is not a flaw to fix.`;
    dimension.interpretations.balanced.meaning = `Mixed ${label}: the average is hiding the interesting split — role, mood, person, or setting. Read the items, not the headline.`;
    dimension.interpretations.high.experiment = `Pick the one ${label.toLowerCase()} item that made you stall. Write the condition that keeps it hot and the condition that makes it a no.`;
    dimension.interpretations.low.experiment = `Name what you want instead of ${label.toLowerCase()}. A specific alternative is more useful than a vague low score.`;
    dimension.interpretations.balanced.experiment = `Compare your highest and lowest answer in ${label.toLowerCase()} before you tell anyone a story about your type.`;
    dimension.interpretations.high.reflection = "If a partner loved this and you only loved the idea, which part is fantasy and which part would you do?";
    dimension.interpretations.low.reflection = "Is this a true no, a not-with-this-person, or a not-yet? Those are different answers.";
    dimension.interpretations.balanced.reflection = "What changes when you are receiving it, offering it, or only imagining it?";
    dimension.interpretations.high.possibleTradeoff = "Strong interest can bulldoze a limit, yours or someone else's, if you treat the score as a plan.";
    dimension.interpretations.low.possibleTradeoff = "A low score can be used to shame a partner who is high here. It is a preference, not a verdict on them.";
    dimension.interpretations.balanced.possibleTradeoff = "A middle score is often two clear answers averaged into mush.";
  }
  if (assessment.slug === "big-five-personality-profile") {
    for (const dimension of assessment.dimensions || []) {
      if (!dimension.interpretations) continue;
      const label = dimension.label;
      dimension.interpretations.high.meaning = `High ${label}: you report being fast and accurate here. This is a reasoning quiz, not a clinical IQ score.`;
      dimension.interpretations.low.meaning = `Low ${label}: these problems slow you down or slip. That is a skill pattern, not a verdict on your worth.`;
      dimension.interpretations.balanced.meaning = `Mixed ${label}: you are sharp on some items and lost on others. The split is the result.`;
      dimension.interpretations.high.experiment = `Redo one ${label.toLowerCase()} item cold, without looking at the explanation you just gave yourself.`;
      dimension.interpretations.low.experiment = `Take one ${label.toLowerCase()} item you guessed and write the rule you missed.`;
      dimension.interpretations.high.reflection = "Where were you actually solving, and where were you recognizing a familiar trick?";
      dimension.interpretations.low.reflection = "Is this a skill you never practiced, or a skill that collapses when you are timed?";
    }
  }
  const patch = advicePatches[assessment.slug];
  if (patch && assessment.adviceProfile) assessment.adviceProfile = { ...assessment.adviceProfile, ...patch };
  if (assessment.adviceProfile && !patch) {
    assessment.adviceProfile = {
      ...assessment.adviceProfile,
      seek: assessment.adviceProfile.seek.includes("specific")
        ? assessment.adviceProfile.seek
        : `Someone who can hear the specific want in ${assessment.shortTitle} without turning a high score into an obligation`,
      optimize: `Separate fantasy, a willing maybe, and a hard no before you talk about any item in ${assessment.shortTitle}.`,
      ask: "Which part do you want to receive, which part do you want to give, and which part stays imaginary?",
    };
  }
}
