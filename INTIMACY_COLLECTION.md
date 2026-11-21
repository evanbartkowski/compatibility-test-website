# Truth Desire: the intimacy collection

Thirty-one original adult reflections contain **1,610 full-form questions** and **312 teaser questions** alongside nine core assessments. The complete library has **40 assessments, 2,060 full-form questions and 402 short-form questions**. Adult definitions now use version `2.0.0`; core definitions use `5.0.0`. Earlier published definitions remain archived for saved results and invitations. Every published assessment has a personalized advice guide; see [the complete advice overview](docs/ASSESSMENTS_AND_ADVICE.md), [three generated example profiles](docs/ADVICE_EXAMPLES.md) and [the question editorial guide](docs/QUESTION_EDITORIAL_GUIDE.md).

All forms show five questions per page. Teasers sample every category; deep dives include the whole authored bank. Most adult tests have ten teaser questions and fifty deep questions. The fantasy catalog has one hundred questions; the blueprint has sixty. Time estimates allow roughly twenty-five seconds per adult item: most teasers take about five minutes and deep dives about twenty-one minutes; the catalog takes roughly forty-two minutes and supports browser drafts.

## Assessments

The hook appears in the catalog. Each definition also includes its own “why people love it” blurb, scale-specific low/mixed/high interpretations, reflection prompts, matching notes and recommended next assessments.

