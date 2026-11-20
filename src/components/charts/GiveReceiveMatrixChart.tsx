"use client";

import React from "react";
import type { DualChannelScore } from "@/lib/assessment/types";

export function GiveReceiveMatrixChart({
  channels,
}: {
  channels: DualChannelScore[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--ink-secondary)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-plum)]" />
          What Makes You Feel Desired / Cared For (Receiving)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-gold)]" />
          What You Instinctively Express / Offer (Giving)
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {channels.map((ch) => (
          <div
            key={ch.channelKey}
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: "var(--bg-canvas)",
              borderColor: ch.gap >= 22 ? "var(--accent-gold)" : "var(--border-hairline)",
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-medium text-sm text-[var(--ink-primary)]">{ch.label}</h4>
              {ch.gap >= 20 && (
                <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 font-mono-tabular text-[10px] font-medium text-[var(--accent-gold)]">
                  Gap {ch.gap} pts
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-[var(--ink-secondary)]">
                  <span>Receiving sensitivity</span>
                  <span className="font-mono-tabular font-semibold">{ch.receiveOrNeedScore}/100</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${ch.receiveOrNeedScore}%`,
                      backgroundColor: "var(--accent-plum)",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[var(--ink-secondary)]">
                  <span>Giving instinct</span>
                  <span className="font-mono-tabular font-semibold">{ch.expressOrOfferScore}/100</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${ch.expressOrOfferScore}%`,
                      backgroundColor: "var(--accent-gold)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
