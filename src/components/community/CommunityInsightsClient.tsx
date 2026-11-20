"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Info, Lock, ShieldCheck } from "lucide-react";
import { builtInAssessments } from "@/data/assessments/catalog";

interface ReadinessRow {
  slug: string;
  title: string;
  category: string;
  realOptedInCount: number;
  minimumThreshold: number;
  unlocked: boolean;
}

interface QuestionAgg {
  questionId: string;
  prompt: string;
  sectionTitle: string;
  aggregate?: {
    respondentCount: number;
    meanEnjoyment: number | null;
    stdDevEnjoyment: number | null;
    available: boolean;
  };
}

interface CommunityPayload {
  assessmentSlug: string;
  eligibleCohortParticipants: number;
  suppressedByPrivacyThreshold: boolean;
  minimumThreshold: number;
  realOptedInCount: number;
  isSyntheticDemo: boolean;
  questions: QuestionAgg[];
  readiness: ReadinessRow[];
}

export function CommunityInsightsClient({
  initialData,
}: {
  initialData: CommunityPayload;
}) {
  const [slug, setSlug] = useState(initialData.assessmentSlug);
  const [demoPreview, setDemoPreview] = useState(false);
  const [ageGroup, setAgeGroup] = useState("all");
  const [relationshipStatus, setRelationshipStatus] = useState("all");
  const [datingPreference, setDatingPreference] = useState("all");
  const [payload, setPayload] = useState<CommunityPayload>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({
      slug,
      demo: demoPreview ? "true" : "false",
      ageGroup,
      relationshipStatus,
      datingPreference,
    });
    fetch(`/api/community?${params.toString()}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.questions) setPayload(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug, demoPreview, ageGroup, relationshipStatus, datingPreference]);

  const unlockedAssessments = payload.readiness.filter((r) => r.unlocked).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
          Anonymous Community Insights
        </h1>
        <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
          Aggregated patterns strictly from opted-in participants. Stats stay locked until at least{" "}
          <strong className="font-mono-tabular text-[var(--ink-primary)]">
            n &ge; {payload.minimumThreshold}
          </strong>{" "}
          eligible responses exist in a cohort.
        </p>
      </div>

      {/* Controls & Threshold Overview */}
      <section
        className="mt-8 rounded-3xl border p-6 sm:p-8"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <div className="flex flex-col justify-between gap-4 border-b pb-6 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-6 text-xs">
            <div>
              <span className="block text-[var(--ink-muted)]">Real Opted-In Responses (Selected Test)</span>
              <span className="font-mono-tabular text-2xl font-bold text-[var(--ink-primary)]">
                {payload.realOptedInCount} / {payload.minimumThreshold}
              </span>
            </div>
            <div>
              <span className="block text-[var(--ink-muted)]">
                Cohorts Unlocked Across {payload.readiness.length || builtInAssessments.length} Tests
              </span>
              <span className="font-mono-tabular text-2xl font-bold text-[var(--accent-plum)]">
                {unlockedAssessments} / {payload.readiness.length}
              </span>
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--accent-gold)]">
            <input
              type="checkbox"
              checked={demoPreview}
              onChange={(e) => setDemoPreview(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-gold)]"
            />
            Preview charts with Synthetic Demo Sample (n=84)
          </label>
        </div>

        {demoPreview && (
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent-gold) 14%, transparent)",
              borderColor: "var(--accent-gold)",
            }}
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
            <p className="text-[var(--ink-primary)]">
              <strong>SYNTHETIC DEMO DATA ACTIVE:</strong> Currently viewing an explicitly synthetic
              sample (n=84) to inspect cohort analytics layout. Actual live opted-in participant
              count for this assessment is{" "}
              <strong className="font-mono-tabular">{payload.realOptedInCount}</strong>.
            </p>
          </div>
        )}

        {/* Assessment + Demographic Filters */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs">
            <span className="text-[var(--ink-muted)]">Assessment</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
            >
              {builtInAssessments.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs">
            <span className="text-[var(--ink-muted)]">Age Group Cohort</span>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
            >
              <option value="all">All ages</option>
              <option value="18-24">18 to 24</option>
              <option value="25-34">25 to 34</option>
              <option value="35-44">35 to 44</option>
              <option value="45+">45+</option>
            </select>
          </label>

          <label className="block text-xs">
            <span className="text-[var(--ink-muted)]">Relationship Status</span>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
            >
              <option value="all">All statuses</option>
              <option value="single">Single</option>
              <option value="dating">Dating</option>
              <option value="partnered">Partnered</option>
              <option value="married">Married</option>
            </select>
          </label>

          <label className="block text-xs">
            <span className="text-[var(--ink-muted)]">Dating Focus</span>
            <select
              value={datingPreference}
              onChange={(e) => setDatingPreference(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
            >
              <option value="all">All preferences</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="all_genders">All genders</option>
            </select>
          </label>
        </div>

        {/* Questions Output */}
        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-[var(--ink-muted)]">Updating cohort aggregates...</p>
          ) : payload.suppressedByPrivacyThreshold ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <Lock className="mx-auto h-7 w-7 text-[var(--accent-plum)]" />
              <h2 className="mt-3 font-display text-2xl text-[var(--ink-primary)]">
                Not enough community responses yet
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--ink-secondary)]">
                This cohort filter currently contains{" "}
                <strong className="font-mono-tabular">
                  {payload.eligibleCohortParticipants}
                </strong>{" "}
                opted-in participant{payload.eligibleCohortParticipants === 1 ? "" : "s"}. Averages
                stay hidden until at least{" "}
                <span className="font-mono-tabular">{payload.minimumThreshold}</span> opted-in
                adults complete this assessment.
              </p>
              <Link
                href={`/assess/${slug}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Take This Assessment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {payload.questions
                .filter((q) => q.aggregate?.available && q.aggregate.meanEnjoyment !== null)
                .slice(0, 16)
                .map((q) => {
                  const mean = q.aggregate!.meanEnjoyment!;
                  const widthPct = Math.round(((mean - 1) / 4) * 100);
                  return (
                    <div
                      key={q.questionId}
                      className="rounded-2xl border bg-[var(--bg-canvas)] p-4 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-[var(--ink-primary)]">{q.prompt}</p>
                        <span className="shrink-0 font-mono-tabular font-semibold text-[var(--accent-plum)]">
                          {mean.toFixed(2)} / 5
                        </span>
                      </div>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: "var(--accent-plum)",
                          }}
                        />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-[var(--ink-muted)]">
                        <span>{q.sectionTitle}</span>
                        <span className="font-mono-tabular">
                          SD {q.aggregate?.stdDevEnjoyment?.toFixed(2) ?? "--"} · n=
                          {q.aggregate?.respondentCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* Assessment Readiness Ledger */}
      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="inline-flex items-center gap-2 font-display text-3xl text-[var(--ink-primary)]">
              <BarChart3 className="h-5 w-5 text-[var(--accent-sage)]" />
              Platform Cohort Readiness Across All {payload.readiness.length || builtInAssessments.length} Tests
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Transparent count of consented participants per assessment against the{" "}
              {payload.minimumThreshold}-respondent privacy floor.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-sage)]">
            <ShieldCheck className="h-4 w-4" /> Zero synthetic inflation
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {payload.readiness.map((row) => (
            <button
              key={row.slug}
              type="button"
              onClick={() => setSlug(row.slug)}
              className="rounded-2xl border p-4 text-left transition-colors hover:border-[var(--accent-plum)]"
              style={{
                backgroundColor:
                  row.slug === slug ? "var(--bg-subtle)" : "var(--bg-elevated)",
                borderColor:
                  row.slug === slug ? "var(--accent-plum)" : "var(--border-hairline)",
              }}
            >
              <span className="block text-[11px] text-[var(--ink-muted)]">{row.category}</span>
              <span className="mt-0.5 block font-medium text-xs text-[var(--ink-primary)]">
                {row.title}
              </span>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-mono-tabular text-[var(--ink-secondary)]">
                  n={row.realOptedInCount}/{row.minimumThreshold}
                </span>
                <span
                  style={{
                    color: row.unlocked ? "var(--accent-sage)" : "var(--ink-muted)",
                  }}
                >
                  {row.unlocked ? "Unlocked" : "Collecting"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
