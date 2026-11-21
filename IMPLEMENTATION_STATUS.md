# Implementation status

Updated November 20, 2026. Implemented and verified locally in the existing Next.js application. No public deployment was made.

## Delivered

- Adult intimacy collection: thirty-one v2 reflections, 1,610 full-form items and 312 teaser items alongside nine core v5 tests. The complete published library is 40 tests and 2,060 full-form questions. The editorial revision removes vague euphemisms, repetitive scenarios and padding. Independent desire/willingness/experience/limit controls, complementary mutual-only reveals, private channels and ownership-checked synthesis remain supported.
- Personalized, versioned advice for every published assessment. Private guides include partner qualities and wording, constructive friction, practical changes, three or four optional experiments and supported desire/experience gap paths. The original five-style inventory ranks primary/secondary preferences only with evidence and handles ties explicitly. Pair guidance uses already disclosed topics only. See docs/ASSESSMENTS_AND_ADVICE.md and docs/ADVICE_EXAMPLES.md for generated deliverables.

- Fluid, full-browser black, violet, magenta and cyan interface with four primary destinations: Discover tests, My profile, Compare and History. Optional light theme and reduced motion remain supported.
- Two-section homepage: concise introduction, draggable 3D example profile and three starting tests. Scores reshape the illustration, a partner overlay shows another example, and a living background shares pausable motion with the profile. Keyboard, touch, reduced motion and canvas fallback are supported.
- Central measured profile, full-width personal radar, detailed category interpretations, evidence counts, tradeoffs, practical experiments and reflection prompts, latest attempts, compatible history lines and an accessible values table. Unrelated tests are not averaged into an invented overall personality score.
- Nine core version 5 definitions and scoring engine 1.2.0. Each has a 10-question short form and a 50-question full form. All earlier core v1–v4 and adult v1 definitions remain available for historical results and pinned invitations. The rewritten questions have fresh answer IDs and separate draft keys. Earlier compatible v3-to-v4 draft restoration remains available to the archived form. See docs/QUESTION_EDITORIAL_GUIDE.md.
- Five questions per page with labeled native agreement buttons, arrow-key and numbered shortcuts, no preselected answer and no second importance rating. Standard-to-full answer preservation, pause/resume and review editing remain. The branching engine is retained for historical and custom definitions.
- Private partner invitations and reports. Saved-result reuse validates ownership and version compatibility. Perspective-dependent intimacy forms and partner-specific games require appropriate fresh responses. Importance, complementary channels and firm boundaries affect the declared exploratory rubric.
- Category distributions, empirical percentiles, strict-below percentages and pooled archetype frequencies from actual opted-in data. Test version, scoring engine, form and demographic cohort thresholds stay separate. Synthetic examples remain explicit.
- Selective result cards start with no fields selected. Actual PNG and SVG downloads work. Curated profile links copy selected fields only, expire and can be revoked. Deleting a source invalidates dependent reports, grants and shared profiles.
- PDF, CSV and JSON summary downloads omit individual answers by default. Sensitive result categories and private details require explicit export selections. A full owned-data export is available in settings. Account privacy defaults persist independently of later guest preferences on a shared browser.
- Firebase email/password registration, guest claiming, sign-out isolation, sign-in and recent-sign-in account deletion passed against the existing live Truth Desire Firebase project through a local production build. The temporary QA identity was deleted and checked for removal. Local configuration is connected in ignored .env.local; the website has not been deployed. Additional Firestore profile copies are opt-in and require a provisioned database and owner rules.
- Email verification and delivery retain real provider integrations. A real MIME message and PDF attachment passed a local SMTP transport fixture; no external mail was sent.
- Admin creation/editing for questions, choices, dimension weights, quick forms, branches, interpretation fields, archetype thresholds, scoring and compatibility strategies. Draft previews use the real scorer without persisting a result. Published measurement cannot be overwritten. Draft revisions keep the live test available; unpublishing is a separate confirmed action.
- Production identity cookies fail closed without an independent 32-character signing secret. Strict prototype Firestore rules block client-written scores, roles, invitations, grants and private aggregates. All seven rules tests passed against the emulator.
- Removed obsolete profile synthesis and unused UI dependencies. Browsing screens receive catalogue summaries; Firebase, charts, cards and authentication UI load when needed. Public publication/readiness queries reuse one store snapshot. Malformed private data files fail visibly rather than silently resetting.

