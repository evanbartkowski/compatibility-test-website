"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Lock, ShieldCheck } from "lucide-react";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import type {
  AssessmentDefinition,
  AssessmentMode,
  SharingPreferences,
} from "@/lib/assessment/types";

interface PartnerInviteFlowProps {
  token: string;
  creatorDisplayName: string;
  expiresAt: string;
  mode: AssessmentMode;
  assessment: AssessmentDefinition;
  existingCompatibilityId?: string;
  savedResults?: Array<{ id: string; createdAt: string; mode: string }>;
}

export function PartnerInviteFlow({
  token,
  creatorDisplayName,
  expiresAt,
  mode,
  assessment,
  existingCompatibilityId,
  savedResults = [],
}: PartnerInviteFlowProps) {
  const router = useRouter();
  const [acceptedIntro, setAcceptedIntro] = useState(false);
  const [savedId, setSavedId] = useState(""),
    [consented, setConsented] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [sharing, setSharing] = useState<SharingPreferences>({
    shareCategoryScores: true,
    shareAlignedHighlights: true,
    shareComplementaryHighlights: true,
    shareSharedCuriosities: false,
    shareHighLevelBoundariesWithoutDetails: true,
    neverExposeRawPrivateAnswers: true,
    shareGameAnswerDetails: false,
  });

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
            This invitation with {creatorDisplayName} has already been
            completed.
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
          You will answer a complementary perspective of the{" "}
          <strong>{assessment.title}</strong> questionnaire ({itemCount}{" "}
          {mode === "quick" && assessment.supportsQuickMode !== false
            ? "quick-discovery items"
            : "complete items"}
          ). Your private responses are never sent straight to your partner;
          compatibility is calculated through mutual sharing filters that
          respect firm boundaries and private reveal locks unconditionally.
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

        {savedResults.length > 0 && (
          <section className="saved-comparison-choice">
            <h2 className="font-display text-2xl">
              Already explored this test?
            </h2>
            <p className="text-sm mt-2">
              Reuse your own result from the same test and scoring version. If
              either result is quick, only the shared quick questions are
              compared.
            </p>
            <label className="form-field mt-4">
              <span>Choose a compatible saved result</span>
              <select
                value={savedId}
                onChange={(e) => setSavedId(e.target.value)}
              >
                <option value="">Select an attempt</option>
                {savedResults.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                    {s.mode === "quick" ? "Quick" : "Deep"}
                  </option>
                ))}
              </select>
            </label>
            <div className="share-selection-fields">
              {(
                [
                  "shareCategoryScores",
                  "shareAlignedHighlights",
                  "shareComplementaryHighlights",
                  "shareSharedCuriosities",
                  "shareHighLevelBoundariesWithoutDetails",
                  "shareGameAnswerDetails",
                ] as const
              ).map((key) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={Boolean(sharing[key])}
                    onChange={(e) =>
                      setSharing((old) => ({ ...old, [key]: e.target.checked }))
                    }
                  />
                  {
                    {
                      shareCategoryScores: "Category scores",
                      shareAlignedHighlights: "Alignment & differences",
                      shareComplementaryHighlights: "Complementary highlights",
                      shareSharedCuriosities: "Mutual interests",
                      shareHighLevelBoundariesWithoutDetails:
                        "High level boundary notice",
                      shareGameAnswerDetails:
                        "Individual game answers, only if both agree",
                    }[key]
                  }
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                />
                I am 18 or older, accept the privacy terms, and authorize this
                comparison of my selected result.
              </label>
            </div>
            <button
              className="button button-primary mt-4"
              disabled={!savedId || !consented || busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const response = await fetch(`/api/invitations/${token}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      existingResultId: savedId,
                      consent: {
                        confirmedAdult18Plus: true,
                        acceptedPrivacyTerms: true,
                        optInCommunityStats: false,
                        consentedAt: new Date().toISOString(),
                      },
                      partnerSharing: sharing,
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error);
                  router.push(`/compatibility/${data.compatibilityId}`);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Unable to compare.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Comparing…" : "Compare my saved result"}
            </button>
            {error && (
              <p
                role="alert"
                className="mt-3 text-sm text-[var(--accent-rose)]"
              >
                {error}
              </p>
            )}
          </section>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs font-medium text-[var(--ink-muted)] hover:underline"
          >
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
            Continue to Consent &amp; Questions{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
