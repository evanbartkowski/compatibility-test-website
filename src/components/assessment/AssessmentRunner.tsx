"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  EyeOff,
  HelpCircle,
  Lock,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { brandConfig } from "@/config/brand";
import type {
  AssessmentDefinition,
  AssessmentDraft,
  AssessmentMode,
  BranchCondition,
  ConsentSettings,
  CuriosityLevel,
  DesireDeltaResponse,
  EnjoymentResponse,
  ExperienceFrequencyResponse,
  FantasyRevealRule,
  ImportanceLevel,
  PartnerWillingnessState,
  QuestionAnswer,
  QuestionDefinition,
  SharingPreferences,
} from "@/lib/assessment/types";
import { formatAnswerDisplayLabel, formatImportanceLabel } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

interface AssessmentRunnerProps {
  assessment: AssessmentDefinition;
  initialMode?: AssessmentMode;
  perspective?: "primary" | "partner";
  inviteToken?: string;
  creatorDisplayName?: string;
}

const ENJOYMENT_SCALE: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string; short: string }> = [
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

const EXPERIENCE_FREQUENCY: Array<{ value: ExperienceFrequencyResponse; label: string }> = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Very often" },
  { value: "prefer_not_to_answer", label: "Prefer not to answer" },
];

const DESIRE_DELTA_OPTIONS: Array<{ value: DesireDeltaResponse; label: string }> = [
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
  { value: "curious_to_explore", label: "Curious to explore", hint: "Open to discussing together" },
  { value: "depends_on_context", label: "Depends on context", hint: "Timing, mood, and trust matter" },
  { value: "prefer_not_to", label: "Prefer not to", hint: "Low personal interest" },
  { value: "firm_boundary", label: "Firm boundary", hint: "Not something I want to do" },
];

const CURIOSITY_OPTIONS: Array<{ value: CuriosityLevel; label: string; hint: string }> = [
  { value: "very_interested", label: "Very interested", hint: "High enthusiasm or strong yes" },
  { value: "interested", label: "Interested / Open", hint: "Gladly welcome this" },
  { value: "curious_uncertain", label: "Curious / Maybe", hint: "Wondering about it gently" },
  { value: "not_interested", label: "Not for me", hint: "Low appeal right now" },
  { value: "firm_boundary", label: "Hard boundary", hint: "Off-limits · respected strictly" },
  { value: "havent_considered", label: "Haven't considered", hint: "Neutral / unexplored thought" },
];

