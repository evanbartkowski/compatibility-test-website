"use client";

import React from "react";
import type { CommunityComparisonItem } from "@/lib/assessment/types";

interface CommunityComparisonChartProps {
  items: CommunityComparisonItem[];
  minimumThreshold: number;
  isSyntheticDemo: boolean;
}

export function CommunityComparisonChart({
  items,
  minimumThreshold,
  isSyntheticDemo,
}: CommunityComparisonChartProps) {
  const rated = items.filter((i) => i.userRating !== null);

  if (rated.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-secondary)]">
        Provide numeric enjoyment ratings (1 to 5) to compare your answers with community averages.
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {rated.slice(0, 16).map((item) => {
        const userPct = ((item.userRating! - 1) / 4) * 100;
        const commPct =
          item.available && item.communityMean !== null
            ? ((item.communityMean - 1) / 4) * 100
            : null;

        return (
          <div
            key={item.questionId}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
              <p className="text-sm font-medium text-[var(--ink-primary)]">{item.prompt}</p>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <span className="font-mono-tabular font-semibold text-[var(--accent-plum)]">
                  You: {item.userRating}/5
                </span>
                {item.available && item.communityMean !== null ? (
                  <span className="font-mono-tabular text-[var(--ink-secondary)]">
                    Sample avg: {item.communityMean}/5 (n={item.respondentCount})
                  </span>
                ) : (
                  <span className="text-[var(--ink-muted)]">
                    Need n &ge; {minimumThreshold} (currently {item.respondentCount})
                  </span>
                )}
              </div>
            </div>

            <div
              className="relative mt-3 h-3 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--bg-subtle)" }}
            >
              {commPct !== null && (
                <div
                  title={`Community mean: ${item.communityMean}/5`}
                  className="absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded-full"
                  style={{
                    left: `${Math.max(2, Math.min(98, commPct))}%`,
                    backgroundColor: "var(--accent-gold)",
                  }}
                />
              )}
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(4, userPct)}%`,
                  backgroundColor: "color-mix(in srgb, var(--accent-plum) 70%, transparent)",
                }}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-secondary)]">
              <span>{item.sectionTitle}</span>
              {item.available && item.percentile !== null ? (
                <span>
                  {isSyntheticDemo ? "[Synthetic Demo] " : ""}
                  Higher than {item.percentile}% of eligible responses
                  {item.difference !== null &&
                    ` (${item.difference > 0 ? "+" : ""}${item.difference} vs. mean)`}
                </span>
              ) : (
                <span>Not enough community responses yet</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
