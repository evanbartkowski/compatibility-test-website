# Verification evidence

Verified locally on November 20, 2026 after the personalized advice expansion. No public website deployment or real-user performance claim is made.

## Personalized advice verification

- **169 unit/integration checks passed across 23 suites; seven Firestore-rule cases skipped without the emulator.** All 40 published definitions have authored coaching. Tests cover changing the leading category, primary and secondary style ranks, leading/secondary ties, no inferred type from missing answers, independent experience/willingness, private and hard-limit gap paths, and summary exports omitting private advice.
- A regression check ensures an optional care plan cannot introduce an unrelated comfort that the person marked as a limit. Partner steps now stay with eligible or mutually disclosed topics. Pair-advice invariance checks confirm that changing hidden experience or limits cannot change the shared guidance.
- **All 80 quick/full catalog journeys passed**, including the new five-style inventory. A subsequent clean production build passed **25 focused browser checks** across Firefox, 1920px desktop, 1440px desktop, tablet and mobile. These cover actual answer input, guide tabs and keyboard navigation, ranked styles, gap/limit handling, privacy, saved drafts, counterpart completion, existing-result advice, collection filtering and both themes. After the secondary-tie refinement, another clean production build passed **five focused core/empty/tie checks** across those same configurations.
- Scoped Axe audits passed for every advice tab in dark/light Chromium projects. **Firefox's automated axe injection reproducibly crashed the installed browser during this advice test.** The suite retains Firefox functional, keyboard, layout and theme checks; repeatable automated advice-accessibility coverage is Chromium only. The browser crash was isolated to the injected audit, and is not claimed fixed. These checks are not an exhaustive human accessibility certification.
- Source lint, TypeScript, the complete unit suite and the final production build passed. The normal private-store SHA-256 remained unchanged. Missing advice is generated in memory for existing results from their pinned definitions and saved scores; an isolated persistence test verifies that reading advice does not rewrite the private file or scores.
- Reviewed dark desktop and mobile guidance captures. The new guide uses preparation-ordered steps, optional evidence disclosures, private gap paths and editable partner wording. Native desire radios now cover their complete visible answer target so decorative numbers cannot intercept clicks. Mutual-topic reports no longer repeat the same strengths in a second comparison list.
- [Three fictional profiles and a pair example](docs/ADVICE_EXAMPLES.md), [structured output](docs/ADVICE_EXAMPLES.json) and [the 40-test overview](docs/ASSESSMENTS_AND_ADVICE.md) are generated from the actual registry and engine using `scripts/generate-advice-examples.ts`. No real user data is read by the generator. Snapshot captures are retained under `qa-artifacts/advice-review`.

The five styles are original non-graphic preference lenses, not validated diagnoses or fixed identities. Advice describes conditions to discuss and optional ordinary comfort/communication experiments; it does not supply clinical guidance, hazardous technique instructions, a readiness grade, a partner safety prediction or current consent. Private advice remains excluded from existing public-share and summary-export whitelists. Full private JSON advice requires explicit owner export selections.

## Earlier adult intimacy collection verification

- **159 unit/integration checks passed across 21 suites.** Seven unchanged Firestore-rule checks were explicitly skipped without the emulator. Coverage includes all 30 new definitions, independent desire/willingness/experience values, limit vetoes, forced-choice direction versus desire, exact hidden-answer report invariance, summary-export privacy, and blueprint ownership/latest-version selection. An experience-only form remains provisional rather than inventing a desire profile.
- **106 production-browser checks passed.** All 78 quick/full journeys across the 39-test catalog completed, including the 200-question catalog and the blueprint teaser's partial final page. The other checks cover native independent inputs, draft restoration, privacy/limit preservation, actual receiving/offering partner completion, selective mutual reveals, private saved-source synthesis, collection filters, binary choices, both themes and the interactive homepage/account modal.
- Chromium and Firefox, 1920px desktop, 1440px desktop, 768px tablet and 390px mobile were exercised. The new controls additionally passed at 320px with at least 44px-wide desire targets. Scoped Axe checks found no violations in the new questionnaire controls in dark and light themes.
- The running production catalog returned **39 tests, 2,310 full-form questions, 30 new tests, 1,660 new full-form questions and 302 new teaser questions**. New discovery pages receive compact summaries. The normal private repository was not used for browser fixtures.
- TypeScript, ESLint, unit/integration tests and the production build passed. A final wording cleanup removed a duplicated possessive from result titles and updated the catalog description to cover five-point as well as seven-point forms. Both blueprint teaser/deep browser journeys passed again after a clean production build with those wording changes. The normal private-store hash remained unchanged during the browser checks.
- Reviewed desktop/mobile questionnaire, mutual-report and private synthesis captures. Removed empty couple-insight/mismatch sections and empty score bars from mutual-only reports; they now emphasize shared-topic counts, not a relationship grade. Private channels distinguish unrated fields from zero. Private synthesis captures are retained under `qa-artifacts/intimacy-blueprint-*.png`; browser test captures are regenerated under `test-results` on each run.

