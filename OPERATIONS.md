# Running and deploying Truth Desire

The supported application runs as a Next.js Node server with one writer and a persistent private data volume. Firebase Auth is optional. Private result storage uses the server repository in `src/lib/server/store.ts`; it is **not a Firestore result-storage adapter**.

## Local development

Use Node 22 or newer, `npm ci`, then `npm run dev`. Guest tests work without Firebase or email credentials. Browser drafts and server results are separate: clearing browser storage does not erase the server file.

Normal development data is `.between-us-data/store.json`. `BETWEEN_US_DATA_DIR` changes that location. Unit persistence tests use isolated operating-system temporary directories. Browser tests use `test-results/e2e-data`. Never point automated tests at your real deployment volume.

## Production server

1. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin before building.
2. Set `BETWEEN_US_DATA_DIR` to an absolute directory on a persistent private volume, readable and writable only by the application service. Production writes fail if this setting is missing. Configure infrastructure encryption and backups according to the deployment's retention policy.
3. Set a long random `BETWEEN_US_ADMIN_KEY` and a separate `BETWEEN_US_UID_SECRET` of at least 32 random characters. Generate independent values using `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`; keep them in the deployment's secret manager. Do not reuse public Firebase configuration as a signing key.
4. Run `npm ci`, `npm run build`, then `npm start`. Put the Node service behind HTTPS. Leave `ALLOW_HTTP_LOCALHOST` unset outside local browser testing. Ensure the reverse proxy supplies trustworthy client IP headers for endpoint rate limits.
5. Use one Node writer for this file-backed repository. Configure automatic restart and durable volume mounting. A horizontally scaled, serverless or ephemeral deployment requires a shared transactional repository implementation first. Do not use an unmounted container filesystem for real results.

The existing Firebase App Hosting configuration is preserved. **Do not deploy the current file repository to App Hosting as though it were durable shared storage.** Either choose the supported persistent Node deployment or implement and verify a shared repository before using that hosting path. Static Firebase Hosting alone does not run these authenticated server APIs.

## Firebase accounts

Set the public client values listed in `.env.example` before building. Enable Email/Password and, if desired, Google under Firebase Authentication. Add the final domain to authorized domains. Enable email enumeration protection in the project's authentication settings. Verify real sign-in, guest claiming, cross-device access to the same deployment, sign-out isolation and account deletion after deployment.

The server verifies Firebase ID tokens with the identity service, then sets its own signed, five-day HttpOnly account cookie. Claimed results require the account; the old guest cookie alone cannot access them. Account deletion requires a sign-in within five minutes, removes the Firebase user profile and identity, deletes app records and revokes existing app sessions. Keep the signing secret stable across ordinary restarts; rotating it signs out all current app sessions.

Firestore user profile copies are optional and disabled by default. Set `NEXT_PUBLIC_FIREBASE_PROFILE_SYNC_ENABLED=true` only after provisioning the database and deploying the owner rules. When enabled, account deletion requires successful cloud-profile removal before deleting the identity and app data. Local emulator mode enables these profile copies for the emulator account tests. Firebase Authentication and the private app result repository do not require Firestore.

Direct browser writes to private score, invitation, compatibility and grant documents are denied. The Functions code retains trusted cloud workflows and publishes only versioned measured aggregates with at least 50 people, ten-bin histograms, current consent and participant deduplication. Browser submissions currently remain in the server repository; the app does not silently mirror them into Firestore.

On November 20, 2026, the registered Truth Desire web app configuration was retrieved, email/password authentication was verified enabled, and ignored local configuration was connected. A local production build passed a live registration, guest-result claim, sign-out isolation, sign-in and account-deletion check. The temporary QA identity was removed. No external email was sent and no website deployment was made. Google sign-in is displayed only when `NEXT_PUBLIC_GOOGLE_SIGNIN_ENABLED=true`; enable that provider and its authorized domains before opting in.

During this implementation, database discovery for the configured `truth-desire` project returned HTTP 403 because the Firestore API was disabled or unused. No live database edition, rule deployment, Function deployment or Hosting deployment was verified. Before using those cloud workflows, provision the intended database, confirm project and billing/region settings, review `firestore.rules` and `firestore.indexes.json`, and deploy through the normal project release process. These are tested prototype rules with strict owner checks, field/type validation and server-only private writes. Review and harden them against the actual production data model before broad public use.

## Email

Configure either `RESEND_API_KEY` or all SMTP connection credentials, plus `EMAIL_FROM` on a verified sender domain. Address verification is required before sending results. Configure provider domain authentication, test delivery to an address you control, and check failure handling. Secure links expire; downloaded and emailed attachments remain outside the app's revocation controls.

A real MIME message and PDF attachment were exercised against a local SMTP fixture. No external recipient was contacted, and production inbox delivery has not been verified. Missing provider credentials produce an explicit unavailable response rather than a delivery success.

## Reproduce the checks

```powershell
npm test
npm run typecheck
npm run lint
npm ci --prefix functions
npm run build --prefix functions
npm audit --omit=dev
npm audit --prefix functions --omit=dev
```

For Firebase checks, install Java 21 and start local emulators in a separate terminal:

```powershell
npx --yes firebase-tools@15.37.0 emulators:start --only auth,firestore --project demo-truth-desire
```

Then run these sequentially, stopping any existing application server on port 3000 first:

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
npm test
$env:RUN_FIREBASE_E2E='true'
npm run test:e2e
```

The rules suite clears the **demo emulator** between cases; do not run it alongside account browser journeys. Browser tests inject emulator-only Firebase build configuration. Rebuild normally, without `RUN_FIREBASE_E2E`, before deploying. Without emulators, `npm test` explicitly skips the seven rules cases, and the browser suite skips three account cases. `npm run test:rules` can start a standalone Firestore emulator when port 8080 is free.

Review `ASSESSMENT_AUDIT.md`, `QUALITY_REPORT.md` and `IMPLEMENTATION_STATUS.md` for measurement contracts and actual verification limits. Synthetic chart previews are labelled examples; deployment does not manufacture a participating population.
