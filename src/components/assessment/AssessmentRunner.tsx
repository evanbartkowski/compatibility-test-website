"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  matchesBranch as evaluateBranching,
  selectAssessmentQuestions,
} from "@/lib/assessment/definition";
import { hasMeaningfulAnswer } from "@/lib/assessment/answers";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Clock,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import { brandConfig } from "@/config/brand";
import { AssessmentArtwork } from "./AssessmentArtwork";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import {
  generateGuestSubmissionId,
  saveGuestSubmission,
} from "@/lib/assessment/guest-storage";
import type {
  AssessmentDefinition,
  AssessmentDraft,
  AssessmentMode,
  ConsentSettings,
  QuestionAnswer,
  QuestionDefinition,
  SharingPreferences,
} from "@/lib/assessment/types";
import { cn } from "@/lib/utils";
import { AssessmentQuestionCard } from "./AssessmentQuestionCard";

interface AssessmentRunnerProps {
  assessment: AssessmentDefinition;
  previousDraftVersion?: {
    version: string;
    quickIds: string[];
    completeIds: string[];
  };
  initialMode?: AssessmentMode;
  perspective?: "primary" | "partner";
  inviteToken?: string;
  creatorDisplayName?: string;
  initialCommunityOptIn?: boolean;
  onPreviewSubmit?: (
    answers: Record<string, QuestionAnswer>,
    mode: AssessmentMode,
  ) => Promise<void>;
}

const QUESTIONS_PER_PAGE = 10;

