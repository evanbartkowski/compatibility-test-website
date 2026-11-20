"use client";

import React from "react";

export function AttachmentQuadrantPlot({
  anxiety,
  avoidance,
  quadrantLabel,
  partnerPoint,
}: {
  anxiety: number;
  avoidance: number;
  quadrantLabel: string;
  partnerPoint?: { anxiety: number; avoidance: number; label: string };
}) {
  // SVG space 360x320, plotting region [52..324] (w=272) and [30..270] (h=240)
  const plotLeft = 52;
  const plotTop = 30;
  const plotW = 272;
  const plotH = 240;

  const mapX = (av: number) => plotLeft + (Math.max(0, Math.min(100, av)) / 100) * plotW;
  const mapY = (anx: number) => plotTop + ((100 - Math.max(0, Math.min(100, anx))) / 100) * plotH;

  const ux = mapX(avoidance);
  const uy = mapY(anxiety);
  const midX = mapX(50);
  const midY = mapY(50);

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <svg
          viewBox="0 0 360 320"
          role="img"
          aria-label={`Attachment quadrant plot: Reassurance vigilance ${anxiety}/100, Autonomy reflex ${avoidance}/100`}
          className="mx-auto w-full max-w-[420px] select-none"
        >
          {/* Four soft quadrant cells */}
          <rect x={plotLeft} y={plotTop} width={plotW / 2} height={plotH / 2} fill="color-mix(in srgb, var(--accent-gold) 10%, transparent)" />
          <rect x={midX} y={plotTop} width={plotW / 2} height={plotH / 2} fill="color-mix(in srgb, var(--accent-rose-fill) 10%, transparent)" />
          <rect x={plotLeft} y={midY} width={plotW / 2} height={plotH / 2} fill="color-mix(in srgb, var(--accent-sage) 14%, transparent)" />
          <rect x={midX} y={midY} width={plotW / 2} height={plotH / 2} fill="color-mix(in srgb, var(--accent-plum) 10%, transparent)" />

          <rect x={plotLeft} y={plotTop} width={plotW} height={plotH} fill="none" stroke="var(--border-strong)" />
          <line x1={midX} y1={plotTop} x2={midX} y2={plotTop + plotH} stroke="var(--border-hairline)" strokeDasharray="4 4" />
          <line x1={plotLeft} y1={midY} x2={plotLeft + plotW} y2={midY} stroke="var(--border-hairline)" strokeDasharray="4 4" />

          {/* Quadrant corner labels */}
          <text x={plotLeft + 8} y={plotTop + 16} className="fill-[var(--ink-secondary)] text-[9.5px] font-medium">
            Reassurance-Seeking
          </text>
          <text x={plotLeft + plotW - 8} y={plotTop + 16} textAnchor="end" className="fill-[var(--ink-secondary)] text-[9.5px] font-medium">
            Mixed / Push-Pull
          </text>
          <text x={plotLeft + 8} y={plotTop + plotH - 10} className="fill-[var(--accent-sage)] text-[9.5px] font-semibold">
            Steadily Connected
          </text>
          <text x={plotLeft + plotW - 8} y={plotTop + plotH - 10} textAnchor="end" className="fill-[var(--ink-secondary)] text-[9.5px] font-medium">
            Autonomy-Protective
          </text>

          {/* Axes labels */}
          <text x={plotLeft + plotW / 2} y={plotTop + plotH + 26} textAnchor="middle" className="fill-[var(--ink-secondary)] text-[10.5px]">
            Autonomy / Distance Reflex (Avoidance: {avoidance}) &rarr;
          </text>
          <text
            x={16}
            y={plotTop + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${plotTop + plotH / 2})`}
            className="fill-[var(--ink-secondary)] text-[10.5px]"
          >
            Reassurance Vigilance (Anxiety: {anxiety}) &rarr;
          </text>

          {/* User coordinate dot */}
          <circle cx={ux} cy={uy} r={9} fill="color-mix(in srgb, var(--accent-plum) 25%, transparent)" />
          <circle cx={ux} cy={uy} r={5.5} fill="var(--accent-plum)" stroke="var(--bg-elevated)" strokeWidth={1.8} />

          {partnerPoint && (
            <circle
              cx={mapX(partnerPoint.avoidance)}
              cy={mapY(partnerPoint.anxiety)}
              r={5.5}
              fill="var(--accent-gold)"
              stroke="var(--bg-elevated)"
              strokeWidth={1.8}
            />
          )}
        </svg>
      </div>

      <div className="space-y-3 lg:col-span-5">
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-hairline)" }}
        >
          <p className="text-xs font-semibold text-[var(--accent-plum)]">Primary Pattern</p>
          <p className="mt-1 font-display text-2xl text-[var(--ink-primary)]">{quadrantLabel}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border bg-[var(--bg-elevated)] p-3">
              <span className="text-[var(--ink-muted)]">Reassurance Vigilance</span>
              <p className="font-mono-tabular mt-0.5 text-lg font-semibold text-[var(--ink-primary)]">
                {anxiety}/100
              </p>
            </div>
            <div className="rounded-xl border bg-[var(--bg-elevated)] p-3">
              <span className="text-[var(--ink-muted)]">Autonomy Reflex</span>
              <p className="font-mono-tabular mt-0.5 text-lg font-semibold text-[var(--ink-primary)]">
                {avoidance}/100
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
          Adult attachment leanings sit along continuous axes rather than fixed boxes. Safe
          communication and steady responsiveness shift people over time.
        </p>
      </div>
    </div>
  );
}
