"use client";

import { useState } from "react";
import { Sparkles, Check, Info } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import type { CommunityDimensionComparison } from "@/lib/assessment/community";
import { DistributionHistogram } from "@/components/charts/DistributionHistogram";
import { CollapsibleSection } from "./CollapsibleSection";
import { cn } from "@/lib/utils";

export type ScoreTier = {
  band: "peak" | "high" | "moderate" | "mild" | "boundary";
  label: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  gradientClass: string;
  glowClass: string;
  hex: string;
};

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) {
    return {
      band: "peak",
      label: "Core Drive",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      textClass: "text-rose-400",
      borderClass: "border-rose-500/40 hover:border-rose-500/70",
      bgClass: "bg-rose-500/[0.06]",
      gradientClass: "from-rose-500 via-pink-500 to-rose-400",
      glowClass: "shadow-[0_0_15px_rgba(244,63,94,0.35)]",
      hex: "#f43f5e",
    };
  }
  if (score >= 60) {
    return {
      band: "high",
      label: "Strong",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      textClass: "text-purple-400",
      borderClass: "border-purple-500/40 hover:border-purple-500/70",
      bgClass: "bg-purple-500/[0.06]",
      gradientClass: "from-purple-500 via-violet-500 to-purple-400",
      glowClass: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      hex: "#a855f7",
    };
  }
  if (score >= 40) {
    return {
      band: "moderate",
      label: "Moderate",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      textClass: "text-amber-400",
      borderClass: "border-amber-500/35 hover:border-amber-500/60",
      bgClass: "bg-amber-500/[0.05]",
      gradientClass: "from-amber-500 via-orange-400 to-amber-400",
      glowClass: "shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      hex: "#f59e0b",
    };
  }
  if (score >= 20) {
    return {
      band: "mild",
      label: "Mild",
      badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      textClass: "text-teal-400",
      borderClass: "border-teal-500/30 hover:border-teal-500/50",
      bgClass: "bg-teal-500/[0.04]",
      gradientClass: "from-teal-500 via-cyan-400 to-teal-400",
      glowClass: "shadow-[0_0_12px_rgba(20,184,166,0.2)]",
      hex: "#14b8a6",
    };
  }
  return {
    band: "boundary",
    label: "Low / Boundary",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    textClass: "text-slate-400",
    borderClass: "border-slate-700/60 hover:border-slate-600",
    bgClass: "bg-slate-800/[0.2]",
    gradientClass: "from-slate-600 to-slate-500",
    glowClass: "",
    hex: "#64748b",
  };
}

