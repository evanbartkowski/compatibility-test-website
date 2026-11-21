import type { AssessmentAdviceProfile, AssessmentDefinition, QuestionDefinition } from "@/lib/assessment/types";

type Scale = {
  key: string;
  label: string;
  description: string;
  items: string[];
};

const advice = (theme: string, seek: string, ask: string): AssessmentAdviceProfile => ({
  theme,
  seek,
  friction: "A high score is a pattern in answers, not a diagnosis and not permission to treat someone else as a type.",
  optimize: "Read the highest category, then the reverse items. The split is more useful than the nickname.",
  solo: ["Write the pattern in one sentence", "Name what the score describes and what it does not prove."],
  together: ["Compare one category", "Each person names their highest category and one thing they do not want assumed from it."],
  curiosity: ["Retake one section later", "See whether the same items still fit after a week, not after one mood."],
  ask,
});

function build(input: {
  slug: string;
  title: string;
  shortTitle: string;
  category: AssessmentDefinition["category"];
  adultsOnly?: boolean;
  hook: string;
  matching?: boolean;
  scales: Scale[];
  ask: string;
}): AssessmentDefinition {
  const questions: QuestionDefinition[] = [];
  let order = 0;
  for (const scale of input.scales) {
    scale.items.forEach((item, index) => {
      order += 1;
      const prompt = item.replace(/^!/, "");
      questions.push({
        id: `${input.slug}-${scale.key}-${index + 1}`,
        order,
        sectionId: scale.key,
        sectionTitle: scale.label,
        inputType: "rating_scale",
        prompt,
        partnerPrompt: prompt,
        helperText: "Rate how true this is of you. Skip is not a button. Blank items are skipped when you continue.",
        quickDiscovery: index < 2,
        directionality: "shared_value",
        supportsExperienceFrequency: false,
        supportsImportance: false,
        supportsBoundaryFlag: false,
        partnerSupportsWillingness: false,
        eligibleForMatching: input.matching !== false,
        safetySensitive: Boolean(input.adultsOnly),
        dimensionWeights: { [scale.key]: 1 },
        reverseScored: item.startsWith("!"),
        editorialStatus: "verified",
        scaleConfig: {
          min: 1,
          max: 7,
          minLabel: "Strongly disagree",
          midLabel: "Neither agree nor disagree",
          maxLabel: "Strongly agree",
        },
      });
    });
  }
  return {
    id: `${input.slug}-v1`,
    slug: input.slug,
    version: "1.0.0",
    title: input.title,
    shortTitle: input.shortTitle,
    category: input.category,
    status: "published",
    adultsOnly: input.adultsOnly,
    audienceNote: input.hook,
    purpose: input.hook,
    marketingBlurb: input.hook,
    futureExtensibilityNote: "Self-report patterns. Not a clinical diagnosis.",
    scientificDisclaimer: "This is a self-report quiz, not a clinical test, diagnosis, or population norm.",
    estimatedMinutesQuick: 4,
    estimatedMinutesComplete: 14,
    supportsQuickMode: true,
    supportsPartnerMatching: input.matching !== false,
    supportsCommunityComparison: false,
    scoringStrategy: "dimension_average",
    compatibilityStrategy: "trait_similarity_complement",
    visualizationTypes: ["radar", "spectrum", "category-detail"],
    supportedExports: ["pdf", "json"],
    quickDescription: "Two statements from each category.",
    deepDescription: `${questions.length} statements across ${input.scales.length} categories.`,
    discoverPoints: input.scales.map((s) => s.label),
    scoringNotes: ["Agreement is averaged inside each category. Reverse items are flipped. Skips are not neutral."],
    adviceProfile: advice(input.shortTitle, input.hook, input.ask),
    dimensions: input.scales.map((s) => ({
      key: s.key,
      label: s.label,
      description: s.description,
    })),
    sections: input.scales.map((s) => ({
      id: s.key,
      title: s.label,
      subtitle: "Usual pattern, not the person you wish you were.",
      description: s.description,
    })),
    questions,
    recommendedNextSlugs: ["big-five-personality-profile"],
  };
}

