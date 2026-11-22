# SoulFlame

Private self-discovery and compatibility tools for adults 18+. Built with Next.js 15, React 19, TypeScript, Tailwind CSS and original SVG/canvas artwork.

**Website:** [truth-desire.web.app](https://truth-desire.web.app) | **Firebase project:** `truth-desire`

## What is included

- **Full tests only.** All 22 assessments use their full question sets, with ten questions per page, individual skip controls, keyboard support and saved progress. Earlier short-test links open the full test; compatible short drafts keep their answers. Historical results retain their original form and scoring context.
- **My profile and history.** Saved results, category scores, advice, recent attempts and compatible retake comparisons are collected in one place. Guest results can remain on the device without an account.
- **Useful comparisons.** Population research, opted-in website community averages, past attempts and private partner comparisons have distinct labels and data sources. U.S. interest percentages cite Herbenick et al. (2017), with the sample and 2014-2015 fieldwork shown. They are not worldwide population norms.
- **The Delusional Standards Test.** A separate population-filter calculator includes age, height, income and additional filters, with labeled native controls and an expandable explanation of its estimate.
- **Light and dark themes.** Light mode uses white surfaces, deeper purple accents and readable score/status colors. Both themes retain the site's illustrations and interactive profile graphic.
- **Phone layouts.** Larger touch targets, visible answer grids, 16px form text, safe-area spacing, responsive navigation and scrollable account dialogs. Decorative background canvases are hidden on phones; reduced-motion preferences are respected.
- **Private sharing and advice.** The full Node application supports selective profile links, invitation-based comparisons, downloads, verified-recipient email and advice based on measured answers. Participation in community statistics is optional, and cohorts below the privacy threshold are suppressed.

Results are exploratory reflections, not diagnoses, validated IQ scores, consent to activities or predictions of relationship success. Synthetic previews are labeled and separate from participant data. Artwork and dependency notices are in [public/licenses](public/licenses).

## Hosting and feature availability

The public Firebase Hosting release serves prerendered pages and browser code. Full tests, the calculator, population research, device-local results and guest profiles can work there. **Firebase Hosting alone does not run the Next.js API routes.**

Session-backed result storage, account result claiming, server-managed sharing/invitations, live community statistics, server erasure/export and transactional email require the supported Node backend and its configured services. These features must not be described as fully deployed merely because the static website is online. App Hosting currently requires a billing-plan upgrade for this Firebase project; this release does not provision it or deploy Functions/database rules.

The server stores application records in `.between-us-data/store.json`, or the directory selected by `BETWEEN_US_DATA_DIR`. It does not automatically use Firestore for private results. Production needs a persistent private volume and a single Node writer. See [OPERATIONS.md](OPERATIONS.md) before deploying the backend or changing storage.

## Run locally

Use Node.js 22 or newer:

```powershell
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` for optional Firebase and email configuration. Keep private credentials, runtime records, browser-test data and generated deployment files out of Git.

## Verify

```powershell
npm test
npm run typecheck
npm run lint
npx playwright install chromium firefox webkit
npx playwright test e2e/library.spec.ts e2e/questionnaire-pages.spec.ts e2e/light-mobile.spec.ts --workers=1
```

The focused browser suite builds the production application and uses isolated data. It covers all 22 full assessments, retired short-form submission rejection, answer persistence, both themes, phone navigation/dialogs, saved profiles/reports, overflow and automated accessibility checks. Projects include Chromium, Firefox, WebKit, Android Chrome and iPhone Safari emulation, with widths from 320px to 1440px.

The latest local release checks recorded **170 passing unit tests** and **59 browser scenarios verified across the full run and targeted reruns**. Seven Firestore-emulator unit cases were explicitly skipped in the ordinary unit run. The mobile Lighthouse lab run scored **100 performance, 100 accessibility and 100 best practices**; LCP was approximately 1.4 seconds and CLS was zero. The Lighthouse run used the default theme; light-mode contrast and theme switching were checked separately. These are local observations, not field performance or accessibility certification.

Run emulator-dependent Firebase checks separately using [OPERATIONS.md](OPERATIONS.md). The additional legacy browser scenarios have broader coverage and are not all represented by the focused release results above.

## Deploy the static website

From a normal production configuration, without emulator flags:

```powershell
npm run build
npm run deploy:prepare
firebase deploy --only hosting --project truth-desire
```

`deploy:prepare` synchronizes security headers, renders site/share icons and copies prerendered pages plus public assets into `deploy-public/`. Deploy only that generated directory. Do not publish `.next/server`, `.env.local`, runtime stores, test results or QA artifacts. Confirm the live pages and their referenced asset hashes after publishing.

For the complete application, follow the persistent Node-server deployment instructions in [OPERATIONS.md](OPERATIONS.md). Publishing the static site does not replace that backend setup.

## Project references

- [Assessment and advice overview](docs/ASSESSMENTS_AND_ADVICE.md), [advice examples](docs/ADVICE_EXAMPLES.md) and [question editorial guide](docs/QUESTION_EDITORIAL_GUIDE.md).
- [Scoring and privacy contracts](INTIMACY_COLLECTION.md), [assessment audit](ASSESSMENT_AUDIT.md) and [implementation status](IMPLEMENTATION_STATUS.md).
- [Design guidance](DESIGN.md), [quality report](QUALITY_REPORT.md) and [November 21 site audit](docs/SITE_AUDIT_2026-11-21.md).

`security-headers.json` supplies shared Next.js/Firebase Hosting protections. Security, legal and production-readiness limits are documented in the audit; no automated check certifies that the service is unhackable or compliant in every jurisdiction. Operator contact details remain unpublished as requested.
