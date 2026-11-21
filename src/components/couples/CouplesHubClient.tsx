"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  HeartHandshake,
  Link2,
  Lock,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { PartnerInvitation } from "@/lib/assessment/types";
import { formatShortDate } from "@/lib/utils";
import { ComparisonExample } from "@/components/home/DiscoveryPreview";

interface CompatibilitySummaryCard {
  compatibilityId: string;
  inviteId: string;
  assessmentSlug: string;
  assessmentTitle: string;
  overallScore: number;
  label: string;
  createdAt: string;
  bothAnsweredCount: number;
  totalEligibleCount: number;
}

interface CouplesAssessmentTile {
  slug: string;
  title: string;
  categoryTitle: string;
  description: string;
  estimatedMinutesComplete: number;
  adultsOnly: boolean;
  latestSubmissionId: string | null;
}

export function CouplesHubClient({
  initialInvitations,
  initialReports,
  couplesAssessments,
}: {
  initialInvitations: PartnerInvitation[];
  initialReports: CompatibilitySummaryCard[];
  couplesAssessments: CouplesAssessmentTile[];
}) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [reports, setReports] = useState(initialReports);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (inviteId: string) => {
    setRevokingId(inviteId);
    try {
      const res = await fetch(
        `/api/invitations?inviteId=${encodeURIComponent(inviteId)}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setInvitations((prev) =>
          prev.map((i) =>
            i.inviteId === inviteId ? { ...i, status: "revoked" } : i,
          ),
        );
        setReports((prev) => prev.filter((r) => r.inviteId !== inviteId));
      }
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopy = async (inv: PartnerInvitation) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/invite/${inv.token}`
        : `/invite/${inv.token}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(inv.inviteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingInvites = invitations.filter((i) => i.status === "pending");

  return (
    <div className="site-shell py-12 sm:py-16">
      <div className="max-w-3xl space-y-3">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
          A little closer to each other.
        </h1>
        <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
          Explore the patterns behind your connection. See your shared
          strengths, understand your differences, and start a better
          conversation.
        </p>
      </div>

      {reports.length === 0 && (
        <section className="comparison-grid mt-8">
          <div className="comparison-panel">
            <span className="panel-symbol">
              <HeartHandshake size={20} />
            </span>
            <h2 className="font-display text-3xl">
              Your connection, in focus.
            </h2>
            <p className="mt-4">
              Two people bring two different stories. Compare your category
              profiles and find the places where your stories meet.
            </p>
            <ComparisonExample />
          </div>
          <div className="comparison-panel">
            <h2 className="font-display text-2xl">
              Make room for a real conversation.
            </h2>
            <ol className="mt-6 space-y-6">
              {[
                {
                  title: "Discover your own profile",
                  text: "Choose a test below and answer at your own pace.",
                },
                {
                  title: "Invite your person",
                  text: "Open your result and create a private partner link. Choose what you share.",
                },
                {
                  title: "See your connection together",
                  text: "Your partner answers independently. You both get the same compatibility report.",
                },
              ].map((step, i) => (
                <li className="flex gap-4" key={step.title}>
                  <span className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full border text-xs text-[var(--accent-plum)]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{step.title}</h3>
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-2">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/explore" className="button button-primary mt-7">
              Find a test for two
            </Link>
          </div>
        </section>
      )}

      {/* Completed Compatibility Reports */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-[var(--accent-plum)]" />
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Shared Compatibility Reports ({reports.length})
          </h2>
        </div>

        {reports.length === 0 ? (
          <div
            className="mt-4 rounded-3xl border p-6 text-sm text-[var(--ink-secondary)]"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-hairline)",
            }}
          >
            No completed couple reports yet. Finish any partner-enabled
            assessment below, open your result, and send a private invite link.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reports.map((rep) => (
              <div
                key={rep.compatibilityId}
                className="flex flex-col justify-between rounded-3xl border p-6"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-strong)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--ink-muted)]">
                      {rep.assessmentTitle} · {formatShortDate(rep.createdAt)}
                    </span>
                    <span className="font-mono-tabular text-xl font-bold text-[var(--accent-plum)]">
                      {rep.overallScore}%
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl text-[var(--ink-primary)]">
                    {rep.label}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    {rep.bothAnsweredCount} of {rep.totalEligibleCount} matched
                    prompts compared.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                  <Link
                    href={`/compatibility/${rep.compatibilityId}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Open Report <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    disabled={revokingId === rep.inviteId}
                    onClick={() => handleRevoke(rep.inviteId)}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)]"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Partner Invitations */}
      {pendingInvites.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[var(--accent-gold)]" />
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Pending Partner Invitations ({pendingInvites.length})
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {pendingInvites.map((inv) => (
              <div
                key={inv.inviteId}
                className="flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="text-xs">
                  <p className="font-semibold text-sm text-[var(--ink-primary)]">
                    {inv.assessmentSlug.replace(/-/g, " ")} · For{" "}
                    {inv.creatorDisplayName}
                  </p>
                  <p className="mt-0.5 text-[var(--ink-muted)]">
                    Expires {formatShortDate(inv.expiresAt)} · {inv.mode} mode
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {inv.token && (
                    <button
                      type="button"
                      onClick={() => handleCopy(inv)}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)]"
                    >
                      {copiedId === inv.inviteId ? (
                        <Check className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === inv.inviteId
                        ? "Copied"
                        : "Copy Invite Link"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRevoke(inv.inviteId)}
                    className="rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--accent-rose)]"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Couples Launchpad Grid */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Couples Games &amp; Partner Assessments
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Take your side privately first, then generate a revocable partner
              invitation from your results page.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <Lock className="h-3.5 w-3.5 text-[var(--accent-sage)]" />{" "}
            Mutual-only fantasy &amp; bucket list protection
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {couplesAssessments.map((item) => (
            <div
              key={item.slug}
              className="flex flex-col justify-between rounded-3xl border p-6"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
                  <span>{item.categoryTitle}</span>
                  <div className="flex items-center gap-2">
                    {item.adultsOnly && (
                      <span className="font-mono-tabular font-semibold text-[var(--accent-rose)]">
                        18+
                      </span>
                    )}
                    <span className="font-mono-tabular">
                      ~{item.estimatedMinutesComplete} min
                    </span>
                  </div>
                </div>
                <h3 className="mt-2 font-display text-2xl text-[var(--ink-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  {item.description}
                </p>
              </div>

              <div
                className="mt-5 flex flex-wrap gap-2 border-t pt-4"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                <Link
                  href={`/assess/${item.slug}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {item.latestSubmissionId ? "Take Again" : "Start Assessment"}
                </Link>
                {item.latestSubmissionId && (
                  <Link
                    href={`/results/${item.latestSubmissionId}`}
                    className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                  >
                    Invite / Result
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
