# Truth Desire: assessments and personalized advice

16 published assessments contain 970 full-form questions. Every published test has an authored advice profile. The adult collection has 10 focused tests, each with a short and full form. Earlier versions remain available for saved results and invitations.

## Every test

The hook, counts and advice topic below come directly from the registered TypeScript definitions. Advice is selected using the measured category, its interpretation, receiving/offering values and the item's actual desire, willingness, experience, privacy and limit fields.

| Test and route | Hook | Teaser / deep | Advice focus |
|---|---|---:|---|
| Personality & Decision Style — `big-five-personality-profile` | Explore curiosity, follow-through, social energy, cooperation, stress and how you make decisions. | 12 / 60 | everyday rhythm: Agree on one everyday routine that leaves room for both predictability and individual choice. |
| Emotional Awareness & Availability — `emotional-availability-reflection` | Understand how you recognize emotions, let someone know you, stay present and communicate your capacity for connection. | 10 / 50 | emotional availability: Use a capacity question before a vulnerable conversation: listening, advice or another time? |
| Attachment, Trust & Independence — `attachment-style-discovery` | Examine reassurance, closeness, autonomy, trust and how you respond when a connection feels uncertain. | 10 / 50 | closeness and independence: Name both needs in the same request: a specific reassurance signal and a realistic amount of independent time. |
| Affection, Care & Connection — `love-affection-preferences` | Discover which forms of everyday care, appreciation, shared attention and play help you feel connected. | 10 / 50 | affection that lands: Ask for one specific gesture and ask which gesture the other person would enjoy receiving in return. |
| Communication, Conflict & Repair — `conflict-communication-personality` | Examine how you raise concerns, listen under pressure, handle intensity and turn an apology into a useful change. | 10 / 50 | repair and disagreement: Agree on a pause-and-return plan before a disagreement: say why you are pausing and suggest a realistic return time. |
| Relationship Values & Boundaries — `relationship-dealbreakers-boundaries` | Bring partner priorities, dating discernment and long-term expectations into one profile of what matters and what needs discussion. | 10 / 50 | shared expectations: Separate a flexible preference from a required agreement, and ask for a concrete example of how each would work. |
| Your Erotic Blueprint — `erotic-blueprint-style` | Discover your Sensual, Sexual, Energetic, Kinky and Shapeshifter preferences—and the conditions that bring them to life. | 10 / 50 | your preferred intimacy style: Translate the leading style into a concrete invitation, a chosen pace and a comfortable ending. |
| Desire, Initiation & Pleasure — `desire-reality-map` | Find what sparks desire, how you want sex initiated, and the pace that actually feels good. | 12 / 60 | interest versus lived experience: For a wanted theme, name the missing condition before deciding whether any real-world step is wanted. |
| Fantasy & Roleplay — `fantasy-catalog` | Explore 50 distinct fantasies and adult roles, including the ones you want to keep in your imagination. | 10 / 100 | adult imagination: Talk about the appealing feeling before debating whether to enact an entire scenario. |
| Touch, Turn-Ons & Sensory Style — `turn-on-anatomy` | Map the kinds of kissing, touch, sound, atmosphere and pressure that draw you closer. | 12 / 60 | sensory cues and attention: Change one ordinary sensory condition at a time so you can tell what actually adds comfort or interest. |
| Aftercare & the Morning After — `aftercare-recovery-style` | Cuddling, reassurance, practical care or space? Find your own way to feel good after sex. | 12 / 60 | care after intensity: Choose immediate care and a later check-in separately, including an option for space. |
| Sexual Communication & Dirty Talk — `communication-language-profile` | Discover the words, direction, teasing and quiet you enjoy—and what you want to say more clearly. | 10 / 50 | words, tone and quiet: Make a short welcome-word and leave-out list, then check whether it still fits instead of relying on a label. |
| Power, Roles & Devotion — `power-exchange-intensity` | Explore leading, following, switching and service, from a single date to an ongoing dynamic. | 16 / 80 | the scope of chosen leadership: Write what is included, when the role ends and which ordinary decisions stay outside it. |
| Boundaries, Privacy & Trust — `limits-boundaries-deep-dive` | Name your yes, maybe and no around sex, sleepovers, sharing details and changing your mind. | 16 / 80 | clear conditions and limits: Use separate language for a preference, a condition, an uncertainty and a hard limit. |
| Exclusivity, Jealousy & Openness — `jealousy-compersion-relationship-structures` | Explore the relationship agreements you want, how jealousy shows up, and where curiosity belongs. | 12 / 60 | relationship agreements: Discuss the actual agreement, time commitments and privacy of other people before considering any change. |
| Your Partner & Relationship Vision — `partner-ideal-dealbreakers` | Find the partner qualities, everyday rhythm and long-term expectations that matter to you. | 12 / 60 | partner habits that matter: Turn an abstract trait into an ordinary question and a behavior you can notice over time. |

