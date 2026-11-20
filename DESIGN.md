---
name: "Truth Desire"
description: "Nocturnal silk-and-rose-ink editorial monograph and quantitative compatibility platform for personality, romance, intimacy, BDSM dynamics, and kink discovery."
colors:
  obsidian-noir: "#08060a"
  velvet-surface: "#110c13"
  plum-veil: "#19121b"
  royal-plum-inset: "#271c2b"
  electric-rose-pink: "#ff5c9e"
  rose-petal-contrast: "#090509"
  mauve-silk: "#e882af"
  boundary-coral-pink: "#ff789b"
  champagne-gold: "#e5bc87"
  sage-alignment: "#8cd3ae"
  blush-ivory-ink: "#fdf2f7"
  dusty-mauve-ink: "#dfc2d1"
  plum-slate-muted: "#ae8e9e"
  hairline-plum: "#2f202d"
  strong-rose-rule: "#5e3b55"
  blush-canvas-light: "#fff3f7"
  crisp-sheet-light: "#ffffff"
  blush-band-light: "#fde4ee"
  carbon-ink-light: "#110a0e"
  crimson-rose-light: "#c2185b"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0em"
rounded:
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.875rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.electric-rose-pink}"
    textColor: "{colors.rose-petal-contrast}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.mauve-silk}"
  button-secondary:
    backgroundColor: "{colors.obsidian-noir}"
    textColor: "{colors.blush-ivory-ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  card-elevated:
    backgroundColor: "{colors.velvet-surface}"
    textColor: "{colors.blush-ivory-ink}"
    rounded: "{rounded.xl}"
    padding: "24px 32px"
  input-field:
    backgroundColor: "{colors.obsidian-noir}"
    textColor: "{colors.blush-ivory-ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: Truth Desire

## Overview

**Creative North Star: "Nocturnal Silk & Rose-Ink Monograph"**

Truth Desire merges the intimate candor of a midnight print journal with clinical-grade analytical charts for adult self-discovery, desire gaps, BDSM dynamics, and kink compatibility. Instead of treating personal intimacy like a flashy arcade quiz or a cold spreadsheet, the interface rests on velvety obsidian black surfaces punctuated by sharp hot-rose pink accents, blush-ivory typography, warm champagne partner highlights, and generous architectural whitespace.

The system defaults to its **Noir Pink & Black** theme (`data-theme="dark"`), paired symmetrically with a crisp **Blush Pink & Carbon** light mode toggle for daylight reading. Surfaces separate primarily through deliberate value steps and hairline plum borders rather than blurry glassmorphism or neon halos. Every component preserves high readability, adult dignity, and calm precision across desktop and mobile viewports.

**Key Characteristics:**
- Predominantly pink-and-black palette anchored by `#08060a` Obsidian Noir and `#ff5c9e` Electric Rose Pink, with near-black `#090509` text on filled pink CTAs for unmistakable contrast.
- Editorial display serif (`Bodoni Moda` with expressive italics) set tightly against readable sans-serif copy (`Figtree`) and tabular monospace coordinates (`JetBrains Mono`).
- Quantitative honesty rendered directly through interactive custom SVG charts (`PreferenceRadarChart`, desire-experience quadrant maps, compatibility dials) with keyboard accessibility and data tables.
- Strict rejection of loud rainbow gradients, flickering neon box-shadows, repetitive centered badge clusters, or explicit pornography tropes.

## Colors

A romantic, midnight-first palette pairing near-black plum-tinted obsidian grounds with electric rose pink, warm champagne partner overlays, and soft ivory-blush inks—inverted cleanly into bright blush paper and crimson rose in light mode.

### Primary
- **Electric Rose Pink** (`--accent-plum`): Primary interactive actions, active specimen tabs, hero italic emphasis, primary radar polygon fill/stroke, and BDSM Top/Primary highlights. Paired strictly with near-black contrast text (`--accent-plum-contrast`) on dark themes and crisp white on crimson rose in light mode so filled buttons clear WCAG 2.2 AA comfortably.
- **Mauve Silk** (`--accent-mauve`): Secondary chart contours, subtle emphasis states, and hover nuance alongside primary rose accents.

### Secondary
- **Champagne Gold** (`--accent-gold`): Partner B overlay series in compatibility charts, intertwined header emblem accent stroke, focus ring outline, and zone indicators. Pairs with `#090509` ink when used as a solid fill on dark backgrounds.

### Tertiary
- **Boundary Coral Pink** (`--accent-rose`): Firm boundary alerts, safety-precedence warnings, and low-desire / slow-down markers.
- **Sage Alignment** (`--accent-sage`): Mutual kink reveal confirmations, verified consent statuses, and `n >= 50` community privacy indicators.

