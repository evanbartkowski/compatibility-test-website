const exchanges: Array<[string, string, string]> = [
  [
    "saying plainly that they find you attractive",
    "A partner says plainly that they find you attractive.",
    "You say plainly that you find a partner attractive.",
  ],
  [
    "telling you what they enjoy about your touch",
    "A partner tells you what they enjoy about your touch.",
    "You tell a partner what you enjoy about their touch.",
  ],
  [
    "asking whether pressure should be lighter or firmer",
    "A partner asks whether you want a lighter or firmer touch.",
    "You ask whether a partner wants a lighter or firmer touch.",
  ],
  [
    "saying what they appreciate about your body without comparing it to anyone else's",
    "A partner tells you what they appreciate about your body without comparisons.",
    "You tell a partner what you appreciate about their body without comparisons.",
  ],
  [
    "naming a sexual preference instead of saying 'whatever you want'",
    "A partner names a sexual preference instead of saying 'whatever you want'.",
    "You name a sexual preference instead of saying 'whatever you want'.",
  ],
  [
    "admitting they rehearsed a flirtatious line before the date",
    "A partner admits they rehearsed a flirtatious line before the date.",
    "You admit you rehearsed a flirtatious line before the date.",
  ],
  [
    "remembering what made your last date feel good",
    "A partner remembers the detail you loved about your last date.",
    "You remember the detail a partner loved about your last date.",
  ],
  [
    "checking their schedule before promising a weekend together",
    "A partner checks their schedule before promising you a weekend together.",
    "You check your schedule before promising a partner a weekend together.",
  ],
  [
    "asking what they misunderstood about your preferences",
    "A partner asks what they misunderstood about your sexual preferences.",
    "You ask what you misunderstood about a partner's sexual preferences.",
  ],
  [
    "listening when you say the sex felt rushed",
    "A partner listens when you say the sex felt rushed.",
    "You listen when a partner says the sex felt rushed.",
  ],
];
const copy = new Map(
  exchanges.flatMap(([topic, receive, offer]) => [
    [`Receiving a partner ${topic}.`, receive],
    [`Giving your partner a partner ${topic}.`, offer],
  ]),
);
export const focusedQuestionCopy = (prompt: string) =>
  copy.get(prompt) || prompt;
