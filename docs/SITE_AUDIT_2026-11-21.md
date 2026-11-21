# Site audit — November 21, 2026

This is an implementation and local verification record, not a penetration-test certification or legal opinion. The requested audience is the U.S., Canada, UK, EU/EEA, Australia and New Zealand. The owner requested that no operator name or email be published yet.

## Changes

- Replaced the remaining text check marker with a vector icon; added six compact vector illustrations for population topics and assessment thumbnails in profiles/history. New art is authored in source, with no externally downloaded image assets. Repeated assessment illustrations now have unique SVG IDs, avoiding gradient/filter collisions.
- Closed an unauthenticated `/api/results/[resultId]/profile` disclosure. Known result IDs alone no longer reveal private role scores. Ownership is checked against the existing result authorization rules.
- Added same-origin/Fetch Metadata checks for API writes, JSON content-type restrictions, a 1 MiB declared request limit, and bounded streaming JSON parsing in API handlers. Browser protections are defense in depth; they do not replace endpoint authorization.
- Added CSP, framing, MIME, referrer and permissions protections to Next.js and Firebase Hosting configuration. CSP permits inline Next.js scripts/styles to preserve static rendering; it is not a strict nonce policy. TLS, reverse-proxy limits, trusted forwarding headers, infrastructure access and distributed rate limiting still need production verification.
- Bounded in-memory rate-limit storage and added per-client/per-recipient verification-email limits. Production deployments with multiple workers need a shared rate limiter or upstream protection.
- Deletion requires a confirmed JSON success response. Browser result copies, drafts and population choices are cleared after confirmed erasure. Sign-out validates the server response and clears device copies. Other devices, downloads and infrastructure backups remain outside this browser's erasure operation.
- Fixed the missing/invalid favicon; added PNG icons for Apple and web manifests. Preserved reduced-motion preferences in canvas animation and added observer fallbacks.
- Added plain-language use terms, clarified sensitive-answer storage consent and browser persistence, removed absolute privacy wording from metadata, and clarified that the reasoning exercise does not produce a validated IQ score.
- Publishing/unpublishing a Studio revision invalidates the corresponding route cache. The profile shell can be rendered statically and loads private data through authorized APIs. Two consolidated assessment redirects preserve query parameters.

## Verification

The audit uses isolated test data, not the owner's saved results. Detailed local measurements and browser screenshots are under `qa-artifacts/site-audit-2026-11-21/` and Playwright's `test-results/`.

- Before changes, `npm audit` for the web application and production Functions dependencies reported zero known vulnerabilities. This is a point-in-time database check, not proof of security.
- Mobile lab baseline: Chromium, 390×844, fresh context, 4× CPU slowdown, 150 ms RTT, 1.6 Mbps download, reduced motion, three runs. Home median LCP 976 ms (960–996); discovery median 1,000 ms (972–1,076). CLS was zero or effectively zero. These are local observations, not real-user field data.
- Baseline Lighthouse: performance 100, accessibility 100, best practices 96. The browser-console failure was a missing favicon.
- Final check results are recorded below after execution.

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

Static Firebase Hosting does not provide the Node API or durable private store. Account, invitation, email and server-statistics features require the documented backend. No production deployment or production legal/security certification was performed by this audit.