const REVEAL_RULE_OPTIONS: Array<{ value: FantasyRevealRule; label: string; hint: string }> = [
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

function evaluateBranching(
  cond: BranchCondition | undefined,
  answers: Record<string, QuestionAnswer>
): boolean {
  if (!cond) return true;
  const target = answers[cond.dependsOnQuestionId];
  if (!target) return false;
  const raw = target.enjoyment ?? target.curiosityLevel ?? target.customValue;
  if (raw === undefined) return false;
  if (cond.operator === "equals") return raw === cond.value;
  if (cond.operator === "not_equals") return raw !== cond.value;
  if (cond.operator === "gte")
    return typeof raw === "number" && typeof cond.value === "number" && raw >= cond.value;
  if (cond.operator === "in" && Array.isArray(cond.value))
    return cond.value.includes(raw as string | number);
  return true;
}

export function AssessmentRunner({
  assessment,
  initialMode = "quick",
  perspective = "primary",
  inviteToken,
  creatorDisplayName,
}: AssessmentRunnerProps) {
  const router = useRouter();
  const draftStorageKey = `between_us_draft_${assessment.slug}_${perspective}_${inviteToken || "self"}`;

  const effectiveDefaultMode: AssessmentMode =
    assessment.supportsQuickMode === false ? "complete" : initialMode;

  const [step, setStep] = useState<"consent" | "questions" | "review" | "submitting">("consent");
  const [mode, setMode] = useState<AssessmentMode>(effectiveDefaultMode);
  const [consent, setConsent] = useState<ConsentSettings>({
    confirmedAdult18Plus: false,
    acceptedPrivacyTerms: false,
    optInCommunityStats: false,
    cohortMetadata: {
      ageGroup: "prefer_not",
      relationshipStatus: "prefer_not",
      datingPreference: "prefer_not",
    },
    consentedAt: "",
  });

  const [partnerSharing, setPartnerSharing] = useState<SharingPreferences>({
    shareCategoryScores: true,
    shareAlignedHighlights: true,
    shareComplementaryHighlights: true,
    shareSharedCuriosities: true,
    shareHighLevelBoundariesWithoutDetails: true,
    neverExposeRawPrivateAnswers: true,
  });

  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [savedDraftPrompt, setSavedDraftPrompt] = useState<AssessmentDraft | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [pauseNotice, setPauseNotice] = useState(false);

  // Restore saved draft if present
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AssessmentDraft;
        if (parsed && Object.keys(parsed.answers || {}).length > 0) {
          setSavedDraftPrompt(parsed);
        }
      }
    } catch {
      // ignore invalid storage
    }
  }, [draftStorageKey]);

  const activeQuestions: QuestionDefinition[] = useMemo(() => {
    const useQuick = mode === "quick" && assessment.supportsQuickMode !== false;
    const base = useQuick
      ? assessment.questions.filter((q) => q.quickDiscovery)
      : assessment.questions;
    const eligible = base.length > 0 ? base : assessment.questions;
    return eligible.filter((q) => evaluateBranching(q.branchingCondition, answers));
  }, [assessment.questions, assessment.supportsQuickMode, mode, answers]);

  const currentQuestion = activeQuestions[currentIndex] || activeQuestions[0];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Autosave progress whenever answers, mode, or index change during quiz
  useEffect(() => {
    if (step === "consent" || step === "submitting") return;
    try {
      const draft: AssessmentDraft = {
        draftId: draftStorageKey,
        assessmentSlug: assessment.slug,
        assessmentVersion: assessment.version,
        mode,
        perspective,
        inviteToken,
        consent,
        answers,
        currentQuestionIndex: currentIndex,
        startedAt: consent.consentedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // ignore storage quota errors
    }
  }, [
    step,
    draftStorageKey,
    assessment.slug,
    assessment.version,
    mode,
    perspective,
    inviteToken,
    consent,
    answers,
    currentIndex,
  ]);

  const updateCurrentAnswer = useCallback(
    (patch: Partial<QuestionAnswer>) => {
      if (!currentQuestion) return;
      setPauseNotice(false);
      setAnswers((prev) => {
        const existing = prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          [currentQuestion.id]: {
            ...existing,
            ...patch,
            skipped: false,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [currentQuestion]
  );

  const goNext = useCallback(() => {
    setShowHelp(false);
    setPauseNotice(false);
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep("review");
    }
  }, [currentIndex, activeQuestions.length]);

  const goPrev = useCallback(() => {
    setShowHelp(false);
    setPauseNotice(false);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const skipCurrent = useCallback(() => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        skipped: true,
        updatedAt: new Date().toISOString(),
      },
    }));
    goNext();
  }, [currentQuestion, goNext]);

  // Keyboard shortcuts (1-7 for numeric scales, ArrowLeft/ArrowRight to step)
  useEffect(() => {
    if (step !== "questions" || !currentQuestion) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (["1", "2", "3", "4", "5", "6", "7"].includes(e.key)) {
        const num = Number(e.key);
        if (currentQuestion.inputType === "enjoyment_scale" && num <= 5) {
          updateCurrentAnswer({ enjoyment: num as 1 | 2 | 3 | 4 | 5, firmBoundary: false });
        } else if (currentQuestion.inputType === "rating_scale") {
          const min = currentQuestion.scaleConfig?.min ?? 1;
          const max = currentQuestion.scaleConfig?.max ?? 5;
          if (num >= min && num <= max) {
            updateCurrentAnswer({ customValue: num, firmBoundary: false });
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, currentQuestion, updateCurrentAnswer, goNext, goPrev]);

  const handleResumeDraft = () => {
    if (!savedDraftPrompt) return;
    setMode(savedDraftPrompt.mode);
    setConsent(savedDraftPrompt.consent);
    setAnswers(savedDraftPrompt.answers);
    setCurrentIndex(
      Math.max(0, Math.min(savedDraftPrompt.currentQuestionIndex || 0, activeQuestions.length - 1))
    );
    setSavedDraftPrompt(null);
    setStep("questions");
  };

  const handleStartFresh = () => {
    if (!consent.confirmedAdult18Plus || !consent.acceptedPrivacyTerms) {
      setErrorMsg("Please confirm you are 18+ and agree to the private processing terms.");
      return;
    }
    setErrorMsg(null);
    setConsent((c) => ({ ...c, consentedAt: new Date().toISOString() }));
    setStep("questions");
  };

  const handleUpgradeToComplete = () => {
    setMode("complete");
    if (step === "review") {
      const completeList = assessment.questions;
      const firstUnanswered = completeList.findIndex((q) => !answers[q.id]);
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      setStep("questions");
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setStep("submitting");
    try {
      const endpoint =
        perspective === "partner" && inviteToken
          ? `/api/invitations/${inviteToken}`
          : "/api/assessments/submit";

      const payload =
        perspective === "partner" && inviteToken
          ? {
              consent: {
                confirmedAdult18Plus: consent.confirmedAdult18Plus,
                acceptedPrivacyTerms: consent.acceptedPrivacyTerms,
                optInCommunityStats: consent.optInCommunityStats,
                consentedAt: consent.consentedAt || new Date().toISOString(),
              },
              partnerSharing,
              answers,
            }
          : {
              assessmentSlug: assessment.slug,
              mode,
              perspective,
              consent: {
                ...consent,
                consentedAt: consent.consentedAt || new Date().toISOString(),
              },
              answers,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to complete submission.");
      }

      window.localStorage.removeItem(draftStorageKey);
      if (perspective === "partner" && data.compatibilityId) {
        router.push(`/compatibility/${data.compatibilityId}`);
      } else {
        router.push(`/results/${data.submissionId}`);
      }
    } catch (err) {
      setStep("review");
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit assessment.");
    }
  };

  const answeredCount = activeQuestions.filter(
    (q) => answers[q.id] && !answers[q.id].skipped
  ).length;
  const progressPercent =
    activeQuestions.length > 0
      ? Math.round(((currentIndex + 1) / activeQuestions.length) * 100)
      : 0;
  const remainingCount = Math.max(0, activeQuestions.length - currentIndex);
  const remainingMinutes = Math.max(1, Math.ceil((remainingCount * 14) / 60));

  const showImportanceControl =
    currentQuestion &&
    currentQuestion.inputType !== "partner_prediction" &&
    currentQuestion.inputType !== "would_rather_vote";

  // -------------------------------------------------------------------------
  // STEP 1: OVERVIEW, DEPTH & CONSENT GATE
  // -------------------------------------------------------------------------
  if (step === "consent") {
    const quickCount = assessment.questions.filter((q) => q.quickDiscovery).length;
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {savedDraftPrompt && (
          <div
            className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--accent-gold)",
            }}
          >
            <div>
              <p className="text-sm font-semibold text-[var(--ink-primary)]">
                Unfinished session found ({Object.keys(savedDraftPrompt.answers).length} saved responses)
              </p>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                Resume right where you left off without losing any previous answers.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResumeDraft}
                className="rounded-full px-4 py-2 text-xs font-medium"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem(draftStorageKey);
                  setSavedDraftPrompt(null);
                }}
                className="rounded-full border px-3 py-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-3xl border p-6 sm:p-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {assessment.adultsOnly && (
              <span
                className="rounded-full px-2.5 py-0.5 font-medium"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-rose-fill) 16%, transparent)",
                  color: "var(--accent-rose)",
                }}
              >
                18+ Adult Intimacy
              </span>
            )}
            {assessment.supportsPartnerMatching && (
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[var(--ink-secondary)]">
                <Users className="h-3 w-3" /> Partner Matching Ready
              </span>
            )}
            {assessment.supportsMultiRater && (
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[var(--ink-secondary)]">
                <Users className="h-3 w-3" /> 360° Peer Mirror (n ≥ 3)
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl text-[var(--ink-primary)] sm:text-5xl">
            {perspective === "partner"
              ? `Complementary Assessment for ${creatorDisplayName || "Your Partner"}`
              : assessment.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {perspective === "partner"
              ? `You have been privately invited to complete the complementary partner version of ${assessment.title}. Neither of your private individual answers will ever be exposed without your consent.`
              : assessment.audienceNote}
          </p>

          {perspective === "primary" &&
            assessment.discoverPoints &&
            assessment.discoverPoints.length > 0 && (
              <div
                className="mt-6 rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <p className="text-xs font-semibold text-[var(--ink-primary)]">
                  What your report reveals
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  {assessment.discoverPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-sage)]" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {assessment.scientificDisclaimer && (
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--ink-muted)]">
              {assessment.scientificDisclaimer}
            </p>
          )}

          {/* Mode Choice (hidden for partner invites or single-depth modules) */}
          {perspective === "primary" && assessment.supportsQuickMode !== false && (
            <div className="mt-7">
              <p className="text-xs font-medium text-[var(--ink-secondary)]">
                Choose Assessment Depth
              </p>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "quick" as const,
                      title: "Quick Discovery",
                      meta: `${quickCount} questions · ~${assessment.estimatedMinutesQuick} min`,
                      desc: `High-signal introduction. Upgrade smoothly to all ${assessment.questions.length} items anytime without losing answers.`,
                    },
                    {
                      key: "complete" as const,
                      title: "Complete Assessment",
                      meta: `${assessment.questions.length} questions · ~${assessment.estimatedMinutesComplete} min`,
                      desc: "Full depth analysis across every section, radar theme, and tailored partner comparison.",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMode(item.key)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      mode === item.key
                        ? "border-[var(--accent-plum)] bg-[var(--bg-subtle)]"
                        : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--ink-primary)]">{item.title}</span>
                      <span className="font-mono-tabular text-xs text-[var(--accent-plum)]">
                        {item.meta}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="mt-8 space-y-4 border-t pt-6" style={{ borderColor: "var(--border-hairline)" }}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent.confirmedAdult18Plus}
                onChange={(e) =>
                  setConsent((c) => ({ ...c, confirmedAdult18Plus: e.target.checked }))
                }
                className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
              />
              <span className="text-sm leading-relaxed text-[var(--ink-primary)]">
                I confirm I am at least <strong>{brandConfig.minimumAge} years old</strong> and
                consent to reflecting on{" "}
                {assessment.adultsOnly
                  ? "romantic, communication, and adult intimacy preferences"
                  : "personal, romantic, and relationship discovery topics"}
                .
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent.acceptedPrivacyTerms}
                onChange={(e) =>
                  setConsent((c) => ({ ...c, acceptedPrivacyTerms: e.target.checked }))
                }
                className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
              />
              <span className="text-sm leading-relaxed text-[var(--ink-primary)]">
                I understand my responses are private, scored deterministically without third-party
                AI tools, and can be deleted at any time from my results or settings.
              </span>
            </label>

            {assessment.supportsCommunityComparison && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consent.optInCommunityStats}
                    onChange={(e) =>
                      setConsent((c) => ({ ...c, optInCommunityStats: e.target.checked }))
                    }
                    className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
                  />
                  <span className="text-xs leading-relaxed text-[var(--ink-secondary)]">
                    <strong className="text-[var(--ink-primary)]">
                      Optional: Contribute anonymized ratings to community comparisons
                    </strong>
                    <br />
                    Only aggregate averages where at least{" "}
                    {brandConfig.communityMinimumThreshold} opted-in respondents participated are
                    ever shown. Leaving this unchecked still gives you your full personal report.
                  </span>
                </label>

                {consent.optInCommunityStats && perspective === "primary" && (
                  <div className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-3">
                    <label className="block text-xs">
                      <span className="text-[var(--ink-muted)]">Age bracket (optional)</span>
                      <select
                        value={consent.cohortMetadata?.ageGroup || "prefer_not"}
                        onChange={(e) =>
                          setConsent((c) => ({
                            ...c,
                            cohortMetadata: {
                              ...c.cohortMetadata,
                              ageGroup: e.target.value as NonNullable<
                                ConsentSettings["cohortMetadata"]
                              >["ageGroup"],
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--ink-primary)]"
                      >
                        <option value="prefer_not">Prefer not to say</option>
                        <option value="18-24">18 to 24</option>
                        <option value="25-34">25 to 34</option>
                        <option value="35-44">35 to 44</option>
                        <option value="45+">45+</option>
                      </select>
                    </label>

                    <label className="block text-xs">
                      <span className="text-[var(--ink-muted)]">Relationship status</span>
                      <select
                        value={consent.cohortMetadata?.relationshipStatus || "prefer_not"}
                        onChange={(e) =>
                          setConsent((c) => ({
                            ...c,
                            cohortMetadata: {
                              ...c.cohortMetadata,
                              relationshipStatus: e.target.value as NonNullable<
                                ConsentSettings["cohortMetadata"]
                              >["relationshipStatus"],
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--ink-primary)]"
                      >
                        <option value="prefer_not">Prefer not to say</option>
                        <option value="single">Single</option>
                        <option value="dating">Dating</option>
                        <option value="partnered">Partnered</option>
                        <option value="married">Married</option>
                      </select>
                    </label>

                    <label className="block text-xs">
                      <span className="text-[var(--ink-muted)]">Dating focus</span>
                      <select
                        value={consent.cohortMetadata?.datingPreference || "prefer_not"}
                        onChange={(e) =>
                          setConsent((c) => ({
                            ...c,
                            cohortMetadata: {
                              ...c.cohortMetadata,
                              datingPreference: e.target.value as NonNullable<
                                ConsentSettings["cohortMetadata"]
                              >["datingPreference"],
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--ink-primary)]"
                      >
                        <option value="prefer_not">Prefer not to say</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="all_genders">All genders</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}

            {perspective === "partner" && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <p className="text-xs font-semibold text-[var(--ink-primary)]">
                  What you consent to share in the couple report
                </p>
                <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                  Raw individual ratings stay hidden. Choose which summary layers appear alongside{" "}
                  {creatorDisplayName || "your partner"}:
                </p>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  {(
                    [
                      ["shareCategoryScores", "Category alignment & radar overlay"],
                      ["shareAlignedHighlights", "Aligned & differing topic highlights"],
                      ["shareComplementaryHighlights", "Complementary dynamic insights"],
                      ["shareSharedCuriosities", "Mutually shared curiosities only"],
                      ["shareHighLevelBoundariesWithoutDetails", "High-level boundary reminders"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="flex items-center gap-2 text-[var(--ink-primary)]">
                      <input
                        type="checkbox"
                        checked={partnerSharing[field]}
                        onChange={(e) =>
                          setPartnerSharing((s) => ({ ...s, [field]: e.target.checked }))
                        }
                        className="h-3.5 w-3.5 accent-[var(--accent-plum)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="mt-4 text-xs font-medium text-[var(--accent-rose)]" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Lock className="h-3.5 w-3.5" /> Autosaves locally · Skip any item
            </span>
            <button
              type="button"
              onClick={handleStartFresh}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              Begin Questions <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STEP 4: CALCULATING / SUBMITTING REVEAL
  // -------------------------------------------------------------------------
  if (step === "submitting") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed"
          style={{ borderColor: "var(--accent-gold)" }}
        >
          <Sparkles className="h-6 w-6 text-[var(--accent-plum)]" />
        </motion.div>
        <h2 className="mt-6 font-display text-3xl text-[var(--ink-primary)]">
          Synthesizing your profile &amp; visualizations
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Computing deterministic dimension weights, desire-versus-experience coordinates, and
          tailored recommendations...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STEP 3: REVIEW & EDIT ANSWERS SCREEN
  // -------------------------------------------------------------------------
  if (step === "review") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl text-[var(--ink-primary)]">
              Review &amp; Refine Your Answers
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              You answered <span className="font-mono-tabular font-semibold">{answeredCount}</span>{" "}
              of <span className="font-mono-tabular font-semibold">{activeQuestions.length}</span>{" "}
              questions in{" "}
              {mode === "quick" && assessment.supportsQuickMode !== false
                ? "Quick Discovery"
                : "Complete Assessment"}{" "}
              mode.
            </p>
          </div>

          {perspective === "primary" &&
            mode === "quick" &&
            assessment.supportsQuickMode !== false && (
              <button
                type="button"
                onClick={handleUpgradeToComplete}
                className="rounded-full border px-4 py-2 text-xs font-medium text-[var(--accent-plum)] hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: "var(--accent-plum)" }}
              >
                Expand to Full {assessment.questions.length} Questions (Keep Answers)
              </button>
            )}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-6 rounded-xl border p-4 text-sm text-[var(--accent-rose)]"
            style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--accent-rose)" }}
          >
            {errorMsg}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {activeQuestions.map((q, idx) => {
            const ans = answers[q.id];
            const promptText = perspective === "partner" ? q.partnerPrompt : q.prompt;
            const formatted = formatAnswerDisplayLabel(q, ans);
            return (
              <div
                key={q.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[11px] text-[var(--ink-muted)]">{q.sectionTitle}</span>
                  <p className="text-sm font-medium text-[var(--ink-primary)]">{promptText}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-secondary)]">
                    <span>
                      Response: <strong className="text-[var(--ink-primary)]">{formatted}</strong>
                    </span>
                    {ans?.importance && q.inputType !== "partner_prediction" && (
                      <span>Importance: {formatImportanceLabel(ans.importance)}</span>
                    )}
                    {typeof ans?.experienceFrequency === "number" && (
                      <span>Experienced: {ans.experienceFrequency}/5</span>
                    )}
                    {ans?.desireDelta && (
                      <span>
                        Pacing:{" "}
                        {DESIRE_DELTA_OPTIONS.find((d) => d.value === ans.desireDelta)?.label}
                      </span>
                    )}
                    {ans?.revealRule && (
                      <span>
                        Visibility:{" "}
                        {REVEAL_RULE_OPTIONS.find((r) => r.value === ans.revealRule)?.label}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setStep("questions");
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Questions
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {perspective === "partner" ? "Generate Compatibility Report" : "Complete & View Results"}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STEP 2: MULTI-FORMAT ONE-QUESTION-AT-A-TIME INTERACTIVE RUNNER
  // -------------------------------------------------------------------------
  if (!currentQuestion) return null;
  const displayPrompt =
    perspective === "partner" ? currentQuestion.partnerPrompt : currentQuestion.prompt;

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Progress Bar & Metadata */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-secondary)]">
          <span className="font-medium text-[var(--accent-plum)]">
            {currentQuestion.sectionTitle}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ~{remainingMinutes} min left
            </span>
            <span className="font-mono-tabular">
              {currentIndex + 1} / {activeQuestions.length}
            </span>
            <button
              type="button"
              onClick={() => setPauseNotice((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            >
              <BookmarkCheck className="h-3 w-3" /> Pause &amp; Save
            </button>
          </div>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--bg-inset)" }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--accent-plum)" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {pauseNotice && (
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--accent-gold)",
            }}
          >
            <span className="text-[var(--ink-primary)]">
              Draft saved privately in this browser ({answeredCount} answered). Return anytime to
              resume.
            </span>
            <Link href="/explore" className="font-medium text-[var(--accent-plum)] hover:underline">
              Browse Tests
            </Link>
          </div>
        )}

        {perspective === "primary" && mode === "quick" && assessment.supportsQuickMode !== false && (
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
            <span>Quick Discovery Mode</span>
            <button
              type="button"
              onClick={handleUpgradeToComplete}
              className="font-medium text-[var(--accent-plum)] hover:underline"
            >
              Switch to Complete ({assessment.questions.length} items) without losing answers
            </button>
          </div>
        )}
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 rounded-3xl border p-6 sm:p-9"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {currentQuestion.inputType === "partner_prediction" && (
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent-plum) 14%, transparent)",
              color: "var(--accent-plum)",
            }}
          >
            <Users className="h-3 w-3" />
            {perspective === "partner"
              ? "Partner Trivia · Predict how your partner answered"
              : "Self Truth · Partner will later guess your answer"}
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl leading-snug text-[var(--ink-primary)] sm:text-3xl">
            {displayPrompt}
          </h2>
          <button
            type="button"
            onClick={() => setShowHelp((h) => !h)}
            aria-expanded={showHelp}
            aria-label="Toggle question context and clarification"
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {showHelp && (
          <div
            className="mt-4 rounded-xl border p-3.5 text-xs leading-relaxed text-[var(--ink-secondary)]"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-hairline)",
            }}
          >
            {currentQuestion.helperText}
          </div>
        )}

        {/* TYPE 1: Partner Willingness OR Enjoyment Scale */}
        {currentQuestion.inputType === "enjoyment_scale" &&
          (perspective === "partner" && currentQuestion.partnerSupportsWillingness ? (
            <div className="mt-7 space-y-2.5">
              <p className="text-xs font-medium text-[var(--ink-muted)]">
                Select your genuine interest or willingness (willingness is scored distinctly from
                enthusiasm):
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PARTNER_WILLINGNESS_OPTIONS.map((opt) => {
                  const selected = currentAnswer?.partnerWillingness === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
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
                          : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      <span className="block text-sm font-medium">{opt.label}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11px]",
                          selected ? "opacity-85" : "text-[var(--ink-muted)]"
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
                      !currentAnswer?.firmBoundary && currentAnswer?.enjoyment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          updateCurrentAnswer({ enjoyment: opt.value, firmBoundary: false })
                        }
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all sm:flex-col sm:items-center sm:text-center",
                          selected
                            ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                            : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
                        )}
                      >
                        <span className="font-mono-tabular text-xs opacity-70">{opt.short}</span>
                        <span className="text-xs font-medium sm:mt-1">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {SPECIAL_STATES.map((st) => {
                  const selected =
                    !currentAnswer?.firmBoundary && currentAnswer?.enjoyment === st.value;
                  return (
                    <button
                      key={String(st.value)}
                      type="button"
                      onClick={() =>
                        updateCurrentAnswer({ enjoyment: st.value, firmBoundary: false })
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                        selected
                          ? "border-[var(--accent-gold-fill)] bg-[var(--accent-gold-fill)] text-[var(--accent-gold-contrast)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      )}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </>
          ))}

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
                        : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <span className="block text-sm font-medium">{opt.label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px]",
                        selected ? "opacity-85" : "text-[var(--ink-muted)]"
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
                  <EyeOff className="h-3.5 w-3.5 text-[var(--accent-plum)]" /> Partner Privacy Rule
                </p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {REVEAL_RULE_OPTIONS.map((rule) => {
                    const active =
                      (currentAnswer?.revealRule || "mutual_only") === rule.value;
                    return (
                      <button
                        key={rule.value}
                        type="button"
                        onClick={() => updateCurrentAnswer({ revealRule: rule.value })}
                        className={cn(
                          "rounded-xl border p-2.5 text-left text-xs transition-all",
                          active
                            ? "border-[var(--accent-plum)] bg-[var(--bg-elevated)] font-medium text-[var(--ink-primary)] shadow-sm"
                            : "border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
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
        {currentQuestion.inputType === "rating_scale" && (() => {
          const min = currentQuestion.scaleConfig?.min ?? 1;
          const max = currentQuestion.scaleConfig?.max ?? 5;
          const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
          return (
            <div className="mt-7 space-y-3">
              <div
                className={cn(
                  "grid gap-2",
                  values.length === 7 ? "grid-cols-7" : "grid-cols-5"
                )}
              >
                {values.map((val) => {
                  const selected =
                    !currentAnswer?.firmBoundary && currentAnswer?.customValue === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateCurrentAnswer({ customValue: val, firmBoundary: false })}
                      className={cn(
                        "flex h-12 items-center justify-center rounded-xl border font-mono-tabular text-sm font-semibold transition-all sm:h-14",
                        selected
                          ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between gap-4 text-[11px] text-[var(--ink-muted)]">
                <span>{currentQuestion.scaleConfig?.minLabel || "Strongly disagree"}</span>
                {currentQuestion.scaleConfig?.midLabel && (
                  <span className="hidden sm:inline">{currentQuestion.scaleConfig.midLabel}</span>
                )}
                <span className="text-right">
                  {currentQuestion.scaleConfig?.maxLabel || "Strongly agree"}
                </span>
              </div>
            </div>
          );
        })()}

        {/* TYPE 4: SLIDER */}
        {currentQuestion.inputType === "slider" && (() => {
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
                <span className="font-medium text-[var(--ink-secondary)]">Current position</span>
                <span
                  className="rounded-full px-3 py-1 font-mono-tabular text-xs font-semibold"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-plum) 15%, transparent)",
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
                onChange={(e) => updateCurrentAnswer({ customValue: Number(e.target.value) })}
                className="h-2.5 w-full cursor-pointer accent-[var(--accent-plum)]"
              />
              <div className="flex justify-between gap-4 text-xs text-[var(--ink-secondary)]">
                <span className="max-w-[44%]">{cfg.minLabel}</span>
                <span className="max-w-[44%] text-right">{cfg.maxLabel}</span>
              </div>
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
                  onClick={() => updateCurrentAnswer({ customValue: opt.value, firmBoundary: false })}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left text-sm transition-all",
                    selected
                      ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
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
              const opt = currentQuestion.options?.find((o) => o.value === optVal);
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
                          idx === 0
                            ? "var(--accent-plum)"
                            : "var(--bg-subtle)",
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
                onClick={() => updateCurrentAnswer({ customValue: currentRankOrder })}
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
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]"
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
          currentQuestion.inputType !== "curiosity_map" &&
          perspective === "primary" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  updateCurrentAnswer({
                    firmBoundary: !currentAnswer?.firmBoundary,
                    ...(currentQuestion.inputType === "enjoyment_scale"
                      ? { enjoyment: !currentAnswer?.firmBoundary ? 1 : currentAnswer?.enjoyment }
                      : {}),
                  })
                }
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium",
                  currentAnswer?.firmBoundary
                    ? "border-[var(--accent-rose-fill)] bg-[var(--accent-rose-fill)] text-[var(--accent-rose-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                )}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Not something I want to do (Firm Boundary)
              </button>
            </div>
          )}

        {/* Importance + Optional 2nd Dimension (Experience Frequency + Desire Delta) */}
        {(showImportanceControl ||
          (currentQuestion.supportsExperienceFrequency && perspective === "primary")) && (
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
                  {currentQuestion.supportsExperienceFrequency && perspective === "primary" && (
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
                          showOptionalDetails && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {IMPORTANCE_OPTIONS.map((imp) => {
                    const selected = (currentAnswer?.importance || "nice_to_have") === imp.value;
                    return (
                      <button
                        key={imp.value}
                        type="button"
                        onClick={() => updateCurrentAnswer({ importance: imp.value })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-colors",
                          selected
                            ? "border-[var(--ink-primary)] bg-[var(--ink-primary)] text-[var(--bg-canvas)]"
                            : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
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
                      Optional: How often have you experienced this with previous partners?
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                      Powers your Desire vs. Experience scatterplot. Leave blank if not applicable.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {EXPERIENCE_FREQUENCY.map((freq) => {
                        const selected = currentAnswer?.experienceFrequency === freq.value;
                        return (
                          <button
                            key={String(freq.value)}
                            type="button"
                            onClick={() => updateCurrentAnswer({ experienceFrequency: freq.value })}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium",
                              selected
                                ? "border-[var(--accent-gold-fill)] bg-[var(--accent-gold-fill)] text-[var(--accent-gold-contrast)]"
                                : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                            )}
                          >
                            {freq.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {currentQuestion.supportsDesireDelta && (
                    <div className="border-t pt-3" style={{ borderColor: "var(--border-hairline)" }}>
                      <p className="text-xs font-medium text-[var(--ink-primary)]">
                        Optional pacing signal: How would you shift frequency going forward?
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {DESIRE_DELTA_OPTIONS.map((dd) => {
                          const selected = currentAnswer?.desireDelta === dd.value;
                          return (
                            <button
                              key={dd.value}
                              type="button"
                              onClick={() => updateCurrentAnswer({ desireDelta: dd.value })}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium",
                                selected
                                  ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                                  : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
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
      </motion.div>

      {/* Bottom Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={skipCurrent}
            className="rounded-full px-4 py-2.5 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
          >
            Skip question
          </button>

          <button
            type="button"
            onClick={() => setStep("review")}
            className="rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            Review ({answeredCount})
          </button>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            {currentIndex === activeQuestions.length - 1 ? "Review & Finish" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
