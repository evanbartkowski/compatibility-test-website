"use client";

import React from "react";
import type { PriorityRankItem } from "@/lib/assessment/types";

const TIER_META: Record<PriorityRankItem["tier"], { label: string; color: string }> = {
  essential: { label: "Essential Non-Negotiable", color: "var(--accent-plum)" },
  strong: { label: "Strong Priority", color: "var(--accent-gold)" },
  flexible: { label: "Flexible Preference", color: "var(--accent-sage)" },
  boundary: { label: "Hard Boundary", color: "var(--accent-rose)" },
};

export function RankedBarChart({ items }: { items: PriorityRankItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const meta = TIER_META[item.tier];
        return (
          <div
            key={item.id}
            className="rounded-2xl border p-3.5"
            style={{
              backgroundColor: "var(--bg-canvas)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono-tabular text-[11px] font-bold"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--ink-primary)",
                  }}
                >
                  #{item.rank}
                </span>
                <span className="font-medium text-sm text-[var(--ink-primary)]">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </span>
                <span className="font-mono-tabular font-semibold text-[var(--ink-primary)]">
                  {item.score}
                </span>
              </div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-inset)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.score}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
