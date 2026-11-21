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
      ? ([`I enjoy receiving ${topic}.`, `I enjoy giving my partner ${topic}.`] as const)
      : topic,
  );
export const invitations = (topics: readonly string[]) =>
  paired(
    "I would like a partner to invite me to {topic}.",
    "I would like to invite my partner to {topic}.",
    topics,
  );
export const hearingTelling = (topics: readonly string[]) =>
  paired(
    "I enjoy hearing a partner talk about {topic}.",
    "I enjoy telling a partner about {topic}.",
    topics,
  );
export const sexAct = (topics: readonly string[]) =>
  paired(
    "I like receiving {topic} during sex.",
    "I like giving my partner {topic} during sex.",
    topics,
  );
export const aftercare = (topics: readonly string[]) =>
  paired(
    "I enjoy receiving {topic} as aftercare after sex.",
    "I enjoy giving my partner {topic} as aftercare after sex.",
    topics,
  );
export const scene = (topics: readonly string[]) =>
  paired(
    "I enjoy being on the receiving end of {topic} during sex.",
    "I enjoy giving {topic} to my partner during sex.",
    topics,
  );
