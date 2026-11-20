"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Layers, Search, Shield, Users } from "lucide-react";
import { assessmentCategories, builtInAssessments } from "@/data/assessments/catalog";
import type { AssessmentCategorySlug, AssessmentDefinition } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

interface CompletionBadge {
  slug: string;
  resultId: string;
  archetypeName: string;
}

export function ExploreCatalogClient() {
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategorySlug | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState<"all" | "quick" | "deep">("all");
  const [focusFilter, setFocusFilter] = useState<"all" | "couples" | "adults18" | "nonsexual">("all");
  const [assessments, setAssessments] = useState<AssessmentDefinition[]>(builtInAssessments);
  const [completedMap, setCompletedMap] = useState<Record<string, CompletionBadge>>({});

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.assessments?.length) {
          setAssessments(data.assessments);
        }
      })
      .catch(() => {});

    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.submissions)) {
          const map: Record<string, CompletionBadge> = {};
          for (const sub of data.submissions) {
            if (!map[sub.assessmentSlug]) {
              map[sub.assessmentSlug] = {
                slug: sub.assessmentSlug,
                resultId: sub.submissionId,
                archetypeName: sub.result?.profile?.archetypeName || "Completed",
              };
            }
          }
          setCompletedMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assessments.filter((a) => {
      if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
      if (durationFilter === "quick" && a.estimatedMinutesQuick > 5) return false;
      if (durationFilter === "deep" && a.estimatedMinutesComplete < 10) return false;
      if (focusFilter === "couples" && !a.isCouplesFocused && !a.supportsPartnerMatching) {
        return false;
      }
      if (focusFilter === "adults18" && !a.adultsOnly) return false;
      if (focusFilter === "nonsexual" && a.adultsOnly) return false;

      if (q) {
        const hay = [
          a.title,
          a.shortTitle,
          a.audienceNote,
          ...(a.discoverPoints || []),
          ...a.sections.map((s) => s.title),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [assessments, selectedCategory, durationFilter, focusFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl space-y-3">
          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            Explore Assessments ({assessments.length})
          </h1>
          <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
            Private assessments across desire, romance, BDSM, kink, personality, and couples
            compatibility, with instant autosave and optional partner invites.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          View My Discovery Profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Search & Attribute Filters */}
      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            type="search"
            aria-label="Search assessments"
            placeholder="Search by topic, BDSM, kink, attachment, Big Five, bucket list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border bg-[var(--bg-elevated)] py-2.5 pl-11 pr-4 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
            style={{ borderColor: "var(--border-strong)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:col-span-6 lg:justify-end">
          <select
            aria-label="Filter by duration"
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value as typeof durationFilter)}
            className="rounded-full border bg-[var(--bg-elevated)] px-4 py-2 text-xs text-[var(--ink-primary)]"
          >
            <option value="all">Any duration</option>
            <option value="quick">Quick (~5 min or less)</option>
            <option value="deep">In-depth (10+ min complete)</option>
          </select>

          <select
            aria-label="Filter by focus"
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value as typeof focusFilter)}
            className="rounded-full border bg-[var(--bg-elevated)] px-4 py-2 text-xs text-[var(--ink-primary)]"
          >
            <option value="all">All formats</option>
            <option value="couples">Couples games &amp; partner matching</option>
            <option value="nonsexual">Personality, Romance &amp; General</option>
            <option value="adults18">Intimacy &amp; Sexuality (18+)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Assessment categories">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
            selectedCategory === "all"
              ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
              : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          )}
        >
          All Categories ({assessments.length})
        </button>

        {assessmentCategories.map((cat) => {
          const count = assessments.filter((a) => a.category === cat.slug).length;
          return (
            <button
              key={cat.slug}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                selectedCategory === cat.slug
                  ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                  : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              )}
            >
              {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Result Count & Cards */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border bg-[var(--bg-subtle)] p-10 text-center">
          <p className="font-display text-2xl text-[var(--ink-primary)]">
            No assessments matched your current filter
          </p>
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">
            Clear your search terms or switch categories to browse all {assessments.length} modules.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setDurationFilter("all");
              setFocusFilter("all");
            }}
            className="mt-5 rounded-full border bg-[var(--bg-elevated)] px-5 py-2 text-xs font-medium text-[var(--ink-primary)]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((assessment) => {
            const catMeta = assessmentCategories.find((c) => c.slug === assessment.category);
            const completed = completedMap[assessment.slug];
            return (
              <article
                key={assessment.id}
                className="flex flex-col justify-between rounded-3xl border p-6 transition-colors hover:border-[var(--border-strong)]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium text-[var(--ink-primary)]"
                        style={{
                          backgroundColor: "var(--bg-subtle)",
                          borderColor: catMeta?.accentVar ?? "var(--border-hairline)",
                        }}
                      >
                        {catMeta?.title}
                      </span>
                      {assessment.adultsOnly && (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 font-mono-tabular text-[11px] font-semibold text-[var(--accent-rose)]">
                          18+
                        </span>
                      )}
                      {assessment.isCouplesFocused && (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-sage)]">
                          Couples Focus
                        </span>
                      )}
                    </div>

                    {completed && (
                      <Link
                        href={`/results/${completed.resultId}`}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-sage)] hover:underline"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent-sage) 14%, transparent)",
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Link>
                    )}
                  </div>

                  <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                    {assessment.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {assessment.audienceNote}
                  </p>

                  {assessment.discoverPoints && assessment.discoverPoints.length > 0 && (
                    <ul className="space-y-1 pt-1 text-xs text-[var(--ink-muted)]">
                      {assessment.discoverPoints.slice(0, 2).map((pt) => (
                        <li key={pt}>• {pt}</li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-[var(--ink-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />~
                      {assessment.estimatedMinutesQuick} min quick · ~
                      {assessment.estimatedMinutesComplete} min full
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[var(--accent-plum)]" />
                      {assessment.questions.length} items
                    </span>
                    {assessment.supportsPartnerMatching && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                        Partner sync
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[var(--ink-muted)]" />
                      Private
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 border-t pt-5" style={{ borderColor: "var(--border-hairline)" }}>
                  <Link
                    href={`/assess/${assessment.slug}?mode=quick`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Quick Discovery <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/assess/${assessment.slug}?mode=complete`}
                    className="inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    Full ({assessment.questions.length})
                  </Link>
                  {completed && (
                    <Link
                      href={`/results/${completed.resultId}`}
                      className="inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--accent-sage)] hover:bg-[var(--bg-subtle)]"
                    >
                      Result
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
