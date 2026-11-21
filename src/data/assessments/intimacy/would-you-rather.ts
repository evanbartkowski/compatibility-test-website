import { defineIntimacyAssessment, preferenceScale } from "./factory";
import type { QuestionDefinition } from "@/lib/assessment/types";

// Forced choices describe direction, never a better/worse grade. Appeal remains an independent rating.
const groups = [
  {
    key: "pace",
    label: "Plan or improvise",
    axis: "pacing" as const,
    low: "You leaned toward flexible timing in the choices you answered.",
    high: "You leaned toward advance structure in the choices you answered.",
    choices: [
      ["Choose the date on the day", "Put a date in the calendar"],
      ["Discover the setting on arrival", "See the setting in advance"],
      ["Let the evening find its shape", "Start with a loose outline"],
      ["Pick music in the moment", "Build a playlist together beforehand"],
      [
        "Talk about a new idea spontaneously",
        "Set aside time for that conversation",
      ],
      ["Leave the ending open", "Agree on an ending time"],
      [
        "Choose between familiar options on arrival",
        "Choose the familiar option ahead of time",
      ],
      ["Keep the afternoon free to decide", "Reserve an afternoon just for us"],
      [
        "Take one invitation as it comes",
        "Exchange ideas before the next invitation",
      ],
      ["Reflect whenever words arrive", "Plan a later check-in"],
    ],
  },
  {
    key: "attention",
    label: "Quiet or expressive",
    axis: "connection" as const,
    low: "Your choices leaned toward quieter expressions of connection.",
    high: "Your choices leaned toward more expressive connection.",
    choices: [
      ["A quiet hand squeeze", "A heartfelt compliment"],
      ["Sit together without talking", "Talk about our favorite moments"],
      ["A small private note", "A warm spoken toast just for us"],
      ["An understated greeting", "An enthusiastic welcome"],
      ["Share a familiar film", "Share a long conversation"],
      ["A thoughtful practical gesture", "A direct expression of appreciation"],
      ["A calm goodbye", "An affectionate goodbye message"],
      ["Enjoy a compliment quietly", "Talk about why the compliment mattered"],
      ["A gentle smile across the room", "A direct invitation to join me"],
      [
        "Let a shared moment speak for itself",
        "Name what made the moment special",
      ],
    ],
  },
  {
    key: "setting",
    label: "Simple or atmospheric",
    axis: "sensory" as const,
    low: "Your choices leaned toward simple, familiar settings.",
    high: "Your choices leaned toward intentionally shaped atmosphere.",
    choices: [
      ["Our ordinary room", "A room dressed for the occasion"],
      ["Comfortable everyday clothes", "A chosen adult costume accessory"],
      ["Quiet background", "A playlist chosen for the mood"],
      ["Familiar lighting", "Lighting adjusted together"],
      ["A normal dinner table", "A carefully arranged picnic"],
      [
        "A favorite familiar place",
        "A new private setting researched together",
      ],
      ["No props", "A small story prop"],
      ["An ordinary written invitation", "A themed invitation"],
      ["A relaxed home evening", "A planned private celebration"],
      ["Let the mood arise naturally", "Choose a mood before we meet"],
    ],
  },
  {
    key: "story",
    label: "Everyday or imagined",
    axis: "imagination" as const,
    low: "Your choices leaned toward ordinary connection as yourselves.",
    high: "Your choices leaned toward playful adult imagination.",
    choices: [
      ["Meet as ourselves", "Pretend to meet as adult strangers"],
      ["Talk about a real shared memory", "Invent a fictional shared memory"],
      ["Use our own names", "Choose adult fictional names"],
      ["An ordinary invitation", "A fictional secret-admirer note"],
      ["Describe a favorite real place", "Invent an imaginary retreat"],
      ["Choose the next date", "Coauthor a story about an imagined date"],
      ["A sincere opening line", "A theatrical opening line agreed in advance"],
      [
        "Stay in our familiar setting",
        "Imagine the room is a fictional lounge",
      ],
      [
        "Keep an idea as a conversation",
        "Turn the idea into a fictional letter",
      ],
      [
        "End the evening as ourselves",
        "Close an imaginary story before returning to ourselves",
      ],
    ],
  },
  {
    key: "roles",
    label: "Shared or guided",
    axis: "roles" as const,
    low: "Your choices leaned toward equal co-direction.",
    high: "Your choices leaned toward briefly receiving an invited lead.",
    choices: [
      ["Choose each step together", "Invite a partner to choose the next step"],
      ["Build the playlist jointly", "Ask a partner to set the soundtrack"],
      ["Share hosting equally", "Be the guest for one evening"],
      [
        "Take turns suggesting the setting",
        "Receive a complete plan with veto rights",
      ],
      ["Start without a ritual", "Follow a simple agreed opening ritual"],
      ["Share the role of storyteller", "Follow a partner's short adult story"],
      ["Arrange the space together", "Receive a thoughtfully arranged welcome"],
      [
        "Keep decisions conversational",
        "Invite a clear suggestion for the next moment",
      ],
      ["Trade small practical gestures", "Receive one planned act of service"],
      [
        "Choose when to finish together",
        "Invite a partner to suggest a stopping point",
      ],
    ],
  },
];

