"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  Lock,
  MessageCircle,
  Plus,
  Printer,
  ShieldAlert,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { CompatibilityDial } from "@/components/charts/CompatibilityDial";
import { PredictionRevealView } from "@/components/charts/PredictionRevealView";
import { PreferenceRadarChart } from "@/components/charts/PreferenceRadarChart";
import { EmailReportModal } from "@/components/results/EmailReportModal";
import type { CompatibilityPairItem, CompatibilityReport } from "@/lib/assessment/types";
import { cn, formatShortDate } from "@/lib/utils";

function PairItemGroup({
  title,
  emptyMessage,
  items,
  accentColor,
}: {
  title: string;
  emptyMessage: string;
  items: CompatibilityPairItem[];
  accentColor: string;
}) {
  return (
    <section
      className="rounded-3xl border p-6 print-break-inside-avoid"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="flex items-baseline justify-between border-b pb-3">
        <h3 className="font-display text-2xl text-[var(--ink-primary)]">{title}</h3>
        <span className="font-mono-tabular text-xs" style={{ color: accentColor }}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-[var(--ink-muted)]">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.questionId}
              className="rounded-2xl border p-4 text-xs"
              style={{
                backgroundColor: "var(--bg-canvas)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <p className="text-sm font-medium text-[var(--ink-primary)]">{item.promptSummary}</p>
              <p className="mt-1 leading-relaxed text-[var(--ink-secondary)]">{item.explanation}</p>
              <span className="mt-2 inline-block text-[11px] text-[var(--ink-muted)]">
                {item.sectionTitle}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CompatibilityDashboard({ report: initialReport }: { report: CompatibilityReport }) {
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [showFormula, setShowFormula] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Interactive bucket list controls (Test 26)
  const [customIdea, setCustomIdea] = useState("");
  const [customCategory, setCustomCategory] = useState("Shared Custom Ideas");
  const [updatingBucket, setUpdatingBucket] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    const res = await fetch(`/api/invitations?inviteId=${encodeURIComponent(report.inviteId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/couples");
    } else {
      setRevoking(false);
    }
  };

  const mutateBucketList = async (payload: Record<string, unknown>) => {
    setUpdatingBucket(true);
    try {
      const res = await fetch("/api/couples/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compatibilityId: report.compatibilityId,
          ...payload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) setReport(data.report);
      }
    } finally {
      setUpdatingBucket(false);
    }
  };

  const handleAddBucketItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdea.trim()) return;
    await mutateBucketList({
      addCustomItem: { label: customIdea.trim(), category: customCategory },
    });
    setCustomIdea("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Main Hero Reveal */}
      <div
        className="grid gap-8 rounded-3xl border p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="lg:col-span-4">
          <CompatibilityDial
            score={report.overallScore}
            coveragePercent={report.coveragePercent}
            provisional={report.provisional}
          />
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
            {report.assessmentTitle && (
              <>
                <span className="font-medium text-[var(--ink-primary)]">{report.assessmentTitle}</span>
                <span>·</span>
              </>
            )}
            <span>{report.label}</span>
            <span>·</span>
            <span className="font-mono-tabular">
              {report.bothAnsweredCount}/{report.totalEligibleCount} matched pairs
            </span>
            <span>·</span>
            <span>Generated {formatShortDate(report.createdAt)}</span>
          </div>

          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            Shared Compatibility Overview
          </h1>

          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {report.disclaimer}
          </p>

          {report.provisional && (
            <div
              className="flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent-gold) 14%, transparent)",
                borderColor: "var(--accent-gold)",
                color: "var(--ink-primary)",
              }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
              <span>
                Provisional Compatibility: only {report.coveragePercent}% of eligible pairs had
                complete answers from both participants. Answering more items improves precision.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-2 no-print">
            <a
              href={`/api/compatibility/${report.compatibilityId}/export?format=pdf`}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <Download className="h-3.5 w-3.5" /> PDF Report
            </a>

            <a
              href={`/api/compatibility/${report.compatibilityId}/export?format=csv`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
            </a>

            <a
              href={`/api/compatibility/${report.compatibilityId}/export?format=json`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <FileJson className="h-3.5 w-3.5" /> JSON
            </a>

            <EmailReportModal
              targetType="compatibility"
              targetId={report.compatibilityId}
              assessmentTitle={report.assessmentTitle ?? "Partner Compatibility Report"}
            />

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>

            <button
              type="button"
              onClick={() => setShowFormula((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              How score was calculated (v{report.scoringEngineVersion})
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFormula && "rotate-180")} />
            </button>

            <button
              type="button"
              disabled={revoking}
              onClick={handleRevoke}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Revoke Shared Access
            </button>
          </div>

          {showFormula && (
            <ul
              className="space-y-1.5 rounded-2xl border p-4 text-xs leading-relaxed text-[var(--ink-secondary)]"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              {report.methodologyNotes.map((note, idx) => (
                <li key={idx}>• {note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Special Assessment Modules: Prediction Trivia / Who Is More Likely To */}
      {(report.predictionSummary || report.voteGameSummary) && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <PredictionRevealView report={report} />
        </section>
      )}

      {/* Special Module: Zero-Exposure Fantasy Reveal Matrix (Test 9) */}
      {report.fantasyReveals && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="inline-flex items-center gap-2 font-display text-3xl text-[var(--ink-primary)]">
                <Lock className="h-5 w-5 text-[var(--accent-plum)]" /> Mutual Fantasy Reveals
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                {report.fantasyReveals.privacyNotice}
              </p>
            </div>
            <span className="rounded-full border px-3 py-1 font-mono-tabular text-xs text-[var(--ink-muted)]">
              {report.fantasyReveals.privateProtectedCount} private/unmatched items hidden
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--accent-plum)] bg-[var(--bg-subtle)] p-5">
              <h3 className="font-display text-2xl text-[var(--accent-plum)]">
                Mutually Selected ({report.fantasyReveals.mutuallySelected.length})
              </h3>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                Independently sparked interest from both of you.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                {report.fantasyReveals.mutuallySelected.length === 0 ? (
                  <li className="text-[var(--ink-muted)]">No mutual overlaps yet.</li>
                ) : (
                  report.fantasyReveals.mutuallySelected.map((m) => (
                    <li key={m.questionId} className="rounded-xl border bg-[var(--bg-elevated)] p-3">
                      <span className="block font-medium text-[var(--ink-primary)]">{m.label}</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">{m.category}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border bg-[var(--bg-canvas)] p-5">
              <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                Openly Shared by Creator ({report.fantasyReveals.openlySharedByCreatorOnly.length})
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                {report.fantasyReveals.openlySharedByCreatorOnly.length === 0 ? (
                  <li className="text-[var(--ink-muted)]">None set to always-share.</li>
                ) : (
                  report.fantasyReveals.openlySharedByCreatorOnly.map((m) => (
                    <li key={m.questionId} className="rounded-xl border bg-[var(--bg-elevated)] p-3">
                      <span className="block font-medium text-[var(--ink-primary)]">{m.label}</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">{m.category}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border bg-[var(--bg-canvas)] p-5">
              <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                Openly Shared by Partner ({report.fantasyReveals.openlySharedByPartnerOnly.length})
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                {report.fantasyReveals.openlySharedByPartnerOnly.length === 0 ? (
                  <li className="text-[var(--ink-muted)]">None set to always-share.</li>
                ) : (
                  report.fantasyReveals.openlySharedByPartnerOnly.map((m) => (
                    <li key={m.questionId} className="rounded-xl border bg-[var(--bg-elevated)] p-3">
                      <span className="block font-medium text-[var(--ink-primary)]">{m.label}</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">{m.category}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Special Module: Shared Interactive Couples Bucket List (Test 26) */}
      {report.bucketListMatches && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Shared Couples Bucket List
              </h2>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                Check off experiences together or add custom plans. Unmatched solo ideas stay private ({report.bucketListMatches.onePartnerOpenCount} asymmetrical suggestions hidden).
              </p>
            </div>
            <span className="font-mono-tabular text-xs font-semibold text-[var(--accent-sage)]">
              {report.bucketListMatches.sharedItems.filter((i) => i.completed).length}/
              {report.bucketListMatches.sharedItems.length} completed
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.bucketListMatches.sharedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs"
                style={{
                  backgroundColor: item.completed ? "var(--bg-subtle)" : "var(--bg-canvas)",
                  borderColor: item.completed ? "var(--accent-sage)" : "var(--border-hairline)",
                }}
              >
                <button
                  type="button"
                  disabled={updatingBucket}
                  onClick={() =>
                    mutateBucketList(
                      item.addedCustom ? { toggleCustomId: item.id } : { toggleItemId: item.id }
                    )
                  }
                  className="flex flex-1 items-start gap-2.5 text-left"
                >
                  {item.completed ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-sage)]" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                  )}
                  <span>
                    <span
                      className={cn(
                        "block font-medium text-sm text-[var(--ink-primary)]",
                        item.completed && "line-through opacity-75"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)]">{item.category}</span>
                  </span>
                </button>
                {item.addedCustom && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.label}`}
                    onClick={() => mutateBucketList({ removeCustomId: item.id })}
                    className="rounded-full p-1 text-[var(--ink-muted)] hover:text-[var(--accent-rose)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddBucketItem} className="mt-6 flex flex-wrap gap-2 no-print">
            <input
              type="text"
              placeholder="Add a shared goal, date idea, or trip..."
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              className="min-w-[220px] flex-1 rounded-full border bg-[var(--bg-canvas)] px-4 py-2 text-xs text-[var(--ink-primary)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="rounded-full border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
            >
              <option value="Travel & Adventure">Travel &amp; Adventure</option>
              <option value="Home & Rituals">Home &amp; Rituals</option>
              <option value="Intimacy & Novelty">Intimacy &amp; Novelty</option>
              <option value="Shared Custom Ideas">Custom Idea</option>
            </select>
            <button
              type="submit"
              disabled={updatingBucket || !customIdea.trim()}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add to Shared List
            </button>
          </form>
        </section>
      )}

      {/* Special Module: Give-vs-Receive Pairing (Tests 12, 28) */}
      {report.giveReceivePairings && report.giveReceivePairings.length > 0 && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Give vs. Receive Channel Calibration
          </h2>
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            Compares what each partner wants to receive against what the other naturally offers.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {report.giveReceivePairings.map((pair) => (
              <div key={pair.channel} className="rounded-2xl border bg-[var(--bg-canvas)] p-4 text-xs">
                <p className="font-medium text-sm text-[var(--ink-primary)]">{pair.channel}</p>
                <div className="mt-2 flex items-center justify-between text-[var(--ink-secondary)]">
                  <span>A&apos;s need / B&apos;s offer fit: <strong className="font-mono-tabular text-[var(--ink-primary)]">{pair.aReceivesFromB}/100</strong></span>
                  <span>B&apos;s need / A&apos;s offer fit: <strong className="font-mono-tabular text-[var(--ink-primary)]">{pair.bReceivesFromA}/100</strong></span>
                </div>
                <p className="mt-2 text-[var(--ink-muted)]">{pair.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dimension Breakdown + Overlay Radar */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <section
          className="rounded-3xl border p-6 sm:p-8 lg:col-span-7"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Profile Overlay Radar
          </h2>
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            Compares broad dimensional shape across both participants without exposing private
            item-level ratings.
          </p>
          <div className="mt-4">
            <PreferenceRadarChart
              dimensions={[]}
              overlay={report.radarOverlay}
              primaryLabel="Person A"
              partnerLabel="Partner B"
              stacked
            />
          </div>
        </section>

        <section
          className="rounded-3xl border p-6 sm:p-8 lg:col-span-5"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Category Alignment
          </h2>
          <div className="mt-5 space-y-4">
            {report.dimensionScores.map((dim) => (
              <div key={dim.dimension} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-[var(--ink-primary)]">{dim.dimension}</span>
                  <span className="font-mono-tabular font-semibold text-[var(--accent-plum)]">
                    {dim.score !== null ? `${dim.score}/100` : "Private"}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--bg-subtle)" }}
                >
                  {dim.score !== null && (
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: "var(--accent-plum)",
                      }}
                    />
                  )}
                </div>
                <p className="text-[11px] text-[var(--ink-muted)]">{dim.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Couple Insights & Conversation Starters */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h2 className="inline-flex items-center gap-2 font-display text-3xl text-[var(--ink-primary)]">
            <Sparkles className="h-5 w-5 text-[var(--accent-gold)]" /> Couple Insights
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-primary)]">
            {report.coupleInsights.map((ins, i) => (
              <li
                key={i}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                {ins}
              </li>
            ))}
          </ul>
        </section>

        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h2 className="inline-flex items-center gap-2 font-display text-3xl text-[var(--ink-primary)]">
            <MessageCircle className="h-5 w-5 text-[var(--accent-plum)]" /> Conversation Starters
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-primary)]">
            {report.conversationStarters.map((q, i) => (
              <li
                key={i}
                className="rounded-2xl border p-4 italic"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Detailed Comparison Sections */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <PairItemGroup
          title="Where You Align"
          emptyMessage="Hidden by sharing settings or no strong matched alignments yet."
          items={report.whereYouAlign}
          accentColor="var(--accent-sage)"
        />
        <PairItemGroup
          title="Where You Complement Each Other"
          emptyMessage="No asymmetric give/receive complements highlighted in this run."
          items={report.whereYouComplement}
          accentColor="var(--accent-gold)"
        />
        <PairItemGroup
          title="Where You Differ"
          emptyMessage="No notable mismatches surfaced."
          items={report.whereYouDiffer}
          accentColor="var(--accent-rose)"
        />
        <PairItemGroup
          title="Your Shared Curiosities"
          emptyMessage="Shared curiosities appear only when both participants independently express interest."
          items={report.sharedCuriosities}
          accentColor="var(--accent-plum)"
        />
      </div>

      {/* Important Boundaries */}
      <section
        className="mt-8 rounded-3xl border p-6 sm:p-8"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-[var(--accent-rose)]" />
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Important Boundary Considerations
          </h2>
        </div>
        {report.boundaryConsiderations.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ink-secondary)]">
            No boundary friction points surfaced under your current sharing preferences.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {report.boundaryConsiderations.map((b) => (
              <div
                key={b.questionId}
                className="rounded-2xl border p-4 text-xs"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <p className="font-semibold text-[var(--ink-primary)]">{b.promptSummary}</p>
                <p className="mt-1 leading-relaxed text-[var(--ink-secondary)]">{b.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-between text-xs text-[var(--ink-muted)] no-print">
        <Link href="/couples" className="hover:underline">
          &larr; Manage invitations in Couples Hub
        </Link>
        <Link href={`/assess/${report.assessmentSlug}`} className="hover:underline">
          Retake assessment &rarr;
        </Link>
      </div>
    </div>
  );
}
