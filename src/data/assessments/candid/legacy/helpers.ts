import type { PreferencePair } from "@/data/assessments/intimacy/factory";
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
export const exchanges = (topics: readonly string[]) =>
  paired("Receiving {topic}.", "Giving your partner {topic}.", topics);
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
