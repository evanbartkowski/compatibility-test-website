"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Lock, ShieldCheck } from "lucide-react";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import type { AssessmentDefinition, AssessmentMode } from "@/lib/assessment/types";

interface PartnerInviteFlowProps {
  token: string;
  creatorDisplayName: string;
  expiresAt: string;
  mode: AssessmentMode;
  assessment: AssessmentDefinition;
  existingCompatibilityId?: string;
}

export function PartnerInviteFlow({
  token,
  creatorDisplayName,
  expiresAt,
  mode,
  assessment,
  existingCompatibilityId,
}: PartnerInviteFlowProps) {
  const [acceptedIntro, setAcceptedIntro] = useState(false);

  if (existingCompatibilityId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div
          className="rounded-3xl border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h1 className="font-display text-4xl text-[var(--ink-primary)]">
            Compatibility Report Ready
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            This invitation with {creatorDisplayName} has already been completed.
          </p>
          <Link
            href={`/compatibility/${existingCompatibilityId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            View Compatibility Results <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (acceptedIntro) {
    return (
      <AssessmentRunner
        assessment={assessment}
        initialMode={mode}
        perspective="partner"
        inviteToken={token}
        creatorDisplayName={creatorDisplayName}
      />
    );
  }

  const itemCount =
    mode === "quick" && assessment.supportsQuickMode !== false
      ? assessment.questions.filter((q) => q.quickDiscovery).length
      : assessment.questions.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <div
        className="rounded-3xl border p-7 sm:p-10"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-lifted)",
        }}
      >
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
          {creatorDisplayName} invited you to explore how your preferences align
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
          You will answer a complementary perspective of the <strong>{assessment.title}</strong>{" "}
          questionnaire ({itemCount}{" "}
          {mode === "quick" && assessment.supportsQuickMode !== false
            ? "quick-discovery items"
            : "complete items"}
          ). Your private responses are never sent straight to your partner; compatibility is
          calculated through mutual sharing filters that respect firm boundaries and private reveal
          locks unconditionally.
        </p>

        <div
          className="mt-6 grid gap-3 rounded-2xl border p-4 text-xs text-[var(--ink-secondary)] sm:grid-cols-2"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--accent-gold)]" />
            No account required to participate
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent-sage)]" />
            Willingness &amp; boundaries scored separately
          </span>
          <span className="inline-flex items-center gap-2 sm:col-span-2">
            <Clock className="h-4 w-4 text-[var(--accent-plum)]" />
            Link valid until {new Date(expiresAt).toLocaleString()}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xs font-medium text-[var(--ink-muted)] hover:underline">
            Decline &amp; return home
          </Link>
          <button
            type="button"
            onClick={() => setAcceptedIntro(true)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Continue to Consent &amp; Questions <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
