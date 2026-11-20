# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js (App Router, TypeScript), Tailwind CSS, Radix UI primitives, Framer Motion, custom SVG data visualizations, plus Firebase Authentication (`truth-desire`), Cloud Firestore, Cloud Functions v2, and App Hosting (with full local server-side storage fallback for zero-credential local operation and automated testing).

## Users

- **Primary users:** Curious adults (18+) seeking a private, romantic, emotionally honest, and spicy-when-appropriate space to explore their personality traits, romantic attachment, sensual turn-ons, BDSM/kink dynamics, desire-versus-experience gaps, and ideal partner traits.
- **Secondary users:** Invited romantic or intimate partners (18+, any gender or orientation) completing a mirrored perspective assessment through a private, revocable link without needing to sign in.
- **Internal editors / admins:** Content authors managing assessment definitions, question taxonomies, and editorial review flags via the internal Assessment Studio.

## Product Purpose

**Truth Desire** helps adults uncover what they genuinely crave, value, avoid, or feel curious to try in romance and intimacy; visualize gaps between desire and real-world experience; optionally compare themselves against privacy-protected opted-in community statistics; and discover boundary-respecting romantic, sexual, and kink compatibility with a partner.

## Positioning

Unlike bland clinical quizzes or crude adult sites, Truth Desire blends a nocturnal velvet editorial aesthetic (Noir Pink & Black dark default paired with a crisp Blush Pink & Carbon light theme) with rich interactive SVG visualizations (7-axis preference radars, desire-versus-experience scatterplots, BDSM power-exchange profiles, and zero-leak mutual kink reveals), provocative yet tasteful conversational questions, complementary directional matching, and strict privacy controls where no private answer is ever leaked or sent to external AI services.

## Operating Context

- **Private reflection:** Users take assessments on mobile, tablet, or desktop in private personal settings, pausing and resuming across sessions as a guest or signing in optionally via Firebase (`truth-desire`) to sync history and partner reports across devices.
- **Couples' dialogue:** Partners complete separate complementary questionnaires from their own devices and review aligned, complementary, mutually revealed, and discussion-worthy topics together, with optional privacy-reviewed PDF/CSV/JSON export.
- **Editorial verification:** Questions for the inaugural Intimacy & Partner Preferences assessment are inspired by the 608-woman *Marketplace of Sex Acts* scatterplot (*Knowingless*), with obscured chart terms explicitly flagged for internal editorial review rather than guessed, and published exploratory averages strictly separated from platform user statistics.

## Capabilities and Constraints

- Adults-only (18+) confirmation and explicit consent required prior to sensitive or kink modules.
- **Zero-gate optional authentication:** No account is ever required to take any of the 30 assessments, view results, export reports, or participate as an invited partner. Signing in (Email/Password, Google Sign-In, or password reset via Firebase project `truth-desire`) is strictly optional and seamlessly claims guest data and syncs results across sessions.
- Deterministic, versioned scoring (`v1.0.0`) with transparent formulas, explicit coverage percentages, firm-boundary precedence, and missing-data exclusion.
- Community comparison strictly requires explicit opt-in and enforces a minimum respondent threshold (`n >= 50` per item/cohort); displays an unavailable state rather than fabricating figures, and labels any synthetic preview dataset unmistakably.
- Zero sensitive responses in URLs, analytics events, logs, or external AI calls; zero-leak mutual reveal rules keep unreciprocated kinks private.

## Brand Commitments

- Configurable brand identity defaulting to **Truth Desire** (connected to Firebase project `truth-desire`).
- Mature, romantic, intimate, and candidly spicy editorial voice dressed in an authentic **Noir Pink & Black** dark default (`#08060A` obsidian ground, `#110C13` velvet plum-black surfaces, `#FF5C9E` electric rose-pink accent, `#E5BC87` champagne rose-gold highlights) alongside an equally crisp **Blush Pink & Carbon Ink** light theme (`#FFF3F7` ground, `#110A0E` ink, `#C2185B` crimson rose-pink accent).

## Evidence on Hand

- Supplied reference chart: `Marketplace of Sex Acts` scatterplot (*survey of 608 women*, *Knowingless* "Good At Sex" pt 4) containing 62 plotted behaviors across enjoyment vs. frequency encountered.
- Full 30-assessment platform spanning Sexuality & Intimacy (including dedicated BDSM Roles & Power Dynamics and Kink & Fetish Exploration Map tests), Romance & Attraction, Personality & Temperament, and Couples & Compatibility.
- Active Firebase project `truth-desire` (`963833977494`) configured for optional authentication and cloud persistence alongside local file persistence.

## Product Principles

1. **Consent & Boundaries First:** Never equate willingness with enjoyment, never override a firm boundary with an average score, and never reveal unreciprocated `mutual_only` kinks.
2. **Statistical Honesty:** Distinguish published reference surveys from platform data, enforce `n >= 50` community and `n >= 3` peer thresholds, and never fabricate distributions or percentiles.
3. **Complementary Matching:** Model reciprocal, top/bottom/switch, give/receive, and shared-value dynamics explicitly instead of treating compatibility as identical answers.
4. **Privacy by Architecture:** Keep tokens unguessable and revocable, omit sensitive answers from URLs, require granular consent before sharing with a partner, and support full deletion.
5. **Extensible Data-Driven Engine:** Author assessments, scales, branching, scoring weights, and visualizations from typed definitions so assessments scale cleanly across categories.

## Accessibility & Inclusion

- Target WCAG 2.2 AA contrast ratios across both Noir Pink & Black dark mode and Blush Pink & Carbon light mode, full keyboard navigation, screen-reader-friendly controls, accessible tabular data views for every chart, one-thumb touch targets on mobile, and `prefers-reduced-motion` support.
