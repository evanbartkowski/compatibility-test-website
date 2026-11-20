"use client";

import React from "react";
import type { RadarDimensionScore } from "@/lib/assessment/types";

export function PersonalitySpectrumChart({
  dimensions,
}: {
  dimensions: RadarDimensionScore[];
}) {
  return (
    <div className="space-y-4">
      {dimensions.map((d) => (
        <div
          key={d.dimension}
          className="rounded-2xl border p-4"
          style={{
            backgroundColor: "var(--bg-canvas)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-display text-xl text-[var(--ink-primary)]">{d.label}</h4>
            <span className="font-mono-tabular text-sm font-semibold text-[var(--accent-plum)]">
              {d.score} / 100
            </span>
          </div>
          {d.description && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
              {d.description}
            </p>
          )}

          <div className="relative mt-3.5 h-3 w-full overflow-hidden rounded-full bg-[var(--bg-inset)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${d.score}%`,
                backgroundColor: "var(--accent-plum)",
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[var(--ink-muted)]">
            <span>{d.lowLabel || "Lower expression (0)"}</span>
            <span className="text-right">{d.highLabel || "Stronger expression (100)"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
