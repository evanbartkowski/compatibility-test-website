"use client";
import { useState } from "react";
import { Fingerprint, Check, Info } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import type { CommunityDimensionComparison } from "@/lib/assessment/community";
import { DistributionHistogram } from "@/components/charts/DistributionHistogram";

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
  if (!dimension)
    return (
      <section className="empty-state mt-6">
        <h2 className="font-display">
          Your profile needs a little more input.
        </h2>
        <p>
          Answer a few questions to see your category breakdown. Skipped answers
          stay out of the scoring.
        </p>
      </section>
    );
  return (
    <section
      className="results-snapshot mt-7"
      aria-label="Your category profile"
    >
      <div>
        <span className="intro-pill">
          <Fingerprint size={13} />
          Your patterns, at a glance
        </span>
        <h2 className="font-display mt-5">{dimension.label}</h2>
        <p>
          {dimension.description ||
            "This category reflects the pattern in your answers. Select a category to see what shaped your score."}
        </p>
        <div className="flex items-baseline gap-2 mt-5">
          <strong className="font-display text-5xl text-[var(--accent-plum)]">
            {dimension.score}
            <span className="text-2xl">%</span>
          </strong>
          <span className="text-xs text-[var(--ink-muted)]">
            category score
          </span>
        </div>
        <p className="!text-xs">
          {dimension.score > 60
            ? dimension.highLabel
            : dimension.score < 40
              ? dimension.lowLabel
              : "You sit between the two ends of this dimension."}
        </p>
        <p className="!text-xs flex items-start gap-2">
          <Info size={13} className="mt-1 shrink-0" />
          Higher means more of this tendency. Each category stands on its own.
        </p>
      </div>
      <div
        className="snapshot-rows"
        role="group"
        aria-label="Choose a category"
      >
        {result.radar.map((d) => {
          const prev = previousResult?.radar.find(
            (p) => p.dimension === d.dimension && p.answeredCount > 0,
          );
          return (
            <button
              type="button"
              className="snapshot-row"
              aria-pressed={d.dimension === dimension.dimension}
              key={d.dimension}
              disabled={d.answeredCount === 0}
              onClick={() => setSelected(d.dimension)}
            >
              <span className="snapshot-row-top">
                <span className="flex items-center gap-2">
                  {d.label}
                  {d.dimension === dimension.dimension && (
                    <Check size={12} className="text-[var(--accent-plum)]" />
                  )}
                </span>
                <strong>
                  {d.answeredCount ? `${d.score}%` : "Not measured"}
                  {prev && d.answeredCount > 0 && (
                    <span className="ml-2 text-[var(--ink-muted)] text-xs">
                      {d.score - prev.score > 0 ? "+" : ""}
                      {d.score - prev.score} pts
                    </span>
                  )}
                </strong>
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: d.answeredCount ? `${d.score}%` : "0%",
                    opacity: d.dimension === dimension.dimension ? 1 : 0.45,
                  }}
                />
              </div>
            </button>
          );
        })}
        <p className="text-xs text-[var(--ink-muted)] mt-1">
          {result.answeredCount} answers ·{" "}
          {result.mode === "quick" ? "Quick discovery" : "Full assessment"} ·
          Saved to your private results
        </p>
      </div>
      {dimension.interpretation && (
        <div
          className="category-interpretation col-span-full"
          aria-live="polite"
        >
          <div className="category-evidence-note">
            <span>
              {dimension.answeredCount} of {dimension.eligibleCount} category
              statements answered
            </span>
            <span>
              {dimension.interpretation.band === "balanced"
                ? "Mixed or context-dependent pattern"
                : dimension.interpretation.band === "high"
                  ? "More of this tendency"
                  : "Less of this tendency"}
            </span>
          </div>
          {dimension.answeredCount < 3 && (
            <p className="category-limited">
              A tentative reading based on fewer than three statements. Add more
              answers before treating this as a settled pattern.
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
          {dimension.contributors.length >= 3 &&
            Math.max(
              ...dimension.contributors.map((c) => c.normalizedContribution),
            ) -
              Math.min(
                ...dimension.contributors.map((c) => c.normalizedContribution),
              ) >=
              66 && (
              <p className="category-context-note">
                Your answers differ noticeably across situations in this
                category. The average brings those differences together; review
                the individual statements below to see where context matters.
              </p>
            )}
        </div>
      )}
      <details className="col-span-full border-t pt-4">
        <summary className="text-sm text-[var(--ink-secondary)] cursor-pointer">
          What shaped your {dimension.label.toLowerCase()} score?
        </summary>
        <ul className="grid gap-3 sm:grid-cols-2 mt-4">
          {dimension.contributors.map((c) => (
            <li
              className="rounded-xl border p-4 bg-[var(--bg-canvas)]"
              key={c.questionId}
            >
              <p className="text-sm leading-relaxed">{c.prompt}</p>
              <p className="text-xs text-[var(--ink-muted)] mt-2">
                {c.enjoymentLabel} · {c.normalizedContribution}% contribution
                {c.direction === "inverse" ? " · Reverse direction" : ""}
              </p>
            </li>
          ))}
        </ul>
      </details>
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
