"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Layers, Shield, Users } from "lucide-react";
import { assessmentCategories, builtInAssessments } from "@/data/assessments/catalog";
import type { AssessmentCategorySlug, AssessmentDefinition } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

export default function AssessmentsLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategorySlug | "all">("all");
  const [assessments, setAssessments] = useState<AssessmentDefinition[]>(builtInAssessments);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.assessments?.length) {
          setAssessments(data.assessments);
        }
      })
      .catch(() => {});
  }, []);

  const filtered =
    selectedCategory === "all"
      ? assessments
      : assessments.filter((a) => a.category === selectedCategory);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
          Assessment Library
        </h1>
        <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
          Browse every quiz across personality, romance, intimacy, and compatibility. Start with
          a quick pass or take the full assessment privately.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Assessment categories">
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

        {assessmentCategories.map((cat) => (
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
            {cat.title}
          </button>
        ))}
      </div>

      {/* Assessment List */}
      <div className="mt-10 space-y-6">
        {filtered.map((assessment) => {
          const isLive = assessment.status === "published" && assessment.questions.length > 0;
          const catMeta = assessmentCategories.find((c) => c.slug === assessment.category);

          return (
            <article
              key={assessment.id}
              className="rounded-3xl border p-6 transition-colors sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: isLive ? "var(--border-strong)" : "var(--border-hairline)",
                boxShadow: isLive ? "var(--shadow-soft)" : undefined,
              }}
            >
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div className="max-w-2xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span
                      className="rounded-full px-3 py-1 font-medium"
                      style={{
                        backgroundColor: isLive
                          ? "color-mix(in srgb, var(--accent-sage) 16%, transparent)"
                          : "var(--bg-subtle)",
                        color: isLive ? "var(--accent-sage)" : "var(--ink-muted)",
                      }}
                    >
                      {isLive ? "Published & Ready" : "Schema Blueprint"}
                    </span>
                    <span className="text-[var(--ink-secondary)]">{catMeta?.title}</span>
                    <span className="font-mono-tabular text-[var(--ink-muted)]">
                      v{assessment.version}
                    </span>
                  </div>

                  <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                    {assessment.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {assessment.audienceNote}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {assessment.futureExtensibilityNote}
                  </p>

                  <div className="flex flex-wrap gap-5 pt-2 text-xs text-[var(--ink-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                      Quick ~{assessment.estimatedMinutesQuick} min · Full ~
                      {assessment.estimatedMinutesComplete} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[var(--accent-plum)]" />
                      {assessment.questions.length} configured items
                    </span>
                    {assessment.supportsPartnerMatching && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                        Partner compatibility enabled
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[var(--ink-muted)]" />
                      {assessment.adultsOnly ? "18+ · Private by default" : "All adults · Private by default"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                  {isLive ? (
                    <>
                      <Link
                        href={`/assess/${assessment.slug}?mode=quick`}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                        style={{
                          backgroundColor: "var(--accent-plum)",
                          color: "var(--accent-plum-contrast)",
                        }}
                      >
                        Start Quick Discovery <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/assess/${assessment.slug}?mode=complete`}
                        className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                        style={{ borderColor: "var(--border-strong)" }}
                      >
                        Full Assessment ({assessment.questions.length} items)
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/studio"
                      className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                      style={{ borderColor: "var(--border-hairline)" }}
                    >
                      Configure in Assessment Studio
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Category Topic Reference */}
      <section className="mt-16 border-t pt-12" style={{ borderColor: "var(--border-hairline)" }}>
        <h2 className="font-display text-3xl text-[var(--ink-primary)]">
          Platform Curriculum Roadmap
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {assessmentCategories.map((cat) => (
            <div
              key={cat.slug}
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <h3 className="font-display text-2xl text-[var(--ink-primary)]">{cat.title}</h3>
              <ul className="mt-3 space-y-1.5 text-xs text-[var(--ink-secondary)]">
                {cat.subtopics.map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