| Assessment | Hook | Teaser / deep | Main insights |
|---|---|---:|---|
| Desire vs Reality Map | Notice the difference between interest, experience and a freely chosen next conversation. | 10 / 50 | Invitation, conditions, novelty, attention and voice; private desire/experience gaps. |
| The Fantasy Catalog | Find the fantasy behind the setting, the role and the attention you want. | 10 / 100 | Fifty distinct themes, each with receiving and offering roles; imagination can remain private and unacted upon. |
| Attraction & Sensory Cues | Discover the small sensory and relational cues that draw you closer. | 10 / 50 | Contact, visual atmosphere, sound, pace and recognition. |
| Aftercare & Recovery Style | Discover the care that helps you land softly after intensity. | 10 / 50 | Comfort through contact, words, practical care, space and follow-up. |
| Intimate Language & Communication | Find the words, tone and quiet that make you feel understood. | 10 / 50 | Affection, direction, playfulness, quiet and naming preferences. |
| Privacy, Visibility & Atmosphere | Explore being noticed, staying discreet and choosing who is part of the moment. | 10 / 50 | Discretion, private settings, opted-in adult audiences, fictional spotlight and visibility controls. |
| Sensory & Sensation Preferences | Explore gentle sensations, attention and the conditions you prefer. | 10 / 50 | Texture, comfortable temperature, pressure preferences, focus and planning. |
| Roleplay & Scenario Explorer | Discover the fictional worlds, roles and moods you enjoy imagining together. | 10 / 50 | Adult introductions, guides and guests, atmosphere, performance and coauthoring. |
| Connection During Intimacy | Map closeness, reassurance and independence without assigning an attachment diagnosis. | 10 / 50 | Reassurance, independent space, emotional openness, repair and predictability. |
| Jealousy, Compersion & Agreements | Reflect on exclusivity, shared joy and the agreements you would choose. | 10 / 50 | Exclusivity, discussing openness, care for feelings, shared joy and logistics; no readiness grade. |
| Service & Devotion | Discover whether care feels best as a gesture, a ritual or a chosen role. | 10 / 50 | Practical service, attentiveness, rituals, recognition and scope. |
| Praise, Teasing & Recognition | Map feeling seen, playfully challenged and put off. | 10 / 50 | Specific praise, focused admiration, gentle agreed teasing, expressive intensity and context. |
| Pleasure Pacing & Choice | Explore anticipation, direction and endings through the lens of your own choice. | 10 / 50 | Anticipation, invited guidance, flexibility, attention without targets and debriefing. |
| Toys, Props & Gear Preferences | Explore how props, atmosphere and optional equipment fit your style. | 10 / 50 | Atmosphere tools, adult costumes, gentle sensory props, selection and practical agreements. |
| Adult Caregiving & Comfort | Explore nurturance and being looked after while remaining fully adult and autonomous. | 10 / 50 | Nurturing gestures, rest, practical support, comfort atmosphere and autonomy. |
| Instinct, Movement & Play | Discover playful energy, movement and grounding. | 10 / 50 | Energy, shared movement, following/leading, expressive presence and returning to calm. |
| Power Exchange & Scope | Map chosen leadership, structure and where equal footing matters. | 10 / 50 | Invited direction, structure, role duration, flexibility and ordinary-life separation. |
| Limits & Boundaries Deep Dive | Give your yes, maybe and no room to mean different things. | 10 / 50 | Personal space, information, conditions, responses to no and changing agreements. |
| Partner Priorities & Dealbreakers | Clarify the qualities you seek and habits you enjoy bringing. | 10 / 50 | Warmth, reliability, curiosity, independence and repair. |
| Your Exploration Pace | Find the pace between curiosity and a freely chosen next step. | 10 / 50 | Planning, small steps, familiarity, invited spontaneity and reflection. |
| The Morning-After Map | Closeness, quiet, breakfast or your own bed: what makes afterward feel right? | 10 / 50 | Lingering, conversation, everyday comforts, goodbyes and rest. |
| Fantasy Sharing Comfort | Share an imagined world without promising to live it. | 10 / 50 | Sharing format, reception, depth, privacy and opening pace. |
| Group & Multi-Partner Curiosity | Separate imagination, social comfort and actual interest. | 10 / 50 | Imagination-only themes, adult social settings, attention, individual agreements and care afterward. |
| Sensory Focus & Overload | Notice whether fewer inputs, familiar surroundings or accessible choices fit you. | 10 / 50 | Visual and sound focus, input level, access to choice and settling afterward. |
| Gifting, Generosity & Money Boundaries | Explore gifts and chosen generosity without surrendering financial autonomy. | 10 / 50 | Symbolic gifts, rituals, shared experiences, autonomy and agreed limits. |
| Your Long-Term Dynamic | Imagine the rhythm you want beyond a single memorable evening. | 10 / 50 | Recurring connection, sustained roles, ordinary life, flexibility and independent adulthood. |
| Comfort After Difficult Experiences | An optional reflection on what supports comfort now. No retelling required. | 10 / 50 | Predictability, choices, supportive language, surroundings and ongoing support; no diagnosis or incident details. |
| Would You Rather: Intimacy Edition | Fifty choices about mood, pace and connection. | 10 / 50 | Plan/improvise, quiet/expressive, simple/atmospheric, everyday/imagined and shared/guided directions. |
| Compatibility Under Pressure | Explore awkward moments before they become unspoken expectations. | 10 / 50 | Changed plans, uneven energy, expectations, awkwardness and repair; no safety certification. |
| Your Personal Intimacy Blueprint | Bring saved reflections together, then add what matters now. | 12 / 60 | Six private synthesis axes: connection, pace, sensory style, imagination, roles and autonomy. |
| Erotic Blueprint: Your Intimacy Styles | Discover your leading Sensual, Sexual, Energetic, Kinky and Shapeshifter preferences and what makes them work for you. | 10 / 50 | Explicit primary and secondary ranking, ties, counterpart questions and category-specific coaching; an original non-graphic reflection, not a validated identity test. |

## Data and registration

- `src/data/assessments/candid/index.ts` publishes the revised question banks in `catalog.ts` alongside `coreAssessments`.
- `helpers.ts` builds receiving/offering pairs from concrete authored topics. `desire-senses.ts`, `care-connection.ts`, `communication-roles.ts`, `agreements.ts` and `fantasy-blueprint.ts` group related banks.
- `choices.ts` supplies fifty real binary choices. Choice direction and appeal are independent; role direction now distinguishes fluid versus explicitly assigned roles.
- `src/data/assessments/intimacy/` retains the original adult v1 publications and metadata. Core v1–v4 definitions also remain archived. Revised answer IDs and version-specific browser drafts prevent old answers being applied to different questions.

## Answer and scoring contract

