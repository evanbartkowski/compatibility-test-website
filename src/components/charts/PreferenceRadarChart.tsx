"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { RadarDimensionScore } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

interface OverlaySeries {
  dimension: string;
  label: string;
  primaryScore: number;
  partnerScore: number;
}

interface PreferenceRadarChartProps {
  dimensions: RadarDimensionScore[];
  overlay?: OverlaySeries[];
  primaryLabel?: string;
  partnerLabel?: string;
  interactive?: boolean;
  stacked?: boolean;
  showDetails?: boolean;
  onInspectQuestion?: (questionId: string, dimensionKey: string) => void;
}

export function PreferenceRadarChart({
  dimensions,
  overlay,
  primaryLabel = "Your Profile",
  partnerLabel = "Partner",
  interactive = true,
  stacked = false,
  showDetails = true,
  onInspectQuestion,
}: PreferenceRadarChartProps) {
  dimensions = dimensions.filter((d) => d.answeredCount > 0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [expandedDims, setExpandedDims] = useState<Record<string, boolean>>({});
  const count = overlay ? overlay.length : dimensions.length;

  if (count === 0) {
    return (
      <p className="py-6 text-center text-xs text-[var(--ink-muted)]">
        Dimensional radar hidden or no weighted items available yet.
      </p>
    );
  }

  // Fallback for < 3 axes (e.g., 2-axis attachment continua)
  if (count < 3) {
    const rows = overlay
      ? overlay.map((o) => ({
          dimension: o.dimension,
          label: o.label,
          primary: o.primaryScore,
          partner: o.partnerScore,
        }))
      : dimensions.map((d) => ({
          dimension: d.dimension,
          label: d.label,
          primary: d.score,
          partner: null as number | null,
        }));

    return (
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.dimension} className="space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-[var(--ink-primary)]">
                {r.label}
              </span>
              <span className="font-mono-tabular font-semibold text-[var(--accent-plum)]">
                {r.primary}/100
                {r.partner !== null
                  ? ` · ${partnerLabel}: ${r.partner}/100`
                  : ""}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${r.primary}%`,
                  backgroundColor: "var(--accent-plum)",
                }}
              />
            </div>
            {r.partner !== null && (
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${r.partner}%`,
                    backgroundColor: "var(--accent-cyan)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const cx = 260;
  const cy = 205;
  const maxR = 114;

  const angleFor = (idx: number) => (Math.PI * 2 * idx) / count - Math.PI / 2;

  const pointAt = (idx: number, value0to100: number) => {
    const angle = angleFor(idx);
    const r = (Math.max(0, Math.min(100, value0to100)) / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const toPolygonPoints = (values: number[]) =>
    values
      .map((val, idx) => {
        const pt = pointAt(idx, val);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(" ");

  const primaryValues = overlay
    ? overlay.map((d) => d.primaryScore)
    : dimensions.map((d) => d.score);

  const partnerValues = overlay ? overlay.map((d) => d.partnerScore) : null;

  const labels = overlay
    ? overlay.map((d) => d.label)
    : dimensions.map((d) => d.label);
  const activeDim = dimensions[selectedIndex];

  return (
    <div
      className={cn(
        "grid gap-6",
        !stacked && showDetails && "lg:grid-cols-12 lg:items-center",
      )}
    >
      <div
        className={cn("relative", !stacked && showDetails && "lg:col-span-7")}
      >
        <svg
          viewBox="0 0 520 410"
          role="img"
          aria-label={`${count}-axis preference radar chart`}
          className={cn(
            "mx-auto w-full select-none overflow-visible",
            stacked ? "max-w-[380px]" : "max-w-[480px]",
          )}
        >
          {/* Concentric rings */}
          {[25, 50, 75, 100].map((level) => (
            <polygon
              key={level}
              points={toPolygonPoints(Array(count).fill(level))}
              fill="none"
              stroke="var(--border-hairline)"
              strokeWidth={level === 100 ? "1.2" : "0.9"}
              strokeDasharray={level === 50 ? "3 3" : undefined}
            />
          ))}

          {/* Axis spokes */}
          {labels.map((_, idx) => {
            const outer = pointAt(idx, 100);
            const isSelected = interactive && idx === selectedIndex;
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={
                  isSelected ? "var(--accent-cyan)" : "var(--border-hairline)"
                }
                strokeWidth={isSelected ? "1.6" : "1"}
              />
            );
          })}

          {/* Primary profile polygon */}
          <motion.polygon
            initial={{ opacity: 0.2, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            points={toPolygonPoints(primaryValues)}
            fill="color-mix(in srgb, var(--accent-plum) 22%, transparent)"
            stroke="var(--accent-plum)"
            strokeWidth="2.2"
          />

          {/* Optional partner overlay polygon */}
          {partnerValues && (
            <motion.polygon
              initial={{ opacity: 0.2, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.65,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              points={toPolygonPoints(partnerValues)}
              fill="color-mix(in srgb, var(--accent-cyan) 20%, transparent)"
              stroke="var(--accent-cyan)"
              strokeWidth="2.2"
              strokeDasharray="5 3"
            />
          )}

          {/* Interactive vertices */}
          {primaryValues.map((val, idx) => {
            const pt = pointAt(idx, val);
            const active = interactive && idx === selectedIndex;
            return (
              <g key={`v-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={active ? 6.5 : 4.5}
                  fill={active ? "var(--accent-cyan)" : "var(--accent-plum)"}
                  stroke="var(--bg-elevated)"
                  strokeWidth="1.8"
                  className={interactive ? "cursor-pointer transition-all" : ""}
                  onClick={() => interactive && setSelectedIndex(idx)}
                />
                {partnerValues && (
                  <circle
                    cx={pointAt(idx, partnerValues[idx]).x}
                    cy={pointAt(idx, partnerValues[idx]).y}
                    r={4.2}
                    fill="var(--accent-cyan)"
                    stroke="var(--bg-elevated)"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          {labels.map((label, idx) => {
            const angle = angleFor(idx);
            const rLabel = maxR + 24;
            const lx = cx + rLabel * Math.cos(angle);
            const ly = cy + rLabel * Math.sin(angle);
            const textAnchor =
              Math.abs(Math.cos(angle)) < 0.2
                ? "middle"
                : Math.cos(angle) > 0
                  ? "start"
                  : "end";
            const active = interactive && idx === selectedIndex;
            const shortLabel =
              label.length > 22 ? `${label.slice(0, 20)}...` : label;

            return (
              <text
                key={label}
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                dominantBaseline="central"
                onClick={() => interactive && setSelectedIndex(idx)}
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  interactive ? "cursor-pointer" : "",
                  active
                    ? "fill-[var(--accent-plum)] font-semibold"
                    : "fill-[var(--ink-secondary)]",
                )}
              >
                {shortLabel}
              </text>
            );
          })}
        </svg>

        {overlay && (
          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-[var(--ink-secondary)]">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "var(--accent-plum)" }}
              />
              {primaryLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "var(--accent-cyan)" }}
              />
              {partnerLabel}
            </span>
          </div>
        )}
      </div>

      {/* Dimension breakdown & contributors */}
      {showDetails && (
        <div className={cn("min-w-0 space-y-4", !stacked && "lg:col-span-5")}>
          {interactive && (
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Select radar dimension"
            >
              {labels.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={idx === selectedIndex}
                  onClick={() => setSelectedIndex(idx)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    idx === selectedIndex
                      ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {overlay ? (
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  {overlay[selectedIndex]?.label}
                </h3>
                <span className="font-mono-tabular shrink-0 text-xs text-[var(--ink-muted)]">
                  Dimension comparison
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div
                  className="rounded-xl border p-3.5"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  <p className="text-xs text-[var(--ink-secondary)]">
                    {primaryLabel}
                  </p>
                  <p className="font-mono-tabular mt-1 text-2xl font-semibold text-[var(--accent-plum)]">
                    {overlay[selectedIndex]?.primaryScore}/100
                  </p>
                </div>
                <div
                  className="rounded-xl border p-3.5"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  <p className="text-xs text-[var(--ink-secondary)]">
                    {partnerLabel}
                  </p>
                  <p className="font-mono-tabular mt-1 text-2xl font-semibold text-[var(--accent-cyan)]">
                    {overlay[selectedIndex]?.partnerScore}/100
                  </p>
                </div>
              </div>
            </div>
          ) : (
            activeDim &&
            (() => {
              const isDimExpanded = Boolean(expandedDims[activeDim.dimension]);
              const visibleContributors = isDimExpanded
                ? activeDim.contributors
                : activeDim.contributors.slice(0, 4);
              const hasMoreContributors = activeDim.contributors.length > 4;

              return (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                      {activeDim.label}
                    </h3>
                    <span className="font-mono-tabular shrink-0 text-xl font-semibold text-[var(--accent-plum)]">
                      {activeDim.score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    Computed from {activeDim.answeredCount} weighted question
                    response
                    {activeDim.answeredCount === 1 ? "" : "s"}
                    {onInspectQuestion
                      ? ". Click any answer below to jump to it."
                      : "."}
                  </p>

                  {activeDim.contributors.length > 0 ? (
                    <>
                      <ul className="mt-4 space-y-2.5">
                        {visibleContributors.map((c) => {
                          const content = (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-[var(--ink-primary)] line-clamp-2 text-left">
                                  {c.prompt}
                                </p>
                                <span
                                  className="font-mono-tabular shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{
                                    backgroundColor:
                                      "color-mix(in srgb, var(--accent-plum) 14%, transparent)",
                                    color: "var(--accent-plum)",
                                  }}
                                >
                                  {c.normalizedContribution}/100
                                </span>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[var(--ink-secondary)]">
                                <span className="inline-flex flex-wrap items-center gap-1.5">
                                  <span className="text-[var(--ink-secondary)]">Response: {c.enjoymentLabel}</span>
                                  {c.direction === "inverse" && (
                                    <span
                                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                      style={{
                                        backgroundColor:
                                          "color-mix(in srgb, var(--accent-rose) 15%, transparent)",
                                        color: "var(--accent-rose)",
                                      }}
                                    >
                                      Inverse pull
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono-tabular text-[var(--accent-plum)]">
                                  Importance: {c.importance.replace("_", " ")}
                                </span>
                              </div>
                            </>
                          );

                          return (
                            <li key={c.questionId}>
                              {onInspectQuestion ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onInspectQuestion(
                                      c.questionId,
                                      activeDim.dimension,
                                    )
                                  }
                                  className="w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors hover:border-[var(--accent-plum)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-plum)]"
                                  style={{
                                    backgroundColor: "var(--bg-elevated)",
                                    borderColor: "var(--border-hairline)",
                                  }}
                                >
                                  {content}
                                </button>
                              ) : (
                                <div
                                  className="rounded-xl border px-3.5 py-2.5 text-xs"
                                  style={{
                                    backgroundColor: "var(--bg-elevated)",
                                    borderColor: "var(--border-hairline)",
                                  }}
                                >
                                  {content}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {hasMoreContributors && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDims((prev) => ({
                              ...prev,
                              [activeDim.dimension]: !isDimExpanded,
                            }))
                          }
                          className="mt-3 w-full rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)]"
                          style={{
                            backgroundColor: "var(--bg-elevated)",
                            borderColor: "var(--border-hairline)",
                          }}
                        >
                          {isDimExpanded
                            ? "Show fewer weighted answers"
                            : `Show all ${activeDim.contributors.length} weighted answers`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="mt-4 text-xs text-[var(--ink-muted)]">
                      Answer more items linked to{" "}
                      {activeDim.label.toLowerCase()} to inspect specific
                      contributors.
                    </p>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