const mbti = [
  "I get energy from being around people and leave a party later than I planned.",
  "I think out loud. A conversation helps me find the point.",
  "!After a crowded day I need hours alone before I can be decent company.",
  "I would rather host than spend the evening with one person and a closed door.",
  "Strangers do not drain me. New rooms wake me up.",
  "I recharge by talking, not by disappearing.",
  "!I prefer text to a call, and a call to a room full of people.",
  "I start conversations with people I do not know.",
  "Being the center of a group is comfortable, not a performance I have to recover from.",
  "!My best thinking happens after everyone has left.",
  "I get bored faster alone than I do in company.",
  "I want a life with a lot of people in it, not a life I narrate later.",
  "Silence with another person starts to feel like work.",
];

const intuition = [
  "I trust the pattern before I trust the checklist.",
  "I get impatient with details once I think I see where something is going.",
  "!I want the concrete facts before I care about the theory.",
  "Metaphors and what-ifs are how I actually understand a problem.",
  "I notice the implication someone did not say.",
  "A practical step-by-step bores me if I cannot see the point.",
  "!I trust what I can measure more than what I can imagine.",
  "I would rather invent a frame than follow a manual.",
  "Future possibilities interest me more than the way things have always been done.",
  "!If it is not in front of me, I do not spend much time on it.",
  "I connect unrelated ideas and then check whether the connection is real.",
  "Symbols, vibes, and subtext are data to me.",
  "I skip the instructions and start from the idea.",
];

const thinking = [
  "In a hard choice I start with what is fair and logical, then check feelings.",
  "I can tell someone they are wrong without it feeling like an attack, even if they take it as one.",
  "!I decide by who will be hurt, and the logic comes second.",
  "A flawed argument bothers me even when I like the person.",
  "I would rather be accurate than comforting.",
  "Criticism is useful. I do not need it wrapped.",
  "!Harmony matters more to me than winning the point.",
  "I can separate a person's worth from a bad idea they just said.",
  "I get annoyed when a decision is made to keep the peace instead of to solve the problem.",
  "!I soften the truth if the truth will upset the room.",
  "Principles beat special pleading, including my own.",
  "I want the reason, not the mood.",
  "I can be warm and still refuse a bad argument.",
];

const judging = [
  "I want the plan, the time, and the ending decided before I relax.",
  "An open-ended day makes me invent a schedule so I can enjoy it.",
  "!I do my best work when the deadline is close and the plan is still loose.",
  "I close loops. Unfinished tasks sit in my head until they are done.",
  "I would rather decide and revise than keep the options open.",
  "Lists, calendars, and a cleared inbox are how I feel like myself.",
  "!I resent a plan that cannot change when the day changes.",
  "I start early. Waiting until I feel like it is how things slip.",
  "Ambiguity about who is doing what bothers me more than the work itself.",
  "!I keep my options open on purpose, even when other people want a decision.",
  "A decision made is better than a perfect decision pending.",
  "I like knowing what next week looks like.",
  "Spontaneity is fun after the obligations are already handled.",
];

const sameGender = [
  "I am sexually attracted to people of my own gender.",
  "I picture sex with someone of my own gender more easily than with anyone else.",
  "!Same-gender bodies do not turn me on.",
  "A same-gender crush has been real, not a joke I told for attention.",
  "I get aroused by same-gender porn, fantasy, or people I actually know.",
  "If I had to pick the gender I most want in bed, it is my own.",
  "!I have never wanted to kiss someone of my own gender.",
  "Same-gender attraction shows up in my body, not only in my politics.",
  "I have wanted to date, not only sleep with, someone of my own gender.",
  "!The idea of a same-gender relationship leaves me cold.",
  "My strongest sexual pull has been toward my own gender.",
  "I notice same-gender people in a room the way other people notice the gender they want.",
  "I would rather be with someone of my own gender than force an opposite-gender script.",
];

const otherGender = [
  "I am sexually attracted to a gender that is not my own.",
  "Opposite-gender or different-gender sex is a real want, not a duty.",
  "!People of a different gender do not turn me on.",
  "I have had crushes on more than one gender.",
  "My attraction does not stay inside one gender.",
  "I can want men and women, or more than those two, without it being a phase I owe anyone.",
  "!I am only attracted to one gender, and the others do not register.",
  "A different-gender partner can be what I want, not what I perform.",
  "Bisexual or pansexual descriptions fit me better than a single-gender one.",
  "!Switching the gender in a fantasy kills the fantasy.",
  "I have wanted sex with more than one gender in the same year.",
  "Gender is not the only thing that decides whether I want someone.",
  "I can be specific about which genders I want and which I do not.",
];

