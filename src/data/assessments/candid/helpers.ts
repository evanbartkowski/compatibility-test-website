import type { PreferencePair } from "../intimacy/factory";
export type CandidBank = Record<string, readonly PreferencePair[]>;

/** The repeated frame establishes the role; each authored topic must ask about a different decision. */
export function paired(
  receive: string,
  offer: string,
  topics: readonly string[],
): PreferencePair[] {
  return topics.map(
    (topic) =>
      [
        receive.replace("{topic}", topic),
        offer.replace("{topic}", topic),
      ] as const,
  );
}
export const exchanges = (
  topics: readonly (string | PreferencePair)[],
): PreferencePair[] =>
  topics.map((topic) =>
    typeof topic === "string"
      ? ([`Receiving ${topic}.`, `Giving your partner ${topic}.`] as const)
      : topic,
  );
export const invitations = (topics: readonly string[]) =>
  paired(
    "A partner invites you to {topic}.",
    "You invite your partner to {topic}.",
    topics,
  );
export const hearingTelling = (topics: readonly string[]) =>
  paired(
    "Hearing a partner talk about {topic}.",
    "Telling a partner about {topic}.",
    topics,
  );
export const sexAct = (topics: readonly string[]) =>
  paired(
    "Receiving {topic} during sex.",
    "Giving your partner {topic} during sex.",
    topics,
  );
export const aftercare = (topics: readonly string[]) =>
  paired(
    "After sex, receiving {topic} as aftercare.",
    "After sex, giving your partner {topic} as aftercare.",
    topics,
  );
export const scene = (topics: readonly string[]) =>
  paired(
    "During sex, you are on the receiving end of {topic}.",
    "During sex, you are the one giving {topic}.",
    topics,
  );
