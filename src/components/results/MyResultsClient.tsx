"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileJson,
  FileSpreadsheet,
  GitCompare,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { PreferenceHistoryChart } from "@/components/charts/PreferenceHistoryChart";
import { builtInAssessments } from "@/data/assessments/catalog";
import type { AssessmentDraft, ScoredAssessmentResult } from "@/lib/assessment/types";
import { formatShortDate } from "@/lib/utils";

interface SubmissionSummary {
  submissionId: string;
  assessmentSlug: string;
  assessmentVersion: string;
  mode: string;
  perspective: string;
  optInCommunityStats: boolean;
  createdAt: string;
  result: ScoredAssessmentResult;
}

export function MyResultsClient({ initialSubmissions }: { initialSubmissions: SubmissionSummary[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [drafts, setDrafts] = useState<AssessmentDraft[]>([]);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compareNewest, setCompareNewest] = useState("");
  const [compareOlder, setCompareOlder] = useState("");

  useEffect(() => {
    const foundDrafts: AssessmentDraft[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("between_us_draft_")) {
          const parsed = JSON.parse(window.localStorage.getItem(k) || "{}") as AssessmentDraft;
          if (parsed && Object.keys(parsed.answers || {}).length > 0) {
            foundDrafts.push(parsed);
          }
        }
      }
    } catch {
      // ignore storage issues
    }
    setDrafts(foundDrafts);
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions || []);
    }
  };

  const handleDeleteSingle = async (submissionId: string) => {
    setDeletingId(submissionId);
    try {
      const res = await fetch(`/api/results/${encodeURIComponent(submissionId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.submissionId !== submissionId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    await fetch("/api/dashboard", { method: "DELETE" });
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("between_us_")) keys.push(k);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
    setDrafts([]);
    refresh();
  };

  // Find repeated assessment slugs eligible for comparing attempts over time
  const repeatedSlugs = useMemo(() => {
    const counts = new Map<string, SubmissionSummary[]>();
    for (const s of submissions) {
      const arr = counts.get(s.assessmentSlug) || [];
      arr.push(s);
      counts.set(s.assessmentSlug, arr);
    }
    return Array.from(counts.entries()).filter(([, list]) => list.length >= 2);
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      [s.assessmentSlug, s.result.assessmentTitle, s.result.profile.archetypeName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [submissions, search]);

  const primaryHistory = submissions
    .filter((s) => s.perspective === "primary")
    .map((s) => s.result);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            My Saved Results ({submissions.length})
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">
            Download PDF, CSV, or JSON reports, compare past attempts, resume saved drafts, or
            delete results anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAll}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: "var(--accent-rose)" }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete All Stored Data
        </button>
      </div>

      {/* Unfinished Drafts */}
      {drafts.length > 0 && (
        <section
          className="mt-8 rounded-3xl border p-6"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--accent-gold)",
          }}
        >
          <h2 className="font-display text-2xl text-[var(--ink-primary)]">
            Paused Drafts Ready to Resume
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {drafts.map((d) => (
              <div
                key={d.draftId}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-[var(--bg-elevated)] p-4 text-xs"
              >
                <div>
                  <p className="font-semibold text-[var(--ink-primary)]">
                    {d.assessmentSlug.replace(/-/g, " ")} ({d.mode})
                  </p>
                  <p className="text-[var(--ink-secondary)]">
                    {Object.keys(d.answers).length} saved · {formatShortDate(d.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/assess/${d.assessmentSlug}?mode=${d.mode}`}
                  className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 font-medium"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Resume
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Compare Two Attempts Tool */}
      {repeatedSlugs.length > 0 && (
        <section
          className="mt-8 rounded-3xl border p-6"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-[var(--accent-plum)]" />
            <h2 className="font-display text-2xl text-[var(--ink-primary)]">
              Compare Two Attempts Over Time
            </h2>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <select
              aria-label="Select newer attempt"
              value={compareNewest}
              onChange={(e) => setCompareNewest(e.target.value)}
              className="rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-[var(--ink-primary)]"
            >
              <option value="">Choose newer result...</option>
              {repeatedSlugs.flatMap(([, list]) =>
                list.map((s) => (
                  <option key={`n-${s.submissionId}`} value={s.submissionId}>
                    {s.result.assessmentTitle ?? s.assessmentSlug} · {formatShortDate(s.createdAt)} ({s.result.profile.archetypeName})
                  </option>
                ))
              )}
            </select>
            <span className="text-[var(--ink-muted)]">vs.</span>
            <select
              aria-label="Select older attempt"
              value={compareOlder}
              onChange={(e) => setCompareOlder(e.target.value)}
              className="rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-[var(--ink-primary)]"
            >
              <option value="">Choose older result...</option>
              {repeatedSlugs.flatMap(([, list]) =>
                list.map((s) => (
                  <option key={`o-${s.submissionId}`} value={s.submissionId}>
                    {s.result.assessmentTitle ?? s.assessmentSlug} · {formatShortDate(s.createdAt)} ({s.result.profile.archetypeName})
                  </option>
                ))
              )}
            </select>
            {compareNewest && compareOlder && compareNewest !== compareOlder && (
              <Link
                href={`/results/${compareNewest}?compare=${encodeURIComponent(compareOlder)}`}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-medium"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Compare Selected <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Search & Results List */}
      <section className="mt-10 space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Completed Assessments
          </h2>
          {submissions.length > 0 && (
            <input
              type="search"
              placeholder="Filter results by assessment or archetype..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-full border bg-[var(--bg-elevated)] px-4 py-2 text-xs text-[var(--ink-primary)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border bg-[var(--bg-subtle)] p-10 text-center">
            <p className="font-display text-2xl text-[var(--ink-primary)]">
              No saved results yet
            </p>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Complete any assessment across all {builtInAssessments.length} modules to generate
              private visual insights and downloadable reports.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              Explore Assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((sub) => (
              <div
                key={sub.submissionId}
                className="flex flex-col justify-between gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <span className="font-medium text-[var(--ink-primary)]">
                      {sub.result.assessmentTitle ?? sub.assessmentSlug}
                    </span>
                    <span>·</span>
                    <span>{formatShortDate(sub.createdAt)}</span>
                    <span>·</span>
                    <span>{sub.mode}</span>
                    <span>·</span>
                    <span className="font-mono-tabular">{sub.result.coveragePercent}% coverage</span>
                  </div>
                  <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                    {sub.result.profile.archetypeName}
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)]">
                    Community stats: {sub.optInCommunityStats ? "Opted in" : "Private (excluded)"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/results/${sub.submissionId}/export?format=pdf`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </a>
                  <a
                    href={`/api/results/${sub.submissionId}/export?format=csv`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  >
                    <FileSpreadsheet className="h-3 w-3" /> CSV
                  </a>
                  <a
                    href={`/api/results/${sub.submissionId}/export?format=json`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  >
                    <FileJson className="h-3 w-3" /> JSON
                  </a>
                  <button
                    type="button"
                    disabled={deletingId === sub.submissionId}
                    onClick={() => handleDeleteSingle(sub.submissionId)}
                    aria-label={`Delete result ${sub.submissionId}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)]"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <Link
                    href={`/results/${sub.submissionId}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {primaryHistory.length > 0 && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--accent-gold)]" />
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Dimension Evolution Over Time
            </h2>
          </div>
          <PreferenceHistoryChart results={primaryHistory} />
        </section>
      )}
    </div>
  );
}
