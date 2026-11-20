"use client";

import React from "react";
import type { CompatibilityReport } from "@/lib/assessment/types";

export function PredictionRevealView({
  report,
}: {
  report: CompatibilityReport;
}) {
  if (report.predictionSummary) {
    const ps = report.predictionSummary;
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-[var(--bg-canvas)] p-4">
            <p className="text-xs text-[var(--ink-muted)]">Prediction Accuracy</p>
            <p className="font-mono-tabular mt-1 text-3xl font-semibold text-[var(--accent-plum)]">
              {ps.accuracyPercent}%
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">
              {ps.correctCount} of {ps.totalCompared} guesses nailed
            </p>
          </div>
          {ps.categoryAccuracy.map((ca) => (
            <div key={ca.category} className="rounded-2xl border bg-[var(--bg-canvas)] p-4">
              <p className="text-xs text-[var(--ink-muted)]">{ca.category}</p>
              <p className="font-mono-tabular mt-1 text-2xl font-semibold text-[var(--ink-primary)]">
                {ca.correct}/{ca.total}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">Round score</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-[var(--bg-canvas)] p-5">
            <h3 className="font-display text-2xl text-[var(--accent-sage)]">
              Nailed It ({ps.nailedIt.length})
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              {ps.nailedIt.length === 0 ? (
                <li className="text-[var(--ink-muted)]">No exact matches yet.</li>
              ) : (
                ps.nailedIt.map((n, idx) => (
                  <li key={idx} className="rounded-xl border bg-[var(--bg-elevated)] p-3">
                    <p className="font-medium text-[var(--ink-primary)]">{n.prompt}</p>
                    <p className="mt-1 text-[var(--accent-sage)]">Correct guess: {n.answer}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-2xl border bg-[var(--bg-canvas)] p-5">
            <h3 className="font-display text-2xl text-[var(--accent-gold)]">
              Playful Surprises ({ps.surprises.length})
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              {ps.surprises.length === 0 ? (
                <li className="text-[var(--ink-muted)]">Zero misses! Scary accuracy.</li>
              ) : (
                ps.surprises.map((s, idx) => (
                  <li key={idx} className="rounded-xl border bg-[var(--bg-elevated)] p-3">
                    <p className="font-medium text-[var(--ink-primary)]">{s.prompt}</p>
                    <p className="mt-1 text-[var(--ink-secondary)]">
                      Actual answer: <strong className="text-[var(--ink-primary)]">{s.primaryActual}</strong>
                    </p>
                    <p className="text-[var(--ink-muted)]">Partner guessed: {s.partnerGuess}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (report.voteGameSummary) {
    const vg = report.voteGameSummary;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl text-[var(--ink-primary)]">
            Who Is More Likely To | Vote Breakdown
          </h3>
          <span className="font-mono-tabular text-sm font-semibold text-[var(--accent-plum)]">
            {vg.agreementPercent}% unanimous agreement
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {vg.items.map((item) => (
            <div
              key={item.questionId}
              className="rounded-2xl border p-4 text-xs"
              style={{
                backgroundColor: "var(--bg-canvas)",
                borderColor: item.agreed ? "var(--accent-sage)" : "var(--border-hairline)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-[var(--ink-primary)]">{item.prompt}</p>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: item.agreed
                      ? "color-mix(in srgb, var(--accent-sage) 16%, transparent)"
                      : "var(--bg-subtle)",
                    color: item.agreed ? "var(--accent-sage)" : "var(--ink-muted)",
                  }}
                >
                  {item.agreed ? "Agreed" : "Split"}
                </span>
              </div>
              <p className="mt-2 text-[var(--ink-secondary)]">
                Creator voted: <strong>{item.primaryVote}</strong> · Partner voted:{" "}
                <strong>{item.partnerVote}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
