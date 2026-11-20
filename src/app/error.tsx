"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div
        className="rounded-3xl border p-8"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <h1 className="font-display text-4xl text-[var(--ink-primary)]">
          Something unexpected occurred
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
          {error.message || "We encountered a temporary error loading this view."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
