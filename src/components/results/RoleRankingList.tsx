"use client";

import { Sparkles, Trophy } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

export function RoleRankingList({ result }: { result: ScoredAssessmentResult }) {
  const roles = result.roleRankings || [];
  if (roles.length === 0) return null;

  const top = [...roles].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const groups = [...new Set(roles.map((r) => r.group))];

  return (
    <section
      className="mt-7 rounded-3xl border p-6 sm:p-8 transition-all"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-hairline)",
      }}
      aria-labelledby="role-ranking-title"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5"
        style={{ borderColor: "var(--border-hairline)" }}
      >
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-rose-500/20 bg-rose-500/10 text-rose-300">
            <Sparkles size={12} className="text-rose-400" />
            Role &amp; Dynamic Compatibility
          </span>
          <h2
            id="role-ranking-title"
            className="font-display text-2xl sm:text-3xl text-[var(--ink-primary)] mt-2"
          >
            Role &amp; Archetype Match
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">
            Compatibility percentage across each power dynamic and role archetype.
          </p>
        </div>

        {/* Top 3 High-Match Badges */}
        {top.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {top.map((r) => (
              <span
                key={r.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              >
                <Trophy size={11} className="text-amber-400" />
                <span>{r.label}</span>
                <strong className="font-mono text-rose-300 font-bold">
                  {r.percent}%
                </strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {groups.map((group) => {
          const groupRoles = roles
            .filter((r) => r.group === group)
            .sort((a, b) => b.percent - a.percent);

          return (
            <div
              key={group}
              className="rounded-2xl border p-5 transition-all"
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
                  {groupRoles.length} {groupRoles.length === 1 ? "role" : "roles"}
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
                        className="h-2 w-full rounded-full overflow-hidden"
                        style={{
                          backgroundColor:
                            "var(--bg-inset, rgba(255,255,255,0.06))",
                        }}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
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
    </section>
  );
}
