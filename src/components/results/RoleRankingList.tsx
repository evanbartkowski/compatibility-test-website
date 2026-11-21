"use client";

import { Sparkles, Trophy } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import { CollapsibleSection } from "./CollapsibleSection";
import { cn } from "@/lib/utils";

export function RoleRankingList({ result }: { result: ScoredAssessmentResult }) {
  const roles = result.roleRankings || [];
  if (roles.length === 0) return null;

  const top = [...roles].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const groups = [...new Set(roles.map((r) => r.group))];
  const isKinkTest = roles.some((r) =>
    r.group.includes("Taboo") ||
    r.group.includes("Restraint") ||
    r.group.includes("Body & Anal") ||
    r.group.includes("Sensation")
  );
  const sectionTitle = isKinkTest ? "Kink & Desires Breakdown" : "Role & Archetype Match";

  return (
    <CollapsibleSection
      id="role-ranking-section"
      title={sectionTitle}
      subtitle={top.map((r) => `${r.label} (${r.percent}%)`).join(", ")}
      icon={Sparkles}
      badge={
        top.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <Trophy size={11} className="text-amber-400" />
            Top: {top[0].label} {top[0].percent}%
          </span>
        ) : null
      }
      className="mt-6"
      defaultOpen={false}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: "var(--border-hairline)" }}>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
          {isKinkTest
            ? "Your affinity ratings across specific kinks, sensation preferences, and power dynamics."
            : "Compatibility percentage across each power dynamic and role archetype."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {top.map((r) => (
            <span
              key={r.key}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
            >
              <Trophy size={11} className="text-amber-400" />
              <span>{r.label}</span>
              <strong className="font-mono text-rose-300 font-bold">{r.percent}%</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {groups.map((group) => {
          const groupRoles = roles
            .filter((r) => r.group === group)
            .sort((a, b) => b.percent - a.percent);

          return (
            <div
              key={group}
              className="rounded-lg border p-5 transition-all"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div
                className="flex items-center justify-between border-b pb-3 mb-4"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                <h3 className="font-display text-base font-semibold text-[var(--ink-primary)]">
                  {group}
                </h3>
                <span className="text-xs text-[var(--ink-muted)] font-mono">
                  {groupRoles.length} {groupRoles.length === 1 ? (isKinkTest ? "kink" : "role") : (isKinkTest ? "kinks" : "roles")}
                </span>
              </div>

              <div className="space-y-3.5">
                {groupRoles.map((role) => {
                  const isHigh = role.percent >= 80;
                  const isMedium = role.percent >= 50;
                  return (
                    <div key={role.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-[var(--ink-primary)]">
                          {role.label}
                        </span>
                        <span
                          className={cn(
                            "font-mono font-bold text-xs px-2 py-0.5 rounded-md",
                            isHigh
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                              : isMedium
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-500/10 text-[var(--ink-muted)] border border-slate-500/20"
                          )}
                        >
                          {role.percent}%
                        </span>
                      </div>
                      <div
                        className="h-2 w-full rounded overflow-hidden"
                        style={{
                          backgroundColor:
                            "var(--bg-inset, rgba(255,255,255,0.06))",
                        }}
                      >
                        <div
                          className={cn(
                            "h-full rounded transition-all duration-500",
                            isHigh
                              ? "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                              : isMedium
                                ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                                : "bg-gradient-to-r from-slate-600 to-slate-500 opacity-60"
                          )}
                          style={{ width: `${Math.max(role.percent, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
