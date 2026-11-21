import { defineIntimacyAssessment, roleScale as s } from "./factory";

/** Original non-graphic preference inventory; the five labels are descriptive lenses, not diagnostic types. */
export const eroticBlueprintStyle = {
  ...defineIntimacyAssessment({
    slug: "erotic-blueprint-style",
    title: "Erotic Blueprint: Your Intimacy Styles",
    hook: "Sensual, Sexual, Energetic, Kinky or Shapeshifter? Discover your leading preferences and what makes them work for you.",
    love: "Go beyond a label: see your primary and secondary style, the conditions behind them and words to start a useful conversation.",
    contentNote:
      "An original non-graphic adult self-reflection. The five style labels are descriptive, not validated diagnoses, fixed identities or a reproduction of another provider's questionnaire. Ties and missing evidence are shown explicitly.",
    matchingNote:
      "Receiving a preferred style is compared with freely offering its counterpart. A shared label alone never creates a match or permission.",
    next: [
      "desire-reality-map",
      "aftercare-recovery-style",
      "personal-erotic-blueprint",
    ],
    scales: [
      s(
        "sensual",
        "Sensual",
        "sensory",
        "Sensory atmosphere is less prominent among these preferences.",
        "Attentive sensory atmosphere is prominent in your answers.",
        "Receiving {topic} in a freely chosen private setting.",
        "Offering a partner {topic} in a freely chosen private setting.",
        [
          "a carefully chosen soundtrack",
          "lighting adjusted to my comfort",
          "an unhurried welcome into a comfortable space",
          "a familiar texture chosen for comfort",
          "attention to ordinary room temperature and interruptions",
        ],
      ),
      s(
        "sexual",
        "Sexual",
        "connection",
        "A direct approach is less prominent among these preferences.",
        "Clear, direct adult intimacy communication is prominent in your answers.",
        "Receiving {topic}.",
        "Offering a partner {topic} when welcome.",
        [
          "a clear invitation to private time",
          "a direct question about current interest",
          "plain language about preferred closeness",
          "a concise check on whether an invitation fits today",
          "an honest answer instead of a hint I must interpret",
        ],
      ),
      s(
        "energetic",
        "Energetic",
        "pacing",
        "Anticipation and extended transitions are less prominent in these answers.",
        "Anticipation, presence and slower transitions are prominent in your answers.",
        "Receiving {topic} without an expected outcome.",
        "Offering a partner {topic} without an expected outcome.",
        [
          "advance notice of a welcome private invitation",
          "an unhurried transition from everyday plans",
          "a few quiet moments of undivided attention",
          "a slow build in the atmosphere of a planned evening",
          "time to enjoy anticipation before making another choice",
        ],
      ),
      s(
        "kinky",
        "Kinky",
        "roles",
        "Negotiated roles and symbolism are less prominent in these answers.",
        "Freely negotiated adult roles and symbolism are prominent in your answers.",
        "Receiving {topic} within a limited, revocable adult agreement.",
        "Offering a partner {topic} within a limited, revocable adult agreement.",
        [
          "a fictional adult title chosen together",
          "a clear guide role for one planned conversation",
          "an agreed private opening ritual",
          "a symbolic gesture of appreciation",
          "an invitation into an adult fictional scenario with an easy opt-out",
        ],
      ),
      s(
        "shapeshifter",
        "Shapeshifter",
        "imagination",
        "A consistent style may appeal more than these changes.",
        "Flexibility and choosing among styles are prominent in your answers.",
        "Being offered {topic}.",
        "Offering a partner {topic} without expecting variety on demand.",
        [
          "a choice between a quiet and a more expressive evening",
          "room to change the atmosphere from one date to the next",
          "an invitation to choose a different familiar role",
          "a fresh check on which style fits today",
          "a chance to combine two familiar styles of connection",
        ],
      ),
    ],
  }),
  styleRankingEnabled: true,
};
