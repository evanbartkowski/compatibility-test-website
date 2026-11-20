"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Download,
  Lock,
  LogOut,
  Save,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { getCurrentIdToken } from "@/lib/firebase/client";
import type { UserPrivacyPreferences } from "@/lib/assessment/types";

export function AccountPrivacyClient({
  initialPrefs,
  initialSubmissionCount,
  initialInvitationCount,
}: {
  initialPrefs: UserPrivacyPreferences;
  initialSubmissionCount: number;
  initialInvitationCount: number;
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [subCount, setSubCount] = useState(initialSubmissionCount);
  const [invCount, setInvCount] = useState(initialInvitationCount);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [deletedBanner, setDeletedBanner] = useState(false);

  // Firebase Auth state
  const { user: firebaseUser, firebaseEnabled, openAuthModal, signOut } = useOptionalAuth();

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/account/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: prefs.displayName || "",
          defaultCommunityOptIn: prefs.defaultCommunityOptIn,
          notifyNewTests: prefs.notifyNewTests,
          notifyPartnerReports: prefs.notifyPartnerReports,
        }),
      });
      const data = await res.json();
      if (res.ok && data.prefs) {
        setPrefs(data.prefs);
        setStatusMsg("Privacy and notification preferences saved.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBulkExport = async () => {
    const res = await fetch("/api/dashboard");
    const data = res.ok ? await res.json() : { submissions: [], invitations: [] };
    const bundle = {
      exportedAt: new Date().toISOString(),
      preferences: prefs,
      submissions: data.submissions || [],
      invitations: data.invitations || [],
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truth-desire-full-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteEverything = async () => {
    await fetch("/api/account/privacy", { method: "DELETE" });
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
    setSubCount(0);
    setInvCount(0);
    setDeletedBanner(true);
    setStatusMsg("All stored session assessments, invitations, and drafts were erased.");
  };

  const handleClaimGuestData = async () => {
    if (!firebaseUser) return;
    const idToken = await getCurrentIdToken(true);
    const res = await fetch("/api/account/claim-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken: idToken || undefined,
        email: firebaseUser.email || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg(
        `Linked ${data.claimedSubmissions} assessment(s) and ${data.claimedInvitations} invitation(s) to your account.`
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
          Account &amp; Privacy Settings
        </h1>
        <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
          Manage storage, community opt-in defaults, optional cloud sync, full JSON exports, or
          permanent deletion.
        </p>
      </div>

      {statusMsg && (
        <div
          role="status"
          className="mt-6 flex items-center gap-2.5 rounded-2xl border p-4 text-xs text-[var(--ink-primary)]"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: deletedBanner ? "var(--accent-rose)" : "var(--accent-sage)",
          }}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent-sage)]" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Privacy & Notifications Form */}
        <form
          onSubmit={handleSavePrefs}
          className="space-y-6 rounded-3xl border p-6 sm:p-8 lg:col-span-7"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--accent-plum)]" />
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Consent &amp; Sharing Defaults
            </h2>
          </div>

          <label className="block text-xs">
            <span className="font-medium text-[var(--ink-primary)]">
              Preferred First Name for Partner &amp; 360° Invites
            </span>
            <input
              type="text"
              maxLength={40}
              placeholder="Optional first name or nickname"
              value={prefs.displayName || ""}
              onChange={(e) => setPrefs((p) => ({ ...p, displayName: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <div className="space-y-3 text-xs">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border bg-[var(--bg-canvas)] p-3.5">
              <input
                type="checkbox"
                checked={prefs.defaultCommunityOptIn}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, defaultCommunityOptIn: e.target.checked }))
                }
                className="mt-0.5 accent-[var(--accent-plum)]"
              />
              <span>
                <strong className="block text-[var(--ink-primary)]">
                  Default Community Insights Opt-In
                </strong>
                <span className="text-[var(--ink-secondary)]">
                  Include new submissions in anonymous aggregate statistics (still requires n &ge; 50
                  before display; you can toggle per submission).
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border bg-[var(--bg-canvas)] p-3.5">
              <input
                type="checkbox"
                checked={prefs.notifyPartnerReports}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, notifyPartnerReports: e.target.checked }))
                }
                className="mt-0.5 accent-[var(--accent-plum)]"
              />
              <span>
                <strong className="block text-[var(--ink-primary)]">
                  Notify When Partner Compatibility Unlocks
                </strong>
                <span className="text-[var(--ink-secondary)]">
                  Applies when an email address is verified and transactional mail is active.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border bg-[var(--bg-canvas)] p-3.5">
              <input
                type="checkbox"
                checked={prefs.notifyNewTests}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, notifyNewTests: e.target.checked }))
                }
                className="mt-0.5 accent-[var(--accent-plum)]"
              />
              <span>
                <strong className="block text-[var(--ink-primary)]">
                  Occasional Platform Research Releases
                </strong>
                <span className="text-[var(--ink-secondary)]">
                  Optional updates when new validated assessments or features launch.
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium disabled:opacity-50"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Privacy Preferences"}
          </button>
        </form>

        {/* Account Sync + Data Control Sidebar */}
        <aside className="space-y-6 lg:col-span-5">
          <div
            className="rounded-3xl border p-6"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[var(--accent-sage)]" />
              <h2 className="font-display text-2xl text-[var(--ink-primary)]">
                Your Stored Data
              </h2>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-secondary)]">
              Current browser session holds{" "}
              <strong className="font-mono-tabular text-[var(--ink-primary)]">{subCount}</strong>{" "}
              completed assessment{subCount === 1 ? "" : "s"} and{" "}
              <strong className="font-mono-tabular text-[var(--ink-primary)]">{invCount}</strong>{" "}
              partner invitation{invCount === 1 ? "" : "s"}.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleBulkExport}
                className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <Download className="h-3.5 w-3.5" /> Export All Data (JSON Bundle)
              </button>

              <button
                type="button"
                onClick={handleDeleteEverything}
                className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: "var(--accent-rose)" }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete All Stored Data &amp; Drafts
              </button>
            </div>
          </div>

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
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                Running cleanly in <strong>Private Guest Session Mode</strong> (HttpOnly session
                cookie + private server persistence). Add Firebase client credentials to enable
                cross-device cloud login &amp; guest migration.
              </p>
            ) : firebaseUser ? (
              <div className="mt-3 space-y-3 text-xs">
                <p className="text-[var(--ink-primary)]">
                  Signed in as <strong>{firebaseUser.email || firebaseUser.uid}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleClaimGuestData}
                    className="rounded-full px-4 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    Claim Guest Session Results
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-1 rounded-full border px-3.5 py-2 text-xs font-medium text-[var(--ink-primary)]"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3 text-xs">
                <p className="leading-relaxed text-[var(--ink-secondary)]">
                  Signing in is completely optional. Connect an email account or Google sign-in via{" "}
                  <span className="font-medium text-[var(--ink-primary)]">truth-desire</span> to
                  carry your results and partner reports across devices.
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
        </aside>
      </div>
    </div>
  );
}
