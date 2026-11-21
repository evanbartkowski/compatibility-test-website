"use client";
import { useState } from "react";
import {
  Download,
  LockKeyhole,
  LogOut,
  Save,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { ConfirmAction } from "@/components/ConfirmAction";
import type { UserPrivacyPreferences } from "@/lib/assessment/types";
function clearDrafts() {
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith("between_us_draft_")) localStorage.removeItem(key);
  } catch {}
}
export function AccountPrivacyClient({
  initialPrefs,
  initialSubmissionCount,
  initialInvitationCount,
}: {
  initialPrefs: UserPrivacyPreferences;
  initialSubmissionCount: number;
  initialInvitationCount: number;
}) {
  const [prefs, setPrefs] = useState(initialPrefs),
    [counts, setCounts] = useState({
      submissions: initialSubmissionCount,
      invitations: initialInvitationCount,
    }),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const auth = useOptionalAuth();
  const eraseData = async () => {
    const response = await fetch("/api/account/privacy", { method: "DELETE" });
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await response.json().catch(() => null);
      if (!response.ok && data)
        throw new Error(data.error || "Unable to erase the data.");
    }
    clearDrafts();
    setCounts({ submissions: 0, invitations: 0 });
    setStatus(
      "Saved results, private reports, related shared links and local drafts have been erased.",
    );
  };
  const deleteAccount = async () => {
    const { getCurrentIdToken } = await import("@/lib/firebase/client");
    const idToken = await getCurrentIdToken(true);
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, confirmation: "DELETE" }),
    });
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await response.json().catch(() => null);
      if (!response.ok && data)
        throw new Error(data.error || "Unable to delete the account.");
    }
    clearDrafts();
    await auth.signOut();
    setCounts({ submissions: 0, invitations: 0 });
    setStatus(
      "Your account and saved app data were deleted. Existing account sessions have been revoked.",
    );
  };
  return (
    <div className="site-shell settings-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <span className="intro-pill">
          <LockKeyhole size={13} />
          Your information, your decisions
        </span>
        <h1 className="font-display text-4xl sm:text-5xl mt-5">
          Account & privacy.
        </h1>
        <p className="text-[var(--ink-muted)] leading-relaxed mt-4">
          Choose how new results are stored and used. Your answers are private
          unless you explicitly select fields to share.
        </p>
      </header>
      {status && (
        <p role="status" className="studio-notice">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error mt-6">
          {error}
        </p>
      )}
      <div className="grid lg:grid-cols-2 gap-6 mt-9">
        <form
          className="comparison-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/account/privacy", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  displayName: prefs.displayName || "",
                  defaultCommunityOptIn: prefs.defaultCommunityOptIn,
                }),
              });
              const ct = response.headers.get("content-type") || "";
              if (!ct.includes("application/json")) {
                throw new Error("Unable to reach settings server offline.");
              }
              const data = await response.json().catch(() => null);
              if (!response.ok || !data)
                throw new Error(
                  data?.error || "Unable to save your preferences.",
                );
              setPrefs(data.prefs);
              setStatus(
                "Privacy preferences saved. Existing results keep their individual consent settings.",
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to save.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <ShieldCheck size={22} className="text-[var(--accent-plum)]" />
          <h2 className="font-display text-2xl mt-4">Privacy preferences</h2>
          <label className="form-field mt-6">
            <span>Preferred name for invitations</span>
            <input
              autoComplete="nickname"
              maxLength={40}
              value={prefs.displayName || ""}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, displayName: e.target.value }))
              }
            />
          </label>
          <label className="flex gap-3 items-start mt-6 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={prefs.defaultCommunityOptIn}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  defaultCommunityOptIn: e.target.checked,
                }))
              }
            />
            <span>
              Offer anonymous community participation as my default.
              <small className="block text-[var(--ink-muted)] leading-relaxed mt-2">
                You still control consent for each result. Aggregates are
                suppressed below 50 opted-in people in the matching cohort.
                Demographic filters need the same minimum.
              </small>
            </span>
          </label>
          <button className="button button-primary mt-7" disabled={busy}>
            <Save size={15} />
            {busy ? "Saving?" : "Save preferences"}
          </button>
        </form>
        <section className="comparison-panel">
          <h2 className="font-display text-2xl">Your saved information</h2>
          <p className="mt-3">
            {counts.submissions} saved attempts ? {counts.invitations}{" "}
            invitations
          </p>
          <p className="!text-sm mt-4">
            Guest results belong to this browser?s private cookie. An optional
            account links them to your verified identity on this deployment.
            Drafts stay in this browser.
          </p>
          <a
            className="button button-secondary mt-6"
            href="/api/account/export"
            download
          >
            <Download size={15} />
            Export my private data
          </a>
          <div className="mt-5">
            <ConfirmAction
              title="Erase your saved data?"
              description="This permanently removes your attempts, reports, related sharing links and drafts on this device. Your sign-in account remains active. Download your export first if you want a copy."
              confirmLabel="Erase saved data"
              onConfirm={eraseData}
            >
              <Trash2 size={14} />
              Erase results & drafts
            </ConfirmAction>
          </div>
        </section>
        <section className="comparison-panel lg:col-span-2">
          <div className="flex flex-wrap justify-between gap-5 items-start">
            <div>
              <h2 className="font-display text-2xl">Optional account</h2>
              <p className="mt-3">
                {auth.user
                  ? "Signed in as " +
                    (auth.user.email || "your private account")
                  : "Experience every test as a guest. Sign in when you want an account."}
              </p>
            </div>
            {auth.user ? (
              <button
                className="button button-secondary"
                onClick={async () => {
                  try {
                    await auth.signOut();
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  className="button button-secondary"
                  onClick={() => auth.openAuthModal("signin")}
                >
                  Sign in
                </button>
                <button
                  className="button button-primary"
                  onClick={() => auth.openAuthModal("register")}
                >
                  Create account
                </button>
              </div>
            )}
          </div>
          {!auth.firebaseEnabled && (
            <p className="!text-xs mt-4">
              Accounts are unavailable on this deployment until Firebase is
              configured. Guest tests and saving remain available.
            </p>
          )}
          {auth.sessionError && (
            <p role="alert" className="form-error mt-4">
              {auth.sessionError}
            </p>
          )}
          {auth.user && (
            <div className="mt-7 pt-6 border-t">
              <ConfirmAction
                title="Permanently delete your account?"
                description="This erases your saved results, reports, cloud profile and sign-in account, and revokes existing account sessions. Sign out and back in first if your last sign-in was more than five minutes ago. Export any information you want to keep."
                confirmLabel="Delete my account"
                onConfirm={deleteAccount}
              >
                <Trash2 size={14} />
                Delete account permanently
              </ConfirmAction>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
