"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Send } from "lucide-react";
import { brandConfig } from "@/config/brand";
import type { MultiRaterSubmissionRecord, QuestionAnswer } from "@/lib/assessment/types";

interface ObserverQuestion {
  id: string;
  order: number;
  sectionTitle: string;
  prompt: string;
  helperText: string;
}

export function PeerFeedbackClient({
  token,
  ownerDisplayName,
  minRespondents,
  questions,
}: {
  token: string;
  ownerDisplayName: string;
  minRespondents: number;
  questions: ObserverQuestion[];
}) {
  const [relationshipType, setRelationshipType] =
    useState<MultiRaterSubmissionRecord["relationshipType"]>("close_friend");
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedState, setSubmittedState] = useState<{
    respondentCount: number;
    minRespondents: number;
  } | null>(null);

  const setScore = (questionId: string, score: 1 | 2 | 3 | 4 | 5) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        enjoyment: score,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < Math.min(questions.length, 5)) {
      setError("Please answer at least 5 items so averages stay meaningful.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/feedback/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipType,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit feedback.");
      } else {
        setSubmittedState({
          respondentCount: data.respondentCount,
          minRespondents: data.minRespondents,
        });
      }
    } catch {
      setError("Network error while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedState) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div
          className="rounded-3xl border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--accent-sage)",
          }}
        >
          <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--accent-sage)]" />
          <h1 className="mt-4 font-display text-4xl text-[var(--ink-primary)]">
            Thank You · Submitted Anonymously
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            Your individual ratings cannot be viewed by {ownerDisplayName}. Aggregated averages only
            unlock after at least {submittedState.minRespondents} trusted people respond (currently{" "}
            <strong className="font-mono-tabular text-[var(--ink-primary)]">
              {submittedState.respondentCount}/{submittedState.minRespondents}
            </strong>
            ).
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Explore {brandConfig.name} Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div
        className="rounded-3xl border p-6 sm:p-8"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <h1 className="font-display text-4xl text-[var(--ink-primary)]">
          Anonymous Perspective for {ownerDisplayName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
          {ownerDisplayName} invited you to share honest perspective on how they come across in close
          relationships.
        </p>
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border bg-[var(--bg-subtle)] p-4 text-xs text-[var(--ink-primary)]">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-sage)]" />
          <span>
            Strict Anonymity Guarantee: Individual forms are never shown. Combined averages unlock
            only after at least <strong>{minRespondents}</strong> respondents complete this link. No
            account or email required.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <label className="block text-xs">
            <span className="font-semibold text-[var(--ink-primary)]">
              How do you know {ownerDisplayName}?
            </span>
            <select
              value={relationshipType}
              onChange={(e) =>
                setRelationshipType(e.target.value as MultiRaterSubmissionRecord["relationshipType"])
              }
              className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="partner">Partner / Dating closely</option>
              <option value="close_friend">Close Friend</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague / Peer</option>
            </select>
          </label>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const current = answers[q.id]?.enjoyment;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border p-4 sm:p-5"
                  style={{
                    backgroundColor: "var(--bg-canvas)",
                    borderColor: current ? "var(--accent-plum)" : "var(--border-hairline)",
                  }}
                >
                  <p className="text-xs text-[var(--ink-muted)]">
                    Item {idx + 1} · {q.sectionTitle}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">{q.prompt}</p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {([1, 2, 3, 4, 5] as const).map((score) => {
                      const active = current === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setScore(q.id, score)}
                          aria-pressed={active}
                          className="min-h-[44px] rounded-xl border px-2 py-2 text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: active ? "var(--accent-plum)" : "var(--bg-elevated)",
                            borderColor: active ? "var(--accent-plum)" : "var(--border-hairline)",
                            color: active
                              ? "var(--accent-plum-contrast)"
                              : "var(--ink-primary)",
                          }}
                        >
                          {score}
                          <span className="mt-0.5 block text-[10px] opacity-80">
                            {score === 1
                              ? "Rarely"
                              : score === 3
                                ? "Moderate"
                                : score === 5
                                  ? "Strong"
                                  : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {error && <p className="text-xs font-medium text-[var(--accent-rose)]">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <span className="font-mono-tabular text-xs text-[var(--ink-muted)]">
              {answeredCount} of {questions.length} rated
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting Anonymously..." : "Submit Anonymous Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