## What each guide includes

- **Who to look for:** authored compatible traits, a role-counterpart question, constructive friction and editable dating/conversation wording. No partner is diagnosed or guaranteed compatible.
- **What to optimize:** a category-specific habit and an explicit high/low contrast when supported. The five-style inventory also explains the secondary style.
- **What to try:** three or four optional suggestions, ordered by preparation. Solo reflection, curiosity and a partner conversation or ordinary comfort prototype remain separate. A known eligible experience gap can add a fourth planning step. This order is not a medical or physical-risk certification.
- **Desire–experience gaps:** up to five strongest supported gaps or missing-context rows, with separate paths for discussion, fantasy-only interest, hard limits, privacy and unknown context. No gap needs closing. Agreement-only core tests explicitly say they do not measure experience.
- **Partner notes:** a separate pair guide uses only topics already mutually disclosed, never solo advice, rankings, gaps, hidden answers or a reason for nonmatching. Friction is a specific question to discuss, not a hidden mismatch claim.

## Five-style ranking

The original, non-graphic inventory describes Sensual (sensory atmosphere), Sexual (clear direct adult intimacy communication), Energetic (anticipation and unhurried transitions), Kinky (negotiated adult roles and symbolism) and Shapeshifter (explicit flexibility preferences). It does not reproduce another questionnaire or claim psychometric validation. All five styles need at least two rated items before naming primary and secondary. Exact leading ties remain ties; they are not reclassified as Shapeshifter. Teasers are provisional.

## Evidence and eligibility

Each advice block carries its source category, score and measured count; an item-specific step also identifies the eligible question. A private guide may explain its owner's hard-limit or private gap, but those topics cannot supply a partner experiment. Missing experience is never changed to Never; willingness never substitutes for desire. Low scores and lack of interest are valid preferences, not deficits to correct. If no category is measured, no partner type or experiment is fabricated.

## Implementation

- `src/data/assessments/advice-profiles.ts`: authored per-test coaching plus category-specific overrides.
- `src/data/assessments/intimacy/erotic-blueprint.ts`: original five-style definition, registered in `intimacy/index.ts` and the main catalog.
- `src/lib/assessment/advice.ts`: deterministic, separately versioned advice and ranking. Existing assessment scores and matching rubrics are unchanged.
- `AdviceGuide.tsx`: keyboard-accessible advice sections, evidence disclosures, copyable wording and gap paths. `PairAdviceGuide.tsx` displays only mutually disclosed guidance.
- Existing saved results receive missing advice in memory from their pinned definitions and existing scores, without rewriting their private file. Blueprint source notes remain owner-only.
- Existing summary-export and public-share whitelists omit advice. A full private JSON export requires explicit answer and sensitive-data selections before it includes the private guide.

## Examples and verification

See [ADVICE_EXAMPLES.md](ADVICE_EXAMPLES.md) for three actual generated fictional profiles and one mutual-topic example, or [ADVICE_EXAMPLES.json](ADVICE_EXAMPLES.json) for structured output. See [../QUALITY_REPORT.md](../QUALITY_REPORT.md) for the executed test scope and limitations.