const sortOf = [
  "I want a same-gender dynamic with a clear sexual role: top, bottom, vers, or the lesbian equivalent.",
  "Masculine partners, feminine partners, or both: I know which presentation I actually chase.",
  "!I do not care about role, presentation, or scene. Attraction is only the gender.",
  "I want rough same-gender sex, not only tender same-gender romance.",
  "I want a queer relationship that is domestic, not only a hookup culture.",
  "Bears, twinks, butches, femmes, studs, or none of those boxes: I have a type.",
  "!Labels for how I have queer sex feel like costumes I do not wear.",
  "I want to be out, or I want this private. I know which, and it is part of the kind of queer life I want.",
  "Kink and same-gender sex belong together for me, not in separate rooms.",
  "I want a partner who is also attracted to my gender, not a straight experiment.",
  "!The only thing I want from queerness is the identity, not the sex.",
  "I know whether I want to pursue, be pursued, or switch.",
  "The kind of gay, bi, or queer sex I want is specific, and I can name it.",
];

const community = [
  "Queer bars, apps, and friend groups are where I actually look.",
  "I want a partner who is comfortable being seen with me as a couple.",
  "!I keep same-gender desire completely separate from the rest of my life.",
  "Coming out, or staying quiet, is a choice I have made on purpose.",
  "I want queer sex and a queer social life, not one without the other.",
  "Straight dating has felt like acting.",
  "!I am only curious. I do not want a same-gender relationship or a same-gender sex life.",
  "I can tell the difference between admiration, political solidarity, and wanting to fuck someone.",
  "My orientation is stable enough that I would bet on it, even if the label took time.",
  "I have changed how I name this, and the attraction underneath did not disappear.",
  "!This is a phase I expect to grow out of.",
  "I want the test to say the pattern plainly: who I want, how much, and what kind.",
  "I trust my arousal more than the story I was handed about who I should want.",
];

const race = [
  "I get uneasy when a neighborhood, school, or workplace becomes mostly another race.",
  "I assume some races are better at certain jobs, sports, or kinds of intelligence.",
  "!I judge strangers by what they do, not by race.",
  "I would rather date, hire, or live near my own race, and I treat that as common sense.",
  "A crime story feels more believable to me when the suspect is a race I already distrust.",
  "I lock the door, clutch the bag, or cross the street based on race.",
  "!I can name a racial stereotype I used to believe and have dropped.",
  "Jokes about another race are fine if I say I am not serious.",
  "I think racism is mostly over, and people who mention it are looking for an advantage.",
  "I trust a same-race stranger faster than a different-race stranger with the same behavior.",
  "!I want my closest circle to include people whose race is not mine.",
  "I explain other people's behavior by their race before I know them.",
  "I would be unhappy if a family member married outside our race.",
];

const antiGay = [
  "Two men or two women kissing in public bothers me more than a straight couple doing the same thing.",
  "I think being gay or bi is a choice, a trend, or a moral failure.",
  "!Gay and bi people should have the same marriage, jobs, housing, and ordinary life as anyone else.",
  "I use 'gay' as an insult, or I laugh when other people do.",
  "I would not want a gay coworker, roommate, or friend.",
  "I think queer people are pushing it by existing where children or families can see them.",
  "!I would defend a gay friend in a room that was being cruel.",
  "I am fine with gay people as long as they do not 'act gay' around me.",
  "I think same-gender sex is disgusting even when it is between adults who want it.",
  "I would be ashamed if my child were gay or bi.",
  "!A gay couple raising kids does not bother me.",
  "I treat queer identity as something to tolerate, not as a normal way to be a person.",
  "I make exceptions for one gay person and keep the prejudice for the group.",
];

