# Truth Desire

A private self-discovery and compatibility platform for adults. Next.js 15, React 19, TypeScript, Tailwind and original SVG visualizations.

## Run locally

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Guest test-taking, local drafts, private saved results, comparisons, selective sharing and downloads work without account setup. Copy .env.example to .env.local for optional Firebase accounts and transactional email.

The server repository stores results in .between-us-data/store.json. Browser drafts stay in the browser. Production saving requires BETWEEN_US_DATA_DIR on a persistent private volume and one Node writer. The app does not automatically store private results in Firestore; see OPERATIONS.md before choosing hosting.

## Product and measurement

- Forty assessments contain 2,060 authored full-form questions with direct wording and concrete situations. Nine core v5 tests and thirty-one adult v2 tests offer short and full forms, including a 100-question fantasy catalog, private synthesis and an original five-style blueprint. Earlier definitions remain available for saved results and invitations; rewritten questions use fresh answer IDs and separate drafts. See [the question editorial guide](docs/QUESTION_EDITORIAL_GUIDE.md).
- Every published test produces a private advice guide: partner qualities, constructive friction, skills and environment changes, three or four optional graduated experiments, and explicit desire/experience gap paths where those fields are measured. Partner advice uses only mutually disclosed topics. See [the complete overview](docs/ASSESSMENTS_AND_ADVICE.md), [example advice](docs/ADVICE_EXAMPLES.md) and [scoring/privacy contracts](INTIMACY_COLLECTION.md).
- A two-section homepage includes a draggable 3D profile, keyboard rotation, adjustable example scores, partner overlay and a pausable living background. Reduced motion is respected.
- Five questions per page with labeled agreement buttons, individual skip controls, page navigation and saved drafts. Native radios support keyboard arrows and 1–7 shortcuts, with no preselected response.
- Measured profiles, per-category explanations, compatible retake history and explicit sharing selections.
- My profile combines browser and session results, account information, a short advice preview and recent attempts. Compare separates population research, opted-in community averages and matching retakes. Population interest percentages cite Herbenick et al. (2017), Tables 2 and 5, with the U.S. sample and 2014–2015 fieldwork visible; optional comparison choices stay on the device and can be cleared.
- Private partner comparisons, ownership-checked saved-result reuse, independent disclosure controls and revocation.
- Actual participant histograms, midrank percentiles, strict-below percentages and archetype frequencies, suppressed below cohort thresholds.
- Draft authoring, validation, scoring previews, immutable published revisions and an independent live publication pointer.
- Visible email/password registration and sign-in, guest-result claiming, sign-out isolation, account deletion, private exports, PNG/SVG cards and verified-recipient email.

These are exploratory reflections, not diagnoses or validated predictions. Synthetic previews are labelled and kept separate from real participant data.

## Verify

```powershell
npm test
npm run typecheck
npm run lint
npx playwright install chromium firefox
npm run test:e2e
```

The browser suite builds the production application and uses isolated data under test-results. It covers desktop, tablet and mobile journeys, both forms of every published test, Firefox, and 1920px desktop layouts. Firebase rules and account cases require local emulators; the exact commands and explicit skips are documented in [OPERATIONS.md](OPERATIONS.md).

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for delivered behavior, [ASSESSMENT_AUDIT.md](ASSESSMENT_AUDIT.md) for the library and scoring contract, [DESIGN.md](DESIGN.md) for UI guidance, and [QUALITY_REPORT.md](QUALITY_REPORT.md) for verification evidence and limits.

The [November 21 site audit](docs/SITE_AUDIT_2026-11-21.md) records artwork, security, browser and privacy fixes, local measurements and remaining production/legal work. `security-headers.json` is shared by Next.js and the Firebase header synchronization script. These checks do not certify that the service is unhackable or compliant in every jurisdiction.