export function AssessmentRunner({
  assessment,
  previousDraftVersion,
  initialMode = "quick",
  perspective = "primary",
  inviteToken,
  creatorDisplayName,
  initialCommunityOptIn = false,
  onPreviewSubmit,
}: AssessmentRunnerProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const isIntimacySuite = assessment.collection === "intimacy-suite";
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const draftStorageKey = `between_us_draft_${onPreviewSubmit ? "studio_" : ""}${assessment.slug}_${perspective}_${inviteToken || "self"}${assessment.editorialRevision ? `_${assessment.version}` : ""}`;

  const effectiveDefaultMode: AssessmentMode =
    assessment.supportsQuickMode === false ? "complete" : initialMode;

  const [step, setStep] = useState<
    "consent" | "questions" | "review" | "submitting"
  >("consent");
  const [mode, setMode] = useState<AssessmentMode>(effectiveDefaultMode);
  const [consent, setConsent] = useState<ConsentSettings>({
    confirmedAdult18Plus: false,
    acceptedPrivacyTerms: false,
    optInCommunityStats: initialCommunityOptIn,
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
  const [savedDraftPrompt, setSavedDraftPrompt] =
    useState<AssessmentDraft | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pauseNotice, setPauseNotice] = useState(false);
  const [draftStorageAvailable, setDraftStorageAvailable] = useState(true);
  const [draftWasUpgraded, setDraftWasUpgraded] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get("mode");
      if (
        urlMode === "complete" ||
        (urlMode === "quick" && assessment.supportsQuickMode !== false)
      ) {
        setMode(urlMode);
      }
    } catch {
      // ignore in non-browser env
    }
  }, [assessment.supportsQuickMode]);

  // Restore saved draft if present
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AssessmentDraft;
        if (
          parsed?.assessmentVersion === assessment.version &&
          Object.keys(parsed.answers || {}).length > 0
        ) {
          setSavedDraftPrompt(parsed);
        } else if (
          previousDraftVersion?.version === parsed?.assessmentVersion &&
          Object.keys(parsed.answers || {}).length > 0
        ) {
          const currentIds = new Set(assessment.questions.map((q) => q.id));
          if (Object.keys(parsed.answers).every((id) => currentIds.has(id))) {
            const previousIds =
              parsed.mode === "quick"
                ? previousDraftVersion.quickIds
                : previousDraftVersion.completeIds;
            const focusedId = previousIds[parsed.currentQuestionIndex || 0];
            const questions = selectAssessmentQuestions(
              assessment,
              parsed.mode,
              parsed.answers,
            );
            setSavedDraftPrompt({
              ...parsed,
              assessmentVersion: assessment.version,
              currentQuestionIndex: Math.max(
                0,
                questions.findIndex((q) => q.id === focusedId),
              ),
            });
            setDraftWasUpgraded(true);
          }
        }
      }
    } catch {
      // ignore invalid storage
    }
  }, [draftStorageKey, assessment, previousDraftVersion]);

  const activeQuestions: QuestionDefinition[] = useMemo(
    () => selectAssessmentQuestions(assessment, mode, answers),
    [assessment, mode, answers],
  );

  const safeIndex = Math.min(
    currentIndex,
    Math.max(0, activeQuestions.length - 1),
  );
  const pageIndex = Math.floor(safeIndex / QUESTIONS_PER_PAGE);
  const pageStart = pageIndex * QUESTIONS_PER_PAGE;
  const pageQuestions = activeQuestions.slice(
    pageStart,
    pageStart + QUESTIONS_PER_PAGE,
  );
  const pageCount = Math.ceil(activeQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestion = activeQuestions[safeIndex];
  const pageRemainingCount = pageQuestions.filter(
    (q) => !hasMeaningfulAnswer(answers[q.id]) && !answers[q.id]?.skipped,
  ).length;

  useEffect(() => {
    if (step !== "questions") return;
    const heading = document.getElementById(`assessment-question-${currentQuestion?.id}`);
    const target = heading || questionHeading.current;
    const frame =
      currentIndex === pageStart
        ? target?.closest(".assessment-main")
        : target?.closest(".assessment-question-card");
    if (frame) {
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .height ?? 82;
      window.scrollTo({
        top: Math.max(
          0,
          frame.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            20,
        ),
        behavior: "instant",
      });
    }
    target?.focus({ preventScroll: true });
  }, [currentIndex, currentQuestion?.id, pageStart, step]);

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
      setDraftStorageAvailable(true);
    } catch {
      setDraftStorageAvailable(false);
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

  const updateAnswer = useCallback(
    (questionId: string, patch: Partial<QuestionAnswer>) => {
      setPauseNotice(false);
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          ...patch,
          skipped: false,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    [],
  );

  const skipUnanswered = (questions: QuestionDefinition[]) => {
    setAnswers((prev) => {
      const next = { ...prev };
      const now = new Date().toISOString();
      for (const question of questions) {
        if (hasMeaningfulAnswer(next[question.id]) || next[question.id]?.skipped) continue;
        next[question.id] = { questionId: question.id, skipped: true, updatedAt: now };
      }
      return next;
    });
  };
  const goNext = () => {
    setPauseNotice(false);
    skipUnanswered(pageQuestions);
    if (pageStart + QUESTIONS_PER_PAGE < activeQuestions.length)
      setCurrentIndex(pageStart + QUESTIONS_PER_PAGE);
    else handleSubmit();
  };
  const goPrev = () => {
    setPauseNotice(false);
    setCurrentIndex(Math.max(0, pageStart - QUESTIONS_PER_PAGE));
  };

  const handleResumeDraft = () => {
    if (!savedDraftPrompt) return;
    setMode(savedDraftPrompt.mode);
    setConsent(savedDraftPrompt.consent);
    setAnswers(savedDraftPrompt.answers);
    const savedQuestions = assessment.questions.filter(
      (q) =>
        (savedDraftPrompt.mode !== "quick" ||
          assessment.supportsQuickMode === false ||
          q.quickDiscovery) &&
        evaluateBranching(q.branchingCondition, savedDraftPrompt.answers),
    );
    setCurrentIndex(
      Math.max(
        0,
        Math.min(
          savedDraftPrompt.currentQuestionIndex || 0,
          savedQuestions.length - 1,
        ),
      ),
    );
    setSavedDraftPrompt(null);
    setStep("questions");
  };

  const handleStartFresh = () => {
    if (!consent.confirmedAdult18Plus || !consent.acceptedPrivacyTerms) {
      setErrorMsg(
        "Please confirm you are 18+ and agree to the private processing terms.",
      );
      return;
    }
    setErrorMsg(null);
    setConsent((c) => ({ ...c, consentedAt: new Date().toISOString() }));
    setStep("questions");
  };

  const handleUpgradeToComplete = () => {
    if (step === "questions" && currentQuestion) {
      const full = assessment.questions.filter((q) =>
        evaluateBranching(q.branchingCondition, answers),
      );
      setCurrentIndex(
        Math.max(
          0,
          full.findIndex((q) => q.id === currentQuestion.id),
        ),
      );
    }
    setMode("complete");
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setStep("submitting");
    try {
      if (onPreviewSubmit) {
        await onPreviewSubmit(answers, mode);
        setStep("questions");
        return;
      }

      // Compute scored result locally so it is guaranteed to succeed offline or without login
      const localSubmissionId = generateGuestSubmissionId();
      const createdAt = new Date().toISOString();
      const scored = scoreAssessmentSubmission({
        resultId: localSubmissionId,
        assessment,
        mode,
        perspective,
        answers,
        createdAt,
      });

      // Save locally to localStorage immediately
      saveGuestSubmission({
        submissionId: localSubmissionId,
        assessmentSlug: assessment.slug,
        assessmentVersion: assessment.version,
        mode,
        perspective,
        optInCommunityStats: consent.optInCommunityStats,
        createdAt,
        result: scored,
        answers,
      });

      // Try server endpoint if available
      let finalSubmissionId = localSubmissionId;
      let finalCompatibilityId: string | undefined;

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
                  consentedAt: consent.consentedAt || createdAt,
                },
                partnerSharing,
                answers,
              }
            : {
                assessmentSlug: assessment.slug,
                assessmentVersion: assessment.version,
                mode,
                perspective,
                consent: {
                  ...consent,
                  consentedAt: consent.consentedAt || createdAt,
                },
                answers,
              };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json().catch(() => null);
            if (data?.submissionId) {
              finalSubmissionId = data.submissionId;
              saveGuestSubmission({
                submissionId: data.submissionId,
                assessmentSlug: assessment.slug,
                assessmentVersion: assessment.version,
                mode,
                perspective,
                optInCommunityStats: consent.optInCommunityStats,
                createdAt,
                result: data.result || scored,
                answers,
              }, localSubmissionId);
            }
            if (data?.compatibilityId) {
              finalCompatibilityId = data.compatibilityId;
            }
          }
        }
      } catch {
        // Offline / static hosting / network: local result is already safely saved!
      }

      window.localStorage.removeItem(draftStorageKey);
      if (perspective === "partner" && finalCompatibilityId) {
        router.push(`/compatibility/${finalCompatibilityId}`);
      } else {
        router.push(`/results?id=${encodeURIComponent(finalSubmissionId)}`);
      }
    } catch (err) {
      setStep("questions");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit assessment.",
      );
    }
  };

  const answeredCount = activeQuestions.filter((q) =>
    hasMeaningfulAnswer(answers[q.id]),
  ).length;
  const progressPercent =
    activeQuestions.length > 0
      ? Math.round((answeredCount / activeQuestions.length) * 100)
      : 0;
  const remainingCount = Math.max(0, activeQuestions.length - answeredCount);
  const remainingMinutes = Math.max(1, Math.ceil((remainingCount * 14) / 60));

  // -------------------------------------------------------------------------
  // STEP 1: OVERVIEW, DEPTH & CONSENT GATE
  // -------------------------------------------------------------------------
  if (step === "consent") {
    const quickCount = assessment.questions.filter(
      (q) => q.quickDiscovery,
    ).length;
    return (
      <div className="site-shell assessment-consent py-10 sm:py-14">
        <div className="mx-auto w-full max-w-2xl">
          <Link
            href="/explore"
            className="text-link mb-6 inline-flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          >
            <ArrowLeft size={14} /> Back to assessments
          </Link>
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
                  Unfinished session found (
                  {Object.keys(savedDraftPrompt.answers).length} saved
                  responses)
                </p>
                <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                  {draftWasUpgraded
                    ? "This test has more questions now. Your previous answers have been kept."
                    : "Resume right where you left off without losing any previous answers."}
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
            <div className="assessment-consent-art mb-6 flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-4">
              <AssessmentArtwork
                slug={assessment.slug}
                category={assessment.category}
                variant="banner"
                className="h-28 w-full max-w-md"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {assessment.adultsOnly && (
                <span
                  className="rounded-full px-2.5 py-0.5 font-medium"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-rose-fill) 16%, transparent)",
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

            <h1 className="mt-3 font-display text-3xl font-bold text-[var(--ink-primary)] sm:text-4xl">
              {perspective === "partner"
                ? `Complementary Assessment for ${creatorDisplayName || "Your Partner"}`
                : assessment.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {perspective === "partner"
                ? `You have been privately invited to complete the complementary partner version of ${assessment.title}. Neither of your private individual answers will ever be exposed without your consent.`
                : assessment.audienceNote || assessment.purpose || assessment.marketingBlurb}
            </p>

            {/* Mode Choice (hidden for partner invites or single-depth modules) */}
            {perspective === "primary" &&
              assessment.supportsQuickMode !== false && (
                <div className="mt-7">
                  <p className="text-xs font-medium text-[var(--ink-secondary)]">
                    Choose Assessment Depth
                  </p>
                  <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          key: "quick" as const,
                          title: isIntimacySuite
                            ? "Teaser"
                            : "Standard Assessment",
                          meta: `${quickCount} questions · ~${assessment.estimatedMinutesQuick} min`,
                          desc: `Covers every category. You can expand to all ${assessment.questions.length} questions without losing your answers.`,
                        },
                        {
                          key: "complete" as const,
                          title: isIntimacySuite
                            ? "Deep dive"
                            : "Complete Assessment",
                          meta: `${assessment.questions.length} questions · ~${assessment.estimatedMinutesComplete} min`,
                          desc: "More situations in each category for a fuller picture of your patterns.",
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
                            : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[var(--ink-primary)]">
                            {item.title}
                          </span>
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
            <div
              className="mt-8 space-y-4 border-t pt-6"
              style={{ borderColor: "var(--border-hairline)" }}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent.confirmedAdult18Plus}
                  onChange={(e) =>
                    setConsent((c) => ({
                      ...c,
                      confirmedAdult18Plus: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
                />
                <span className="text-sm leading-relaxed text-[var(--ink-primary)]">
                  I confirm I am at least{" "}
                  <strong>{brandConfig.minimumAge} years old</strong> and
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
                    setConsent((c) => ({
                      ...c,
                      acceptedPrivacyTerms: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
                />
                <span className="text-sm leading-relaxed text-[var(--ink-primary)]">
                  I understand my responses are private, scored
                  deterministically without third-party AI tools, and can be
                  deleted at any time from my results or settings.{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 text-[var(--accent-plum)]"
                  >
                    Read how information is stored and shared.
                  </Link>
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
                        setConsent((c) => ({
                          ...c,
                          optInCommunityStats: e.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-[var(--accent-plum)]"
                    />
                    <span className="text-sm font-medium text-[var(--ink-primary)]">
                      Optional: Contribute anonymized ratings to community comparisons
                    </span>
                  </label>

                  {consent.optInCommunityStats && perspective === "primary" && (
                    <div className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-3">
                      <label className="block text-xs">
                        <span className="text-[var(--ink-muted)]">
                          Age bracket (optional)
                        </span>
                        <select
                          value={
                            consent.cohortMetadata?.ageGroup || "prefer_not"
                          }
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
                        <span className="text-[var(--ink-muted)]">
                          Relationship status
                        </span>
                        <select
                          value={
                            consent.cohortMetadata?.relationshipStatus ||
                            "prefer_not"
                          }
                          onChange={(e) =>
                            setConsent((c) => ({
                              ...c,
                              cohortMetadata: {
                                ...c.cohortMetadata,
                                relationshipStatus: e.target
                                  .value as NonNullable<
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
                        <span className="text-[var(--ink-muted)]">
                          Dating focus
                        </span>
                        <select
                          value={
                            consent.cohortMetadata?.datingPreference ||
                            "prefer_not"
                          }
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
                    Raw individual ratings stay hidden. Choose which summary
                    layers appear alongside{" "}
                    {creatorDisplayName || "your partner"}:
                  </p>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    {(
                      [
                        [
                          "shareGameAnswerDetails",
                          "Reveal individual game answers only if both agree",
                        ],
                        [
                          "shareCategoryScores",
                          "Category alignment & radar overlay",
                        ],
                        [
                          "shareAlignedHighlights",
                          "Aligned & differing topic highlights",
                        ],
                        [
                          "shareComplementaryHighlights",
                          "Complementary dynamic insights",
                        ],
                        [
                          "shareSharedCuriosities",
                          "Mutually shared curiosities only",
                        ],
                        [
                          "shareHighLevelBoundariesWithoutDetails",
                          "High-level boundary reminders",
                        ],
                      ] as const
                    ).map(([field, label]) => (
                      <label
                        key={field}
                        className="flex items-center gap-2 text-[var(--ink-primary)]"
                      >
                        <input
                          type="checkbox"
                          checked={partnerSharing[field]}
                          onChange={(e) =>
                            setPartnerSharing((s) => ({
                              ...s,
                              [field]: e.target.checked,
                            }))
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
              <p
                className="mt-4 text-xs font-medium text-[var(--accent-rose)]"
                role="alert"
              >
                {errorMsg}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                <Lock className="h-3.5 w-3.5" /> Autosaves locally
              </span>
              <button
                type="button"
                onClick={handleStartFresh}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98] shadow-md"
                style={{
                  backgroundColor: "var(--accent-plum)",
                  color: "var(--accent-plum-contrast)",
                }}
              >
                Begin Test <ArrowRight className="h-4 w-4" />
              </button>
            </div>
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
          Computing deterministic dimension weights, desire-versus-experience
          coordinates, and tailored recommendations...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STEP 2: FIVE-QUESTION PAGES
  // -------------------------------------------------------------------------
  if (!currentQuestion) return null;
  return (
    <div className="site-shell assessment-workspace py-8 sm:py-12">
      <div className="assessment-main w-full">
        <nav aria-label="Jump to a category" className="sr-only">
          {assessment.sections.map((section) => {
            const questions = activeQuestions.filter(
              (q) => q.sectionId === section.id,
            );
            if (!questions.length) return null;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  const index = activeQuestions.findIndex((q) => q.sectionId === section.id);
                  if (index >= 0) {
                    setCurrentIndex(index);
                    if (index === currentIndex) {
                      document.getElementById(`assessment-question-${activeQuestions[index].id}`)?.focus();
                    }
                  }
                }}
              >
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>
        <header className="assessment-page-heading">
          <div
            className="mb-4 flex items-center justify-between border-b pb-3"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            <Link
              href="/explore"
              className="text-link inline-flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            >
              <ArrowLeft size={14} /> Back to assessments
            </Link>
            <span className="text-xs font-medium text-[var(--ink-muted)]">
              {assessment.title}
            </span>
          </div>
          <h2 ref={questionHeading} tabIndex={-1} className="font-display">
            {progressPercent}% complete
          </h2>
        </header>
        {/* Answer progress */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-secondary)]">
            <span className="assessment-progress-label">
              {answeredCount} of {activeQuestions.length} answered
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> ~{remainingMinutes} min left
              </span>
              <span className="font-mono-tabular">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPauseNotice((v) => !v)}
                className="assessment-pause-button"
              >
                <BookmarkCheck className="h-3 w-3" />{" "}
                {draftStorageAvailable ? "Pause & Save" : "Save unavailable"}
              </button>
            </div>
          </div>

          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--bg-inset)" }}
            role="progressbar"
            aria-label="Assessment answers completed"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${answeredCount} of ${activeQuestions.length} questions answered`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--accent-plum)" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{
                duration: reducedMotion ? 0 : 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
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
                {draftStorageAvailable
                  ? `Draft saved privately in this browser (${answeredCount} answered). Return anytime to resume.`
                  : "Browser storage is unavailable. Keep this tab open to continue without losing your answers."}
              </span>
              <Link
                href="/explore"
                className="font-medium text-[var(--accent-plum)] hover:underline"
              >
                Browse Tests
              </Link>
            </div>
          )}

          {perspective === "primary" &&
            mode === "quick" &&
            assessment.supportsQuickMode !== false && (
              <div className="assessment-depth-switch">
                <span>
                  {isIntimacySuite ? "Teaser" : "Standard version"} · 10
                  questions per page
                </span>
                <button
                  type="button"
                  onClick={handleUpgradeToComplete}
                  className="font-medium text-[var(--accent-plum)] hover:underline"
                >
                  Switch to Complete ({assessment.questions.length} questions)
                </button>
              </div>
            )}
        </div>

        <section
          className="assessment-question-list"
          aria-label="Questions on this page"
        >
          {pageQuestions.map((question, index) => (
            <AssessmentQuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id]}
              number={pageStart + index + 1}
              perspective={perspective}
              onAnswer={(patch) => updateAnswer(question.id, patch)}
            />
          ))}
        </section>

        <footer className="assessment-page-footer">
          <p className="assessment-page-note" role="status">
            {pageRemainingCount
              ? `${pageRemainingCount} unanswered. Continuing skips them.`
              : "All set on this page. Continue when you're ready."}
          </p>
          <div className="assessment-controls">
            <button
              type="button"
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="assessment-previous"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Previous page
            </button>
            <span className="assessment-page-position">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="assessment-next"
            >
              {pageIndex === pageCount - 1
                  ? (perspective === "partner"
                      ? "Generate Compatibility Report"
                      : "Complete & View Results")
                  : "Next page"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
          <div className="assessment-save-note">
            <span>
              <Lock size={13} aria-hidden="true" />
              {draftStorageAvailable
                ? "Progress saved in this browser"
                : "Keep this tab open to keep your progress"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