export function ResultsOverview({
  result,
  previousResult,
}: {
  result: ScoredAssessmentResult;
  previousResult?: ScoredAssessmentResult | null;
}) {
  const measured = result.radar.filter((d) => d.answeredCount > 0);
  const [selected, setSelected] = useState(measured[0]?.dimension);
  const dimension =
    measured.find((d) => d.dimension === selected) || measured[0];

  if (!dimension) {
    return (
      <section className="empty-state mt-6">
        <h2 className="font-display">Your profile needs a little more input.</h2>
        <p>Answer a few questions to see your category breakdown.</p>
      </section>
    );
  }

  const selectedTier = getScoreTier(dimension.score);

  return (
    <section className="mt-7 space-y-6" aria-label="Category scores and breakdown">
      {/* 1. TOP OF PAGE: VISUALLY APPEALING COLOR-CODED SCORES SHOWCASE */}
      <div
        className="rounded-3xl border p-6 sm:p-8 transition-all"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-rose-500/20 bg-rose-500/10 text-rose-300">
              <Sparkles size={12} className="text-rose-400" />
              Overview &amp; Category Scores
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[var(--ink-primary)] mt-2">
              Category Score Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">
              Color-coded by intensity. Click any category card to inspect its in-depth breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-muted)] shrink-0">
            <span>{result.answeredCount} answers</span>
            <span>·</span>
            <span className="text-[var(--accent-plum)] font-semibold">
              {result.mode === "quick" ? "Quick discovery" : "Full assessment"}
            </span>
          </div>
        </div>

        {/* The Grid of Category Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {result.radar.map((d) => {
            const tier = getScoreTier(d.score);
            const isSelected = d.dimension === dimension.dimension;
            const prev = previousResult?.radar.find(
              (p) => p.dimension === d.dimension && p.answeredCount > 0,
            );
            const delta =
              prev && d.answeredCount > 0 ? d.score - prev.score : null;

            return (
              <button
                key={d.dimension}
                type="button"
                onClick={() => setSelected(d.dimension)}
                disabled={d.answeredCount === 0}
                className={cn(
                  "flex flex-col justify-between text-left p-4 sm:p-5 rounded-lg border transition-all duration-300 relative group overflow-hidden cursor-pointer",
                  tier.bgClass,
                  tier.borderClass,
                  isSelected
                    ? "ring-2 ring-rose-500/70 shadow-[0_0_24px_rgba(244,63,94,0.22)] scale-[1.01]"
                    : "hover:scale-[1.01] hover:shadow-lg opacity-90 hover:opacity-100"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-sm sm:text-base font-semibold text-[var(--ink-primary)] leading-snug">
                      {d.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs font-bold px-2 py-0.5 rounded-md border shrink-0",
                        tier.badgeClass
                      )}
                    >
                      {d.answeredCount ? tier.label : "Unmeasured"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-3">
                    <span
                      className={cn(
                        "font-display text-4xl sm:text-5xl font-black tracking-tight",
                        tier.textClass
                      )}
                    >
                      {d.answeredCount ? d.score : "--"}
                      <span className="text-xl font-bold ml-0.5">%</span>
                    </span>

                    {delta !== null && (
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold",
                          delta > 0
                            ? "text-emerald-400"
                            : delta < 0
                              ? "text-rose-400"
                              : "text-[var(--ink-muted)]"
                        )}
                      >
                        {delta > 0 ? `+${delta}` : delta} pts
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div
                    className="h-2 w-full rounded overflow-hidden"
                    style={{
                      backgroundColor:
                        "var(--bg-inset, rgba(255,255,255,0.06))",
                    }}
                  >
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-700 bg-gradient-to-r",
                        tier.gradientClass,
                        tier.glowClass
                      )}
                      style={{
                        width: `${d.answeredCount ? Math.max(d.score, 4) : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] mt-2">
                    <span className="truncate max-w-[170px]">
                      {d.score >= 60
                        ? d.highLabel
                        : d.score <= 40
                          ? d.lowLabel
                          : "Context-dependent"}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 font-semibold text-rose-400 shrink-0">
                        <Check size={11} /> Selected
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. IN-DEPTH CATEGORY DETAILS IN A DROP DOWN MENU */}
      <CollapsibleSection
        id="category-deep-dive"
        title={`Category Deep Dive: ${dimension.label}`}
        subtitle={
          dimension.description ||
          "Explanations, tensions, and contributing statements for this category"
        }
        icon={Info}
        badge={
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border",
              selectedTier.badgeClass
            )}
          >
            {dimension.score}% · {selectedTier.label}
          </span>
        }
        defaultOpen={false}
      >
        <div className="space-y-6">
          {dimension.interpretation && (
            <div className="category-interpretation" aria-live="polite">
              <div className="category-evidence-note">
                <span>
                  {dimension.answeredCount} of {dimension.eligibleCount} category
                  statements answered
                </span>
                <span>
                  {dimension.interpretation.band === "balanced"
                    ? "Mixed or context-dependent pattern"
                    : dimension.interpretation.band === "high"
                      ? "High tendency"
                      : "Lower tendency"}
                </span>
              </div>
              {dimension.answeredCount < 3 && (
                <p className="category-limited">
                  A tentative reading based on fewer than three statements. Add
                  more answers before treating this as a settled pattern.
                </p>
              )}
              <div className="category-reading-grid">
                <div>
                  <h3>What your answers suggest</h3>
                  <p>{dimension.interpretation.meaning}</p>
                  <h3>A tension to notice</h3>
                  <p>{dimension.interpretation.possibleTradeoff}</p>
                </div>
                <div>
                  <h3>Something to try</h3>
                  <p>{dimension.interpretation.experiment}</p>
                  <h3>A question to sit with</h3>
                  <p className="category-reflection">
                    {dimension.interpretation.reflection}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statements that shaped the score */}
          {dimension.contributors.length > 0 && (
            <div>
              <h4 className="font-display text-base font-semibold text-[var(--ink-primary)] mb-3">
                Statements that shaped your {dimension.label.toLowerCase()} score
              </h4>
              <ul className="grid gap-3 sm:grid-cols-2">
                {dimension.contributors.map((c) => (
                  <li
                    className="rounded-2xl border p-4 bg-[var(--bg-subtle)]"
                    style={{ borderColor: "var(--border-hairline)" }}
                    key={c.questionId}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-primary)]">
                      {c.prompt}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] mt-2 font-mono">
                      {c.enjoymentLabel} · {c.normalizedContribution}% weight
                      {c.direction === "inverse" ? " · Inverse key" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </section>
  );
}

export function CommunityBenchmarks({
  dimensions,
  minimumThreshold,
  isSyntheticDemo,
}: {
  dimensions: CommunityDimensionComparison[];
  minimumThreshold: number;
  isSyntheticDemo: boolean;
}) {
  return (
    <section aria-label="Category community benchmarks" className="mb-8">
      <h3 className="font-display text-2xl mb-3">
        Your patterns in perspective
      </h3>
      <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-5">
        {isSyntheticDemo
          ? "Synthetic example data. These are demonstration rankings, not actual community results."
          : "Compared with opted-in test takers on this assessment version. This self-selected community is not a representative sample of the general population."}{" "}
        Percentiles use the share below your score plus half of tied scores.
      </p>
      <div className="benchmark-list">
        {dimensions.map((d) => (
          <article key={d.dimension} className="benchmark-row">
            <div className="flex items-baseline justify-between gap-4">
              <h3>{d.label}</h3>
              <span className="muted-label">
                {d.respondentCount}{" "}
                {isSyntheticDemo ? "example responses" : "test takers"}
              </span>
            </div>
            {d.available ? (
              <>
                <DistributionHistogram dimension={d} />
                <div
                  className="benchmark-track"
                  role="img"
                  aria-label={`Your score ${d.userScore ?? "not measured"}, community average ${d.communityMean}`}
                >
                  <div
                    className="bar-fill"
                    style={{ width: `${d.userScore ?? 0}%` }}
                  />
                  <span
                    className="mean-marker"
                    style={{ left: `${d.communityMean}%` }}
                  />
                </div>
                <div className="benchmark-stats">
                  <span>
                    You{" "}
                    <strong>
                      {d.userScore === null
                        ? "Not measured"
                        : `${d.userScore}%`}
                    </strong>
                  </span>
                  <span>
                    Community average{" "}
                    <strong className="!text-[var(--accent-cyan)]">
                      {d.communityMean}%
                    </strong>
                  </span>
                  {d.percentile !== null && (
                    <span>
                      Percentile <strong>{d.percentile}</strong>
                    </span>
                  )}
                </div>
                <p>
                  {d.higherThanPercent !== null && d.userScore !== null
                    ? `You scored higher than ${d.higherThanPercent}% of the participating test takers on this category. `
                    : ""}
                  {d.percentile === null
                    ? "Answer questions in this category to see your percentile."
                    : `Your midrank percentile is ${d.percentile} out of 100 in this cohort. ${d.userScore! > d.communityMean! ? "You show more of this tendency than the average test taker." : d.userScore! < d.communityMean! ? "You show less of this tendency than the average test taker." : "Your score is at the community average."}`}
                </p>
              </>
            ) : (
              <p>
                Category averages and rankings unlock with at least{" "}
                {minimumThreshold} measured, opted-in test takers.{" "}
                {Math.max(0, minimumThreshold - d.respondentCount)} more needed.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
