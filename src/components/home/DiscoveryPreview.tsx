"use client";
import { useId, useState } from "react";

export function ComparisonExample() {
  const [partner, setPartner] = useState(true);
  return (
    <div className="comparison-preview">
      <div className="flex justify-between gap-3">
        <div className="preview-legend">
          <span>
            <i className="legend-dot" />
            You
          </span>
          {partner && (
            <span>
              <i className="legend-dot cyan" />
              Partner
            </span>
          )}
        </div>
        <button
          className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
          type="button"
          aria-pressed={partner}
          onClick={() => setPartner(!partner)}
        >
          {partner ? "Hide partner" : "Show partner"}
        </button>
      </div>
      {[
        { label: "Communication", you: 86, them: 91 },
        { label: "Affection", you: 78, them: 72 },
        { label: "Independence", you: 64, them: 82 },
      ].map((row) => (
        <div className="sample-bar-row" key={row.label}>
          <header>
            {row.label}
            <span>
              {partner
                ? `${100 - Math.abs(row.you - row.them)}% alignment`
                : `${row.you}/100`}
            </span>
          </header>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${row.you}%` }} />
          </div>
          {partner && (
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${row.them}%` }} />
            </div>
          )}
        </div>
      ))}
      <p className="example-note">
        Illustrative scores. Real comparisons use both partners’ answers.
      </p>
    </div>
  );
}

export function PopulationExample() {
  const [score, setScore] = useState(76);
  const id = useId().replace(/:/g, "");
  return (
    <div className="comparison-preview population-preview">
      <div className="flex justify-between items-center gap-3 text-xs">
        <span className="text-[var(--ink-muted)]">
          Try moving your example score
        </span>
        <strong className="text-[var(--accent-cyan)]">{score}/100</strong>
      </div>
      <svg viewBox="0 0 360 105" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--accent-cyan)" stopOpacity=".3" />
            <stop offset="1" stopColor="var(--accent-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M5 92C60 92 62 85 95 65S146 10 180 10s52 36 85 55 35 27 90 27V100H5Z"
          fill={`url(#${id})`}
        />
        <path
          d="M5 92C60 92 62 85 95 65S146 10 180 10s52 36 85 55 35 27 90 27"
          stroke="var(--accent-cyan)"
          fill="none"
          strokeWidth="1.5"
        />
        <line
          x1={5 + score * 3.5}
          x2={5 + score * 3.5}
          y1="10"
          y2="100"
          stroke="var(--accent-plum)"
          strokeDasharray="3 4"
        />
        <circle cx={5 + score * 3.5} cy="93" r="4" fill="var(--accent-plum)" />
      </svg>
      <input
        type="range"
        aria-label="Example category score"
        min="0"
        max="100"
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="w-full h-3"
      />
      <div className="distribution-labels mt-3">
        <span>0 · Lower</span>
        <span>50 · Middle</span>
        <span>100 · Higher</span>
      </div>
      <p className="example-note">
        Illustrative distribution. Live percentiles use measured test-taker
        data.
      </p>
    </div>
  );
}