const stereotype = [
  "I have a ranking of races, religions, or nationalities in my head, even if I do not say it.",
  "I think poor people, immigrants, or another group are lazy until proven otherwise.",
  "!When I catch a stereotype, I treat it as my error, not as street smarts.",
  "I believe crime, welfare, or intelligence statistics prove a group's character.",
  "I talk about 'those people' as if they share one personality.",
  "A person's accent, name, or country of origin lowers my expectations.",
  "!I ask before I assume someone's culture, religion, or politics from their face.",
  "I think some groups are more violent, more dirty, or more dishonest by nature.",
  "I repeat 'facts' about a group that I have never checked.",
  "I get angry when a group asks not to be stereotyped.",
  "!I can like my own group without needing another group to be worse.",
  "I use one bad experience with a person as evidence about their whole group.",
  "I think equality has gone too far for a group I do not belong to.",
];

const examine = [
  "I want to know if I am racist or homophobic, even if the answer is ugly.",
  "I can hear that a joke landed as prejudice and retire the joke.",
  "!I treat any suggestion that I am biased as an attack, and I stop listening.",
  "I have changed a belief about a group because the belief did not survive contact with real people.",
  "I would rather lose an argument than keep a prejudice I cannot defend.",
  "I notice when my fear is about race or sexuality and not about the actual situation.",
  "!I do not think I am capable of racism or homophobia, so I do not check.",
  "I can separate a political disagreement from contempt for a whole group.",
  "I want my dating, hiring, and friendship choices examined, not protected.",
  "If this test scores me high, I would believe the items, not the excuse.",
  "!A high prejudice score would just mean the test is biased against people like me.",
  "I can want my own culture and still refuse a hierarchy.",
  "I would tell a friend to stop if they were being racist or homophobic in front of me.",
];

export const extraAssessments: AssessmentDefinition[] = [
  build({
    slug: "myers-briggs-type-test",
    title: "The Personality Type Test",
    shortTitle: "The Personality Type Test",
    category: "personality",
    hook: "INTJ, ENFP, and the rest. Four letters from how you actually think, not a horoscope.",
    ask: "Which letter feels like you on a tired Tuesday, not on your best interview?",
    scales: [
      { key: "extraversion", label: "Extraversion", description: "High means E. Low means I.", items: mbti },
      { key: "intuition", label: "Intuition", description: "High means N. Low means S.", items: intuition },
      { key: "thinking", label: "Thinking", description: "High means T. Low means F.", items: thinking },
      { key: "judging", label: "Judging", description: "High means J. Low means P.", items: judging },
    ],
  }),
  build({
    slug: "gay-lgbt-attraction-test",
    title: "The Gay Test",
    shortTitle: "The Gay Test",
    category: "sexuality-intimacy",
    adultsOnly: true,
    matching: true,
    hook: "Who you want, how same-gender that want is, and what kind of queer sex and life you actually mean. Not a diagnosis.",
    ask: "Who do you want in the bed, and what kind of dynamic do you want with them?",
    scales: [
      { key: "same_gender", label: "Same-gender attraction", description: "How much your want points at your own gender.", items: sameGender },
      { key: "multi_gender", label: "More than one gender", description: "Attraction that does not stay in one gender.", items: otherGender },
      { key: "queer_style", label: "What kind", description: "Roles, types, and the sex you mean.", items: sortOf },
      { key: "queer_life", label: "How lived", description: "Out, private, social, or still unsure.", items: community },
    ],
  }),
  build({
    slug: "bias-self-check",
    title: "The Bias Test",
    shortTitle: "The Bias Test",
    category: "personality",
    matching: false,
    hook: "A blunt self-check for racist and homophobic patterns. A high score is prejudice, not a personality to match on.",
    ask: "Which answer is the one you actually make, not the one that sounds decent?",
    scales: [
      { key: "racial_bias", label: "Racial prejudice", description: "High means more racist patterns in the answers.", items: race },
      { key: "anti_gay_bias", label: "Anti-gay prejudice", description: "High means more homophobic patterns in the answers.", items: antiGay },
      { key: "stereotypes", label: "Stereotypes", description: "High means group judgments are doing the thinking.", items: stereotype },
      { key: "examine", label: "Willing to look", description: "High means you will examine the ugly answer.", items: examine },
    ],
  }),
];
