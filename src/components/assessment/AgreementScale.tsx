"use client";

import React from "react";

interface ScaleLevel {
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  activeBg: string;
  activeText: string;
}

const SCALE_LEVELS_7: ScaleLevel[] = [
  {
    label: "Strongly disagree",
    color: "#f43f5e",
    borderColor: "rgba(244, 63, 94, 0.45)",
    bgColor: "rgba(244, 63, 94, 0.08)",
    activeBg: "#f43f5e",
    activeText: "#ffffff",
  },
  {
    label: "Disagree",
    color: "#fb923c",
    borderColor: "rgba(251, 146, 60, 0.45)",
    bgColor: "rgba(251, 146, 60, 0.08)",
    activeBg: "#fb923c",
    activeText: "#ffffff",
  },
  {
    label: "Somewhat disagree",
    color: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.45)",
    bgColor: "rgba(245, 158, 11, 0.08)",
    activeBg: "#f59e0b",
    activeText: "#18181b",
  },
  {
    label: "Neither agree nor disagree",
    color: "#8b5cf6",
    borderColor: "rgba(139, 92, 246, 0.45)",
    bgColor: "rgba(139, 92, 246, 0.08)",
    activeBg: "#8b5cf6",
    activeText: "#ffffff",
  },
  {
    label: "Somewhat agree",
    color: "#0ea5e9",
    borderColor: "rgba(14, 165, 233, 0.45)",
    bgColor: "rgba(14, 165, 233, 0.08)",
    activeBg: "#0ea5e9",
    activeText: "#ffffff",
  },
  {
    label: "Agree",
    color: "#14b8a6",
    borderColor: "rgba(20, 184, 166, 0.45)",
    bgColor: "rgba(20, 184, 166, 0.08)",
    activeBg: "#14b8a6",
    activeText: "#ffffff",
  },
  {
    label: "Strongly agree",
    color: "#22c55e",
    borderColor: "rgba(34, 197, 94, 0.45)",
    bgColor: "rgba(34, 197, 94, 0.08)",
    activeBg: "#22c55e",
    activeText: "#ffffff",
  },
];

const SCALE_LEVELS_5: ScaleLevel[] = [
  {
    label: "Strongly disagree",
    color: "#f43f5e",
    borderColor: "rgba(244, 63, 94, 0.45)",
    bgColor: "rgba(244, 63, 94, 0.08)",
    activeBg: "#f43f5e",
    activeText: "#ffffff",
  },
  {
    label: "Disagree",
    color: "#fb923c",
    borderColor: "rgba(251, 146, 60, 0.45)",
    bgColor: "rgba(251, 146, 60, 0.08)",
    activeBg: "#fb923c",
    activeText: "#ffffff",
  },
  {
    label: "Neutral",
    color: "#8b5cf6",
    borderColor: "rgba(139, 92, 246, 0.45)",
    bgColor: "rgba(139, 92, 246, 0.08)",
    activeBg: "#8b5cf6",
    activeText: "#ffffff",
  },
  {
    label: "Agree",
    color: "#0ea5e9",
    borderColor: "rgba(14, 165, 233, 0.45)",
    bgColor: "rgba(14, 165, 233, 0.08)",
    activeBg: "#0ea5e9",
    activeText: "#ffffff",
  },
  {
    label: "Strongly agree",
    color: "#22c55e",
    borderColor: "rgba(34, 197, 94, 0.45)",
    bgColor: "rgba(34, 197, 94, 0.08)",
    activeBg: "#22c55e",
    activeText: "#ffffff",
  },
];

export interface AgreementScaleProps {
  questionId: string;
  value?: string | number | string[];
  onChange: (value: number) => void;
  scalePoints?: 5 | 7;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
}

export function AgreementScale({
  questionId,
  value,
  onChange,
  scalePoints = 7,
  minLabel,
  midLabel,
  maxLabel,
}: AgreementScaleProps) {
  const selected = typeof value === "number" ? value : undefined;
  const baseLevels = scalePoints === 5 ? SCALE_LEVELS_5 : SCALE_LEVELS_7;
  
  const levels = React.useMemo(() => {
    return baseLevels.map((lvl, idx) => {
      if (idx === 0 && minLabel) {
        return { ...lvl, label: minLabel };
      }
      if (idx === baseLevels.length - 1 && maxLabel) {
        return { ...lvl, label: maxLabel };
      }
      if (idx === Math.floor(baseLevels.length / 2) && midLabel) {
        return { ...lvl, label: midLabel };
      }
      return lvl;
    });
  }, [baseLevels, minLabel, midLabel, maxLabel]);

  const keyPattern = scalePoints === 5 ? /^[1-5]$/ : /^[1-7]$/;

  return (
    <fieldset
      className="agreement-scale"
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          !keyPattern.test(event.key)
        )
          return;
        event.preventDefault();
        onChange(Number(event.key));
        event.currentTarget
          .querySelector<HTMLInputElement>(`input[value="${event.key}"]`)
          ?.focus();
      }}
    >
      <legend className="sr-only">How much do you agree?</legend>
      <div className="agreement-options">
        {levels.map((level, index) => {
          const isSelected = selected === index + 1;
          return (
            <label
              key={level.label + index}
              className="agreement-option"
              data-selected={isSelected}
              data-value={index + 1}
              title={level.label}
            >
              <input
                type="radio"
                name={`agreement-${questionId}`}
                value={index + 1}
                checked={isSelected}
                onChange={() => onChange(index + 1)}
                aria-label={level.label}
              />
              <span
                className="agreement-choice"
                style={{
                  borderColor: isSelected
                    ? level.color
                    : level.borderColor,
                  backgroundColor: isSelected
                    ? level.activeBg
                    : level.bgColor,
                  color: isSelected
                    ? level.activeText
                    : "var(--ink-primary)",
                  boxShadow: isSelected
                    ? `0 0 16px ${level.color}40`
                    : "none",
                }}
              >
                <span className="agreement-label">{level.label}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
