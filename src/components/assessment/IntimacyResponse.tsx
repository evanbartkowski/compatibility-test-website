"use client";
import type {
  PartnerWillingnessState,
  QuestionAnswer,
  QuestionDefinition,
} from "@/lib/assessment/types";

const desireLabels = [
  "Not appealing",
  "Slightly appealing",
  "Mixed / unsure",
  "Appealing",
  "Very appealing",
];

const INTIMACY_SCALE_COLORS = [
  { color: "#f43f5e", border: "rgba(244, 63, 94, 0.4)", bg: "rgba(244, 63, 94, 0.08)", activeBg: "#f43f5e" },
  { color: "#fb923c", border: "rgba(251, 146, 60, 0.4)", bg: "rgba(251, 146, 60, 0.08)", activeBg: "#fb923c" },
  { color: "#8b5cf6", border: "rgba(139, 92, 246, 0.4)", bg: "rgba(139, 92, 246, 0.08)", activeBg: "#8b5cf6" },
  { color: "#14b8a6", border: "rgba(20, 184, 166, 0.4)", bg: "rgba(20, 184, 166, 0.08)", activeBg: "#14b8a6" },
  { color: "#22c55e", border: "rgba(34, 197, 94, 0.4)", bg: "rgba(34, 197, 94, 0.08)", activeBg: "#22c55e" },
];
const willingnessOptions: Array<[PartnerWillingnessState, string]> = [
  ["enthusiastically_enjoy", "Freely interested"],
  ["willing_if_partner_enjoys", "Willing for a partner"],
  ["curious_to_explore", "Curious to discuss"],
  ["depends_on_context", "Depends on conditions"],
  ["prefer_not_to", "Not willing"],
  ["firm_boundary", "Hard limit"],
];

export function IntimacyResponse({
  question,
  answer,
  onAnswer,
}: {
  question: QuestionDefinition;
  answer?: QuestionAnswer;
  onAnswer: (patch: Partial<QuestionAnswer>) => void;
}) {
  const prefix = `intimacy-${question.id}`;
  const isLimit =
    answer?.firmBoundary === true ||
    answer?.partnerWillingness === "firm_boundary";
  return (
    <div className="intimacy-response">
      {question.options && (
        <fieldset className="intimacy-choice">
          <legend>Which fits better?</legend>
          {question.options.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={`${prefix}-choice`}
                value={option.value}
                checked={answer?.customValue === option.value}
                onChange={() => onAnswer({ customValue: option.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
      )}
      <fieldset>
        <legend>
          {question.options
            ? "How appealing is your chosen option? (optional)"
            : "How appealing is this to you?"}
        </legend>
        <div className="intimacy-desire-scale">
          {desireLabels.map((label, i) => {
            const isSelected = answer?.enjoyment === i + 1;
            const stepColor = INTIMACY_SCALE_COLORS[i];
            return (
              <label
                key={label}
                style={{
                  borderColor: isSelected ? stepColor.color : stepColor.border,
                  backgroundColor: isSelected ? stepColor.activeBg : stepColor.bg,
                  color: isSelected ? "#ffffff" : "var(--ink-primary)",
                  boxShadow: isSelected ? `0 0 14px ${stepColor.color}40` : "none",
                }}
              >
                <input
                  type="radio"
                  name={`${prefix}-desire`}
                  value={i + 1}
                  checked={isSelected}
                  onChange={() =>
                    onAnswer({ enjoyment: (i + 1) as 1 | 2 | 3 | 4 | 5 })
                  }
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="intimacy-limit">
        <input
          type="checkbox"
          checked={isLimit}
          onChange={(e) =>
            onAnswer({
              firmBoundary: e.target.checked,
              ...(!e.target.checked &&
              answer?.partnerWillingness === "firm_boundary"
                ? { partnerWillingness: undefined }
                : {}),
            })
          }
        />
        <span>
          Hard limit{" "}
          <small>
            {isLimit
              ? "Excluded from partner suggestions. Your desire rating is kept."
              : "Keep this out of partner suggestions."}
          </small>
        </span>
      </label>
      <details className="intimacy-details">
        <summary>
          Willingness, experience & privacy{" "}
          <span>
            {answer?.revealRule === "private_never_share"
              ? "Private"
              : answer?.partnerWillingness
                ? "Added"
                : "Optional"}
          </span>
        </summary>
        <div className="intimacy-details-body">
          <p>
            Desire is not willingness. Nothing is shared from this item unless
            both people are eligible for a mutual match. Leave willingness blank
            to keep it out of matching.
          </p>
          <fieldset>
            <legend>What are you freely willing to discuss today?</legend>
            <div className="intimacy-willingness">
              {willingnessOptions.map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={`${prefix}-willingness`}
                    value={value}
                    checked={answer?.partnerWillingness === value}
                    onChange={() => onAnswer({ partnerWillingness: value })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {answer?.partnerWillingness && (
              <button
                type="button"
                className="text-link mt-2 text-xs"
                onClick={() => onAnswer({ partnerWillingness: undefined })}
              >
                Clear willingness
              </button>
            )}
          </fieldset>
          <div className="intimacy-detail-selects">
            <label htmlFor={`${prefix}-experience`}>
              Past experience
              <select
                id={`${prefix}-experience`}
                value={
                  typeof answer?.experienceFrequency === "number"
                    ? answer.experienceFrequency
                    : ""
                }
                onChange={(e) =>
                  onAnswer({
                    experienceFrequency: e.target.value
                      ? (Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
                      : undefined,
                  })
                }
              >
                <option value="">Not rated / prefer not to answer</option>
                {["Never", "Rarely", "Sometimes", "Often", "Very often"].map(
                  (label, i) => (
                    <option key={label} value={i + 1}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label htmlFor={`${prefix}-privacy`}>
              Partner visibility
              <select
                id={`${prefix}-privacy`}
                value={answer?.revealRule || "mutual_only"}
                onChange={(e) =>
                  onAnswer({
                    revealRule: e.target.value as
                      | "mutual_only"
                      | "private_never_share",
                  })
                }
              >
                <option value="mutual_only">Only as a mutual match</option>
                <option value="private_never_share">Always private</option>
              </select>
            </label>
          </div>
          <p>
            Experience is private context. “Never” means no experience, not no
            desire. Hard limits override willingness for matching.
          </p>
          {answer?.enjoyment !== undefined && (
            <button
              type="button"
              className="text-link text-xs"
              onClick={() => onAnswer({ enjoyment: undefined })}
            >
              Clear desire rating
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
