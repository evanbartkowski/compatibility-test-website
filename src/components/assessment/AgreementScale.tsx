"use client";

import { Check } from "lucide-react";

const labels = [
  "Strongly disagree",
  "Disagree",
  "Somewhat disagree",
  "Neither agree nor disagree",
  "Somewhat agree",
  "Agree",
  "Strongly agree",
];

export function AgreementScale({
  questionId,
  value,
  onChange,
}: {
  questionId: string;
  value?: string | number | string[];
  onChange: (value: number) => void;
}) {
  const selected = typeof value === "number" ? value : undefined;
  return (
    <fieldset
      className="agreement-scale"
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          !/^[1-7]$/.test(event.key)
        )
          return;
        event.preventDefault();
        onChange(Number(event.key));
        event.currentTarget
          .querySelector<HTMLInputElement>(`input[value="${event.key}"]`)
          ?.focus();
      }}
    >
      <legend>How much do you agree?</legend>
      <div className="agreement-options">
        {labels.map((label, index) => (
          <label
            key={label}
            className="agreement-option"
            data-selected={selected === index + 1}
            title={label}
          >
            <input
              type="radio"
              name={`agreement-${questionId}`}
              value={index + 1}
              checked={selected === index + 1}
              onChange={() => onChange(index + 1)}
            />
            <span
              className="agreement-choice"
              data-distance={Math.abs(index - 3)}
            >
              <span className="agreement-indicator" aria-hidden="true">
                {selected === index + 1 ? <Check size={14} /> : index + 1}
              </span>
              <span className="agreement-label">{label}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="agreement-selection" role="status">
        {selected
          ? `Your answer: ${labels[selected - 1]}`
          : "Choose one answer above."}
      </p>
    </fieldset>
  );
}
