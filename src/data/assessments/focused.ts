import type {
  AssessmentDefinition,
  AssessmentAdviceProfile,
} from "@/lib/assessment/types";
import { curatedAssessments } from "./curated";
import { intimacyAssessments } from "./intimacy";
import { publishLegacyCandid } from "./candid/legacy-publish";
import { focusedQuestionCopy } from "./focused-copy";

// Frozen editorial publications are sources, not extra cards in the public library.
const sources = [...curatedAssessments, ...intimacyAssessments].map(
  publishLegacyCandid,
);
const source = (slug: string) => {
  const a = sources.find((a) => a.slug === slug);
  if (!a) throw new Error(`Missing consolidation source: ${slug}`);
  return a;
};
type Category = readonly [slug: string, key: string];
interface Plan {
  slug: string;
  title: string;
  hook: string;
  categories: Category[];
}
const categories = (slug: string, keys: string[]): Category[] =>
  keys.map((key) => [slug, key]);
const all = (slug: string) =>
  categories(
    slug,
    source(slug).sections.map((s) => s.id),
  );

const plans: Plan[] = [
  {
    slug: "erotic-blueprint-style",
    title: "Your Erotic Blueprint",
    hook: "Discover your Sensual, Sexual, Energetic, Kinky and Shapeshifter preferences—and the conditions that bring them to life.",
    categories: all("erotic-blueprint-style"),
  },
  {
    slug: "desire-reality-map",
    title: "Desire, Initiation & Pleasure",
    hook: "Find what sparks desire, how you want sex initiated, and the pace that actually feels good.",
    categories: [
      ...categories("desire-reality-map", [
        "invitation",
        "conditions",
        "attention",
        "voice",
      ]),
      ...categories("orgasm-pacing-control", ["anticipation", "flexibility"]),
    ],
  },
  {
    slug: "fantasy-catalog",
    title: "Fantasy & Roleplay",
    hook: "Explore 50 distinct fantasies and adult roles, including the ones you want to keep in your imagination.",
    categories: all("fantasy-catalog"),
  },
  {
    slug: "turn-on-anatomy",
    title: "Touch, Turn-Ons & Sensory Style",
    hook: "Map the kinds of kissing, touch, sound, atmosphere and pressure that draw you closer.",
    categories: [
      ...categories("turn-on-anatomy", ["contact", "visual", "sound", "pace"]),
      ...categories("sensory-sensation-play-map", ["texture", "pressure"]),
    ],
  },
  {
    slug: "aftercare-recovery-style",
    title: "Aftercare & the Morning After",
    hook: "Cuddling, reassurance, practical care or space? Find your own way to feel good after sex.",
    categories: [
      ...all("aftercare-recovery-style"),
      ...categories("post-intimacy-morning-after", ["sleep"]),
    ],
  },
  {
    slug: "communication-language-profile",
    title: "Sexual Communication & Dirty Talk",
    hook: "Discover the words, direction, teasing and quiet you enjoy—and what you want to say more clearly.",
    categories: all("communication-language-profile"),
  },
  {
    slug: "power-exchange-intensity",
    title: "Power, Roles & Devotion",
    hook: "Explore leading, following, switching and service, from a single date to an ongoing dynamic.",
    categories: [
      ...all("power-exchange-intensity"),
      ...categories("service-devotion-profile", [
        "practical",
        "ritual",
        "recognition",
      ]),
    ],
  },
  {
    slug: "limits-boundaries-deep-dive",
    title: "Boundaries, Privacy & Trust",
    hook: "Name your yes, maybe and no around sex, sleepovers, sharing details and changing your mind.",
    categories: [
      ...all("limits-boundaries-deep-dive"),
      ...categories("privacy-visibility-risk-profile", [
        "discretion",
        "control",
      ]),
      ...categories("recovery-past-experiences", ["choice"]),
    ],
  },
  {
    slug: "jealousy-compersion-relationship-structures",
    title: "Exclusivity, Jealousy & Openness",
    hook: "Explore the relationship agreements you want, how jealousy shows up, and where curiosity belongs.",
    categories: [
      ...all("jealousy-compersion-relationship-structures"),
      ...categories("group-multipartner-interest", ["imagination"]),
    ],
  },
  {
    slug: "partner-ideal-dealbreakers",
    title: "Your Partner & Relationship Vision",
    hook: "Find the partner qualities, everyday rhythm and long-term expectations that matter to you.",
    categories: [
      ...all("partner-ideal-dealbreakers"),
      ...categories("long-term-dynamic-vision", ["rhythm"]),
    ],
  },
];