const base = defineIntimacyAssessment({
  slug: "spicy-would-you-rather",
  title: "Would You Rather: Intimacy Edition",
  hook: "Fifty quick choices about mood, pace and connection. Which feels more like you today?",
  love: "A playful way to find preferences you might never think to name.",
  matchingNote:
    "Only the same chosen option with explicit mutual willingness can be revealed. A forced choice alone never indicates desire or consent.",
  next: ["desire-reality-map", "personal-erotic-blueprint"],
  scales: groups.map((g) =>
    preferenceScale(g.key, g.label, g.axis, g.low, g.high, [
      ["Placeholder receiving item", "Placeholder offering item"],
    ]),
  ),
});
let order = 0;
const questions: QuestionDefinition[] = groups.flatMap((g) =>
  g.choices.map(([a, b], i) => ({
    id: `${g.key}-${i + 1}`,
    order: ++order,
    sectionId: g.key,
    sectionTitle: g.label,
    prompt: `Which fits you better today: ${a.toLowerCase()} or ${b.toLowerCase()}?`,
    partnerPrompt: `Which fits you better today: ${a.toLowerCase()} or ${b.toLowerCase()}?`,
    inputType: "intimacy_profile",
    intimacyRole: "shared",
    directionality: "shared_value",
    defaultRevealRule: "mutual_only",
    helperText:
      "Choose a direction, then optionally rate its appeal. Neither choice is better. Skip if neither fits. A choice alone is never a mutual match.",
    options: [
      { value: "a", label: a, dimensionWeights: { [g.key]: 0 } },
      { value: "b", label: b, dimensionWeights: { [g.key]: 1 } },
    ],
    quickDiscovery: i < 2,
    dimensionWeights: { [g.key]: 1 },
    supportsExperienceFrequency: true,
    supportsBoundaryFlag: true,
    supportsRevealRule: true,
    partnerSupportsWillingness: true,
    safetySensitive: true,
    eligibleForMatching: true,
    editorialStatus: "verified",
    topicTags: [g.key, "choice"],
  })),
);
export const wouldYouRather = {
  ...base,
  questions,
  sections: base.sections.map((section) => ({
    ...section,
    questionIds: questions
      .filter((q) => q.sectionId === section.id)
      .map((q) => q.id),
  })),
  dimensions: base.dimensions?.map((d) => ({
    ...d,
    lowLabel: "First option direction",
    highLabel: "Second option direction",
  })),
  estimatedMinutesQuick: 5,
  estimatedMinutesComplete: 21,
  quickDescription: "10 choices sample all five preference directions.",
  deepDescription:
    "50 choices map preference direction. Appeal, willingness, experience and limits remain independent.",
  visualizationTypes: ["preference-direction-bars", "independent-channels"],
  scoringNotes: [
    "The direction bars summarize chosen options, not desire or quality. Missing choices stay unmeasured.",
    ...(base.scoringNotes || []),
  ],
};
