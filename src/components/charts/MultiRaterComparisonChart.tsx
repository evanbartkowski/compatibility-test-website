"use client";

import React from "react";

export function MultiRaterComparisonChart({
  available,
  respondentCount,
  minRespondents,
  dimensionComparison,
  insights,
}: {
  available: boolean;
  respondentCount: number;
  minRespondents: number;
  dimensionComparison: Array<{
    dimension: string;
    label: string;
    selfScore: number;
    othersMeanScore: number | null;
    gap: number | null;
  }>;
  insights: string[];
}) {
  return (
    <div className="space-y-5">
      {!available ? (
        <div
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <p className="text-sm font-semibold text-[var(--ink-primary)]">
            Collecting Anonymous Peer Responses ({respondentCount} of {minRespondents} minimum)
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
            To protect every individual responder&apos;s anonymity, observer averages remain hidden
            until at least {minRespondents} trusted people submit feedback using your private link.
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-inset)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.round((respondentCount / minRespondents) * 100))}%`,
                backgroundColor: "var(--accent-plum)",
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--ink-secondary)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-plum)]" />
              Your Self-Rating
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-sage)]" />
              Anonymous Observers Mean (n={respondentCount})
            </span>
          </div>

          <div className="space-y-3">
            {dimensionComparison.map((row) => (
              <div
                key={row.dimension}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-canvas)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium text-sm text-[var(--ink-primary)]">{row.label}</span>
                  <span className="font-mono-tabular text-[var(--ink-secondary)]">
                    Self {row.selfScore} vs. Peers {row.othersMeanScore ?? "--"}
                    {row.gap !== null ? ` (Gap ${row.gap})` : ""}
                  </span>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${row.selfScore}%`, backgroundColor: "var(--accent-plum)" }}
                    />
                  </div>
                  {row.othersMeanScore !== null && (
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.othersMeanScore}%`,
                          backgroundColor: "var(--accent-sage)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {insights.length > 0 && (
            <ul className="space-y-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
              {insights.map((ins, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border px-3.5 py-2.5"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  {ins}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
