# Truth Desire: the focused intimacy collection

Ten adult assessments contain **660 full-form questions** alongside six core assessments. The complete library has **16 assessments, 970 full-form questions and 184 short-form questions**. Adult definitions use version 3.0.0; core definitions use 6.0.0. Earlier definitions remain archived for saved results and invitations.

The adult tests are Erotic Blueprint; Desire, Initiation & Pleasure; Fantasy & Roleplay; Touch, Turn-Ons & Sensory Style; Aftercare & the Morning After; Sexual Communication & Dirty Talk; Power, Roles & Devotion; Boundaries, Privacy & Trust; Exclusivity, Jealousy & Openness; and Your Partner & Relationship Vision. Each has 50?100 full-form questions and personalized advice.

All forms show five questions per page. Related topics are categories within a broader test rather than extra cards. [The generated overview](docs/ASSESSMENTS_AND_ADVICE.md) contains exact hooks, counts and advice topics. [The consolidation and 3D profile guide](docs/FOCUSED_LIBRARY_AND_3D_PROFILE.md) explains redirects, historical versions and the graph's score sources.

## Data and registration

- src/data/assessments/focused.ts registers the 16 tests, merges related categories, maps counterpart IDs and updates coaching keys.
- src/data/assessments/focused-copy.ts contains targeted readability corrections.
- src/data/assessments/candid/legacy-publish.ts and candid/legacy/ retain the previous editorial publications. Original intimacy v1 and core v1?v4 definitions remain unchanged.
- Retired links redirect through focusedRedirects. Existing invitations resolve their exact pinned definitions. New drafts use version-specific storage keys.

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