`intimacy_profile` is a five-point desire scale plus Skip. Willingness, experience, hard limit and visibility are independent optional fields. No willingness is preselected, and choosing a desire rating does not add willingness, experience or remove a limit.

- **Desire:** explicit 1–5 appeal, normalized to 0–100. Category averages include only explicit ratings. Receiving and offering averages are also separate. Missing answers remain unmeasured. Reverse scoring is deliberately not used for direct appeal ratings; the existing agreement scales retain their authored reverse items.
- **Willingness:** explicit positions for freely interested, willing for a partner, curious to discuss, depends on conditions, not willing and hard limit. The private summary uses 100/75/50/40/0/0 as descriptive positions, not consent probabilities. Hard limits veto eligibility independently.
- **Experience:** explicit Never/Rarely/Sometimes/Often/Very often, summarized separately. Never is measured experience 0/100; blank remains unmeasured. Scatterplots use the original 1–5 positions and require both explicit desire and experience.
- **Limits:** a separate checkbox or hard-limit willingness blocks matching. A private desire rating can remain high alongside a hard limit. The scoring path does not rewrite it to zero.
- **Forced choices:** binary option weights measure preference direction, not desire. Appeal remains a separate rating. A forced choice by itself cannot create a mutual reveal.
- **Interpretations:** each authored category has its own low/high reading plus a mixed interpretation, tradeoff and reflection. These original self-reports have not been psychometrically validated and do not produce diagnoses, safety judgments, population percentiles or readiness labels.

Private results show interactive category bars/radars with evidence, separate channel cards, receiving/offering values, and a desire-versus-experience view. The blueprint additionally shows cross-assessment axis summaries and a source disclosure. A stronger score is not a better result.

## Partner privacy and complementary matching

The `consent_complementary` strategy compares a receiving item with the other person's corresponding offering item. Receiving interest of 4/5 or higher can match a freely willing offer even when the offer's personal desire is lower. Offering willingness is not recast as desire. Two explicitly curious counterparts may appear as a shared discussion topic when both people enabled curiosity sharing.

Private, skipped, hard-limit, unwilling and context-dependent answers are ineligible. Blank willingness is also ineligible. Binary items require the same valid choice plus explicit appeal and willingness, or mutual curiosity. Category/highlight sharing choices are honored.

Only disclosed mutual topics affect the shared score, category counts and coverage. Private and unmatched answers cannot change those outputs. The report includes no raw radar overlay, private-limit counts, rejection reasons or mismatch lists. The browser presents a mutual-topic count rather than an overall relationship-grade dial. No match supplies current consent.

Summary exports and public share projections use existing whitelists. They do not automatically include the new private channel, limit or synthesis payloads. Full private answer exports still require the owner's explicit answer and sensitive-data selections.

## Blueprint ownership and freshness

When a primary blueprint is submitted, the server selects only records owned by the same authenticated UID (or the same guest session for guest records). It excludes partner attempts, old assessment versions and the blueprint itself. The latest eligible attempt per assessment contributes once, with equal weight per source on each measured axis. A source's categories map to declared `blueprintAxis` values; no unrelated personality axis is guessed.

The resulting snapshot lists source titles and dates, not result IDs. Other assessments completed later do not silently rewrite it; retake the blueprint to refresh. An empty synthesis stays empty and explains how to add evidence. It does not manufacture a profile from missing history.

## Content scope

The brief's sexualized age-regression idea is replaced by adult-to-adult caregiving and comfort. Visibility scenarios require opted-in adults in closed private settings. Sensory, power, financial and story themes are non-graphic preference reflections, without hazardous technique instructions, actual coercion, financial dependency or non-consenting bystanders. No ageplay, childlike role, graphic erotic script or readiness/safety certification is included.

## Verification

The collection's tests exercise registration and schema validity for all thirty definitions, role reciprocity, independent channels, binary choice semantics, hard-limit vetoes, hidden-answer invariance and private blueprint ownership/version selection. Browser journeys cover teaser/deep completion, saved drafts, native answer controls, partner matching, catalog filters, themes, accessibility and responsive layouts. See [QUALITY_REPORT.md](QUALITY_REPORT.md) for the executed counts and verification scope.