function consolidate(plan: Plan): AssessmentDefinition {
  const a = structuredClone(source(plan.slug));
  const sections: AssessmentDefinition["sections"] = [],
    dimensions: NonNullable<AssessmentDefinition["dimensions"]> = [],
    questions: AssessmentDefinition["questions"] = [];
  const coaching: NonNullable<AssessmentAdviceProfile["dimensionCoaching"]> =
    {};
  for (const [slug, key] of plan.categories) {
    const parent = source(slug),
      section = parent.sections.find((s) => s.id === key)!,
      dimension = parent.dimensions!.find((d) => d.key === key)!;
    if (!section || !dimension)
      throw new Error(`Missing category ${slug}/${key}`);
    const newKey =
      slug === plan.slug
        ? key
        : `${slug.split("-").slice(0, 2).join("-")}-${key}`;
    sections.push({ ...section, id: newKey });
    dimensions.push({ ...structuredClone(dimension), key: newKey });
    const items = parent.questions.filter((q) => q.sectionId === key);
    const ids = new Map(
      items.map((q) => [
        q.id,
        `focus3-${newKey}-${q.id.replace(/^rev2-/, "")}`,
      ]),
    );
    questions.push(
      ...items.map((q) => ({
        ...structuredClone(q),
        id: ids.get(q.id)!,
        order: questions.length + items.indexOf(q) + 1,
        sectionId: newKey,
        dimensionWeights: { [newKey]: 1 },
        complementaryPartnerId: q.complementaryPartnerId
          ? ids.get(q.complementaryPartnerId)
          : undefined,
      })),
    );
    const profile = parent.adviceProfile!;
    coaching[newKey] = profile.dimensionCoaching?.[key] || {
      seek: profile.seek,
      friction: profile.friction,
      optimize: profile.optimize,
      solo: profile.solo,
      together: profile.together,
      curiosity: profile.curiosity,
    };
  }
  a.version = "3.0.0";
  a.id = `${a.slug}-focused-v3`;
  a.editorialRevision = "focused-2026-11";
  a.title = a.shortTitle = plan.title;
  a.audienceNote = a.purpose = a.marketingBlurb = plan.hook;
  a.sections = sections;
  a.dimensions = dimensions;
  a.questions = questions;
  for (const q of a.questions) {
    q.prompt = q.partnerPrompt = focusedQuestionCopy(q.prompt);
    if (
      plan.slug === "aftercare-recovery-style" &&
      !/\b(?:sex|aftercare)\b/i.test(q.prompt)
    )
      q.prompt =
        q.partnerPrompt = `After sex, ${q.prompt.charAt(0).toLowerCase() + q.prompt.slice(1)}`;
  }
  a.adviceProfile = { ...a.adviceProfile!, dimensionCoaching: coaching };
  a.discoverPoints = sections.map((s) => s.title);
  a.estimatedMinutesQuick = Math.ceil(
    (questions.filter((q) => q.quickDiscovery).length * 25) / 60,
  );
  a.estimatedMinutesComplete = Math.ceil((questions.length * 25) / 60);
  a.quickDescription = `${questions.filter((q) => q.quickDiscovery).length} selected questions cover every category.`;
  a.deepDescription = `${questions.length} questions cover ${sections.map((s) => s.title.toLowerCase()).join(", ")}.`;
  a.futureExtensibilityNote =
    "A focused assessment combining related categories. Earlier definitions and answers remain version-pinned.";
  return a;
}

