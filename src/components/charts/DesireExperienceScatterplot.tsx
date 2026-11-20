"use client";

import React, { useMemo, useState } from "react";
import { RotateCcw, Table2, ZoomIn, ZoomOut } from "lucide-react";
import type { ImportanceLevel, QuestionSectionId, ScatterPoint } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

interface DesireExperienceScatterplotProps {
  points: ScatterPoint[];
  experienceUnratedCount: number;
}

const IMPORTANCE_COLORS: Record<ImportanceLevel, string> = {
  essential: "var(--accent-plum)",
  important: "var(--accent-gold)",
  nice_to_have: "var(--accent-mauve)",
  not_important: "var(--ink-muted)",
};

const QUADRANT_LABELS: Record<ScatterPoint["quadrant"], string> = {
  high_desire_low_experience: "Love it · Rarely experienced",
  high_desire_high_experience: "Love it · Frequently experienced",
  low_desire_high_experience: "Dislike · Frequently experienced",
  low_desire_low_experience: "Dislike · Rarely experienced",
  neutral: "Neutral / Middle band",
};

export function DesireExperienceScatterplot({
  points,
  experienceUnratedCount,
}: DesireExperienceScatterplotProps) {
  const [sectionFilter, setSectionFilter] = useState<QuestionSectionId | "all">("all");
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint | null>(points[0] || null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number } | null>(null);
  const [tableView, setTableView] = useState(false);

  const sections = useMemo(() => {
    const map = new Map<QuestionSectionId, string>();
    for (const p of points) map.set(p.sectionId, p.sectionTitle);
    return Array.from(map.entries());
  }, [points]);

  const filtered = useMemo(() => {
    return sectionFilter === "all"
      ? points
      : points.filter((p) => p.sectionId === sectionFilter);
  }, [points, sectionFilter]);

  // Deterministic anti-overlap micro-offset for points sharing integer (experience, enjoyment) coordinates
  const plottedPoints = useMemo(() => {
    const coordCount = new Map<string, number>();
    return filtered.map((p) => {
      const key = `${p.experienceScore}-${p.enjoymentScore}`;
      const occ = coordCount.get(key) || 0;
      coordCount.set(key, occ + 1);
      const angle = occ * 1.45;
      const radius = occ === 0 ? 0 : Math.min(0.24, 0.08 + Math.floor(occ / 4) * 0.06);
      const jx = p.experienceScore + Math.cos(angle) * radius;
      const jy = p.enjoymentScore + Math.sin(angle) * radius;
      return { ...p, jx, jy };
    });
  }, [filtered]);

  const width = 620;
  const height = 420;
  const padL = 64;
  const padR = 28;
  const padT = 38;
  const padB = 56;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toX = (val1to5: number) =>
    padL + ((Math.max(0.55, Math.min(5.45, val1to5)) - 0.55) / 4.9) * plotW;
  const toY = (val1to5: number) =>
    padT + plotH - ((Math.max(0.55, Math.min(5.45, val1to5)) - 0.55) / 4.9) * plotH;

  const midX = toX(3);
  const midY = toY(3);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (points.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <h4 className="font-display text-2xl text-[var(--ink-primary)]">
          Desire vs. Experience Plot Not Available Yet
        </h4>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[var(--ink-secondary)]">
          This scatterplot draws strictly from questions where you answered both how much you
          enjoy something and how often you have experienced it. Because experience frequency is
          optional ({experienceUnratedCount} items left unrated), no points are fabricated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSectionFilter("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sectionFilter === "all"
                ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            )}
          >
            All categories ({points.length})
          </button>
          {sections.map(([secId, secTitle]) => (
            <button
              key={secId}
              type="button"
              onClick={() => setSectionFilter(secId)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                sectionFilter === secId
                  ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                  : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              )}
            >
              {secTitle.split("&")[0].trim()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {!tableView && (
            <>
              <button
                type="button"
                aria-label="Zoom out scatterplot"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Zoom in scatterplot"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Reset scatterplot view"
                onClick={handleReset}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setTableView((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <Table2 className="h-3.5 w-3.5" />
            {tableView ? "Chart View" : "Accessible Table"}
          </button>
        </div>
      </div>

      {tableView ? (
        <div
          className="overflow-x-auto rounded-2xl border"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className="border-b text-xs text-[var(--ink-secondary)]"
                style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--bg-subtle)" }}
              >
                <th className="px-4 py-3 font-medium">Preference</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Enjoyment</th>
                <th className="px-4 py-3 font-medium">Experienced</th>
                <th className="px-4 py-3 font-medium">Quadrant</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-hairline)" }}>
              {filtered.map((p) => (
                <tr key={p.questionId} className="hover:bg-[var(--bg-subtle)]">
                  <td className="px-4 py-3 font-medium text-[var(--ink-primary)]">{p.shortLabel}</td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-secondary)]">{p.sectionTitle}</td>
                  <td className="font-mono-tabular px-4 py-3">{p.enjoymentScore}/5</td>
                  <td className="font-mono-tabular px-4 py-3">{p.experienceScore}/5</td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-secondary)]">
                    {QUADRANT_LABELS[p.quadrant]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div
            className="relative overflow-hidden rounded-2xl border lg:col-span-8"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label="Personal desire versus experience scatterplot"
              className="w-full touch-none select-none"
              onPointerDown={(e) => {
                if (zoom <= 1) return;
                setDragging({ startX: e.clientX - pan.x, startY: e.clientY - pan.y });
              }}
              onPointerMove={(e) => {
                if (!dragging) return;
                setPan({
                  x: Math.max(-180, Math.min(180, e.clientX - dragging.startX)),
                  y: Math.max(-120, Math.min(120, e.clientY - dragging.startY)),
                });
              }}
              onPointerUp={() => setDragging(null)}
              onPointerLeave={() => setDragging(null)}
            >
              <g
                transform={`translate(${pan.x}, ${pan.y}) translate(${width / 2}, ${height / 2}) scale(${zoom}) translate(${-width / 2}, ${-height / 2})`}
              >
                {/* Quadrant shading */}
                <rect
                  x={padL}
                  y={padT}
                  width={midX - padL}
                  height={midY - padT}
                  fill="color-mix(in srgb, var(--accent-gold) 8%, transparent)"
                />
                <rect
                  x={midX}
                  y={padT}
                  width={padL + plotW - midX}
                  height={midY - padT}
                  fill="color-mix(in srgb, var(--accent-sage) 8%, transparent)"
                />
                <rect
                  x={padL}
                  y={midY}
                  width={midX - padL}
                  height={padT + plotH - midY}
                  fill="color-mix(in srgb, var(--ink-muted) 4%, transparent)"
                />
                <rect
                  x={midX}
                  y={midY}
                  width={padL + plotW - midX}
                  height={padT + plotH - midY}
                  fill="color-mix(in srgb, var(--accent-rose) 8%, transparent)"
                />

                {/* Gridlines */}
                {[1, 2, 3, 4, 5].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={toX(tick)}
                      y1={padT}
                      x2={toX(tick)}
                      y2={padT + plotH}
                      stroke="var(--border-hairline)"
                      strokeWidth={tick === 3 ? 1.4 : 0.8}
                      strokeDasharray={tick === 3 ? "4 3" : undefined}
                    />
                    <line
                      x1={padL}
                      y1={toY(tick)}
                      x2={padL + plotW}
                      y2={toY(tick)}
                      stroke="var(--border-hairline)"
                      strokeWidth={tick === 3 ? 1.4 : 0.8}
                      strokeDasharray={tick === 3 ? "4 3" : undefined}
                    />
                    <text
                      x={toX(tick)}
                      y={padT + plotH + 18}
                      textAnchor="middle"
                      className="font-mono-tabular fill-[var(--ink-muted)] text-[10px]"
                    >
                      {tick}
                    </text>
                    <text
                      x={padL - 10}
                      y={toY(tick) + 3}
                      textAnchor="end"
                      className="font-mono-tabular fill-[var(--ink-muted)] text-[10px]"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* Quadrant annotations */}
                <text
                  x={padL + 10}
                  y={padT + 12}
                  className="fill-[var(--accent-gold)] text-[10px] font-medium"
                >
                  High Desire · Rarely Experienced
                </text>
                <text
                  x={padL + plotW - 10}
                  y={padT + 12}
                  textAnchor="end"
                  className="fill-[var(--accent-sage)] text-[10px] font-medium"
                >
                  High Desire · Frequently Experienced
                </text>
                <text
                  x={padL + 10}
                  y={padT + plotH - 7}
                  className="fill-[var(--ink-muted)] text-[10px] font-medium"
                >
                  Low Desire · Rarely Experienced
                </text>
                <text
                  x={padL + plotW - 10}
                  y={padT + plotH - 7}
                  textAnchor="end"
                  className="fill-[var(--accent-rose)] text-[10px] font-medium"
                >
                  Low Desire · Frequently Experienced
                </text>

                {/* Data points */}
                {plottedPoints.map((pt) => {
                  const cx = toX(pt.jx);
                  const cy = toY(pt.jy);
                  const isActive = selectedPoint?.questionId === pt.questionId;
                  return (
                    <g
                      key={pt.questionId}
                      role="button"
                      tabIndex={0}
                      aria-label={`${pt.shortLabel}: Enjoyment ${pt.enjoymentScore} out of 5, Experience ${pt.experienceScore} out of 5`}
                      className="cursor-pointer focus:outline-none"
                      onClick={() => setSelectedPoint(pt)}
                      onMouseEnter={() => setSelectedPoint(pt)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPoint(pt);
                        }
                      }}
                    >
                      {isActive && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={12}
                          fill="color-mix(in srgb, var(--accent-gold) 25%, transparent)"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 7.2 : 5.4}
                        fill={IMPORTANCE_COLORS[pt.importance]}
                        stroke="var(--bg-elevated)"
                        strokeWidth="1.6"
                      />
                    </g>
                  );
                })}

                {/* Axis Titles */}
                <text
                  x={padL + plotW / 2}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-[var(--ink-primary)] text-[11px] font-medium"
                >
                  How often you&apos;ve experienced it (1 = Never · 5 = Very often)
                </text>
                <text
                  x={18}
                  y={padT + plotH / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 18 ${padT + plotH / 2})`}
                  className="fill-[var(--ink-primary)] text-[11px] font-medium"
                >
                  How much you enjoy it (1 to 5)
                </text>
              </g>
            </svg>
          </div>

          {/* Inspector panel */}
          <div className="space-y-4 lg:col-span-4">
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              {selectedPoint ? (
                <>
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--ink-secondary)",
                    }}
                  >
                    {QUADRANT_LABELS[selectedPoint.quadrant]}
                  </span>
                  <h4 className="mt-3 text-base font-semibold leading-snug text-[var(--ink-primary)]">
                    {selectedPoint.prompt}
                  </h4>
                  <p className="mt-1.5 text-xs text-[var(--ink-secondary)]">
                    {selectedPoint.sectionTitle}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <span className="text-[11px] text-[var(--ink-muted)]">Enjoyment</span>
                      <p className="font-mono-tabular mt-0.5 text-xl font-semibold text-[var(--accent-plum)]">
                        {selectedPoint.enjoymentScore}/5
                      </p>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <span className="text-[11px] text-[var(--ink-muted)]">Experienced</span>
                      <p className="font-mono-tabular mt-0.5 text-xl font-semibold text-[var(--accent-gold)]">
                        {selectedPoint.experienceScore}/5
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--ink-secondary)]">
                  Hover or tap any plotted point to inspect its exact preference and frequency scores.
                </p>
              )}
            </div>

            <div
              className="rounded-2xl border p-4 text-xs leading-relaxed text-[var(--ink-secondary)]"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <p className="font-medium text-[var(--ink-primary)]">Color Key (Importance)</p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent-plum)" }} />
                  Essential
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent-gold)" }} />
                  Important
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent-mauve)" }} />
                  Nice to have
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--ink-muted)" }} />
                  Low priority
                </span>
              </div>
              {experienceUnratedCount > 0 && (
                <p className="mt-3 border-t pt-2.5 text-[11px] text-[var(--ink-muted)]">
                  {experienceUnratedCount} rated item{experienceUnratedCount === 1 ? "" : "s"} excluded
                  from this graph because optional experience frequency was not provided.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
