"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  EyeOff,
  HeartCrack,
  Wine,
  Scale,
} from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

interface RedFlagScorecardProps {
  result: ScoredAssessmentResult;
  previousResult?: ScoredAssessmentResult | null;
}

interface SubcategoryMeta {
  key: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tagline: string;
  lowDesc: string;
  midDesc: string;
  highDesc: string;
}

const SUBCATEGORY_META: Record<string, SubcategoryMeta> = {
  direct_communication: {
    key: "direct_communication",
    name: "Avoidance & Stonewalling",
    icon: EyeOff,
    tagline: "Ghosting, silent treatment, and emotional shutdown",
    lowDesc: "You confront issues directly, stay present during friction, and communicate your needs without vanishing.",
    midDesc: "You occasionally shut down, give the cold shoulder, or drop hints when overwhelmed instead of saying what hurt you.",
    highDesc: "You consistently punish with silence, ghost when conversations get tough, say 'I'm fine' while resentful, or threaten to leave to force peace.",
  },
  listening: {
    key: "listening",
    name: "Emotional Manipulation",
    icon: HeartCrack,
    tagline: "Guilt-tripping, weaponized tears, and gaslighting",
    lowDesc: "You take feedback cleanly, don't weaponize vulnerabilities, and don't turn yourself into the victim when called out.",
    midDesc: "You occasionally play defense, use guilt, or make subtle jabs when feeling criticized or insecure in an argument.",
    highDesc: "You reverse blame with 'I guess I'm just the worst partner', withhold affection as punishment, love bomb then pull away, or play the victim until they apologize.",
  },
  regulation: {
    key: "regulation",
    name: "Substance & Chaos",
    icon: Wine,
    tagline: "Impulsive drama, substance excuses, and emotional volatility",
    lowDesc: "You keep control of your words and actions, manage stress without numbing out, and don't create late-night crisis loops.",
    midDesc: "You occasionally let stress or alcohol amplify arguments, or make impulsive financial/emotional choices you regret.",
    highDesc: "You use alcohol or substances as an excuse for shady behavior, pick late-night fights, drive or slam things aggressively, or cause drama when bored.",
  },
  accountability: {
    key: "accountability",
    name: "Sneaky Disloyalty & Rosters",
    icon: ShieldAlert,
    tagline: "Phone snooping, side rosters, micro-cheating, and double standards",
    lowDesc: "You respect digital privacy, maintain transparent boundaries with exes, and apologize sincerely without excuses.",
    midDesc: "You have mild boundary leaks, check follower lists when suspicious, or feel defensive about sharing phone access.",
    highDesc: "You keep backup rosters on unread, snoop through messages, micro-cheat with people who have crushes on you, or hold your partner to standards you don't follow.",
  },
  collaboration: {
    key: "collaboration",
    name: "Contempt & Scorekeeping",
    icon: Scale,
    tagline: "Ego, condescension, scorekeeping, and needing to win",
    lowDesc: "You treat people with genuine kindness, celebrate your partner's wins, and can admit when you are wrong gracefully.",
    midDesc: "You occasionally keep mental score of who did what, roll your eyes when annoyed, or hate conceding an argument.",
    highDesc: "You keep an exhaustive mental ledger of mistakes, talk down to your partner, mock them in front of others, or believe you are out of their league.",
  },
};

function getSeverity(overall: number) {
  if (overall >= 80) {
    return {
      title: "Walking Hazard",
      badge: "Severe Flag 🚨",
      color: "text-rose-400",
      bgClass: "bg-rose-500/10 border-rose-500/30",
      barGradient: "from-rose-600 via-red-500 to-rose-400",
      summary: "High relationship volatility. Secretive habits, emotional withdrawal, and reactive drama create severe instability.",
    };
  }
  if (overall >= 60) {
    return {
      title: "Major Red Flags",
      badge: "Major Flag ⚠️",
      color: "text-orange-400",
      bgClass: "bg-orange-500/10 border-orange-500/30",
      barGradient: "from-orange-500 to-rose-500",
      summary: "Significant toxic patterns. Disloyalty leaks, avoidance tactics, and scorekeeping are actively hurting relationship trust.",
    };
  }
  if (overall >= 40) {
    return {
      title: "Moderate Red Flag Zone",
      badge: "Moderate Flag ⚡",
      color: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/30",
      barGradient: "from-amber-500 to-orange-500",
      summary: "Noticeable defensive habits. You have occasional toxic instincts when hurt, insecure, or overwhelmed by tough discussions.",
    };
  }
  if (overall >= 20) {
    return {
      title: "Mild Warning Flags",
      badge: "Low Risk 🛡️",
      color: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/30",
      barGradient: "from-teal-500 to-emerald-400",
      summary: "Mostly healthy relationship patterns. Minor communication quirks or boundary slip-ups that are easily resolved with honest talk.",
    };
  }
  return {
    title: "Green Flag Safe",
    badge: "Green Flag ✅",
    color: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
    barGradient: "from-emerald-500 to-teal-400",
    summary: "Exceptionally grounded and emotionally mature. You communicate with transparency, respect boundaries, and don't play manipulative games.",
  };
}

