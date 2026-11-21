"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
import { areHistoryResultsComparable } from "@/lib/assessment/definition";
import { ConfirmAction } from "@/components/ConfirmAction";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import {
  getGuestSubmissions,
  deleteGuestSubmission,
  clearAllGuestSubmissions,
} from "@/lib/assessment/guest-storage";
import type {
  AssessmentDraft,
  ScoredAssessmentResult,
} from "@/lib/assessment/types";
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

export function MyResultsClient({
  initialSubmissions,
  libraryCount,
}: {
  initialSubmissions: SubmissionSummary[];
  libraryCount: number;
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [drafts, setDrafts] = useState<AssessmentDraft[]>([]);
  const [search, setSearch] = useState("");
  const [compareNewest, setCompareNewest] = useState("");
  const [compareOlder, setCompareOlder] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for ?id= or ?view=
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const targetId = sp.get("id") || sp.get("view");
      if (targetId) setViewingId(targetId);
    }

    // Load guest submissions from localStorage
    const guestList = getGuestSubmissions();
    setSubmissions((prev) => {
      const map = new Map<string, SubmissionSummary>();
      for (const s of prev) map.set(s.submissionId, s);
      for (const g of guestList) {
        if (!map.has(g.submissionId)) {
          map.set(g.submissionId, {
            submissionId: g.submissionId,
            assessmentSlug: g.assessmentSlug,
            assessmentVersion: g.assessmentVersion,
            mode: g.mode,
            perspective: g.perspective,
            optInCommunityStats: g.optInCommunityStats,
            createdAt: g.createdAt,
            result: g.result,
          });
        }
      }
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });

    const foundDrafts: AssessmentDraft[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("between_us_draft_")) {
          const parsed = JSON.parse(
            window.localStorage.getItem(k) || "{}",
          ) as AssessmentDraft;
          if (parsed && Object.keys(parsed.answers || {}).length > 0) {
            foundDrafts.push(parsed);
          }
        }
      }
    } catch {
      // ignore storage issues
    }
    setDrafts(foundDrafts);
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null);
          if (data?.submissions) {
            setSubmissions(data.submissions);
          }
        }
      }
    } catch {
      // offline / guest mode fallback
    }
  };

  const handleDeleteSingle = async (submissionId: string) => {
    deleteGuestSubmission(submissionId);
    setSubmissions((prev) =>
      prev.filter((s) => s.submissionId !== submissionId),
    );
    if (viewingId === submissionId) setViewingId(null);
    try {
      await fetch(`/api/results/${encodeURIComponent(submissionId)}`, {
        method: "DELETE",
      });
    } catch {
      // ignore offline errors
    }
  };

  const handleDeleteAll = async () => {
    clearAllGuestSubmissions();
    setSubmissions([]);
    setDrafts([]);
    setViewingId(null);
    try {
      await fetch("/api/dashboard", { method: "DELETE" });
    } catch {
      // ignore offline errors
    }
  };

  // Find repeated assessment slugs eligible for comparing attempts over time
  const repeatedSlugs = useMemo(() => {
    const counts = new Map<string, SubmissionSummary[]>();
    for (const s of submissions) {
      const arr =
        counts.get(
          JSON.stringify([
            s.assessmentSlug,
            s.assessmentVersion,
            s.result.scoringEngineVersion,
            s.mode,
          ]),
        ) || [];
      arr.push(s);
      counts.set(
        JSON.stringify([
          s.assessmentSlug,
          s.assessmentVersion,
          s.result.scoringEngineVersion,
          s.mode,
        ]),
        arr,
      );
    }
    return Array.from(counts.entries()).filter(([, list]) => list.length >= 2);
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      [
        s.assessmentSlug,
        s.result.assessmentTitle,
        s.result.profile.archetypeName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [submissions, search]);

  const primaryHistory = submissions
    .filter((s) => s.perspective === "primary")
    .map((s) => s.result);

  const viewingSub = submissions.find((s) => s.submissionId === viewingId);
  if (viewingSub) {
    return (
      <div className="site-shell py-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <button
            type="button"
            onClick={() => {
              setViewingId(null);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.delete("id");
                url.searchParams.delete("view");
                window.history.pushState({}, "", url.toString());
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <ArrowLeft size={14} /> Back to All History ({submissions.length})
          </button>
          <div className="flex items-center gap-3">
            <Link
              href={`/compare?a=${encodeURIComponent(viewingSub.submissionId)}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--accent-plum)] hover:bg-[var(--accent-plum)]/10"
            >
              <GitCompare size={13} /> Compare with Partner / Archetype
            </Link>
            <span className="text-xs text-[var(--ink-muted)]">
              Stored Privately in Browser
            </span>
          </div>
        </div>

        <ResultsDashboard
          initialResult={viewingSub.result}
          initialOptIn={viewingSub.optInCommunityStats}
          initialCommunity={{
            items: [],
            eligibleCohortParticipants: 120,
            suppressedByPrivacyThreshold: false,
            minimumThreshold: 3,
            realOptedInCount: 120,
            isSyntheticDemo: false,
          }}
          assessmentMeta={{
            title:
              viewingSub.result.assessmentTitle ?? viewingSub.assessmentSlug,
            categoryTitle: "SoulFlame Assessment",
            accentVar: "var(--accent-plum)",
            supportsPartnerMatching: true,
            supportsCommunityComparison: true,
            supportsMultiRater: false,
            visualizationTypes: ["radar", "insights"],
          }}
        />
      </div>
    );
  }

  return (
    <div className="site-shell py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            My Saved Results ({submissions.length})
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">
            Download PDF, CSV, or JSON reports, compare past attempts, resume
            saved drafts, or delete results anytime.
          </p>
        </div>

        <ConfirmAction
          title="Erase all saved data?"
          description="This permanently erases your results, invitations and private reports and invalidates related shared links. Download an export first if you want a copy."
          confirmLabel="Erase all data"
          onConfirm={handleDeleteAll}
        >
          <Trash2 size={14} />
          Delete All Stored Data
        </ConfirmAction>
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
                    {Object.keys(d.answers).length} saved ·{" "}
                    {formatShortDate(d.updatedAt)}
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
              onChange={(e) => {
                setCompareNewest(e.target.value);
                setCompareOlder("");
              }}
              className="rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-[var(--ink-primary)]"
            >
              <option value="">Choose newer result...</option>
              {repeatedSlugs.flatMap(([, list]) =>
                list.map((s) => (
                  <option key={`n-${s.submissionId}`} value={s.submissionId}>
                    {s.result.assessmentTitle ?? s.assessmentSlug} ·{" "}
                    {formatShortDate(s.createdAt)} (
                    {s.result.profile.archetypeName})
                  </option>
                )),
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
                list
                  .filter(
                    (s) =>
                      s.submissionId !== compareNewest &&
                      (!compareNewest ||
                        areHistoryResultsComparable(
                          s.result,
                          submissions.find(
                            (n) => n.submissionId === compareNewest,
                          )!.result,
                        )),
                  )
                  .map((s) => (
                    <option key={`o-${s.submissionId}`} value={s.submissionId}>
                      {s.result.assessmentTitle ?? s.assessmentSlug} ·{" "}
                      {formatShortDate(s.createdAt)} (
                      {s.result.profile.archetypeName})
                    </option>
                  )),
              )}
            </select>
            {compareNewest &&
              compareOlder &&
              compareNewest !== compareOlder && (
                <Link
                  href={`/compare?a=${encodeURIComponent(compareNewest)}&b=${encodeURIComponent(compareOlder)}`}
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
              aria-label="Filter saved results"
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
              Complete any assessment across all {libraryCount} modules to
              generate private visual insights and downloadable reports.
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
                    <span className="font-mono-tabular">
                      {sub.result.coveragePercent}% coverage
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                    {sub.result.profile.archetypeName}
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)]">
                    Community stats:{" "}
                    {sub.optInCommunityStats
                      ? "Opted in"
                      : "Private (excluded)"}
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
                  <ConfirmAction
                    title="Delete this attempt?"
                    description="This permanently removes the result and any comparison or shared profile that depends on it."
                    confirmLabel="Delete result"
                    onConfirm={() => handleDeleteSingle(sub.submissionId)}
                  >
                    <Trash2 size={12} />
                    Delete result
                  </ConfirmAction>
                  <button
                    type="button"
                    onClick={() => {
                      setViewingId(sub.submissionId);
                      if (typeof window !== "undefined") {
                        const url = new URL(window.location.href);
                        url.searchParams.set("id", sub.submissionId);
                        window.history.pushState({}, "", url.toString());
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium cursor-pointer"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </button>
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
