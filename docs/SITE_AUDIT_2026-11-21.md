# Site audit — November 21, 2026

This is an implementation and local verification record, not a penetration-test certification or legal opinion. The requested audience is major Western markets, including the U.S., Canada, UK, EU/EEA, Switzerland, Australia and New Zealand. The owner requested that no operator name or email be published yet.

## Changes

- Replaced the remaining text check marker with a vector icon; added six compact vector illustrations for population topics and assessment thumbnails in profiles/history. New art is authored in source, with no externally downloaded image assets. Repeated assessment illustrations now have unique SVG IDs, avoiding gradient/filter collisions.
- Closed an unauthenticated `/api/results/[resultId]/profile` disclosure. Known result IDs alone no longer reveal private role scores. Ownership is checked against the existing result authorization rules.
- Added same-origin/Fetch Metadata checks for API writes, JSON content-type restrictions, a 1 MiB declared request limit, and bounded streaming JSON parsing in API handlers. Browser protections are defense in depth; they do not replace endpoint authorization.
- Added CSP, framing, MIME, referrer and permissions protections to Next.js and Firebase Hosting configuration. CSP permits inline Next.js scripts/styles to preserve static rendering; it is not a strict nonce policy. TLS, reverse-proxy limits, trusted forwarding headers, infrastructure access and distributed rate limiting still need production verification.
- Kept Firebase popup/redirect authentication compatible with that policy by permitting its Google API loader. The initial restricted policy blocked this script during the real-browser audit; the final policy permits the required Google origin.
- Bounded in-memory rate-limit storage and added per-client/per-recipient verification-email limits. Production deployments with multiple workers need a shared rate limiter or upstream protection.
- Deletion requires a confirmed JSON success response. Browser result copies, drafts and population choices are cleared after confirmed erasure. Sign-out validates the server response and clears device copies. Other devices, downloads and infrastructure backups remain outside this browser's erasure operation.
- Fixed the missing/invalid favicon; added PNG icons for Apple and web manifests. Preserved reduced-motion preferences in canvas animation and added observer fallbacks.
- Fixed advice links into collapsed report sections, hydration-sensitive theme/population controls and selected-answer contrast/touch targets. The Open Graph PNG now renders the authored artwork and text rather than only its background.
- Added plain-language use terms, clarified sensitive-answer storage consent and browser persistence, removed absolute privacy wording from metadata, and clarified that the reasoning exercise does not produce a validated IQ score.
- Publishing/unpublishing a Studio revision invalidates the corresponding route cache. The profile shell can be rendered statically and loads private data through authorized APIs. Two consolidated assessment redirects preserve query parameters.

## Verification

The audit uses isolated test data, not the owner's saved results. Other edits continued in the shared checkout, so browser/build measurements use an isolated snapshot. `qa-artifacts/site-audit-2026-11-21/source-manifest.json` identifies the exact source files tested. Later concurrent edits are outside that snapshot's coverage. Detailed local measurements and browser screenshots are under `qa-artifacts/site-audit-2026-11-21/`; browser reports/screenshots are in its `snapshot/` directory.

- Before changes, `npm audit` for the web application and production Functions dependencies reported zero known vulnerabilities. This is a point-in-time database check, not proof of security.
- Mobile lab baseline: Chromium, 390×844, fresh context, 4× CPU slowdown, 150 ms RTT, 1.6 Mbps download, reduced motion, three runs. Home median LCP 976 ms (960–996); discovery median 1,000 ms (972–1,076). CLS was zero or effectively zero. These are local observations, not real-user field data.
- Baseline Lighthouse: performance 100, accessibility 100, best practices 96. The browser-console failure was a missing favicon.
- Final Lighthouse: **performance 100, accessibility 100, best practices 100**; LCP 1.2 s, CLS 0, total blocking time 80 ms. No console errors or DevTools policy issues were reported. This is a local mobile lab result, not real-user field data or an accessibility certification.
- Final three-run mobile measurements, with the same throttling as the baseline: home median LCP **1,244 ms** (1,232–1,260); discovery **1,256 ms** (1,248–1,300). Every run had CLS 0 and no horizontal overflow. Observed resource transfer was approximately 395 KB and 538 KB respectively; cross-origin resources without timing permission can report zero transfer bytes. The medians were higher than the baseline, so this audit does not claim a load-time improvement. The build retains a Lighthouse performance score of 100 while adding artwork and security/privacy behavior; field LCP/INP/CLS still need production monitoring.
- Final unit suite: 166 passed, 7 skipped. The seven skipped cases require the Firestore emulator; the separate emulator run passed all seven. Functions TypeScript build passed. The current checkout also passed TypeScript and ESLint with no warnings or errors at the time checked.
- Final browser run: **90 passed, zero failed/skipped**, using one worker to avoid host browser-process instability observed in an earlier concurrent run. Projects covered Chromium desktop/tablet/mobile, Firefox desktop and Safari WebKit desktop. This includes all 40 quick/complete catalog forms plus saved-profile fallback, ownership, selective sharing/revocation, PNG export, deletion, Studio publication/cache invalidation, population controls, themes, keyboard controls, automated accessibility checks, security headers and request limits. This is targeted coverage, not a claim that every legacy browser scenario or physical device was tested.
- After concurrent content edits introduced a direct-interest kink bank, three older generic assertions expected reverse-scored questions and failed in the main checkout. The assertions now validate direct, role-tagged ratings for that bank while retaining reverse-scoring checks for other surveys. The main checkout subsequently passed all 166 unit tests, TypeScript and ESLint. Its later assessment-content changes are not part of the frozen browser snapshot.
- Static packaging passed with the synchronized headers, real ICO/PNG icons, terms and license notices included. The generated profile shell contained no saved result IDs. The application and Functions dependency audits reported zero known vulnerabilities; no dependency upgrade was needed. No production deployment was performed.

## Legal and operational work still required before a broad launch

The public pages are factual product explanations. They are not a complete jurisdiction-specific legal package. Do not advertise the site as unhackable, medically validated, legally approved, compliant everywhere, or immune from claims.

Sex-life and sexual-orientation information can be special-category data. Confirm applicable lawful bases and conditions, meaningful consent, minimization, deletion/retention rules, international transfers, processor agreements, children's access rules and whether a DPIA or other assessment is required. Establish a private rights-request and incident-response channel before public collection at scale. Operator/contact details remain unpublished as requested; that means the privacy notice is not ready to be represented as a complete multi-jurisdiction notice.

Have qualified counsel review the intended markets, applicable state/provincial laws, any age-assurance obligations, the terms/notice, branding/trademark rights, assessment claims and content licensing. Add an actual operator/contact route and verified processor/hosting locations when ready. Preserve font and icon licenses supplied in `public/licenses/`.

Primary references checked during this audit:

- [ICO: special category data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/)
- [Canada OPC: meaningful consent](https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805/)
- [OAIC: transparent management of personal information](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-1-app-1-open-and-transparent-management-of-personal-information)
- [FTC: collecting, using or sharing consumer health information](https://search.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach)
- [U.S. Copyright Office: permissions](https://www.copyright.gov/circs/m10.pdf)
- [OWASP: Next.js security](https://cheatsheetseries.owasp.org/cheatsheets/Nextjs_Security_Cheat_Sheet.html)
- [Firebase: supported environments and CSP requirements](https://firebase.google.com/docs/web/environments-js-sdk#content-security-policy-and-trusted-types)

Static Firebase Hosting does not provide the Node API or durable private store. Account, invitation, email and server-statistics features require the documented backend. No production deployment or production legal/security certification was performed by this audit.
