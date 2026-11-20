"use client";

import React, { useState } from "react";
import { Cloud, X } from "lucide-react";
import { useOptionalAuth } from "./AuthProvider";

export function OptionalSyncBanner({ compact = false }: { compact?: boolean }) {
  const { user, loading, firebaseEnabled, openAuthModal } = useOptionalAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading || !firebaseEnabled || user || dismissed) {
    return null;
  }

  return (
    <div
      className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Cloud className="h-4 w-4 shrink-0 text-[var(--accent-plum)]" />
        <p className="text-[var(--ink-secondary)]">
          <strong className="font-medium text-[var(--ink-primary)]">
            {compact ? "Save across devices:" : "Currently in private guest mode."}
          </strong>{" "}
          Optionally sign in with email or Google to keep your saved assessments and couple reports
          across browsers.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal("signin")}
          className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent-plum)",
            color: "var(--accent-plum-contrast)",
          }}
        >
          Sign In to Sync
        </button>
        <button
          type="button"
          aria-label="Dismiss sync suggestion"
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
