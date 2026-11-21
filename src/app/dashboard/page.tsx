"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  History,
  Link2,
  LogOut,
  RotateCcw,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { PreferenceHistoryChart } from "@/components/charts/PreferenceHistoryChart";
import type {
  AssessmentDraft,
  PartnerInvitation,
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

export default function PersonalDashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [invitations, setInvitations] = useState<PartnerInvitation[]>([]);
  const [drafts, setDrafts] = useState<AssessmentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const { user: firebaseUser, firebaseEnabled, openAuthModal, signOut } = useOptionalAuth();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const ct = res.headers.get("content-type") || "";
      if (res.ok && ct.includes("application/json")) {
        const data = await res.json().catch(() => null);
        if (data) {
          setSubmissions(data.submissions || []);
          setInvitations(data.invitations || []);
        }
      }
    } finally {
      setLoading(false);
    }

    // Collect local unfinished drafts
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
      // ignore storage errors
    }
    setDrafts(foundDrafts);
  };

  useEffect(() => {
    loadDashboard();
  }, [firebaseUser?.uid]);

  const handleRevokeInvite = async (inviteId: string) => {
    const res = await fetch(`/api/invitations?inviteId=${encodeURIComponent(inviteId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      loadDashboard();
    }
  };

  const handleDeleteAllData = async () => {
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
    loadDashboard();
  };

  const primaryHistory = submissions
    .filter((s) => s.perspective === "primary")
    .map((s) => s.result);

  return (
    <div className="site-shell py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            Personal Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">
            Review past assessments, resume unfinished drafts, track how preferences evolve over
            time, manage partner invitations, and control or delete stored data.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAllData}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: "var(--accent-rose)" }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete All Stored Data
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Main Workspace */}
        <div className="space-y-8 lg:col-span-8">
          {/* Unfinished Drafts */}
          {drafts.length > 0 && (
            <section
              className="rounded-3xl border p-6"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--accent-gold)",
              }}
            >
              <h2 className="font-display text-2xl text-[var(--ink-primary)]">
                Unfinished Sessions Ready to Resume
              </h2>
              <div className="mt-4 space-y-3">
                {drafts.map((d) => (
                  <div
                    key={d.draftId}
                    className="flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--ink-primary)]">
                        {d.assessmentSlug.replace(/-/g, " ")} ({d.mode})
                      </p>
                      <p className="text-xs text-[var(--ink-secondary)]">
                        {Object.keys(d.answers).length} answers autosaved · Updated{" "}
                        {formatShortDate(d.updatedAt)}
                      </p>
                    </div>
                    <Link
                      href={`/assess/${d.assessmentSlug}?mode=${d.mode}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
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

          {/* Completed Assessments */}
          <section
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Completed Assessments
              </h2>
              <Link
                href="/assess/intimacy-partner-preferences"
                className="text-xs font-medium text-[var(--accent-plum)] hover:underline"
              >
                + Take New Assessment
              </Link>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-[var(--ink-muted)]">Loading session records...</p>
            ) : submissions.length === 0 ? (
              <div className="mt-6 rounded-2xl border p-6 text-center" style={{ backgroundColor: "var(--bg-subtle)" }}>
                <p className="text-sm text-[var(--ink-secondary)]">
                  No completed assessments stored in this browser session yet.
                </p>
                <Link
                  href="/assess/intimacy-partner-preferences"
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  Begin Intimacy Assessment <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.submissionId}
                    className="flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center"
                    style={{
                      backgroundColor: "var(--bg-canvas)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
                        <span>{formatShortDate(sub.createdAt)}</span>
                        <span>·</span>
                        <span>{sub.mode} mode</span>
                        <span>·</span>
                        <span className="font-mono-tabular">{sub.result.coveragePercent}% coverage</span>
                      </div>
                      <h3 className="mt-1 font-display text-2xl text-[var(--ink-primary)]">
                        {sub.result.profile.archetypeName}
                      </h3>
                      <p className="text-xs text-[var(--ink-secondary)]">
                        Community stats opt-in: {sub.optInCommunityStats ? "Enabled" : "Private (excluded)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/results/${sub.submissionId}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--accent-plum)",
                          color: "var(--accent-plum-contrast)",
                        }}
                      >
                        Open Results <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Historical Timeline */}
          <section
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-[var(--accent-gold)]" />
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Preference Changes Over Time
              </h2>
            </div>
            <PreferenceHistoryChart results={primaryHistory} />
          </section>

          {/* Partner Invitations */}
          <section
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-[var(--accent-plum)]" />
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Partner Invitations &amp; Reports
              </h2>
            </div>

            {invitations.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--ink-secondary)]">
                No partner invitations created yet. Open any completed result and select
                &ldquo;Compare With Partner&rdquo; to generate a revocable invitation.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {invitations.map((inv) => {
                  const link =
                    typeof window !== "undefined"
                      ? `${window.location.origin}/invite/${inv.token}`
                      : `/invite/${inv.token}`;
                  return (
                    <div
                      key={inv.inviteId}
                      className="flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center"
                      style={{
                        backgroundColor: "var(--bg-canvas)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--ink-primary)]">
                            For: {inv.creatorDisplayName}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: "var(--bg-subtle)",
                              color:
                                inv.status === "completed"
                                  ? "var(--accent-sage)"
                                  : inv.status === "revoked"
                                    ? "var(--accent-rose)"
                                    : "var(--accent-gold)",
                            }}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-[var(--ink-muted)]">
                          Expires {formatShortDate(inv.expiresAt)} · {inv.mode} mode
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {inv.compatibilityId && inv.status === "completed" && (
                          <Link
                            href={`/compatibility/${inv.compatibilityId}`}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: "var(--accent-plum)",
                              color: "var(--accent-plum-contrast)",
                            }}
                          >
                            View Compatibility
                          </Link>
                        )}
                        {inv.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(link);
                              setCopiedInviteId(inv.inviteId);
                              setTimeout(() => setCopiedInviteId(null), 1800);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)]"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedInviteId === inv.inviteId ? "Copied" : "Copy Link"}
                          </button>
                        )}
                        {inv.status !== "revoked" && (
                          <button
                            type="button"
                            onClick={() => handleRevokeInvite(inv.inviteId)}
                            className="rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--accent-rose)]"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Account & Privacy Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          <div
            className="rounded-3xl border p-6"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[var(--accent-plum)]" />
              <h2 className="font-display text-2xl text-[var(--ink-primary)]">
                Optional Account Sync
              </h2>
            </div>

            {!firebaseEnabled ? (
              <div className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                <p>
                  You are currently operating in <strong>Private Session Mode</strong> (cookie +
                  encrypted-at-rest server store). No account is required to complete tests, view
                  results, or share revocable partner invitations.
                </p>
                <p className="text-[var(--ink-muted)]">
                  To enable cross-device Firebase Auth &amp; Cloud Firestore sync, add your
                  Firebase project environment variables in <code>.env.local</code>.
                </p>
              </div>
            ) : firebaseUser ? (
              <div className="mt-4 space-y-3 text-xs">
                <p className="text-[var(--ink-primary)]">
                  Signed in as <strong>{firebaseUser.email || firebaseUser.displayName || "Cloud Account"}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)]"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                <p className="leading-relaxed text-[var(--ink-secondary)]">
                  Optional cloud sync via Firebase Authentication (<span className="font-mono-tabular">truth-desire</span>).
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal("signin")}
                    className="rounded-full px-4 py-2 font-medium"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("register")}
                    className="rounded-full border px-4 py-2 font-medium text-[var(--ink-primary)]"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="rounded-3xl border p-6 text-xs leading-relaxed text-[var(--ink-secondary)]"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-primary)]">
              <Shield className="h-4 w-4 text-[var(--accent-sage)]" />
              Privacy Guarantee
            </div>
            <ul className="mt-3 space-y-2">
              <li>• Result pages carry <code>noindex, nofollow</code> headers.</li>
              <li>• Sensitive answers never enter URLs, analytics, or external AI models.</li>
              <li>• Community averages strictly exclude non-consenting submissions.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