### Neutral
- **Obsidian Noir** (`--bg-canvas`): Main viewport canvas in dark mode (paired with **Blush Canvas** in light mode).
- **Velvet Surface** (`--bg-elevated`): Primary elevated cards, specimen stage panels, interactive dialogs, and spotlight tables.
- **Plum Veil** (`--bg-subtle`): Tonal alternating section bands, left specimen navigation rails, and pill switch tracks.
- **Royal Plum Inset** (`--bg-inset`): Progress tracks, recessed sliders, and chart backing rings.
- **Blush Ivory Ink** (`--ink-primary`): High-contrast primary headings and interactive labels on dark grounds (paired with **Carbon Ink** in light mode).
- **Dusty Mauve Ink** (`--ink-secondary`): 65ch body paragraphs and card descriptions.
- **Plum Slate Muted** (`--ink-muted`): Coordinates, item counts, durations, and methodology footnotes.
- **Hairline Plum & Strong Rose Rules** (`--border-hairline`, `--border-strong`): Structural 1px dividers separating monograph bands, directory rows, and interactive frames.

### Named Rules
**The Noir Pink Contrast Rule.** Solid `--accent-plum` surfaces (`#ff5c9e`) in dark mode always carry near-black ink (`--accent-plum-contrast`: `#090509`), never pure white—ensuring instant legibility and crisp dark-mode contrast without darkening the vibrancy of the pink.

**The Scarcity of Spark Rule.** Electric rose pink stays confined to primary actions, single-word italic display highlights, and active data paths (~<=12% of viewport area) so the black obsidian canvas retains nocturnal tension and intimacy.

## Typography

**Display Font:** `Bodoni Moda` (with `Georgia, serif` fallback; weights 400, 500, 600 in normal and italic)
**Body Font:** `Figtree` (with `system-ui, -apple-system, sans-serif` fallback)
**Label/Mono Font:** `JetBrains Mono` (with `ui-monospace, monospace` fallback; tabular figures enabled)

**Character:** Dramatic high-contrast didone serif headlines (`Bodoni Moda` italics for words like *desire*) disciplined by a friendly geometric grotesk sans (`Figtree`) and clinical tabular numerals for psychometric scores and coverage fractions.

### Hierarchy
- **Display** (`500`, `clamp(3rem, 5vw, 4.5rem)`, line-height `0.98`, tracking `-0.02em`): Hero monograph statements paired with single-word italic accent spans.
- **Headline** (`500`, `1.875rem–3rem`, line-height `1.12`, tracking `-0.02em`): Major section headers across the catalog, couples hub, and results workspace.
- **Title** (`500`, `1.25rem–1.875rem`, line-height `1.25`): Spotlight assessment titles, modal titles, and archetype reveals.
- **Body** (`400`, `0.875rem–1rem`, line-height `1.65`): Primary prose, assessment stems, and interpretative coaching capped near 65ch for comfortable reading.
- **Label & Mono Metrics** (`500–600`, `0.6875rem–0.8125rem`, tabular numerals): Item counts (`56 items`), durations (`~4 min`), scores (`94/100`), and engine versions.

### Named Rules
**The Typographic Discipline Rule.** Display headings rely purely on solid foreground and italic rose ink (`--ink-primary` + `--accent-plum`), never CSS linear-gradient text clipping or decorative uppercase tracked kickers.

## Layout

Pages center inside a breathable container (`max-width: 72rem` / `1152px`) with responsive horizontal padding (`16px` mobile, `24px` tablet, `32px` desktop) and a sticky `64px` translucent header (`backdrop-filter: blur(12px)` over `88%` canvas tint).

- **Asymmetric 12-Column Grid:** Editorial landing sections split along `7 / 5` or `4 / 8` column proportions, stacking cleanly into single-column flows on `< 768px` mobile viewports with zero horizontal scroll (`scrollWidth <= innerWidth`).
- **Tonal Alternation & Ledger Dividers:** Content sections alternate cleanly between canvas ground (`--bg-canvas`) and tonal veil (`--bg-subtle`) bounded by `1px` top/bottom hairline rules (`--border-hairline`), avoiding repetitive uniform card grids by using crisp horizontal ledger rows (`divide-y`) for test directories.
- **Mobile Thumb Comfort:** Primary quiz controls and header menus keep hit targets at `>= 40px` height (`40px` square icon toggles, `44px+` full-width pill action buttons).

## Elevation & Depth

Surface hierarchy relies primarily on four deliberate tonal background layers (`--bg-canvas` < `--bg-subtle` < `--bg-elevated` < `--bg-inset`) and crisp `1px` structural borders, reserving multi-stop diffused ambient shadows strictly for major focal containers and floating dialogs.

### Shadow Vocabulary
- **Soft Atmospheric Lift** (`--shadow-soft`): Used on primary action pills and secondary standalone summary plates to separate them subtly from surrounding velvet copy (`0 16px 40px -14px rgba(0,0,0,0.72), 0 2px 10px -2px rgba(255,92,158,0.08)` in dark mode).
- **Lifted Focal Folio** (`--shadow-lifted`): Reserved strictly for the hero Interactive Report Folio and foreground Radix modals (`0 26px 58px -16px rgba(0,0,0,0.85), 0 6px 18px -4px rgba(255,92,158,0.14)` in dark mode).

### Named Rules
**The Quiet-Frame Rule.** Never apply vivid pink outer box-shadow glows (`0 0 20px #ff5c9e`) around idle cards or buttons; pink stays strictly inside razor-sharp `1px` focus/active strokes and low-opacity (`<= 14%`) shadow depth.

