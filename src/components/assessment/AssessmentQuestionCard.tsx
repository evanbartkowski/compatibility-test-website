"use client";
import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  EyeOff,
  ShieldAlert,
  Users,
} from "lucide-react";
import type {
  CuriosityLevel,
  DesireDeltaResponse,
  EnjoymentResponse,
  ExperienceFrequencyResponse,
  FantasyRevealRule,
  ImportanceLevel,
  PartnerWillingnessState,
  QuestionAnswer,
  QuestionDefinition,
} from "@/lib/assessment/types";
import { hasMeaningfulAnswer } from "@/lib/assessment/answers";
import { cn } from "@/lib/utils";
import { AgreementScale } from "./AgreementScale";
import { IntimacyResponse } from "./IntimacyResponse";

const ENJOYMENT_SCALE: Array<{
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  short: string;
}> = [
  { value: 1, label: "Strongly dislike", short: "1" },
  { value: 2, label: "Dislike", short: "2" },
  { value: 3, label: "Neutral", short: "3" },
  { value: 4, label: "Like", short: "4" },
  { value: 5, label: "Strongly like", short: "5" },
];

const SPECIAL_STATES: Array<{ value: EnjoymentResponse; label: string }> = [
  { value: "haven_t_experienced", label: "Haven't experienced this" },
  { value: "curious", label: "Curious about trying" },
  { value: "depends", label: "Depends on the situation" },
  { value: "prefer_not_to_answer", label: "Prefer not to answer" },
];

const EXPERIENCE_FREQUENCY: Array<{
  value: ExperienceFrequencyResponse;
  label: string;
}> = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Very often" },
  { value: "prefer_not_to_answer", label: "Prefer not to answer" },
];

export const DESIRE_DELTA_OPTIONS: Array<{
  value: DesireDeltaResponse;
  label: string;
}> = [
  { value: "want_more", label: "Would love more often" },
  { value: "about_right", label: "About the right amount" },
  { value: "want_less", label: "Would prefer less often" },
];

const IMPORTANCE_OPTIONS: Array<{ value: ImportanceLevel; label: string }> = [
  { value: "essential", label: "Essential to me" },
  { value: "important", label: "Important" },
  { value: "nice_to_have", label: "Nice to have" },
  { value: "not_important", label: "Not particularly important" },
];

const PARTNER_WILLINGNESS_OPTIONS: Array<{
  value: PartnerWillingnessState;
  label: string;
  hint: string;
}> = [
  {
    value: "enthusiastically_enjoy",
    label: "Enthusiastically enjoy",
    hint: "Genuine personal enjoyment",
  },
  {
    value: "willing_if_partner_enjoys",
    label: "Willing if partner enjoys",
    hint: "Supportive willingness, not independent craving",
  },
  {
    value: "curious_to_explore",
    label: "Curious to explore",
    hint: "Open to discussing together",
  },
  {
    value: "depends_on_context",
    label: "Depends on context",
    hint: "Timing, mood, and trust matter",
  },
  {
    value: "prefer_not_to",
    label: "Prefer not to",
    hint: "Low personal interest",
  },
  {
    value: "firm_boundary",
    label: "Firm boundary",
    hint: "Not something I want to do",
  },
];

const CURIOSITY_OPTIONS: Array<{
  value: CuriosityLevel;
  label: string;
  hint: string;
}> = [
  {
    value: "very_interested",
    label: "Very interested",
    hint: "High enthusiasm or strong yes",
  },
  {
    value: "interested",
    label: "Interested / Open",
    hint: "Gladly welcome this",
  },
  {
    value: "curious_uncertain",
    label: "Curious / Maybe",
    hint: "Wondering about it gently",
  },
  {
    value: "not_interested",
    label: "Not for me",
    hint: "Low appeal right now",
  },
  {
    value: "firm_boundary",
    label: "Hard boundary",
    hint: "Off-limits · respected strictly",
  },
  {
    value: "havent_considered",
    label: "Haven't considered",
    hint: "Neutral / unexplored thought",
  },
];

