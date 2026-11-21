"use client";
import { useState } from "react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import { areHistoryResultsComparable } from "@/lib/assessment/definition";
import { formatShortDate } from "@/lib/utils";
const colors = [
  "var(--accent-plum)",
  "var(--accent-cyan)",
  "var(--accent-rose)",
  "var(--accent-sage)",
  "var(--accent-gold)",
  "var(--accent-slate)",
];
export function PreferenceHistoryChart({
  results,
}: {
  results: ScoredAssessmentResult[];
}) {
  const [hidden, setHidden] = useState<string[]>([]);
  const ordered = [...results].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    ),
    anchor = ordered.at(-1);
  const comparable = anchor
    ? ordered.filter((r) => areHistoryResultsComparable(r, anchor))
    : [];
  if (comparable.length < 2)
    return (
      <div className="history-empty">
        <p>Retake the same test version and depth to see changes over time.</p>
        <span>
          Each test measures its own dimensions. Unrelated tests and scoring
          versions are kept separate.
        </span>
      </div>
    );
  const dimensions = anchor!.radar.filter((d) =>
    comparable.some(
      (r) =>
        (r.radar.find((p) => p.dimension === d.dimension)?.answeredCount || 0) >
        0,
    ),
  );
  const width = 700,
    height = 270,
    left = 38,
    right = 24,
    top = 25,
    bottom = 45,
    plotW = width - left - right,
    plotH = height - top - bottom;
  const x = (index: number) => left + (index / (comparable.length - 1)) * plotW,
    y = (score: number) => top + ((100 - score) / 100) * plotH;
  return (
    <div>
      <div
        className="history-series-controls"
        role="group"
        aria-label="History chart categories"
      >
        {dimensions.map((d, index) => (
          <button
            key={d.dimension}
            type="button"
            aria-pressed={!hidden.includes(d.dimension)}
            onClick={() =>
              setHidden((old) =>
                old.includes(d.dimension)
                  ? old.filter((key) => key !== d.dimension)
                  : [...old, d.dimension],
              )
            }
          >
            <i
              style={{ background: colors[index % colors.length] }}
              aria-hidden="true"
            />
            {d.label}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Category score history for ${anchor!.assessmentTitle}. Text values are available in the table.`}
        className="w-full mt-4"
      >
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--border-hairline)"
              strokeDasharray={value ? "3 5" : undefined}
            />
            <text
              x={left - 10}
              y={y(value) + 4}
              fill="var(--ink-muted)"
              fontSize="11"
              textAnchor="end"
            >
              {value}
            </text>
          </g>
        ))}
        {dimensions
          .filter((d) => !hidden.includes(d.dimension))
          .map((d) => {
            const color = colors[dimensions.indexOf(d) % colors.length];
            let segment = false;
            const path = comparable
              .map((result, index) => {
                const score = result.radar.find(
                  (r) => r.dimension === d.dimension && r.answeredCount > 0,
                );
                if (!score) {
                  segment = false;
                  return "";
                }
                const command = segment ? "L" : "M";
                segment = true;
                return `${command}${x(index)} ${y(score.score)}`;
              })
              .join(" ");
            return (
              <g key={d.dimension}>
                <path d={path} fill="none" stroke={color} strokeWidth="2" />
                {comparable.map((result, index) => {
                  const score = result.radar.find(
                    (r) => r.dimension === d.dimension && r.answeredCount > 0,
                  );
                  return score ? (
                    <circle
                      key={result.resultId}
                      cx={x(index)}
                      cy={y(score.score)}
                      r="4"
                      fill={color}
                    />
                  ) : null;
                })}
              </g>
            );
          })}
        {comparable.map((result, index) =>
          index === 0 ||
          index === comparable.length - 1 ||
          comparable.length < 5 ? (
            <text
              key={result.resultId}
              x={x(index)}
              y={height - 16}
              textAnchor={
                index === 0
                  ? "start"
                  : index === comparable.length - 1
                    ? "end"
                    : "middle"
              }
              fontSize="11"
              fill="var(--ink-muted)"
            >
              {formatShortDate(result.createdAt)}
            </text>
          ) : null,
        )}
      </svg>
      <details className="history-data-table">
        <summary>View history as a table</summary>
        <div className="overflow-x-auto mt-4">
          <table>
            <caption className="sr-only">
              Comparable test attempts and measured category scores
            </caption>
            <thead>
              <tr>
                <th scope="col">Completed</th>
                {dimensions.map((d) => (
                  <th key={d.dimension} scope="col">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparable.map((result) => (
                <tr key={result.resultId}>
                  <th scope="row">{formatShortDate(result.createdAt)}</th>
                  {dimensions.map((d) => {
                    const value = result.radar.find(
                      (r) => r.dimension === d.dimension && r.answeredCount > 0,
                    );
                    return (
                      <td key={d.dimension}>
                        {value ? `${value.score}%` : "Not measured"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {comparable.length !== results.length && (
        <p className="example-note">
          Only matching test and scoring versions at the same depth are shown.
        </p>
      )}
    </div>
  );
}