## Shapes

Truth Desire balances sharp architectural hairlines (`1px` straight horizontal rules) against welcoming, supple geometry (`9999px` pill actions, `24px` folio shells, `12px–16px` internal inputs and nested data tiles).

- **Pill Buttons & Filter Chips (`9999px` radius):** Primary/secondary CTAs, archetype switchers, category tags, and sign-in modal controls feel soft and inviting to touch.
- **Editorial Folios & Modal Dialogs (`24px` radius):** Large interactive frames wrap `1px` `--border-strong` boundaries cleanly without hard industrial corners.
- **Analytical Sub-Cards & Form Fields (`12px–16px` radius):** Nested stat boxes, Likert controls, and text inputs (`12px` radius) establish clean inner hierarchy inside `24px` outer containers.

## Components

Tactile, restrained, and immediately legible—every control conveys direct physical responsiveness without excessive ornamentation.

### Buttons
- **Shape:** Full pill silhouette (`9999px` radius).
- **Primary:** Solid Electric Rose Pink fill with near-black contrast label (`14px` text, `font-weight: 500`, padding `14px 24px`). Subtle `-1px` vertical translate on hover and `0.98` scale press feedback.
- **Secondary / Ghost:** Transparent or subtle obsidian fill with `1px` `--border-strong` perimeter and `--ink-primary` label; shifts smoothly toward `--bg-subtle` background and rose perimeter on hover.
- **Icon Circular (`40px x 40px`):** Theme toggle and mobile hamburger triggers inside the `64px` sticky header.

### Chips
- **Style:** Pill badges (`9999px`) inside `border: 1px solid var(--border-hairline)` for metadata subtopics, or tinted `15%` rose-pink pills (`--accent-plum` text) for active category counters (`11 live`).
- **State:** Active segmented filter pills switch cleanly between transparent idle labels and solid `--accent-plum` fills with `--accent-plum-contrast` ink.

### Cards / Containers
- **Corner Style:** Rounded-3xl (`24px`) for focal plates; flat horizontal divide-y rows (`0px` outer corners) for browsable directories.
- **Background:** Elevated velvet (`--bg-elevated`) on dark ground or crisp sheet (`#ffffff`) on blush paper.
- **Border:** `1px solid var(--border-strong)` on focal folios, `1px solid var(--border-hairline)` on ledger rows and nested tiles.
- **Internal Padding:** `24px–32px` on desktop stages, `16px` on compact nested tiles.

### Inputs / Fields
- **Style:** `12px` radius, `1px solid var(--border-strong)`, recessed `--bg-canvas` background inside elevated forms, generous `10px 14px` padding (`40px` left offset when prefixed by a 16px Lucide icon).
- **Focus:** Universal accessible `2px solid var(--accent-gold)` ring offset by `2px` (`:focus-visible`).
- **Error / Status:** `10%` tinted alert panels framed by solid `--accent-rose` (errors/boundaries) or `--accent-sage` (reset sent / mutual match).

### Navigation
- Sticky `64px` translucent header linking brand intertwined double-ring SVG emblem + `Bodoni Moda` wordmark on the left, 5 primary links in center, and compact utility pills (`Privacy`, optional `Sign In` / user handle + Sign Out, theme toggle, primary `Start Discovery` CTA, and mobile drawer menu `< 768px`) on the right. Active routes show rose-pink ink accented by a `1px` champagne-gold underline offset by `4px`.

### Interactive Report Folio (Signature Component)
- A `4 / 8` asymmetric specimen stage contrasting a tactile `#19121b` (`--bg-subtle`) left selector rail against an interactive `#110c13` (`--bg-elevated`) analytical workbench.
- Switches seamlessly between the 7-axis SVG `PreferenceRadarChart` (with synthetic archetype toggles), clickable *Desire vs. Experience* quadrant points inspecting high-desire/low-frequency gaps, and a *BDSM & Kink Mutual Reveal* live privacy-rule tester (`Mutual Only` / `Share Openly` / `Keep Private`).

## Do's and Don'ts

### Do:
- **Do** enforce `data-theme="dark"` (**Noir Pink & Black**) as the default experience paired symmetrically with Blush Pink light mode tokens.
- **Do** keep dark-mode filled rose buttons paired strictly with near-black contrast text (`#090509` on `#ff5c9e`).
- **Do** preserve keyboard navigation, `2px` focus rings (`--accent-gold`), and `@media (prefers-reduced-motion: reduce)` fallbacks across every custom chart and quiz screen.
- **Do** display transparent sample thresholds (`n >= 50` community floor) and zero-exposure protection states prominently.

### Don't:
- **Don't** place bright pink outer neon box-shadows, animated sparkles, or gradient text masks on headings or buttons.
- **Don't** require login anywhere in the discovery, testing, compatibility invitation, or PDF export flow—authentication stays strictly optional.
- **Don't** expose internal redaction tokens (`[OBSCURED]`) or fabricated community averages inside user-facing copy.
- **Don't** add small all-caps eyebrow tags above headlines or decorative oversized step numerals next to clean section titles.
