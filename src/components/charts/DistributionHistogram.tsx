"use client";
import { useState } from "react";
import type { CommunityDimensionComparison } from "@/lib/assessment/community";
export function DistributionHistogram({
  dimension,
}: {
  dimension: CommunityDimensionComparison;
}) {
  const [active, setActive] = useState<number | null>(null);
  if (!dimension.histogram) return null;
  const bins = dimension.histogram;
  const highest = Math.max(1, ...bins.map((bin) => bin.count));
  return (
    <div className="distribution-chart">
      <div
        className="distribution-bars"
        role="group"
        aria-label={`${dimension.label} score distribution`}
      >
        {bins.map((bin, index) => (
          <button
            type="button"
            key={bin.min}
            aria-pressed={active === index}
            aria-label={`Scores ${bin.min} to ${bin.max}${index === 9 ? " inclusive" : " exclusive"}: ${bin.count} participants, ${bin.percent} percent`}
            onFocus={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(active === index ? null : index)}
          >
            <span
              className="distribution-column"
              style={{ height: `${Math.max(2, (bin.count / highest) * 100)}%` }}
            />
            <span className="sr-only">{bin.percent}%</span>
          </button>
        ))}
        {dimension.userScore !== null && (
          <span
            className="distribution-user-marker"
            style={{ left: `${dimension.userScore}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="distribution-axis">
        <span>0</span>
        <span>Category score</span>
        <span>100</span>
      </div>
      <p className="distribution-tooltip" role="status">
        {active === null
          ? "Choose a bar to inspect the measured distribution."
          : `${bins[active].count} participants (${bins[active].percent}%) scored from ${bins[active].min} to ${bins[active].max}${active === 9 ? ", including 100" : " (upper limit excluded)"}.`}
      </p>
    </div>
  );
}