The new collection is original exploratory, non-graphic adult content, not psychometrically validated scales, readiness assessments or safety guarantees. Its exact scope, source files, counts, scoring and disclosure rules are documented in [INTIMACY_COLLECTION.md](INTIMACY_COLLECTION.md). No live account, mail, hosting or Firestore deployment was needed or repeated for this collection change; earlier account evidence below remains a separate verification scope.

## Earlier homepage and account checks

- **89 unit/integration checks passed across 19 suites.** Includes all 650 prompts providing scoring signal, balanced category coverage, unique questions, v3 archival resolution, v3 draft migration, independent page answers and account-deletion behavior with optional Firestore disabled or unavailable. Seven Firestore-rule cases explicitly skipped because the emulator was not running.
- **63 production-browser checks passed; two duplicate live-account cases intentionally skipped on tablet/mobile.** All 18 standard/full library journeys were completed and submitted. Chromium, Firefox, 1920px desktop, tablet and mobile were exercised. The selected suite also covers homepage interaction, assessment pages, account flows and accessibility; unrelated admin/expanded-feature browser suites were not rerun in this pass.
- Real Firebase email/password registration, guest-result claiming, logout isolation, login and account deletion passed. The temporary QA identity was deleted and a provider lookup confirmed it was removed. Optional Firestore profile copies are explicitly gated; accounts do not depend on an unprovisioned Firestore service.
- Browser checks verify pointer and keyboard rotation, reset, score adjustment, partner overlay, actual changing background pixels, reduced-motion defaults and pause. Both themes, saved drafts, page navigation, question skipping, category reports, PDF bytes and partner comparisons remain covered.
- Final production build, TypeScript checking, ESLint and focused diff checks passed. No new runtime graphics dependency was needed. Discovery receives compact summaries instead of complete question banks.

## Visual and final browser inspection

Inspected current dark and light homepage screenshots at desktop and mobile sizes. Read-only snapshots at 320, 390, 768 and 1440px showed no horizontal overflow and exactly two main homepage sections. The profile uses actual 3D projection with pointer, keyboard and button alternatives. All question answer labels remain visible, with larger mobile tap targets and five questions per page.

Fixed question-position restoration below the sticky header, removed the second importance response from equally weighted scales, eliminated unsupported desire/ideal-partner sections from current reports, and removed a duplicated disclaimer. Category details include an interpretation, tradeoff, practical experiment, reflection prompt and answered/eligible counts. A limited-evidence notice appears below three answers; contrasting responses produce a context note.

Current artifacts are under test-results/ and qa-artifacts/home-*.png. Homepage, auth modal and assessment Axe checks passed in the selected browser runs. Earlier six-route artifacts remain under qa-artifacts/2026-11-20-curation. Automated checks are not an exhaustive human accessibility certification.

Current browser fixtures use isolated repositories under test-results/e2e-data and qa-artifacts/home-preview-data. Existing definitions remain available for saved results and invitations; compatible v3 browser drafts retain their answers when moving to v4.

## Earlier local performance baseline

These measurements preceded the current interactive homepage and live Firebase configuration; they were not rerun for this change. Historical target: http://127.0.0.1:3000/, guest entry without Firebase account configuration. Lighthouse 13.6.0, default simulated mobile profile, headless Playwright Chromium. Three sequential navigation audits on the same local machine.

| Category | Run 1 | Run 2 | Run 3 | Median |
| --- | ---: | ---: | ---: | ---: |
| Performance | 100 | 100 | 100 | 100 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |

Median LCP: **0.90 seconds**. Median total blocking time: **2.5 ms**. Median CLS: **0**. No failed binary Lighthouse audits. Raw reports: qa-artifacts/2026-11-20-curation/lighthouse-1.json through lighthouse-3.json.

These local measurements do not establish production INP, field Core Web Vitals, authenticated performance, representative hardware performance or real network loading. No deployed CrUX dataset or real-user measurement was available. The initial, earlier single-run score of 89 performance is historical context and not a controlled improvement comparison.

## Infrastructure limits

Live Firebase Authentication was verified through the local production build. Hosting, Functions, Firestore deployment and external inbox delivery were not deployed or verified in this pass. Account and rules emulators were exercised in earlier work; rules cases were explicitly skipped in this run. Firestore profile copies remain opt-in.

Private records require a persistent single-writer Node repository. Ephemeral or horizontally scaled hosting requires a shared transactional repository. See OPERATIONS.md for setup and deployment boundaries. Current participant cohorts remain separate from all archived definitions, require actual consent and sufficient samples, and contain no synthetic norms.
