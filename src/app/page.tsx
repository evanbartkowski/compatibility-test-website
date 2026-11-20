import Link from "next/link";
import { ArrowRight, Compass, Flame, HeartHandshake, Lock, ShieldCheck, Users } from "lucide-react";
import { brandConfig } from "@/config/brand";
import {
  assessmentCategories,
  builtInAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
import {
  CompatibilityMatcherDemo,
  HeroVisualPreview,
} from "@/components/home/HomeInteractivePreview";

export default function HomePage() {
  const featured = builtInAssessments[0];
  const bdsmTest = getAssessmentBySlug("bdsm-power-dynamics-test");
  const kinkMap = getAssessmentBySlug("kink-exploration-map");
  const fantasyMatcher = getAssessmentBySlug("private-fantasy-matcher");

  const spotlightTests = [bdsmTest, kinkMap, fantasyMatcher].filter(
    (a): a is NonNullable<typeof a> => Boolean(a)
  );

  const popularRowSlugs = [
    "attachment-style-discovery",
    "big-five-personality-profile",
    "love-affection-preferences",
    "couples-bucket-list-matcher",
    "relationship-dealbreakers-boundaries",
    "desire-frequency-initiation",
  ];
  const popularTests = popularRowSlugs
    .map((s) => getAssessmentBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="pb-16">
      {/* Asymmetric Editorial Monograph Opening & Specimen Folio */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-18 sm:pb-24 lg:px-8">
        <div className="grid gap-10 border-b pb-12 lg:grid-cols-12 lg:items-end" style={{ borderColor: "var(--border-hairline)" }}>
          <div className="lg:col-span-7">
            <h1 className="font-display text-balance text-5xl leading-[0.98] text-[var(--ink-primary)] sm:text-6xl lg:text-7xl">
              Truth, <span className="italic text-[var(--accent-plum)]">desire</span>, and what
              actually moves you.
            </h1>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
              {brandConfig.name} brings together {builtInAssessments.length} private assessments
              across intimacy, romance, personality, BDSM dynamics, and kink discovery, plus
              zero-leak partner matching with no account required.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href={`/assess/${featured.slug}`}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-transform hover:translate-y-[-1px] active:scale-[0.99]"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                Take the Intimacy Test
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)] hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Explore All {builtInAssessments.length} Tests
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                Optional Firebase sync
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                Adults {brandConfig.minimumAge}+ &middot; Zero external AI
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <HeroVisualPreview />
        </div>
      </section>

      {/* Flagship Intimacy + BDSM & Kink Editorial Spotlight */}
      <section
        className="border-y py-16 sm:py-24"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Monograph Column: 56-Item Flagship + Section Index */}
            <div className="space-y-6 lg:col-span-5">
              <h2 className="font-display text-4xl text-[var(--ink-primary)] sm:text-5xl">
                Intimacy, BDSM Roles &amp; Unfiltered Desire
              </h2>
              <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                Inspired by the 608-woman <span className="italic">Marketplace of Sex Acts</span>{" "}
                framework, our 56-item flagship separates what turns you on, how often it happens,
                and what remains off limits.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/assess/${featured.slug}?mode=quick`}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  Quick Intimacy (14 items)
                </Link>
                <Link
                  href={`/assess/${featured.slug}?mode=complete`}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)]"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  Full Assessment (56)
                </Link>
              </div>

              <div
                className="border-t pt-5"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                <p className="mb-3 text-xs font-semibold text-[var(--ink-primary)]">
                  Six lenses covered inside the flagship profile
                </p>
                <ul className="divide-y text-xs" style={{ borderColor: "var(--border-hairline)" }}>
                  {featured.sections.map((section) => (
                    <li key={section.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="font-medium text-[var(--ink-primary)]">{section.title}</span>
                      <span className="text-right text-[var(--ink-muted)]">{section.subtitle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Asymmetric Editorial Spotlight Ledger */}
            <div className="divide-y rounded-3xl border bg-[var(--bg-elevated)] lg:col-span-7" style={{ borderColor: "var(--border-strong)" }}>
              {spotlightTests.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-7"
                >
                  <div className="max-w-lg space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-[var(--accent-plum)]">
                        <Flame className="h-3.5 w-3.5" />
                        {item.adultsOnly ? "18+ Romantic & Spicy" : "Discovery"}
                      </span>
                      <span className="text-[var(--ink-muted)]">&middot;</span>
                      <span className="font-mono-tabular text-[var(--ink-muted)]">
                        {item.questions.length} items &middot; ~{item.estimatedMinutesQuick} min quick
                      </span>
                    </div>
                    <h3 className="font-display text-3xl text-[var(--ink-primary)]">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
                      {item.audienceNote}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                    <Link
                      href={`/assess/${item.slug}?mode=quick`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--accent-plum)",
                        color: "var(--accent-plum-contrast)",
                      }}
                    >
                      Quick Start <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/assess/${item.slug}?mode=complete`}
                      className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      Full ({item.questions.length})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Personality, Romance & Couples Directory Strip */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end" style={{ borderColor: "var(--border-hairline)" }}>
          <div>
            <h2 className="font-display text-4xl text-[var(--ink-primary)]">
              Attachment, Personality &amp; Couples Play
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">
              Pair attachment maps, Big Five traits, and interactive couples bucket lists to see
              how emotional habits shape physical chemistry.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-plum)] hover:underline"
          >
            Browse all {builtInAssessments.length} assessments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-hairline)" }}>
          {popularTests.map((item) => {
            const cat = assessmentCategories.find((c) => c.slug === item.category);
            return (
              <Link
                key={item.slug}
                href={`/assess/${item.slug}`}
                className="group grid gap-3 py-5 transition-colors hover:bg-[var(--bg-subtle)]/50 sm:grid-cols-12 sm:items-center sm:px-3"
              >
                <div className="sm:col-span-3">
                  <span className="text-xs font-medium text-[var(--accent-gold)]">
                    {cat?.title}
                  </span>
                  <span className="ml-2 font-mono-tabular text-xs text-[var(--ink-muted)]">
                    ~{item.estimatedMinutesQuick} min
                  </span>
                </div>
                <div className="sm:col-span-4">
                  <h3 className="font-display text-2xl text-[var(--ink-primary)] group-hover:text-[var(--accent-plum)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[var(--ink-secondary)] sm:col-span-4">
                  {item.audienceNote}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-plum)] sm:col-span-1 sm:justify-end">
                  Start <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Interactive Couples Compatibility Matcher */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <CompatibilityMatcherDemo />
      </section>

      {/* Four Categories Horizontal Ledger */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end" style={{ borderColor: "var(--border-hairline)" }}>
          <div>
            <h2 className="font-display text-4xl text-[var(--ink-primary)]">
              Four dimensions of relationship discovery
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">
              Deterministic scoring across scales, sliders, priority rankings, forced choices, and
              complementary partner matching.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-plum)] hover:underline"
          >
            View full directory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-hairline)" }}>
          {assessmentCategories.map((cat) => {
            const catTests = builtInAssessments.filter(
              (a) => a.category === cat.slug && a.status === "published"
            );
            const firstTest = catTests[0];
            return (
              <div
                key={cat.slug}
                className="grid gap-4 py-7 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                      {cat.title}
                    </h3>
                    <span
                      className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--accent-plum) 15%, transparent)",
                        color: "var(--accent-plum)",
                      }}
                    >
                      {catTests.length} live
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {cat.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:col-span-6">
                  {cat.subtopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border px-3 py-1 text-xs text-[var(--ink-secondary)]"
                      style={{ borderColor: "var(--border-hairline)" }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex lg:col-span-2 lg:justify-end">
                  {firstTest && (
                    <Link
                      href={`/assess/${firstTest.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-plum)] hover:underline"
                    >
                      Begin <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Honest Methodology & Editorial Synthesis Band */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
          className="grid gap-10 border-t pt-12 lg:grid-cols-12"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="space-y-8 lg:col-span-7">
            <div className="flex items-start gap-4">
              <Compass className="mt-1 h-5 w-5 shrink-0 text-[var(--accent-plum)]" />
              <div>
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  Honest statistical comparisons (n &ge; {brandConfig.communityMinimumThreshold})
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Community averages stay locked behind at least{" "}
                  {brandConfig.communityMinimumThreshold} opted-in respondents per cohort, so you
                  never see invented sample data disguised as consensus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="mt-1 h-5 w-5 shrink-0 text-[var(--accent-gold)]" />
              <div>
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  Zero-leak partner invitations &amp; optional sync
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Take every test anonymously as a guest and share an expiring token via the{" "}
                  <Link href="/couples" className="underline text-[var(--ink-primary)]">
                    Couples Hub
                  </Link>
                  , or optionally sign in with email or Google to carry your results across devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[var(--accent-sage)]" />
              <div>
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  Willingness, enthusiasm &amp; boundary precedence
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Enthusiastic desire is scored differently from caring willingness, and firm
                  boundaries always remain visible and non-negotiable across every partner report.
                </p>
              </div>
            </div>
          </div>

          <aside
            className="flex flex-col justify-between rounded-3xl border p-7 sm:p-9 lg:col-span-5"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-strong)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div>
              <HeartHandshake className="h-6 w-6 text-[var(--accent-plum)]" />
              <h3 className="mt-4 font-display text-3xl text-[var(--ink-primary)]">
                Ready for your private map?
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Start with 14 quick intimacy questions, map your BDSM &amp; kink curiosity privately,
                or send a zero-leak partner invite with automatic local saving.
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-2.5">
              <Link
                href={`/assess/${featured.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Begin Intimacy Assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/assess/bdsm-power-dynamics-test"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)]"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Explore BDSM Power Dynamics &amp; Kink Map
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
