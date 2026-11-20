"use client";

import React from "react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import { formatShortDate } from "@/lib/utils";

interface PreferenceHistoryChartProps {
  results: ScoredAssessmentResult[];
}

export function PreferenceHistoryChart({ results }: PreferenceHistoryChartProps) {
  if (results.length < 2) {
    return (
      <p className="text-sm text-[var(--ink-secondary)]">
        Complete at least two runs over time to inspect preference trends across Communication,
        Sensuality, Exploration, and Mutual Attentiveness.
      </p>
    );
  }

  const ordered = [...results].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const width = 600;
  const height = 220;
  const padL = 44;
  const padR = 24;
  const padT = 20;
  const padB = 42;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const dims: Array<{ key: string; label: string; color: string }> = [
    { key: "communication", label: "Communication", color: "var(--accent-plum)" },
    { key: "sensuality", label: "Sensuality", color: "var(--accent-rose)" },
    { key: "exploration", label: "Exploration", color: "var(--accent-gold)" },
    { key: "mutualAttentiveness", label: "Attentiveness", color: "var(--accent-sage)" },
  ];

  const xAt = (idx: number) =>
    padL + (ordered.length === 1 ? plotW / 2 : (idx / (ordered.length - 1)) * plotW);
  const yAt = (score: number) => padT + plotH - (score / 100) * plotH;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={yAt(v)}
              x2={padL + plotW}
              y2={yAt(v)}
              stroke="var(--border-hairline)"
              strokeDasharray={v === 50 ? "3 3" : undefined}
            />
            <text
              x={padL - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              className="font-mono-tabular fill-[var(--ink-muted)] text-[10px]"
            >
              {v}
            </text>
          </g>
        ))}

        {dims.map((dim) => {
          const pts = ordered
            .map((r, i) => {
              const found = r.radar.find((d) => d.dimension === dim.key);
              return `${xAt(i).toFixed(1)},${yAt(found?.score ?? 50).toFixed(1)}`;
            })
            .join(" ");

          return (
            <g key={dim.key}>
              <polyline fill="none" stroke={dim.color} strokeWidth="2.2" points={pts} />
              {ordered.map((r, i) => {
                const found = r.radar.find((d) => d.dimension === dim.key);
                return (
                  <circle
                    key={`${dim.key}-${r.resultId}`}
                    cx={xAt(i)}
                    cy={yAt(found?.score ?? 50)}
                    r={4}
                    fill={dim.color}
                    stroke="var(--bg-elevated)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          );
        })}

        {ordered.map((r, i) => (
          <text
            key={r.resultId}
            x={xAt(i)}
            y={height - 14}
            textAnchor="middle"
            className="fill-[var(--ink-secondary)] text-[10px]"
          >
            {formatShortDate(r.createdAt)} ({r.coveragePercent}% cov)
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-secondary)]">
        {dims.map((d) => (
          <span key={d.key} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-[var(--ink-muted)]">
        Coverage percentages are displayed beneath each run so differences caused by switching
        between Quick Discovery and Complete Assessment are clearly distinguished from preference shifts.
      </p>
    </div>
  );
}