export const REVEAL_RULE_OPTIONS: Array<{
  value: FantasyRevealRule;
  label: string;
  hint: string;
}> = [
  {
    value: "mutual_only",
    label: "Reveal only if mutual",
    hint: "Hidden unless partner independently shows interest",
  },
  {
    value: "always_share_with_partner",
    label: "Share openly",
    hint: "Share gently in partner report even if one-sided",
  },
  {
    value: "private_never_share",
    label: "Keep completely private",
    hint: "Personal journal only · never shown to partners",
  },
];

export function AssessmentQuestionCard({
  question: currentQuestion,
  answer: currentAnswer,
  number,
  perspective,
  onAnswer,
  onSkip,
}: {
  question: QuestionDefinition;
  answer?: QuestionAnswer;
  number: number;
  perspective: "primary" | "partner";
  onAnswer: (patch: Partial<QuestionAnswer>) => void;
  onSkip: () => void;
}) {
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const updateCurrentAnswer = onAnswer;
  const displayPrompt =
    perspective === "partner"
      ? currentQuestion.partnerPrompt
      : currentQuestion.prompt;
  const answered = hasMeaningfulAnswer(currentAnswer);
  const showImportanceControl =
    currentQuestion.inputType !== "intimacy_profile" &&
    currentQuestion.supportsImportance !== false &&
    currentQuestion.inputType !== "partner_prediction" &&
    currentQuestion.inputType !== "would_rather_vote";
  const currentRankOrder: string[] =
    currentQuestion.inputType === "ranking"
      ? Array.isArray(currentAnswer?.customValue)
        ? currentAnswer.customValue
        : (currentQuestion.options || []).map((o) => o.value)
      : [];

  const moveRankItem = (idx: number, delta: -1 | 1) => {
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= currentRankOrder.length) return;
    const copy = [...currentRankOrder];
    const [moved] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, moved);
    updateCurrentAnswer({ customValue: copy });
  };

  return (
    <article
      className="assessment-question-card"
      data-answered={answered}
      data-skipped={!!currentAnswer?.skipped}
      aria-labelledby={`assessment-question-${currentQuestion.id}`}
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          !/^[1-7]$/.test(event.key) ||
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        )
          return;
        const value = Number(event.key);
        if (
          currentQuestion.inputType === "rating_scale" &&
          value >= (currentQuestion.scaleConfig?.min ?? 1) &&
          value <= (currentQuestion.scaleConfig?.max ?? 5)
        ) {
          event.preventDefault();
          updateCurrentAnswer({ customValue: value, firmBoundary: false });
        } else if (
          currentQuestion.inputType === "enjoyment_scale" &&
          value <= 5 &&
          !(
            perspective === "partner" &&
            currentQuestion.partnerSupportsWillingness
          )
        ) {
          event.preventDefault();
          updateCurrentAnswer({
            enjoyment: value as 1 | 2 | 3 | 4 | 5,
            firmBoundary: false,
          });
        }
      }}
    >
      <div className="assessment-question-meta">
        <span className="assessment-question-number" aria-hidden="true">
          {answered ? <Check size={16} aria-hidden="true" /> : number}
        </span>
        <span className="sr-only">Question {number}</span>
        <span>{currentQuestion.sectionTitle}</span>
        <span className="assessment-answer-status">
          {answered
            ? "Answered"
            : currentAnswer?.skipped
              ? "Skipped"
              : "Choose one answer"}
        </span>
      </div>
      {currentQuestion.inputType === "partner_prediction" && (
        <p className="assessment-question-hint">
          <Users size={16} aria-hidden="true" />
          {perspective === "partner"
            ? "How do you think your partner answered?"
            : "Answer for yourself. Your partner can guess your answer later."}
        </p>
      )}
      <h3
        id={`assessment-question-${currentQuestion.id}`}
        tabIndex={-1}
        className="font-display"
      >
        {displayPrompt}
      </h3>
      {/* TYPE 1: Partner Willingness OR Enjoyment Scale */}
      {currentQuestion.inputType === "enjoyment_scale" &&
        (perspective === "partner" &&
        currentQuestion.partnerSupportsWillingness ? (
          <div className="mt-7 space-y-2.5">
            <p className="text-xs font-medium text-[var(--ink-muted)]">
              Select your genuine interest or willingness (willingness is scored
              distinctly from enthusiasm):
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PARTNER_WILLINGNESS_OPTIONS.map((opt) => {
                const selected =
                  currentAnswer?.partnerWillingness === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateCurrentAnswer({
                        partnerWillingness: opt.value,
                        firmBoundary: opt.value === "firm_boundary",
                      })
                    }
                    className={cn(
                      "rounded-2xl border p-3.5 text-left transition-all",
                      selected
                        ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                        : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                    )}
                  >
                    <span className="block text-sm font-medium">
                      {opt.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px]",
                        selected ? "opacity-85" : "text-[var(--ink-muted)]",
                      )}
                    >
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7">
              <p className="mb-2.5 text-xs font-medium text-[var(--ink-muted)]">
                Your personal preference (keys 1 to 5)
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                {ENJOYMENT_SCALE.map((opt) => {
                  const selected =
                    !currentAnswer?.firmBoundary &&
                    currentAnswer?.enjoyment === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        updateCurrentAnswer({
                          enjoyment: opt.value,
                          firmBoundary: false,
                        })
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all sm:flex-col sm:items-center sm:text-center",
                        selected
                          ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                      )}
                    >
                      <span className="font-mono-tabular text-xs opacity-70">
                        {opt.short}
                      </span>
                      <span className="text-xs font-medium sm:mt-1">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SPECIAL_STATES.map((st) => {
                const selected =
                  !currentAnswer?.firmBoundary &&
                  currentAnswer?.enjoyment === st.value;
                return (
                  <button
                    key={String(st.value)}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateCurrentAnswer({
                        enjoyment: st.value,
                        firmBoundary: false,
                      })
                    }
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                      selected
                        ? "border-[var(--accent-gold-fill)] bg-[var(--accent-gold-fill)] text-[var(--accent-gold-contrast)]"
                        : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                    )}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </>
        ))}

      {currentQuestion.inputType === "intimacy_profile" && (
        <IntimacyResponse
          question={currentQuestion}
          answer={currentAnswer}
          onAnswer={onAnswer}
        />
      )}

      {/* TYPE 2: CURIOSITY MAP (6 states + optional Reveal Rule for Test 9) */}
      {currentQuestion.inputType === "curiosity_map" && (
        <div className="mt-7 space-y-5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {CURIOSITY_OPTIONS.map((opt) => {
              const selected = currentAnswer?.curiosityLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    updateCurrentAnswer({
                      curiosityLevel: opt.value,
                      firmBoundary: opt.value === "firm_boundary",
                    })
                  }
                  className={cn(
                    "rounded-2xl border p-3.5 text-left transition-all",
                    selected
                      ? opt.value === "firm_boundary"
                        ? "border-[var(--accent-rose-fill)] bg-[var(--accent-rose-fill)] text-[var(--accent-rose-contrast)]"
                        : "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px]",
                      selected ? "opacity-85" : "text-[var(--ink-muted)]",
                    )}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {currentQuestion.supportsRevealRule && (
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-primary)]">
                <EyeOff className="h-3.5 w-3.5 text-[var(--accent-plum)]" />{" "}
                Partner Privacy Rule
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                {REVEAL_RULE_OPTIONS.map((rule) => {
                  const active =
                    (currentAnswer?.revealRule || "mutual_only") === rule.value;
                  return (
                    <button
                      key={rule.value}
                      type="button"
                      onClick={() =>
                        updateCurrentAnswer({ revealRule: rule.value })
                      }
                      className={cn(
                        "rounded-xl border p-2.5 text-left text-xs transition-all",
                        active
                          ? "border-[var(--accent-plum)] bg-[var(--bg-elevated)] font-medium text-[var(--ink-primary)] shadow-sm"
                          : "border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                      )}
                    >
                      <span className="block">{rule.label}</span>
                      <span className="mt-0.5 block text-[10px] text-[var(--ink-muted)]">
                        {rule.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TYPE 3: RATING SCALE (5-pt / 7-pt Likert with anchor captions) */}
      {currentQuestion.inputType === "rating_scale" &&
        (() => {
          const min = currentQuestion.scaleConfig?.min ?? 1;
          const max = currentQuestion.scaleConfig?.max ?? 5;
          if (
            min === 1 &&
            max === 7 &&
            currentQuestion.scaleConfig?.maxLabel === "Strongly agree"
          ) {
            return (
              <AgreementScale
                questionId={currentQuestion.id}
                value={currentAnswer?.customValue}
                onChange={(customValue) =>
                  updateCurrentAnswer({ customValue, firmBoundary: false })
                }
              />
            );
          }
          const values = Array.from(
            { length: max - min + 1 },
            (_, i) => min + i,
          );
          return (
            <div className="mt-7 space-y-3">
              <div
                className={cn(
                  "grid gap-2",
                  values.length === 7 ? "grid-cols-7" : "grid-cols-5",
                )}
              >
                {values.map((val) => {
                  const selected =
                    !currentAnswer?.firmBoundary &&
                    currentAnswer?.customValue === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        updateCurrentAnswer({
                          customValue: val,
                          firmBoundary: false,
                        })
                      }
                      className={cn(
                        "flex h-12 items-center justify-center rounded-xl border font-mono-tabular text-sm font-semibold transition-all sm:h-14",
                        selected
                          ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between gap-4 text-[11px] text-[var(--ink-muted)]">
                <span>
                  {currentQuestion.scaleConfig?.minLabel || "Strongly disagree"}
                </span>
                {currentQuestion.scaleConfig?.midLabel && (
                  <span className="hidden sm:inline">
                    {currentQuestion.scaleConfig.midLabel}
                  </span>
                )}
                <span className="text-right">
                  {currentQuestion.scaleConfig?.maxLabel || "Strongly agree"}
                </span>
              </div>
            </div>
          );
        })()}

      {/* TYPE 4: SLIDER */}
      {currentQuestion.inputType === "slider" &&
        (() => {
          const cfg = currentQuestion.sliderConfig || {
            min: 0,
            max: 100,
            step: 5,
            minLabel: "Low",
            maxLabel: "High",
          };
          const val =
            typeof currentAnswer?.customValue === "number"
              ? currentAnswer.customValue
              : Math.round((cfg.min + cfg.max) / 2);
          return (
            <div className="mt-7 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--ink-secondary)]">
                  Current position
                </span>
                <span
                  className="rounded-full px-3 py-1 font-mono-tabular text-xs font-semibold"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-plum) 15%, transparent)",
                    color: "var(--accent-plum)",
                  }}
                >
                  {val}
                  {cfg.unit ? ` ${cfg.unit}` : "%"}
                </span>
              </div>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={val}
                aria-label={displayPrompt}
                onChange={(e) =>
                  updateCurrentAnswer({
                    customValue: Number(e.target.value),
                  })
                }
                className="h-2.5 w-full cursor-pointer accent-[var(--accent-plum)]"
              />
              <div className="flex justify-between gap-4 text-xs text-[var(--ink-secondary)]">
                <span className="max-w-[44%]">{cfg.minLabel}</span>
                <span className="max-w-[44%] text-right">{cfg.maxLabel}</span>
              </div>
              {typeof currentAnswer?.customValue !== "number" && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => updateCurrentAnswer({ customValue: val })}
                >
                  Use this position
                </button>
              )}
            </div>
          );
        })()}

      {/* TYPE 5: MULTIPLE CHOICE / FORCED CHOICE / SITUATIONAL / PREDICTION / VOTE */}
      {(currentQuestion.inputType === "multiple_choice" ||
        currentQuestion.inputType === "forced_choice" ||
        currentQuestion.inputType === "situational" ||
        currentQuestion.inputType === "partner_prediction" ||
        currentQuestion.inputType === "would_rather_vote") && (
        <div className="mt-7 space-y-2.5">
          {(currentQuestion.options || []).map((opt) => {
            const selected = currentAnswer?.customValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  updateCurrentAnswer({
                    customValue: opt.value,
                    firmBoundary: false,
                  })
                }
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left text-sm transition-all",
                  selected
                    ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                )}
              >
                <span className="font-medium leading-snug">{opt.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* TYPE 6: ACCESSIBLE RANKING */}
      {currentQuestion.inputType === "ranking" && (
        <div className="mt-7 space-y-2.5">
          <p className="text-xs text-[var(--ink-muted)]">
            Order from #1 (top priority) down using the arrow controls:
          </p>
          {currentRankOrder.map((optVal, idx) => {
            const opt = currentQuestion.options?.find(
              (o) => o.value === optVal,
            );
            if (!opt) return null;
            return (
              <div
                key={opt.value}
                className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                style={{
                  backgroundColor: "var(--bg-canvas)",
                  borderColor:
                    idx === 0 ? "var(--accent-plum)" : "var(--border-hairline)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono-tabular text-xs font-bold"
                    style={{
                      backgroundColor:
                        idx === 0 ? "var(--accent-plum)" : "var(--bg-subtle)",
                      color:
                        idx === 0
                          ? "var(--accent-plum-contrast)"
                          : "var(--ink-secondary)",
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--ink-primary)]">
                    {opt.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveRankItem(idx, -1)}
                    disabled={idx === 0}
                    aria-label={`Move ${opt.label} up`}
                    className="rounded-lg border p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRankItem(idx, 1)}
                    disabled={idx === currentRankOrder.length - 1}
                    aria-label={`Move ${opt.label} down`}
                    className="rounded-lg border p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {!Array.isArray(currentAnswer?.customValue) && (
            <button
              type="button"
              onClick={() =>
                updateCurrentAnswer({ customValue: currentRankOrder })
              }
              className="text-xs font-medium text-[var(--accent-plum)] hover:underline"
            >
              Keep current order as my selection
            </button>
          )}
        </div>
      )}

      {/* TYPE 7: MULTI-SELECT */}
      {currentQuestion.inputType === "multi_select" && (
        <div className="mt-7 space-y-2.5">
          {(currentQuestion.options || []).map((opt) => {
            const list = Array.isArray(currentAnswer?.customValue)
              ? currentAnswer.customValue
              : [];
            const selected = list.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const next = selected
                    ? list.filter((v) => v !== opt.value)
                    : [...list, opt.value];
                  updateCurrentAnswer({ customValue: next });
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left text-sm transition-all",
                  selected
                    ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]",
                )}
              >
                <span>{opt.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Separate Boundary Flag (for enjoyment/rating scales with supportsBoundaryFlag) */}
      {currentQuestion.supportsBoundaryFlag &&
        currentQuestion.inputType !== "intimacy_profile" &&
        currentQuestion.inputType !== "curiosity_map" &&
        perspective === "primary" && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() =>
                updateCurrentAnswer({
                  firmBoundary: !currentAnswer?.firmBoundary,
                  ...(currentQuestion.inputType === "enjoyment_scale"
                    ? {
                        enjoyment: !currentAnswer?.firmBoundary
                          ? 1
                          : currentAnswer?.enjoyment,
                      }
                    : {}),
                })
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium",
                currentAnswer?.firmBoundary
                  ? "border-[var(--accent-rose-fill)] bg-[var(--accent-rose-fill)] text-[var(--accent-rose-contrast)]"
                  : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Not something I want to do (Firm Boundary)
            </button>
          </div>
        )}

      {/* Importance + Optional 2nd Dimension (Experience Frequency + Desire Delta) */}
      {(showImportanceControl ||
        (currentQuestion.inputType !== "intimacy_profile" &&
          currentQuestion.supportsExperienceFrequency &&
          perspective === "primary")) && (
        <div
          className="mt-7 border-t pt-5"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          {showImportanceControl && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--ink-secondary)]">
                  How important is this to you?
                </span>
                {currentQuestion.supportsExperienceFrequency &&
                  perspective === "primary" && (
                    <button
                      type="button"
                      onClick={() => setShowOptionalDetails((s) => !s)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-plum)]"
                    >
                      {showOptionalDetails
                        ? "Hide experience frequency"
                        : "Add past experience frequency (for scatterplot)"}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          showOptionalDetails && "rotate-180",
                        )}
                      />
                    </button>
                  )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {IMPORTANCE_OPTIONS.map((imp) => {
                  const selected =
                    (currentAnswer?.importance || "nice_to_have") === imp.value;
                  return (
                    <button
                      key={imp.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        updateCurrentAnswer({ importance: imp.value })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        selected
                          ? "border-[var(--ink-primary)] bg-[var(--ink-primary)] text-[var(--bg-canvas)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                      )}
                    >
                      {imp.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Optional 2nd Dimension: Past Experience Frequency + Desire Delta */}
          {currentQuestion.supportsExperienceFrequency &&
            perspective === "primary" &&
            (showOptionalDetails ||
              currentAnswer?.experienceFrequency !== undefined ||
              currentAnswer?.desireDelta !== undefined) && (
              <div
                className="mt-4 space-y-4 rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div>
                  <p className="text-xs font-medium text-[var(--ink-primary)]">
                    Optional: How often have you experienced this with previous
                    partners?
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                    Powers your Desire vs. Experience scatterplot. Leave blank
                    if not applicable.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {EXPERIENCE_FREQUENCY.map((freq) => {
                      const selected =
                        currentAnswer?.experienceFrequency === freq.value;
                      return (
                        <button
                          key={String(freq.value)}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            updateCurrentAnswer({
                              experienceFrequency: freq.value,
                            })
                          }
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            selected
                              ? "border-[var(--accent-gold-fill)] bg-[var(--accent-gold-fill)] text-[var(--accent-gold-contrast)]"
                              : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                          )}
                        >
                          {freq.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {currentQuestion.supportsDesireDelta && (
                  <div
                    className="border-t pt-3"
                    style={{ borderColor: "var(--border-hairline)" }}
                  >
                    <p className="text-xs font-medium text-[var(--ink-primary)]">
                      Optional pacing signal: How would you shift frequency
                      going forward?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {DESIRE_DELTA_OPTIONS.map((dd) => {
                        const selected =
                          currentAnswer?.desireDelta === dd.value;
                        return (
                          <button
                            key={dd.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              updateCurrentAnswer({ desireDelta: dd.value })
                            }
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium",
                              selected
                                ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                                : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                            )}
                          >
                            {dd.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      <div className="assessment-question-footer">
        <details>
          <summary>Help with this question</summary>
          <p>{currentQuestion.helperText}</p>
        </details>
        <button
          type="button"
          onClick={onSkip}
          disabled={!!currentAnswer?.skipped}
          aria-label={`Skip question ${number}`}
        >
          {currentAnswer?.skipped ? "Skipped" : "Skip question"}
        </button>
      </div>
    </article>
  );
}
