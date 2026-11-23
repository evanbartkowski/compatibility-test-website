"use client";

import { useMemo, useState } from "react";
import { Sparkles, Trophy, Search, Flame, Shield, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import type { RoleScore } from "@/lib/assessment/role-rankings";
import { getScoreTier } from "./ResultsOverview";
import { cn } from "@/lib/utils";

export function KinkScoreList({
  result,
}: {
  result: ScoredAssessmentResult;
  previousResult?: ScoredAssessmentResult | null;
}) {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const roles: RoleScore[] = useMemo(() => result.roleRankings || [], [result.roleRankings]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    roles.forEach((r) => {
      if (r.group) set.add(r.group);
    });
    return ["all", ...Array.from(set)];
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesSearch =
        !q ||
        role.label.toLowerCase().includes(q) ||
        role.group.toLowerCase().includes(q) ||
        role.key.toLowerCase().includes(q);
      const matchesGroup =
        selectedGroup === "all" ||
        (selectedGroup === "core" && role.percent >= 80) ||
        (selectedGroup === "strong" && role.percent >= 60) ||
        role.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [roles, search, selectedGroup]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const coreCount = roles.filter((r) => r.percent >= 80).length;
  const strongCount = roles.filter((r) => r.percent >= 60 && r.percent < 80).length;
  const topKink = roles[0];

  if (roles.length === 0) {
    return (
      <section className="mt-7 rounded-3xl border p-6 text-center" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-hairline)" }}>
        <p className="text-sm text-[var(--ink-secondary)]">No kink ratings available for this assessment.</p>
      </section>
    );
  }

  return (
    <section className="mt-7 space-y-6" aria-label="Complete Kink and Dynamic Ratings">
      {/* 1. TOP OF PAGE: VISUALLY APPEALING COMPLETE KINK SCORES SHOWCASE */}
      <div
        className="rounded-3xl border p-6 sm:p-8 transition-all"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <Sparkles size={12} className="text-rose-400" />
              Complete Kink &amp; Role Breakdown (0% – 100%)
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[var(--ink-primary)] mt-2">
              Your Kink &amp; Dynamic Profile
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1 max-w-2xl leading-relaxed">
              Every kink, role, and sensation dynamic rated from 0% to 100% based on your answers.
              Color-coded by intensity.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            {topKink && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-200">
                <Trophy size={13} className="text-amber-400" />
                <span>Top: {topKink.label}</span>
                <strong className="text-rose-300 font-bold">{topKink.percent}%</strong>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[var(--ink-secondary)]" style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--bg-subtle)" }}>
              <Flame size={13} className="text-rose-400" />
              <span>{coreCount} Core Drives</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[var(--ink-secondary)]" style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--bg-subtle)" }}>
              <Shield size={13} className="text-purple-400" />
              <span>{roles.length} Total Kinks</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-muted)]" />
            <input
              type="text"
              aria-label="Filter kinks by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kinks (e.g. impact, bdsm, sadist, brat, anal, praise)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border bg-[var(--bg-subtle)] text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              style={{ borderColor: "var(--border-hairline)" }}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium transition-all",
                selectedGroup === "all"
                  ? "bg-rose-500 text-white font-semibold"
                  : "bg-[var(--bg-subtle)] text-[var(--ink-secondary)] border hover:border-rose-500/50"
              )}
              style={selectedGroup !== "all" ? { borderColor: "var(--border-hairline)" } : undefined}
            >
              All ({roles.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("core")}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium transition-all",
                selectedGroup === "core"
                  ? "bg-rose-500 text-white font-semibold"
                  : "bg-[var(--bg-subtle)] text-[var(--ink-secondary)] border hover:border-rose-500/50"
              )}
              style={selectedGroup !== "core" ? { borderColor: "var(--border-hairline)" } : undefined}
            >
              Core (80%+) ({coreCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("strong")}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium transition-all",
                selectedGroup === "strong"
                  ? "bg-purple-600 text-white font-semibold"
                  : "bg-[var(--bg-subtle)] text-[var(--ink-secondary)] border hover:border-purple-500/50"
              )}
              style={selectedGroup !== "strong" ? { borderColor: "var(--border-hairline)" } : undefined}
            >
              Strong (60%+) ({coreCount + strongCount})
            </button>
            {groups
              .filter((g) => g !== "all")
              .slice(0, 5)
              .map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={cn(
                    "px-2.5 py-1 rounded-full font-medium transition-all",
                    selectedGroup === group
                      ? "bg-rose-500 text-white font-semibold"
                      : "bg-[var(--bg-subtle)] text-[var(--ink-secondary)] border hover:border-rose-500/50"
                  )}
                  style={selectedGroup !== group ? { borderColor: "var(--border-hairline)" } : undefined}
                >
                  {group}
                </button>
              ))}
          </div>
        </div>

        {/* Big List Grid (2 columns on tablet/desktop, 1 column on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {filteredRoles.map((role) => {
            const tier = getScoreTier(role.percent);
            const isExpanded = expandedKeys.has(role.key);

            return (
              <div
                key={role.key}
                className={cn(
                  "flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 relative group overflow-hidden",
                  tier.bgClass,
                  tier.borderClass,
                  role.percent >= 80 ? tier.glowClass : ""
                )}
                style={{
                  backgroundColor: "var(--bg-subtle)",
                }}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display text-sm sm:text-base font-semibold text-[var(--ink-primary)] truncate">
                        {role.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border",
                          tier.badgeClass
                        )}
                      >
                        {role.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Subtitle / Group Badge & Details toggle */}
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--ink-muted)]">
                    <span className="truncate max-w-[200px]">{role.group}</span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(role.key)}
                      className="inline-flex items-center gap-0.5 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors py-0.5"
                    >
                      <span>{isExpanded ? "Less" : "Info"}</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden mt-2.5"
                    style={{ backgroundColor: "var(--border-hairline)" }}
                  >
                    <div
                      className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", tier.gradientClass)}
                      style={{ width: `${role.percent}%` }}
                    />
                  </div>
                </div>

                {/* Optional Collapsed Description (Clean, concise, no bloat) */}
                {isExpanded && (
                  <div
                    className="mt-3 pt-3 border-t text-xs text-[var(--ink-secondary)] leading-relaxed space-y-1.5"
                    style={{ borderColor: "var(--border-hairline)" }}
                  >
                    <p>{role.you}</p>
                    {role.try && role.try.length > 0 && (
                      <p className="text-[11px] text-[var(--ink-muted)]">
                        <strong className="text-[var(--ink-secondary)]">Exploration idea:</strong> {role.try[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredRoles.length === 0 && (
          <div className="mt-8 text-center py-8 border rounded-xl" style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--bg-subtle)" }}>
            <HelpCircle className="mx-auto h-8 w-8 text-[var(--ink-muted)]" />
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">No kinks match &ldquo;{search}&rdquo;.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedGroup("all");
              }}
              className="mt-3 text-xs text-rose-400 underline font-medium"
            >
              Clear search &amp; filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
