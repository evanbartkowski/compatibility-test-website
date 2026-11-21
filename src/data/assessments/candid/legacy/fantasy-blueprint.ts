import { invitations as i, paired as p, type CandidBank } from "./helpers";

export const fantasyBlueprintBanks: Record<string, CandidBank> = {
  "fantasy-catalog": {
    worlds: p(
      "Imagining {topic} with a consenting adult partner.",
      "Being the partner who suggests imagining {topic} together.",
      [
        "sex in daylight instead of keeping the bedroom dark",
        "an entire date devoted to kissing without sex",
        "a planned romantic overnight stay instead of a hurried visit",
        "sex at home after a formal dinner date",
        "a bedroom with music chosen specifically for foreplay",
        "a slow morning together instead of sex squeezed in before sleep",
        "a date in which dressing up creates anticipation before sex",
        "a date at an unfamiliar but fully private location",
        "a familiar bedroom transformed with different lighting and bedding",
        "a quiet evening in which sex is optional rather than the purpose of meeting",
      ],
    ),
    characters: [
      [
        "Imagining a partner confidently making the first sexual invitation.",
        "Imagining yourself confidently making the first sexual invitation.",
      ],
      [
        "Imagining a partner leading a kind of foreplay you have discussed.",
        "Imagining yourself leading a kind of foreplay you have discussed.",
      ],
      [
        "Imagining a partner approaching you as if you were adult strangers on a first date.",
        "Imagining yourself approaching a familiar partner as if you were adult strangers on a first date.",
      ],
      [
        "Imagining a partner planning a date entirely around your preferences.",
        "Imagining yourself planning a date entirely around a partner's preferences.",
      ],
      [
        "Imagining a partner following your lead instead of keeping their usual sexual role.",
        "Imagining yourself following a partner's lead instead of keeping your usual sexual role.",
      ],
      [
        "Imagining a partner addressing you by an adult roleplay name you chose.",
        "Imagining yourself addressing a partner by an adult roleplay name they chose.",
      ],
      [
        "Imagining a partner saying exactly what attracts them to you.",
        "Imagining yourself saying exactly what attracts you to a partner.",
      ],
      [
        "Imagining a partner wanting you to receive all the attention during foreplay.",
        "Imagining yourself wanting a partner to receive all the attention during foreplay.",
      ],
      [
        "Imagining a partner sharing a sexual fantasy you have never heard before.",
        "Imagining yourself sharing a sexual fantasy you have never mentioned before.",
      ],
      [
        "Imagining a partner dropping a teasing role and becoming openly affectionate after sex.",
        "Imagining yourself dropping a teasing role and becoming openly affectionate after sex.",
      ],
    ],
    narratives: p(
      "Imagining {topic}, with no promise to act on it.",
      "Inviting a partner to imagine {topic}, with no promise to act on it.",
      [
        "flirtatious messages building anticipation before a planned date",
        "reconnecting sexually after a long time apart",
        "rewriting a disappointing first kiss into the kind of kiss you wanted",
        "taking turns writing a adult romance premise",
        "a sexual fantasy that stays entirely unwritten and private",
        "an adult roleplay that starts with a planned invitation rather than a surprise",
        "a date that changes from elaborate plans to simply kissing at home",
        "telling a partner which part of an imagined story is attractive and which part is not",
        "switching adult characters while keeping the same romantic mood",
        "ending a roleplay before sex and continuing the date as yourselves",
      ],
    ),
    attention: p(
      "Imagining receiving {topic}.",
      "Imagining offering a partner {topic}.",
      [
        "undivided attention during foreplay without phones or television",
        "a sincere description of what a partner finds attractive about you",
        "a date designed around your preferred pace of sex",
        "an affectionate letter explaining why a partner enjoys kissing you",
        "a few minutes of praise without feeling obliged to return a compliment",
        "thoughtful aftercare that was discussed before sex",
        "an evening where you are the guest rather than the planner",
        "a welcoming hug after saying that you do not want sex tonight",
        "a partner remembering a sexual preference you mentioned months ago",
        "an invitation to say something you want without being teased for it",
      ],
    ),
    choice: p(
      "Imagining a partner offering you {topic}.",
      "Imagining yourself offering a partner {topic}.",
      [
        "a choice between leading and following during a sexual roleplay",
        "a choice between spontaneous sex and a planned date",
        "a chance to change who initiates kissing",
        "a fantasy conversation without a plan to turn it into sex",
        "a familiar form of foreplay at a different pace",
        "a choice between quiet kissing and spoken appreciation",
        "an opportunity to combine affection with an agreed adult role",
        "a new story premise after you reject the first one",
        "a chance to make an imagined sexual scenario less theatrical and more like everyday life",
        "a clear ending where a fantasy remains a fantasy and nothing is owed",
      ],
    ),
  },
  "personal-erotic-blueprint": {
    connection: p(
      "A partner offers you {topic}.",
      "You offer a partner {topic}.",
      [
        "affection on a night when you do not want sex",
        "a straightforward conversation about what kissing means to each of you",
        "reassurance when desire differs between you",
        "a clear answer about whether you are dating casually or romantically",
        "a follow-up message after a first sexual encounter",
      ],
    ),
    pacing: i([
      "make a date for sex instead of hoping your schedules line up",
      "leave more time for kissing before sex",
      "talk about a new sexual role several days before a date",
      "pause sex to change a pace that is not working",
      "wait until the next day before deciding whether to repeat a sexual experiment",
    ]),
    sensory: i([
      "keep the lights on during sex",
      "choose music for foreplay rather than use whatever is already playing",
      "leave strong scents out of the bedroom",
      "prefer a firm hug to a very light touch",
      "make the bedroom cooler or warmer before sex begins",
    ]),
    imagination: i([
      "describe a sexual fantasy that you want to keep imaginary",
      "pretend to meet again for a first-date kiss",
      "choose an adult roleplay nickname together",
      "dress differently for a date to change its mood",
      "share the feeling behind a sexual fantasy without telling the whole story",
    ]),
    roles: p(
      "A partner takes the lead on {topic}.",
      "You take the lead on {topic}.",
      [
        "initiating sex instead of waiting for the other person",
        "choosing between already discussed kinds of foreplay",
        "starting a conversation about an adult roleplay",
        "planning the care you want after sex",
        "ending a roleplay and returning to equal, everyday conversation",
      ],
    ),
    autonomy: i([
      "keep one sexual fantasy entirely to yourself",
      "keep separate homes even when dates include overnight stays",
      "keep role-based nicknames out of work and family life",
      "change a sexual plan after a date has already started",
      "maintain friendships and hobbies outside an absorbing sexual relationship",
    ]),
  },
};