## Current advice verification

- 169 unit/integration checks passed across 23 suites; seven Firestore emulator cases skipped.
- All 80 catalog form journeys passed. A clean-build focused run passed 25 interaction, ranking, guide, matching, privacy, layout and theme checks across five configurations; five final tie/core/empty-result checks passed after another clean build.
- Every advice tab passed scoped Axe checks in both Chromium themes. Firefox functional checks pass, but its injected advice Axe run crashes the installed browser; that specific audit remains a documented tool limitation.
- Generated overview and three example profiles use the actual TypeScript registry and scorer. Type checking, lint and the final production build passed; normal private data remained unchanged. See QUALITY_REPORT.md.

## Earlier intimacy-collection verification

- 159 unit/integration checks passed across 21 suites; seven Firestore emulator cases skipped.
- 106 production-browser checks passed, including all 78 quick/full journeys across 39 tests, five browser/viewport configurations, independent controls, private complementary matching, blueprint synthesis, accessible themes and draft restoration.
- Production build, source lint and TypeScript checks passed. See QUALITY_REPORT.md for the executed scope, content boundaries and final focused verification.

## Earlier curation verification

- 76 unit/integration checks passed across 15 suites; seven unchanged Firestore-rule cases explicitly skipped without the emulator.
- 61 production-browser checks passed; three Firebase-account cases explicitly skipped without account emulators. Covers all 18 quick/deep form journeys, Chrome and Firefox, 1920px desktop, tablet and mobile, real agreement-dot input, score/evidence accuracy, resume, sharing, exports, admin and keyboard accessibility.
- Ten focused browser checks passed again after correcting homepage category labels and the five-category preview layout. Final read-only inspection passed 36 route/viewport checks, with additional agreement/report Axe checks and an unchanged private-store hash.
- Source lint and type checking passed. Visual review repaired question-position restoration below the sticky header and removed duplicate report copy. The final production build and normal-data preview are verified in QUALITY_REPORT.md.

## Earlier overhaul verification

These counts describe the preceding implementation. Current curation validation is recorded in QUALITY_REPORT.md.

- 121 unit, integration and emulator-rule checks passed across 15 suites.
- Comprehensive production-browser run: 98 checks passed. This includes 62 form journeys across all 31 published tests on desktop and 36 responsive/account/admin/sharing/history/accessibility checks across 1440px, 768px and 390px.
- After final chart/loading/read optimizations, all 36 responsive checks passed again. Screenshots wait for loaded charts and were visually reviewed; a clipped mobile card layout was repaired.
- Final read-only inspection passed 24 route/viewport checks, including 320px, with no clipped cards, overflow, browser exceptions or private-store changes.
- TypeScript, ESLint and the production build passed. Functions compiled under the declared Node 22 runtime. App and Functions dependency audits reported zero known vulnerabilities.
- The legacy persistence test now uses a temporary directory. Nine identified synthetic fixtures were backed up and removed from the normal store; no non-test submissions were present. The full test suite subsequently left the normal store SHA-256 unchanged.
- Local Lighthouse measurements and limits are in QUALITY_REPORT.md.

## External configuration and limits

Private records use a single-writer file repository. Configure a persistent private volume and HTTPS for the supported Node deployment. Firebase App Hosting or another horizontally scaled/ephemeral host requires a shared transactional repository first; the current repository must not be treated as durable cloud storage. Firebase public configuration, independent signing secrets, database provisioning/rules deployment and a verified email provider are not implied by emulator checks. The configured project's Firestore API discovery returned HTTP 403 during this run. No live Firebase, Function, Hosting or external mailbox delivery was verified.

The security rules are a tested prototype. Review and harden them against the actual production model before a broad launch. See OPERATIONS.md for exact setup, reproduction and hosting boundaries.
