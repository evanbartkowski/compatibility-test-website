"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, LockKeyhole } from "lucide-react";
import { standardsCard, type AssessmentSummary } from "@/lib/assessment/catalog-summary";
const assessmentCategories = [
  { slug: "romance" },
  { slug: "personality" },
  { slug: "compatibility" },
  { slug: "sexuality-intimacy" },
] as const;
import type { AssessmentCategorySlug } from "@/lib/assessment/types";
import { TestCard } from "./TestCard";

const labels: Record<string, string> = {
  romance: "Romance & connection",
  personality: "Personality",
  compatibility: "Couples",
  "sexuality-intimacy": "Intimacy · 18+",
};
export function ExploreCatalogClient({
  initialAssessments,
}: {
  initialAssessments: AssessmentSummary[];
}) {
  const [category, setCategory] = useState<AssessmentCategorySlug | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState("all");
  const [focus, setFocus] = useState("all");
  const [assessments] = useState<AssessmentSummary[]>(initialAssessments);
  const [completed, setCompleted] = useState<Record<string, string>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { signal: controller.signal })
      .then(async (r) => {
        const ct = r.headers.get("content-type") || "";
        return r.ok && ct.includes("application/json")
          ? r.json().catch(() => null)
          : null;
      })
      .then((d) => {
        const map: Record<string, string> = {};
        for (const sub of d?.submissions || [])
          if (!map[sub.assessmentSlug])
            map[sub.assessmentSlug] = sub.submissionId;
        setCompleted(map);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const filtered = useMemo(
    () =>
      assessments.filter(
        (a) =>
          a.status === "published" &&
          (category === "all" || a.category === category) &&
          (duration !== "quick" || a.estimatedMinutesComplete <= 5) &&
          (duration !== "deep" || a.estimatedMinutesComplete >= 10) &&
          (focus !== "matching" || a.supportsPartnerMatching) &&
          (focus !== "general" || !a.adultsOnly) &&
          (focus !== "mature" || a.adultsOnly) &&
          (focus !== "collection" || a.collection === "intimacy-suite") &&
          [
            a.title,
            a.shortTitle,
            a.audienceNote,
            a.marketingBlurb || "",
            ...(a.discoverPoints || []),
            ...a.sections.map((s) => s.title),
          ]
            .join(" ")
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [assessments, category, duration, focus, search],
  );
  const query = search.trim().toLowerCase();
  const showStandards =
    (category === "all" || category === "romance") &&
    duration !== "deep" &&
    focus !== "matching" &&
    focus !== "general" &&
    focus !== "collection" &&
    "the standards test age height income money body men women population".includes(query);
  const ordered = [...filtered].sort(
    (a, b) =>
      Number(b.slug === "attachment-style-discovery") -
      Number(a.slug === "attachment-style-discovery"),
  );
  const reset = () => {
    setCategory("all");
    setSearch("");
    setDuration("all");
    setFocus("all");
  };
  return (
    <div className="site-shell">
      <div className="page-intro">
        <span className="intro-pill">
          <LockKeyhole size={13} />
          Your curiosity. Your pace.
        </span>
        <h1 className="font-display mt-5">What would you like to discover?</h1>
        <p>
          The BDSM test, the kink test, the personality type test, the gay test, the bias test, and the standards calculator. Threesomes live in the kink test.
        </p>
      </div>
      <div className="library-toolbar">
        <div className="search-field">
          <Search />
          <input
            type="search"
            aria-label="Search assessments"
            placeholder="Search tests: BDSM, kink, love language, IQ, icks, desires…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="library-selects">
          <select
            aria-label="Filter by duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="all">Any duration</option>
            <option value="quick">5 minutes or less</option>
            <option value="deep">10+ minute full tests</option>
          </select>
          <select
            aria-label="Filter by focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          >
            <option value="all">All experiences</option>
            <option value="matching">Partner matching</option>
            <option value="general">General discovery</option>
            <option value="mature">Mature · 18+</option>
            <option value="collection">Intimacy collection · {assessments.filter((a) => a.collection === "intimacy-suite").length} tests</option>
          </select>
        </div>
      </div>
      <div
        className="filter-pills"
        role="group"
        aria-label="Assessment categories"
      >
        <button
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
        >
          All tests <span>{assessments.length}</span>
        </button>
        {[...assessmentCategories]
          .sort(
            (a, b) =>
              Number(a.slug === "sexuality-intimacy") -
              Number(b.slug === "sexuality-intimacy"),
          )
          .map((cat) => (
            <button
              key={cat.slug}
              aria-pressed={category === cat.slug}
              onClick={() => setCategory(cat.slug)}
            >
              {labels[cat.slug]}
              <span>
                {assessments.filter((a) => a.category === cat.slug).length}
              </span>
            </button>
          ))}
      </div>
      <p className="library-count" role="status">
        {ordered.length + (showStandards ? 1 : 0)}{" "}
        {ordered.length + (showStandards ? 1 : 0) === 1 ? "test" : "tests"} to explore{" "}
        <span aria-hidden="true">·</span> Progress saves in this browser
      </p>
      {ordered.length || showStandards ? (
        <div className="test-grid">
          <h2 className="sr-only">Available tests</h2>
          {showStandards && (
            <TestCard assessment={standardsCard} href="/standards" featured />
          )}
          {ordered.map((a) => (
            <TestCard
              key={a.slug}
              assessment={a}
              featured={[
                "bdsm-power-dynamics-test",
                "sexual-interests-curiosity-map",
                "relationship-dealbreakers-boundaries",
                "love-affection-preferences",
              ].includes(a.slug)}
              resultId={completed[a.slug]}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search className="mx-auto text-[var(--ink-muted)] mb-4" />
          <h2 className="font-display">A different kind of discovery?</h2>
          <p>
            No tests match those filters. Try another topic or reset to see the
            full library.
          </p>
          <button
            type="button"
            className="button button-secondary"
            onClick={reset}
          >
            Reset filters
          </button>
        </div>
      )}
      <p className="muted-label mt-8 leading-relaxed">
        Self-discovery tools for adults 18+. These profiles support reflection
        and conversation.{" "}
        <Link href="/settings" className="text-link">
          Your privacy choices
        </Link>
      </p>
    </div>
  );
}