export function RedFlagScorecard({ result }: RedFlagScorecardProps) {
  const subcategories = useMemo(() => {
    const radar = result.radar || [];
    return radar.map((r) => {
      const dimKey = r.dimension || (r as { dimension?: string; key?: string }).key || "";
      const meta = SUBCATEGORY_META[dimKey] || {
        key: dimKey,
        name: r.label,
        icon: AlertTriangle,
        tagline: "Specific behavioral pattern",
        lowDesc: "Low tendency toward this flag.",
        midDesc: "Moderate tendency toward this flag.",
        highDesc: "High tendency toward this flag.",
      };
      return {
        ...meta,
        score: Math.round(r.score),
      };
    }).sort((a, b) => b.score - a.score);
  }, [result.radar]);

  const overall = useMemo(() => {
    if (subcategories.length === 0) return 50;
    const sum = subcategories.reduce((acc, s) => acc + s.score, 0);
    return Math.round(sum / subcategories.length);
  }, [subcategories]);

  const severity = getSeverity(overall);
  const highestFlag = subcategories[0];
  const lowestFlag = subcategories[subcategories.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Red Flag % Card */}
      <div
        className="rounded-2xl border p-6 sm:p-8 relative overflow-hidden"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-strong)",
          boxShadow: "var(--shadow-lifted)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                  severity.bgClass,
                  severity.color
                )}
              >
                <Flame size={13} />
                {severity.badge}
              </span>
              <span className="text-xs text-[var(--ink-muted)]">
                The Red Flags Test Result
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)]">
              {severity.title}
            </h2>

            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              {severity.summary}
            </p>

            {highestFlag && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[var(--ink-muted)]">Biggest red flag:</span>
                <span className="font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-md">
                  {highestFlag.name} ({highestFlag.score}%)
                </span>
                {lowestFlag && (
                  <>
                    <span className="text-[var(--ink-muted)] ml-2">Cleanest area:</span>
                    <span className="font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                      {lowestFlag.name} ({lowestFlag.score}%)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Big Circular / Box Meter */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border bg-[var(--bg-subtle)] min-w-[180px] shrink-0" style={{ borderColor: "var(--border-hairline)" }}>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1 font-mono-tabular font-bold">
              <span className={cn("text-5xl sm:text-6xl tracking-tight", severity.color)}>
                {overall}
              </span>
              <span className="text-2xl text-[var(--ink-muted)]">%</span>
            </div>
            <span className="text-xs text-[var(--ink-secondary)] mt-1 font-medium">
              Red Flag Index
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6">
          <div className="h-2.5 w-full rounded-full overflow-hidden bg-[var(--bg-inset)]">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", severity.barGradient)}
              style={{ width: `${Math.max(overall, 4)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-[var(--ink-muted)]">
            <span>0% Pure Green Flag</span>
            <span>50% Moderate</span>
            <span>100% Extreme Red Flag</span>
          </div>
        </div>
      </div>

      {/* Subcategories Breakdown Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-hairline)" }}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400" />
            <h3 className="font-display text-lg font-semibold text-[var(--ink-primary)]">
              Red Flag Subcategories Breakdown
            </h3>
          </div>
          <span className="text-xs text-[var(--ink-muted)] font-mono">
            {subcategories.length} Dimensions Measured
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1.5">
          Detailed breakdown of where your toxic tendencies manifest across communication, manipulation, substances, disloyalty, and ego.
        </p>
      </div>

      {/* Subcategories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subcategories.map((sub) => {
          const Icon = sub.icon;
          const isHigh = sub.score >= 60;
          const isMid = sub.score >= 35 && sub.score < 60;
          const badgeClass = isHigh
            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
            : isMid
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
          
          const barColor = isHigh
            ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
            : isMid
              ? "bg-gradient-to-r from-amber-500 to-orange-400"
              : "bg-gradient-to-r from-teal-500 to-emerald-400";

          const description = isHigh ? sub.highDesc : isMid ? sub.midDesc : sub.lowDesc;

          return (
            <div
              key={sub.key}
              className="rounded-xl border p-5 flex flex-col justify-between transition-all"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-lg border"
                      style={{
                        backgroundColor: "var(--bg-canvas)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <Icon size={16} className={isHigh ? "text-rose-400" : isMid ? "text-amber-400" : "text-emerald-400"} />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-[var(--ink-primary)]">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-[var(--ink-muted)]">{sub.tagline}</p>
                    </div>
                  </div>

                  <span className={cn("px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border", badgeClass)}>
                    {sub.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="my-3 h-2 w-full rounded-full overflow-hidden bg-[var(--bg-inset)]">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{ width: `${Math.max(sub.score, 4)}%` }}
                  />
                </div>

                <p className="text-xs leading-relaxed text-[var(--ink-secondary)] mt-2">
                  {description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: "var(--border-hairline)" }}>
                <span className="text-[var(--ink-muted)]">Risk Level:</span>
                <span className={cn("font-medium", isHigh ? "text-rose-400" : isMid ? "text-amber-400" : "text-emerald-400")}>
                  {isHigh ? "High Red Flag" : isMid ? "Moderate Risk" : "Low Risk / Clean"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
