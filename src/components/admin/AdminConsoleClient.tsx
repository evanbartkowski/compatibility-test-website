"use client";

import { AssessmentBuilder } from "./AssessmentBuilder";
import React, { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  Check,
  FileSearch,
  FlaskConical,
  Lock,
  LogOut,
  Mail,
  Sparkles,
} from "lucide-react";

import type { ReferenceChartItem } from "@/data/reference-chart-audit";
import type {
  AssessmentDefinition,
  AuditEventRecord,
  ScoredAssessmentResult,
} from "@/lib/assessment/types";
import type { EmailTemplateConfig } from "@/lib/server/store";
import { cn, formatShortDate } from "@/lib/utils";

interface TelemetrySummary {
  totalSubmissions: number;
  totalInvitations: number;
  totalCompatibilities: number;
  totalEmailDeliveries: number;
  byAssessment: Record<string, { total: number; optedIn: number }>;
  recentAuditEvents: AuditEventRecord[];
}

export function AdminConsoleClient({
  initialAuthenticated,
  keyConfigured,
  devFallbackActive,
  heading = "Admin & Scoring Console",
  defaultTab = "telemetry",
}: {
  initialAuthenticated: boolean;
  keyConfigured: boolean;
  devFallbackActive: boolean;
  heading?: string;
  defaultTab?: "telemetry" | "builder" | "simulator" | "emails" | "audit";
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [tab, setTab] = useState<string>(defaultTab);
  const [assessments, setAssessments] = useState<AssessmentDefinition[]>([]);
  const [auditItems, setAuditItems] = useState<ReferenceChartItem[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(null);
  const [templates, setTemplates] = useState<EmailTemplateConfig | null>(null);
  const [auditFilter, setAuditFilter] = useState<
    "all" | "flagged_obscured" | "verified_readable"
  >("flagged_obscured");

  // Simulator state
  const [simulationAssessments, setSimulationAssessments] = useState<
    Array<{ slug: string; title: string }>
  >([]);
  const [simSlug, setSimSlug] = useState("");
  const [simError, setSimError] = useState<string | null>(null);
  const [simPreset, setSimPreset] = useState<
    "balanced" | "high_exploration" | "boundary_focused" | "reserved"
  >("balanced");
  const [simResult, setSimResult] = useState<ScoredAssessmentResult | null>(
    null,
  );
  const [simLoading, setSimLoading] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadWorkspace = async () => {
    const res = await fetch("/api/studio");
    if (res.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setAssessments(data.assessments || []);
      const available = data.simulationAssessments || [];
      setSimulationAssessments(available);
      setSimSlug((current) =>
        available.some((a: { slug: string }) => a.slug === current)
          ? current
          : available[0]?.slug || "",
      );
      setAuditItems(data.editorialAudit || []);
      setTelemetry(data.telemetry || null);
      setTemplates(data.emailTemplates || null);
      setAuthenticated(true);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadWorkspace();
    }
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Sign in failed.");
      } else {
        setPassphrase("");
        setAuthenticated(true);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  const handleRunSimulator = async () => {
    setSimLoading(true);
    setSimError(null);
    setSimResult(null);
    try {
      const res = await fetch("/api/admin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentSlug: simSlug, preset: simPreset }),
      });
      const data = await res.json();
      if (res.ok && data.simulatedResult) {
        setSimResult(data.simulatedResult);
      } else
        setSimError(
          data.error ||
            "The simulation could not run. Try another published assessment.",
        );
    } catch {
      setSimError("The simulation could not connect. Try again.");
    } finally {
      setSimLoading(false);
    }
  };

  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templates) return;
    const res = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "email_templates", templates }),
    });
    if (res.ok) {
      setSaveMessage("Transactional email templates updated cleanly.");
      loadWorkspace();
    }
  };

  const toggleEditorialVerification = async (item: ReferenceChartItem) => {
    const nextStatus =
      item.editorialStatus === "flagged_obscured"
        ? "verified_readable"
        : "flagged_obscured";
    await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "editorial_update",
        chartId: item.chartId,
        editorialStatus: nextStatus,
        editorialNotes: item.editorialNotes,
      }),
    });
    loadWorkspace();
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div
          className="rounded-3xl border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-strong)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <Lock className="h-8 w-8 text-[var(--accent-plum)]" />
          <h1 className="mt-4 font-display text-4xl text-[var(--ink-primary)]">
            {heading}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
            Protected administration area for managing assessments, running
            deterministic scoring simulations, customizing email templates, and
            reviewing non-PII system telemetry.
          </p>

          {!keyConfigured ? (
            <p className="mt-5 rounded-2xl border border-[var(--accent-rose)] bg-[var(--bg-subtle)] p-4 text-xs text-[var(--ink-primary)]">
              <code>BETWEEN_US_ADMIN_KEY</code> is not configured in this
              production server environment. Set a strong administrator
              passphrase (8+ characters) to unlock access.
            </p>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {devFallbackActive && (
                <p className="rounded-2xl border border-[var(--accent-gold)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--ink-secondary)]">
                  Local development fallback active (
                  <code>BETWEEN_US_ADMIN_KEY</code> defaults to{" "}
                  <code>between-us-local-dev-admin</code> when unset outside
                  production).
                </p>
              )}

              <label className="block text-xs">
                <span className="font-semibold text-[var(--ink-primary)]">
                  Administrator Passphrase
                </span>
                <input
                  type="password"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter admin key..."
                  className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
                  style={{ borderColor: "var(--border-strong)" }}
                />
              </label>

              {authError && (
                <p className="text-xs font-medium text-[var(--accent-rose)]">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={signingIn}
                className="w-full rounded-full py-2.5 text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                {signingIn ? "Verifying..." : "Unlock Admin Workspace"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const visibleAudit =
    auditFilter === "all"
      ? auditItems
      : auditItems.filter((i) => i.editorialStatus === auditFilter);

  return (
    <div className="site-shell py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div className="max-w-3xl space-y-2">
          <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            {heading}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            Manage assessments, simulate deterministic scoring, edit
            transactional email copy, review non-PII audit telemetry, and curate
            the reference scatterplot queue.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>

      {saveMessage && (
        <div className="mt-4 rounded-2xl border border-[var(--accent-sage)] bg-[var(--bg-subtle)] p-3 text-xs font-medium text-[var(--accent-sage)]">
          {saveMessage}
        </div>
      )}

      <Tabs.Root value={tab} onValueChange={setTab} className="mt-8">
        <Tabs.List className="flex flex-wrap gap-2 border-b pb-4">
          {[
            { value: "telemetry", label: "Telemetry & Audit", icon: Activity },
            { value: "simulator", label: "Scoring Tester", icon: FlaskConical },
            {
              value: "builder",
              label: `Assessment Builder (${assessments.length})`,
              icon: Sparkles,
            },
            { value: "emails", label: "Email Templates", icon: Mail },
            {
              value: "audit",
              label: `Reference Chart Editorial Queue (${auditItems.filter((i) => i.editorialStatus === "flagged_obscured").length} flagged)`,
              icon: FileSearch,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Tabs.Trigger
                key={item.value}
                value={item.value}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium",
                  tab === item.value
                    ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {item.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* TELEMETRY TAB */}
        <Tabs.Content value="telemetry" className="mt-8 space-y-8">
          {telemetry && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Total Submissions",
                    value: telemetry.totalSubmissions,
                  },
                  {
                    label: "Partner Invitations",
                    value: telemetry.totalInvitations,
                  },
                  {
                    label: "Compatibility Reports",
                    value: telemetry.totalCompatibilities,
                  },
                  {
                    label: "Email Deliveries Logged",
                    value: telemetry.totalEmailDeliveries,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border p-5"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <p className="text-xs text-[var(--ink-muted)]">
                      {stat.label}
                    </p>
                    <p className="font-mono-tabular mt-1 text-3xl font-bold text-[var(--ink-primary)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6">
                  <h2 className="font-display text-2xl text-[var(--ink-primary)]">
                    Per-Assessment Opt-In Volume (Non-PII)
                  </h2>
                  <div className="mt-4 max-h-80 space-y-2 overflow-y-auto text-xs">
                    {Object.entries(telemetry.byAssessment).length === 0 ? (
                      <p className="text-[var(--ink-muted)]">
                        No submissions recorded yet.
                      </p>
                    ) : (
                      Object.entries(telemetry.byAssessment).map(
                        ([s, counts]) => (
                          <div
                            key={s}
                            className="flex items-center justify-between rounded-xl border bg-[var(--bg-canvas)] px-3 py-2"
                          >
                            <span className="font-medium text-[var(--ink-primary)]">
                              {s}
                            </span>
                            <span className="font-mono-tabular text-[var(--ink-secondary)]">
                              {counts.total} total · {counts.optedIn} opted in
                            </span>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6">
                  <h2 className="font-display text-2xl text-[var(--ink-primary)]">
                    Recent Non-PII Audit Events
                  </h2>
                  <div className="mt-4 max-h-80 space-y-2 overflow-y-auto text-xs">
                    {telemetry.recentAuditEvents.length === 0 ? (
                      <p className="text-[var(--ink-muted)]">No events yet.</p>
                    ) : (
                      telemetry.recentAuditEvents.map((ev) => (
                        <div
                          key={ev.eventId}
                          className="rounded-xl border bg-[var(--bg-canvas)] p-3"
                        >
                          <div className="flex justify-between">
                            <strong className="font-mono-tabular text-[var(--accent-plum)]">
                              {ev.eventType}
                            </strong>
                            <span className="text-[11px] text-[var(--ink-muted)]">
                              {formatShortDate(ev.createdAt)}
                            </span>
                          </div>
                          {ev.detail && (
                            <p className="mt-1 text-[var(--ink-secondary)]">
                              {ev.detail}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Tabs.Content>

        {/* SIMULATOR TAB */}
        <Tabs.Content value="simulator" className="mt-8 space-y-6">
          <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6 sm:p-8">
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Deterministic Scoring Tester
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Run synthetic persona profiles across any of the{" "}
              {simulationAssessments.length} published assessments without
              writing records to storage.
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-3 text-xs">
              <label className="block flex-1 min-w-[200px]">
                <span className="text-[var(--ink-muted)]">
                  Target Assessment
                </span>
                <select
                  value={simSlug}
                  onChange={(e) => {
                    setSimSlug(e.target.value);
                    setSimResult(null);
                    setSimError(null);
                  }}
                  className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                >
                  {simulationAssessments.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block min-w-[180px]">
                <span className="text-[var(--ink-muted)]">
                  Synthetic Persona Preset
                </span>
                <select
                  value={simPreset}
                  onChange={(e) =>
                    setSimPreset(e.target.value as typeof simPreset)
                  }
                  className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                >
                  <option value="balanced">Balanced / Moderate</option>
                  <option value="high_exploration">
                    High Exploration &amp; Intensity
                  </option>
                  <option value="boundary_focused">
                    Boundary-Conscious / Selective
                  </option>
                  <option value="reserved">Quiet / Low Intensity</option>
                </select>
              </label>

              <button
                type="button"
                disabled={simLoading || !simSlug}
                onClick={handleRunSimulator}
                className="rounded-full px-5 py-2.5 text-xs font-medium disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                {simLoading ? "Simulating..." : "Run Simulator"}
              </button>
            </div>

            {simError && (
              <p
                role="alert"
                className="mt-4 text-sm text-[var(--accent-rose)]"
              >
                {simError}
              </p>
            )}
            {simResult && (
              <div className="mt-6 space-y-4 rounded-2xl border bg-[var(--bg-canvas)] p-5 text-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
                  <div>
                    <p className="text-[var(--ink-muted)]">
                      Computed Archetype
                    </p>
                    <p className="font-display text-2xl text-[var(--ink-primary)]">
                      {simResult.profile.archetypeName}
                    </p>
                  </div>
                  <span className="font-mono-tabular text-[var(--accent-plum)]">
                    {simResult.answeredCount} items ·{" "}
                    {simResult.coveragePercent}% coverage
                  </span>
                </div>
                <p className="text-[var(--ink-secondary)]">
                  {simResult.profile.summaryParagraph}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {simResult.radar.map((d) => (
                    <div
                      key={d.dimension}
                      className="rounded-xl border bg-[var(--bg-elevated)] p-3"
                    >
                      <span className="text-[var(--ink-muted)]">{d.label}</span>
                      <p className="font-mono-tabular mt-0.5 text-lg font-semibold text-[var(--ink-primary)]">
                        {d.score}/100
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Tabs.Content>

        {/* ASSESSMENT BUILDER TAB */}
        <Tabs.Content value="builder" className="mt-8">
          <AssessmentBuilder
            assessments={assessments}
            onSaved={loadWorkspace}
          />
        </Tabs.Content>

        {/* EMAIL TEMPLATES TAB */}
        <Tabs.Content value="emails" className="mt-8">
          {templates && (
            <form
              onSubmit={handleSaveTemplates}
              className="space-y-4 rounded-3xl border bg-[var(--bg-elevated)] p-6 sm:p-8"
            >
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Transactional Email Templates
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-xs">
                  <span className="font-medium text-[var(--ink-primary)]">
                    Secure Link Subject
                  </span>
                  <input
                    type="text"
                    value={templates.secureLinkSubject}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        secureLinkSubject: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-medium text-[var(--ink-primary)]">
                    Summary Subject
                  </span>
                  <input
                    type="text"
                    value={templates.summarySubject}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        summarySubject: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                  />
                </label>
              </div>
              <label className="block text-xs">
                <span className="font-medium text-[var(--ink-primary)]">
                  Secure Link Intro
                </span>
                <textarea
                  rows={2}
                  value={templates.secureLinkIntro}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      secureLinkIntro: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                />
              </label>
              <label className="block text-xs">
                <span className="font-medium text-[var(--ink-primary)]">
                  Summary Mode Intro
                </span>
                <textarea
                  rows={2}
                  value={templates.summaryIntro}
                  onChange={(e) =>
                    setTemplates({ ...templates, summaryIntro: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                />
              </label>
              <label className="block text-xs">
                <span className="font-medium text-[var(--ink-primary)]">
                  PDF Attachment Privacy Notice
                </span>
                <textarea
                  rows={2}
                  value={templates.pdfDisclaimer}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      pdfDisclaimer: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                />
              </label>
              <button
                type="submit"
                className="rounded-full px-5 py-2.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Save Email Copy
              </button>
            </form>
          )}
        </Tabs.Content>

        {/* REFERENCE CHART EDITORIAL AUDIT TAB */}
        <Tabs.Content value="audit" className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-xs leading-relaxed text-[var(--ink-secondary)]">
              Every point visible on the supplied &ldquo;Marketplace of Sex
              Acts&rdquo; reference scatterplot is transcribed verbatim below.
              Any redacted term carries <code>[OBSCURED]</code> and never
              guesses missing phrasing.
            </p>
            <div className="flex gap-1.5">
              {(
                [
                  ["flagged_obscured", "Flagged Obscured"],
                  ["verified_readable", "Readable Verified"],
                  ["all", "All 62 Items"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAuditFilter(key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    auditFilter === key
                      ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {visibleAudit.map((item) => (
              <div
                key={item.chartId}
                className="rounded-2xl border bg-[var(--bg-elevated)] p-4 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono-tabular text-[11px] text-[var(--ink-muted)]">
                      {item.chartId} · (X={item.approxXEncountered}, Y=
                      {item.approxYEnjoyment})
                    </span>
                    <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">
                      &ldquo;{item.exactReadableTranscription}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEditorialVerification(item)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-gold)]"
                  >
                    <Check className="h-3 w-3" />
                    {item.editorialStatus === "flagged_obscured"
                      ? "Needs Review"
                      : "Verified"}
                  </button>
                </div>
                <p className="mt-2 text-[var(--ink-secondary)]">
                  {item.editorialNotes}
                </p>
              </div>
            ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