const coreSlugs = [
  "big-five-personality-profile",
  "emotional-availability-reflection",
  "attachment-style-discovery",
  "love-affection-preferences",
  "conflict-communication-personality",
  "relationship-dealbreakers-boundaries",
];
export const focusedCoreAssessments = coreSlugs.map((slug) => {
  const a = structuredClone(source(slug));
  a.version = "6.0.0";
  a.id = `${slug}-focused-v6`;
  a.editorialRevision = "focused-2026-11";
  if (slug === "big-five-personality-profile") {
    a.title = a.shortTitle = "Personality & Decision Style";
    a.audienceNote = a.purpose =
      "Explore curiosity, follow-through, social energy, cooperation, stress and how you make decisions.";
    const key = "logical_reasoning",
      title = "Logic & deliberation";
    a.sections.push({
      id: key,
      title,
      subtitle: "How you weigh a decision",
      description:
        "Your preference for checking evidence and comparing explanations. This does not measure intelligence.",
    });
    a.dimensions!.push({
      key,
      label: title,
      description:
        "Evidence-led decision preferences, not intelligence or an IQ score.",
      lowLabel: "More intuitive",
      highLabel: "More deliberate",
      interpretations: {
        low: {
          meaning:
            "Your answers favor trusting an initial impression over extended comparison.",
          possibleTradeoff:
            "A fast decision can miss a detail that changes the outcome.",
          experiment:
            "Before one small decision, write the strongest reason for the alternative.",
          reflection:
            "When is your first impression useful, and when do you want more evidence?",
        },
        balanced: {
          meaning:
            "You combine intuition with deliberate checking depending on the choice.",
          possibleTradeoff:
            "It can help to name which decisions deserve a longer comparison.",
          experiment: "Set a time limit for researching one everyday choice.",
          reflection: "Which decisions benefit most from slowing down?",
        },
        high: {
          meaning:
            "Your answers favor comparing evidence and possible explanations before committing.",
          possibleTradeoff: "More analysis can delay a reversible decision.",
          experiment:
            "Define what would be enough information before researching a decision.",
          reflection: "When do you know enough to choose?",
        },
      },
    });
    const statements = [
      "I compare two plausible explanations before deciding why a plan failed.",
      "I can name evidence that would change a decision I feel strongly about.",
      "!When a choice feels right, I rarely check the details before committing.",
      "A short checklist helps me compare options without one attractive feature deciding everything.",
      "I separate what I observed from what I assume someone intended.",
      "Before repeating a surprising claim, I check where it came from.",
      "!If a plan agrees with my first impression, I rarely look for reasons it might fail.",
      "I ask which missing fact would make the biggest difference to a difficult choice.",
      "I can change my explanation when the evidence stops fitting it.",
      "I compare the cost of a mistake with the cost of waiting for more information.",
    ];
    const prototype = a.questions[0];
    a.questions.push(
      ...statements.map((s, i) => ({
        ...prototype,
        id: `focus6-${key}-${i + 1}`,
        order: 51 + i,
        sectionId: key,
        sectionTitle: title,
        prompt: s.replace(/^!/, ""),
        partnerPrompt: s.replace(/^!/, ""),
        reverseScored: s.startsWith("!"),
        quickDiscovery: i < 2,
        dimensionWeights: { [key]: 1 },
      })),
    );
    a.discoverPoints = a.sections.map((s) => s.title);
    a.adviceProfile = {
      ...a.adviceProfile!,
      dimensionCoaching: {
        ...a.adviceProfile?.dimensionCoaching,
        logical_reasoning: {
          wording:
            "I enjoy comparing evidence and possible explanations before making a decision. I appreciate a partner who can think it through with me and say when they want empathy before analysis.",
          seek: "Someone who welcomes questions, can change their mind with evidence, and can distinguish a request for empathy from a request for problem-solving",
          friction:
            "A carefully reasoned answer can still miss an emotional need. Intuition and deliberate analysis can work together when neither becomes a test of intelligence.",
          optimize:
            "Before solving a relationship problem, ask whether the other person wants listening, options or a decision. Agree how much information is enough for a reversible choice.",
          solo: [
            "Find the deciding fact",
            "Choose one pending everyday decision. Write the fact most likely to change your mind, then set a limit on how long you will research it.",
          ],
          together: [
            "Compare a real small decision",
            "Choose a low-stakes plan together. Each name one fact, one assumption and one feeling that affects the choice before proposing a next step.",
          ],
          curiosity: [
            "Give intuition a fair hearing",
            "Privately write the strongest intuitive case for an option you did not prefer. Check whether it identifies a value your comparison left out.",
          ],
        },
      },
    };
  }
  a.quickDescription = `${a.questions.filter((q) => q.quickDiscovery).length} selected statements sample every category.`;
  a.deepDescription = `${a.questions.length} situational statements explore each category with concrete choices and contrasting directions.`;
  a.estimatedMinutesComplete = Math.ceil((a.questions.length * 14) / 60);
  a.estimatedMinutesQuick = Math.ceil(
    (a.questions.filter((q) => q.quickDiscovery).length * 14) / 60,
  );
  return a;
});
export const focusedAssessments = [
  ...focusedCoreAssessments,
  ...plans.map(consolidate),
];

// Keep links useful, while archived invitations continue resolving their exact versions.
export const focusedRedirects: Record<string, string> = {
  "intimacy-partner-preferences": "desire-reality-map",
  "sexual-interests-curiosity-map": "fantasy-catalog",
  "bdsm-power-dynamics-test": "power-exchange-intensity",
  "sensory-sensation-play-map": "turn-on-anatomy",
  "sensory-deprivation-overload": "turn-on-anatomy",
  "toys-tools-gear-preferences": "turn-on-anatomy",
  "attachment-bedroom": "attachment-style-discovery",
  "post-intimacy-morning-after": "aftercare-recovery-style",
  "adult-caregiving-comfort": "aftercare-recovery-style",
  "recovery-past-experiences": "limits-boundaries-deep-dive",
  "privacy-visibility-risk-profile": "limits-boundaries-deep-dive",
  "financial-gifting-boundaries": "limits-boundaries-deep-dive",
  "service-devotion-profile": "power-exchange-intensity",
  "primal-movement-play": "power-exchange-intensity",
  "kink-compatibility-stress-test": "power-exchange-intensity",
  "orgasm-pacing-control": "desire-reality-map",
  "curiosity-exploration-speed": "desire-reality-map",
  "roleplay-scenario-explorer": "fantasy-catalog",
  "fantasy-sharing-comfort": "fantasy-catalog",
  "spicy-would-you-rather": "fantasy-catalog",
  "personal-erotic-blueprint": "erotic-blueprint-style",
  "group-multipartner-interest": "jealousy-compersion-relationship-structures",
  "long-term-dynamic-vision": "partner-ideal-dealbreakers",
  "praise-intensity-spectrum": "communication-language-profile",
};
const live = new Set(focusedAssessments.map((a) => a.slug));
for (const a of focusedAssessments)
  a.recommendedNextSlugs = [
    ...new Set(
      (a.recommendedNextSlugs || []).map((s) => focusedRedirects[s] || s),
    ),
  ].filter((s) => s !== a.slug && live.has(s));
