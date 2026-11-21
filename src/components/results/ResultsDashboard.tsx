"use client";
import { ArchetypeDistribution } from "@/components/community/ArchetypeDistribution";
import { AssessmentArtwork } from "@/components/assessment/AssessmentArtwork";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Compass,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  Fingerprint,
  Flame,
  HeartHandshake,
  Image as ImageIcon,
  Info,
  Layers,
  Link2,
  Printer,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
const AttachmentQuadrantPlot = dynamic(
  () =>
    import("@/components/charts/AttachmentQuadrantPlot").then(
      (module) => module.AttachmentQuadrantPlot,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const CommunityComparisonChart = dynamic(
  () =>
    import("@/components/charts/CommunityComparisonChart").then(
      (module) => module.CommunityComparisonChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const DesireExperienceScatterplot = dynamic(
  () =>
    import("@/components/charts/DesireExperienceScatterplot").then(
      (module) => module.DesireExperienceScatterplot,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const GiveReceiveMatrixChart = dynamic(
  () =>
    import("@/components/charts/GiveReceiveMatrixChart").then(
      (module) => module.GiveReceiveMatrixChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const MultiRaterComparisonChart = dynamic(
  () =>
    import("@/components/charts/MultiRaterComparisonChart").then(
      (module) => module.MultiRaterComparisonChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const PersonalitySpectrumChart = dynamic(
  () =>
    import("@/components/charts/PersonalitySpectrumChart").then(
      (module) => module.PersonalitySpectrumChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const PreferenceRadarChart = dynamic(
  () =>
    import("@/components/charts/PreferenceRadarChart").then(
      (module) => module.PreferenceRadarChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
const RankedBarChart = dynamic(
  () =>
    import("@/components/charts/RankedBarChart").then(
      (module) => module.RankedBarChart,
    ),
  { loading: () => <div className="chart-placeholder" /> },
);
import { EmailReportModal } from "./EmailReportModal";
import { PartnerInviteModal } from "./PartnerInviteModal";
const ShareableSummaryCard = dynamic(() =>
  import("./ShareableSummaryCard").then(
    (module) => module.ShareableSummaryCard,
  ),
);
import { ResultsOverview, CommunityBenchmarks } from "./ResultsOverview";
import { CollapsibleSection } from "./CollapsibleSection";
import { IntimacyInsights } from "./IntimacyInsights";
import { RoleRankingList } from "./RoleRankingList";
import { ExtraResultNote } from "./ExtraResultNote";
import { AdviceGuide } from "./AdviceGuide";
import type { CommunityDimensionComparison } from "@/lib/assessment/community";
import type {
  CommunityComparisonItem,
  QuestionAnswerSummary,
  ScoredAssessmentResult,
} from "@/lib/assessment/types";
import {
  formatEnjoymentLabel,
  formatImportanceLabel,
} from "@/lib/assessment/scoring";

import { cn, formatShortDate } from "@/lib/utils";

interface CommunityApiPayload {
  dimensions?: CommunityDimensionComparison[];
  archetypes?: import("@/lib/assessment/community").CommunityArchetypeAggregate[];
  items: CommunityComparisonItem[];
  eligibleCohortParticipants: number;
  suppressedByPrivacyThreshold: boolean;
  minimumThreshold: number;
  realOptedInCount: number;
  isSyntheticDemo: boolean;
}

interface MultiRaterSummaryPayload {
  inviteCount: number;
  available: boolean;
  respondentCount: number;
  minRespondents: number;
  relationshipBreakdown: Record<string, number>;
  dimensionComparison: Array<{
    dimension: string;
    label: string;
    selfScore: number;
    othersMeanScore: number | null;
    gap: number | null;
  }>;
  insights: string[];
}

interface ResultsDashboardProps {
  initialResult: ScoredAssessmentResult;
  initialOptIn: boolean;
  initialCommunity: CommunityApiPayload;
  assessmentMeta?: {
    title: string;
    categoryTitle: string;
    accentVar: string;
    supportsPartnerMatching: boolean;
    supportsCommunityComparison: boolean;
    supportsMultiRater: boolean;
    visualizationTypes: string[];
    scientificDisclaimer?: string;
  };
  previousResult?: ScoredAssessmentResult | null;
  recommendedAssessments?: Array<{
    slug: string;
    title: string;
    shortTitle: string;
    category: string;
    estimatedMinutesComplete: number;
    adultsOnly: boolean;
  }>;
  initialMultiRaterSummary?: MultiRaterSummaryPayload | null;
}

function PreferenceBucketList({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: QuestionAnswerSummary[];
}) {
  return (
    <div
      className="rounded-md border p-5"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="flex items-baseline justify-between border-b pb-3">
        <h4 className="font-display text-2xl text-[var(--ink-primary)]">
          {title}
        </h4>
        <span className="font-mono-tabular text-xs text-[var(--ink-muted)]">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-[var(--ink-muted)]">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.slice(0, 8).map((item) => (
            <li
              key={item.questionId}
              className="rounded-xl border px-3.5 py-2.5 text-xs"
              style={{
                backgroundColor: "var(--bg-canvas)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <p className="font-medium text-[var(--ink-primary)]">
                {item.prompt}
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--ink-secondary)]">
                <span>
                  {item.firmBoundary
                    ? "Firm boundary"
                    : item.answerLabel || formatEnjoymentLabel(item.enjoyment)}
                </span>
                <span>
                  · Importance: {formatImportanceLabel(item.importance)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResultsDashboard({
  initialResult,
  initialOptIn,
  initialCommunity,
  assessmentMeta,
  previousResult,
  recommendedAssessments = [],
  initialMultiRaterSummary = null,
}: ResultsDashboardProps) {
  const [result] = useState(initialResult);
  const [optIn, setOptIn] = useState(initialOptIn);
  const [community, setCommunity] =
    useState<CommunityApiPayload>(initialCommunity);
  const [demoPreview, setDemoPreview] = useState(false);
  const [ageGroup, setAgeGroup] = useState("all");
  const [relationshipStatus, setRelationshipStatus] = useState("all");
  const [datingPreference, setDatingPreference] = useState("all");
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const query = useSearchParams(),
    navigation = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [includePrivateExport, setIncludePrivateExport] = useState(false);
  const [includeSensitiveExport, setIncludeSensitiveExport] = useState(false);
  const exportParams = `&answers=${includePrivateExport}&sensitive=${includeSensitiveExport}`;
  useEffect(() => {
    const tab = query.get("tab");
    if (
      ["overview", "community", "scatterplot", "ideal-partner"].includes(
        tab || "",
      )
    )
      setActiveTab(tab!);
  }, [query]);
  const selectTab = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(query.toString());
    params.set("tab", tab);
    navigation.replace(`?${params.toString()}`, { scroll: false });
  };
  const [qaOpen, setQaOpen] = useState(false);
  const [qaFilter, setQaFilter] = useState<string>("all");
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<
    string | null
  >(null);
  const [intoTab, setIntoTab] = useState<
    | "coreTurnOns"
    | "wantMoreOf"
    | "curiousExplorations"
    | "dealbreakersAndLimits"
  >(() => {
    const w = initialResult.whatYouAreInto;
    if (w?.coreTurnOns.length) return "coreTurnOns";
    if (w?.wantMoreOf.length) return "wantMoreOf";
    if (w?.curiousExplorations.length) return "curiousExplorations";
    if (w?.dealbreakersAndLimits.length) return "dealbreakersAndLimits";
    return "coreTurnOns";
  });

  const jumpToQaQuestion = (questionId: string, nextFilter: string = "all") => {
    setActiveTab("overview");
    setQaOpen(true);
    setQaFilter(nextFilter);
    setHighlightedQuestionId(questionId);
    if (typeof window !== "undefined") {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.setTimeout(() => {
        const el = document.getElementById(`qa-row-${questionId}`);
        if (el) {
          el.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      }, 65);
    }
  };

  // Test 19 Multi-Rater state
  const [multiRaterSummary, setMultiRaterSummary] =
    useState<MultiRaterSummaryPayload | null>(initialMultiRaterSummary);
  const [peerDisplayName, setPeerDisplayName] = useState("");
  const [peerInviteUrl, setPeerInviteUrl] = useState<string | null>(null);
  const [creatingPeerInvite, setCreatingPeerInvite] = useState(false);
  const [copiedPeerLink, setCopiedPeerLink] = useState(false);

  const isFlagshipIntimacy = result.scoringStrategy === "intimacy_weighted";
  const isCategoryReport = result.radar.some((d) => Boolean(d.interpretation));
  const showScatterTab = isFlagshipIntimacy || result.scoringStrategy === "intimacy_profile" || result.scatterPoints.length > 0;
  const showCommunityTab = assessmentMeta?.supportsCommunityComparison ?? true;
  const showIdealPartnerTab =
    !isCategoryReport &&
    (isFlagshipIntimacy ||
      result.assessmentCategory === "romance" ||
      result.assessmentCategory === "sexuality-intimacy" ||
      result.idealPartner.characteristics.length > 0);

  useEffect(() => {
    if (!showCommunityTab) return;
    const controller = new AbortController();
    setLoadingCommunity(true);
    const params = new URLSearchParams({
      demo: demoPreview ? "true" : "false",
      ageGroup,
      relationshipStatus,
      datingPreference,
    });
    fetch(`/api/results/${result.resultId}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.includes("application/json")) {
          return r.json().catch(() => null);
        }
        return null;
      })
      .then((data) => {
        if (data?.community && !controller.signal.aborted)
          setCommunity(data.community);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCommunity(false);
      });

    return () => controller.abort();
  }, [
    result.resultId,
    demoPreview,
    ageGroup,
    relationshipStatus,
    datingPreference,
    showCommunityTab,
  ]);

  const handleToggleOptIn = async (next: boolean) => {
    setOptIn(next);
    await fetch(`/api/results/${result.resultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optInCommunityStats: next }),
    }).catch(() => {});
  };

  const handleCreatePeerInvite = async () => {
    setCreatingPeerInvite(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: result.resultId,
          displayName:
            peerDisplayName.trim() || "Someone who values your honesty",
        }),
      });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok || !ct.includes("application/json")) {
        return;
      }
      const data = await res.json().catch(() => null);
      if (!data) return;
      const resolvedUrl =
        typeof data.inviteUrl === "string"
          ? data.inviteUrl
          : typeof data.feedbackUrl === "string"
            ? `${typeof window !== "undefined" ? window.location.origin : ""}${data.feedbackUrl}`
            : null;
      if (resolvedUrl) {
        setPeerInviteUrl(resolvedUrl);
        // Refresh summary count
        const sumRes = await fetch(
          `/api/feedback?submissionId=${encodeURIComponent(result.resultId)}`,
        );
        const sumCt = sumRes.headers.get("content-type") || "";
        if (sumRes.ok && sumCt.includes("application/json")) {
          const sumJson = await sumRes.json().catch(() => null);
          if (sumJson?.summary) {
            setMultiRaterSummary(sumJson.summary);
          } else if (sumJson) {
            setMultiRaterSummary(sumJson);
          }
        }
      }
    } finally {
      setCreatingPeerInvite(false);
    }
  };

  const handleCopyPeerUrl = async () => {
    if (!peerInviteUrl) return;
    await navigator.clipboard.writeText(peerInviteUrl).catch(() => {});
    setCopiedPeerLink(true);
    setTimeout(() => setCopiedPeerLink(false), 2000);
  };

  const tabs = [
    { value: "overview", label: "Your profile", icon: Sparkles },
    ...(showScatterTab
      ? [
          {
            value: "scatterplot",
            label: "Desire vs. Experience",
            icon: BarChart3,
          },
        ]
      : []),
    ...(showCommunityTab
      ? [
          {
            value: "community",
            label: "Community comparison",
            icon: Users,
          },
        ]
      : []),
    ...(showIdealPartnerTab
      ? [
          {
            value: "ideal-partner",
            label: "Your kind of partner",
            icon: HeartHandshake,
          },
        ]
      : []),
  ];

  const showSpectrumAlongside =
    !isFlagshipIntimacy &&
    result.radar.length > 0 &&
    (result.radar.some((d) => Boolean(d.lowLabel && d.highLabel)) ||
      result.radar.length < 3);

  return (
    <div className="results-dashboard site-shell py-10 sm:py-14">
      {/* Header Banner */}
      <div
        className="rounded-lg border p-6 sm:p-10"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--ink-muted)]">
              <span
                className="rounded-full px-2.5 py-0.5 font-medium text-[var(--ink-primary)]"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  border: `1px solid ${assessmentMeta?.accentVar ?? "var(--border-hairline)"}`,
                }}
              >
                {assessmentMeta?.title ??
                  result.assessmentTitle ??
                  result.assessmentSlug}
              </span>
              <span>·</span>
              <span>Completed {formatShortDate(result.createdAt)}</span>
              <span>·</span>
              <span className="font-mono-tabular">
                {result.answeredCount}/{result.totalEligibleInMode} items (
                {result.coveragePercent}% coverage)
              </span>
              <span>·</span>
              <span className="font-mono-tabular">
                v{result.scoringEngineVersion}
              </span>
            </div>

            <h1 className="font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
              {result.profile.archetypeName}
            </h1>
            <p className="text-base leading-relaxed text-[var(--ink-secondary)]">
              {result.profile.archetypeTagline}
            </p>
            <p className="text-xs text-[var(--ink-muted)]">
              {result.profile.disclaimer}
              {assessmentMeta?.scientificDisclaimer &&
              assessmentMeta.scientificDisclaimer !== result.profile.disclaimer
                ? ` ${assessmentMeta.scientificDisclaimer}`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            {result.perspective === "primary" &&
              (assessmentMeta?.supportsPartnerMatching ?? true) && (
                <PartnerInviteModal resultId={result.resultId} />
              )}
            <a
              href={`/api/results/${result.resultId}/export?format=pdf${exportParams}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </a>
            <details className="export-menu">
              <summary className="button button-secondary button-small">
                Export &amp; email <ChevronDown size={14} />
              </summary>
              <div className="export-menu-content">
                <div className="export-privacy-options">
                  <p>
                    Downloads contain summary scores by default. Choose any
                    additional private fields explicitly.
                  </p>
                  <label>
                    <input
                      type="checkbox"
                      checked={includePrivateExport}
                      onChange={(e) =>
                        setIncludePrivateExport(e.target.checked)
                      }
                    />
                    Include individual answers and private details
                  </label>
                  {(result.adultsOnly ||
                    result.assessmentCategory === "sexuality-intimacy") && (
                    <label>
                      <input
                        type="checkbox"
                        checked={includeSensitiveExport}
                        onChange={(e) =>
                          setIncludeSensitiveExport(e.target.checked)
                        }
                      />
                      Include sensitive scores and selected private details
                    </label>
                  )}
                </div>
                <a
                  href={`/api/results/${result.resultId}/export?format=csv${exportParams}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border-hairline)" }}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                </a>
                <a
                  href={`/api/results/${result.resultId}/export?format=json${exportParams}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border-hairline)" }}
                >
                  <FileJson className="h-3.5 w-3.5" /> JSON
                </a>
                <EmailReportModal
                  targetType="result"
                  targetId={result.resultId}
                  assessmentTitle={
                    assessmentMeta?.title ?? result.profile.archetypeName
                  }
                />
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border-hairline)" }}
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <Link
                  href={`/assess/${result.assessmentSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border-hairline)" }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retake
                </Link>
              </div>
            </details>
          </div>
        </div>

        {result.provisional && (
          <div
            className="mt-6 flex items-start gap-3 rounded-md border p-4 text-xs"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
              borderColor: "var(--accent-gold)",
              color: "var(--ink-primary)",
            }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
            <p>
              <strong>
                Provisional Profile ({result.coveragePercent}% coverage):
              </strong>{" "}
              You answered a relatively small share of questions so far.
              Answering more items in{" "}
              <Link
                href={`/assess/${result.assessmentSlug}?mode=complete`}
                className="underline text-[var(--accent-plum)]"
              >
                Complete Assessment mode
              </Link>{" "}
              will yield richer scatterplots and analysis.
            </p>
          </div>
        )}
      </div>

      {/* 1. Category Scores Overview (Visually appealing color-coded scores showcase at top of page) */}
      <ResultsOverview result={result} previousResult={previousResult} />

      {/* 2. Role & Archetype Match (Collapsible dropdown menu) */}
      <RoleRankingList result={result} />

      {/* 3. Action Guide (Collapsible dropdown menu) */}
      {result.advice && result.advice.status === "ready" && (
        <CollapsibleSection
          title="Personalized Action Guide & Suggestions"
          subtitle={result.advice.headline}
          icon={Compass}
          badge={
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Coaching
            </span>
          }
          className="mt-6"
          defaultOpen={false}
        >
          <AdviceGuide result={result} />
        </CollapsibleSection>
      )}

      {/* 4. Desire, Willingness & Experience Matrix (Collapsible dropdown menu) */}
      {result.intimacyProfile && (
        <CollapsibleSection
          title="Desire, Willingness & Experience Blueprint"
          subtitle="Want, willing, done. Not the same number."
          icon={Activity}
          badge={
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
              {result.intimacyProfile.channels.length} Channels
            </span>
          }
          className="mt-6"
          defaultOpen={false}
        >
          <IntimacyInsights result={result} />
        </CollapsibleSection>
      )}

      {/* 5. Create a Shareable Result Card (Collapsible dropdown menu) */}
      <CollapsibleSection
        title="Create a Shareable Result Card"
        subtitle="Generate and download customized SVG or PNG graphic cards"
        icon={ImageIcon}
        className="mt-6"
        defaultOpen={false}
      >
        <ShareableSummaryCard result={result} />
      </CollapsibleSection>

      {/* Previous Attempt Diff Comparison (if ?compare= passed) */}
      {previousResult && (
        <div
          className="mt-6 rounded-lg border p-6"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-strong)",
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl text-[var(--ink-primary)]">
              Change Since Your Attempt on{" "}
              {formatShortDate(previousResult.createdAt)}
            </h2>
            <span className="text-xs text-[var(--ink-muted)]">
              Previous: {previousResult.profile.archetypeName} &rarr; Current:{" "}
              {result.profile.archetypeName}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {result.radar.map((dim) => {
              const prev = previousResult.radar.find(
                (p) => p.dimension === dim.dimension,
              );
              const delta = prev ? dim.score - prev.score : null;
              return (
                <div
                  key={dim.dimension}
                  className="rounded-md border bg-[var(--bg-elevated)] p-3.5 text-xs"
                >
                  <p className="font-medium text-[var(--ink-primary)]">
                    {dim.label}
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="font-mono-tabular text-base font-semibold text-[var(--ink-primary)]">
                      {dim.score}
                    </span>
                    {delta !== null && (
                      <span
                        className="font-mono-tabular font-semibold"
                        style={{
                          color:
                            delta > 0
                              ? "var(--accent-sage)"
                              : delta < 0
                                ? "var(--accent-rose)"
                                : "var(--ink-muted)",
                        }}
                      >
                        {delta > 0
                          ? `+${delta}`
                          : delta === 0
                            ? "Unchanged"
                            : delta}{" "}
                        pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard Navigation Tabs */}
      <Tabs.Root value={activeTab} onValueChange={selectTab} className="mt-10">
        <Tabs.List
          aria-label="Results sections"
          className="flex flex-wrap gap-2 border-b pb-4 no-print"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium",
                  isActive
                    ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* TAB 1: OVERVIEW + TAILORED VISUALIZATIONS + BUCKETS + INSIGHTS */}
        <Tabs.Content value="overview" className="mt-8 space-y-10">
          {/* Attachment 2D Quadrant Plot (Test 11) */}
          {result.attachmentCoordinates && (
            <CollapsibleSection
              title="Attachment Dynamics Map"
              subtitle="Maps your self-reported reassurance vigilance alongside your autonomy reflex"
              icon={Layers}
              defaultOpen={false}
            >
              <AttachmentQuadrantPlot
                anxiety={result.attachmentCoordinates.anxiety}
                avoidance={result.attachmentCoordinates.avoidance}
                quadrantLabel={result.attachmentCoordinates.quadrantLabel}
              />
            </CollapsibleSection>
          )}

          {/* Dual-Channel Give vs Receive Matrix (Tests 6, 12, 28) */}
          {result.dualChannelScores && result.dualChannelScores.length > 0 && (
            <CollapsibleSection
              title="Receive vs. Give Matrix"
              subtitle="Where what you want done to you splits from what you want to do"
              icon={Activity}
              defaultOpen={false}
            >
              <GiveReceiveMatrixChart channels={result.dualChannelScores} />
            </CollapsibleSection>
          )}

          {/* Ranked Priorities Bar Chart (Tests 10, 16, 22) */}
          {result.priorityRanking && result.priorityRanking.length > 0 && (
            <CollapsibleSection
              title="Priority & Dealbreaker Hierarchy"
              subtitle="Ranked by your tradeoffs, ratings, and explicitly flagged non-negotiables"
              icon={Trophy}
              defaultOpen={false}
            >
              <RankedBarChart items={result.priorityRanking} />
            </CollapsibleSection>
          )}

          {/* Curiosity Map Grid (Test 2) */}
          {result.curiosityGroups && result.curiosityGroups.length > 0 && (
            <CollapsibleSection
              title="Curiosity & Exploration Map"
              subtitle="Grouped across your six comfort and curiosity states"
              icon={Compass}
              defaultOpen={false}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.curiosityGroups.map((group) => (
                  <div
                    key={group.level}
                    className="rounded-md border p-4"
                    style={{
                      backgroundColor: "var(--bg-canvas)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <div className="flex items-baseline justify-between border-b pb-2">
                      <h3 className="font-display text-xl text-[var(--ink-primary)]">
                        {group.label}
                      </h3>
                      <span className="font-mono-tabular text-xs text-[var(--ink-muted)]">
                        {group.items.length}
                      </span>
                    </div>
                    {group.items.length === 0 ? (
                      <p className="mt-2.5 text-xs text-[var(--ink-muted)]">
                        None selected here.
                      </p>
                    ) : (
                      <ul className="mt-2.5 space-y-1.5 text-xs text-[var(--ink-secondary)]">
                        {group.items.map((it) => (
                          <li key={it.questionId} className="leading-snug">
                            •{" "}
                            <span className="text-[var(--ink-primary)]">
                              {it.prompt}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Blended Archetype Breakdown (Tests 14, 15, 21) */}
          {result.blendedArchetype &&
            result.blendedArchetype.blendScores.length > 0 && (
              <CollapsibleSection
                title="Your Blended Archetype Fit"
                subtitle={`Primary resonance: ${result.blendedArchetype.primary}${
                  result.blendedArchetype.secondary
                    ? ` · Secondary leaning: ${result.blendedArchetype.secondary}`
                    : ""
                }`}
                icon={Sparkles}
                defaultOpen={false}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {result.blendedArchetype.blendScores.map((b, i) => (
                    <div
                      key={b.id}
                      className="rounded-md border p-4"
                      style={{
                        backgroundColor:
                          i === 0 ? "var(--bg-subtle)" : "var(--bg-canvas)",
                        borderColor:
                          i === 0
                            ? "var(--accent-plum)"
                            : "var(--border-hairline)",
                      }}
                    >
                      <p className="text-xs font-medium text-[var(--ink-primary)]">
                        {b.name}
                      </p>
                      <p className="font-mono-tabular mt-1 text-2xl font-semibold text-[var(--accent-plum)]">
                        {b.score}%
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${b.score}%`,
                            backgroundColor: "var(--accent-plum)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

          {/* Multi-Rater 360 Panel (Test 19) */}
          {assessmentMeta?.supportsMultiRater && (
            <section
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div className="flex flex-col justify-between gap-4 border-b pb-5 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                    360° Self vs. Trusted Peer Perception
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                    Invite friends, partners, or close colleagues to answer
                    anonymously. Scores remain locked behind n &ge;{" "}
                    {multiRaterSummary?.minRespondents ?? 3} responses.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 no-print">
                  <input
                    type="text"
                    placeholder="First name shown to raters"
                    value={peerDisplayName}
                    onChange={(e) => setPeerDisplayName(e.target.value)}
                    className="rounded-full border bg-[var(--bg-canvas)] px-4 py-2 text-xs text-[var(--ink-primary)]"
                    style={{ borderColor: "var(--border-strong)" }}
                  />
                  <button
                    type="button"
                    disabled={creatingPeerInvite}
                    onClick={handleCreatePeerInvite}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--accent-plum)",
                      color: "var(--accent-plum-contrast)",
                    }}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {creatingPeerInvite
                      ? "Generating..."
                      : "Create Anonymous Feedback Link"}
                  </button>
                </div>
              </div>

              {peerInviteUrl && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--accent-sage)] bg-[var(--bg-subtle)] p-4 text-xs">
                  <span className="truncate font-mono-tabular text-[var(--ink-primary)]">
                    {peerInviteUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPeerUrl}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--bg-elevated)] px-3 py-1.5 font-medium text-[var(--ink-primary)]"
                  >
                    {copiedPeerLink ? (
                      <Check className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedPeerLink ? "Copied" : "Copy Link"}
                  </button>
                </div>
              )}

              <div className="mt-6">
                <MultiRaterComparisonChart
                  available={multiRaterSummary?.available ?? false}
                  respondentCount={multiRaterSummary?.respondentCount ?? 0}
                  minRespondents={multiRaterSummary?.minRespondents ?? 3}
                  dimensionComparison={
                    multiRaterSummary?.dimensionComparison ??
                    result.radar.map((d) => ({
                      dimension: d.dimension,
                      label: d.label,
                      selfScore: d.score,
                      othersMeanScore: null,
                      gap: null,
                    }))
                  }
                  insights={multiRaterSummary?.insights ?? []}
                />
              </div>
            </section>
          )}

          {/* Trait Spectrum Continuums (Big Five, Conflict, etc.) */}
          {showSpectrumAlongside && (
            <section
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div className="mb-5">
                <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                  Dimension Continuums
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                  Where your pattern sits between balancing poles across each
                  dimension.
                </p>
              </div>
              <PersonalitySpectrumChart dimensions={result.radar} />
            </section>
          )}

          {/* What You Are Into: Deep evidence-linked desire & limit breakdown */}
          {result.whatYouAreInto && (
            <section
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div
                className="border-b pb-5"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-plum)]">
                  <Flame className="h-4 w-4" />
                  Direct Signal Breakdown
                </div>
                <h2 className="mt-1 font-display text-3xl text-[var(--ink-primary)]">
                  What You Are Into
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[var(--ink-secondary)]">
                  {result.whatYouAreInto.headline}
                </p>
              </div>

              {result.whatYouAreInto.styleSummary.length > 0 && (
                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {result.whatYouAreInto.styleSummary
                    .slice(0, 3)
                    .map((summaryPoint, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border px-3.5 py-2.5 text-xs leading-relaxed text-[var(--ink-primary)]"
                        style={{
                          backgroundColor: "var(--bg-subtle)",
                          borderColor: "var(--border-hairline)",
                        }}
                      >
                        {summaryPoint}
                      </div>
                    ))}
                </div>
              )}

              {result.whatYouAreInto.roleOrDynamicLean && (
                <div
                  className="mt-5 flex flex-col justify-between gap-3 rounded-md border p-4 sm:flex-row sm:items-center"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-plum) 10%, var(--bg-subtle))",
                    borderColor: "var(--accent-plum)",
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-plum)]">
                      {result.whatYouAreInto.roleOrDynamicLean.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--ink-primary)]">
                      {result.whatYouAreInto.roleOrDynamicLean.detail}
                    </p>
                  </div>
                  {result.whatYouAreInto.roleOrDynamicLean
                    .linkedQuestionIds[0] && (
                    <button
                      type="button"
                      onClick={() =>
                        jumpToQaQuestion(
                          result.whatYouAreInto!.roleOrDynamicLean!
                            .linkedQuestionIds[0],
                          "all",
                        )
                      }
                      className="shrink-0 rounded-full border bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      Inspect role signal &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Category selector pills */}
              <div
                role="tablist"
                aria-label="What you are into categories"
                className="mt-5 flex flex-wrap gap-2"
              >
                {(
                  [
                    {
                      key: "coreTurnOns" as const,
                      label: "Top Turn Ons",
                      count: result.whatYouAreInto.coreTurnOns.length,
                    },
                    {
                      key: "wantMoreOf" as const,
                      label: "Want More Of",
                      count: result.whatYouAreInto.wantMoreOf.length,
                    },
                    {
                      key: "curiousExplorations" as const,
                      label: "Curious To Try",
                      count: result.whatYouAreInto.curiousExplorations.length,
                    },
                    {
                      key: "dealbreakersAndLimits" as const,
                      label: "Limits & Dealbreakers",
                      count: result.whatYouAreInto.dealbreakersAndLimits.length,
                    },
                  ] as const
                ).map((t) => {
                  const selected = intoTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setIntoTab(t.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        selected
                          ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                      )}
                    >
                      <span>{t.label}</span>
                      <span className="font-mono-tabular opacity-80">
                        ({t.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const items = result.whatYouAreInto[intoTab];
                if (items.length === 0) {
                  const emptyCopy: Record<typeof intoTab, string> = {
                    coreTurnOns:
                      "No strong high enjoyment signals stood out in this submission.",
                    wantMoreOf:
                      "No questions flagged as wanting more frequency yet. Rate past frequency or add experience tags in complete mode.",
                    curiousExplorations:
                      "No items were marked as curious or open to trying here.",
                    dealbreakersAndLimits:
                      "No hard limits or low enjoyment boundaries were flagged on these items.",
                  };
                  return (
                    <p className="mt-4 rounded-md border border-dashed p-5 text-xs text-[var(--ink-muted)]">
                      {emptyCopy[intoTab]}
                    </p>
                  );
                }

                return (
                  <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                    {items.map((item) => (
                      <div
                        key={`${intoTab}-${item.questionId}`}
                        className="flex flex-col justify-between rounded-md border p-4"
                        style={{
                          backgroundColor: "var(--bg-canvas)",
                          borderColor:
                            intoTab === "dealbreakersAndLimits"
                              ? "var(--accent-rose)"
                              : "var(--border-hairline)",
                        }}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--ink-primary)]">
                              {item.shortLabel}
                            </p>
                            {item.score0to100 !== null &&
                              item.score0to100 !== undefined && (
                                <span
                                  className="font-mono-tabular shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{
                                    backgroundColor:
                                      intoTab === "dealbreakersAndLimits"
                                        ? "color-mix(in srgb, var(--accent-rose) 15%, transparent)"
                                        : "color-mix(in srgb, var(--accent-plum) 15%, transparent)",
                                    color:
                                      intoTab === "dealbreakersAndLimits"
                                        ? "var(--accent-rose)"
                                        : "var(--accent-plum)",
                                  }}
                                >
                                  {item.score0to100}/100
                                </span>
                              )}
                          </div>

                          {item.prompt !== item.shortLabel && (
                            <p className="mt-1 text-xs leading-snug text-[var(--ink-muted)] line-clamp-2">
                              {item.prompt}
                            </p>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-[var(--accent-plum)]">
                              {item.answerLabel}
                            </span>
                            {item.importance &&
                              item.importance !== "nice_to_have" && (
                                <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] text-[var(--ink-secondary)]">
                                  {formatImportanceLabel(item.importance)}
                                </span>
                              )}
                          </div>

                          {item.detail && (
                            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                              {item.detail}
                            </p>
                          )}
                        </div>

                        <div
                          className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5"
                          style={{ borderColor: "var(--border-hairline)" }}
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {item.linkedDimensions.slice(0, 3).map((ld) => (
                              <button
                                key={`${item.questionId}-${ld.dimension}`}
                                type="button"
                                onClick={() =>
                                  jumpToQaQuestion(
                                    item.questionId,
                                    ld.dimension,
                                  )
                                }
                                title={`Filter breakdown by ${ld.label}`}
                                className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-plum)] hover:text-[var(--ink-primary)]"
                                style={{
                                  backgroundColor: "var(--bg-subtle)",
                                  borderColor: "var(--border-hairline)",
                                }}
                              >
                                {ld.label}
                                {ld.direction === "inverse" ? " (Inverse)" : ""}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              jumpToQaQuestion(
                                item.questionId,
                                intoTab === "dealbreakersAndLimits"
                                  ? "limits"
                                  : "into",
                              )
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-plum)] hover:underline"
                          >
                            Inspect answer <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Interactive Radar (preserved with exact heading for E2E) */}
          <section
            className="rounded-lg border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="mb-6">
              <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                Interactive Preference Radar
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Tap any dimension spoke or contributor below to inspect the
                exact answers behind its score.
            </p>
            <ExtraResultNote result={result} />
          </div>
            <PreferenceRadarChart
              dimensions={result.radar}
              onInspectQuestion={(questionId, dimKey) =>
                jumpToQaQuestion(questionId, dimKey)
              }
            />
          </section>

          {/* Dimension Interactions: How your top scores reinforce or contrast */}
          {result.dimensionInteractions &&
            result.dimensionInteractions.length > 0 && (
              <section
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-gold)]">
                    <Link2 className="h-4 w-4" />
                    Score Connections
                  </div>
                  <h2 className="mt-1 font-display text-3xl text-[var(--ink-primary)]">
                    How Your Scores Connect
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                    See how your leading dimensions amplify or balance one
                    another, linked directly to your answers.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.dimensionInteractions.map((inter) => (
                    <div
                      key={inter.id}
                      className="flex flex-col justify-between rounded-md border p-5"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <div>
                        <div className="flex flex-wrap gap-1.5">
                          {inter.dimensions.map((d) => (
                            <button
                              key={d.dimension}
                              type="button"
                              onClick={() => {
                                setQaOpen(true);
                                setQaFilter(d.dimension);
                                setHighlightedQuestionId(null);
                              }}
                              className="font-mono-tabular rounded-full border px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-plum)] hover:border-[var(--accent-plum)]"
                              style={{
                                backgroundColor: "var(--bg-subtle)",
                                borderColor: "var(--border-hairline)",
                              }}
                            >
                              {d.label}: {d.score}/100
                            </button>
                          ))}
                        </div>
                        <h3 className="mt-3 font-display text-2xl text-[var(--ink-primary)]">
                          {inter.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                          {inter.summary}
                        </p>
                      </div>

                      {inter.evidence.length > 0 && (
                        <div
                          className="mt-4 flex flex-wrap gap-1.5 border-t pt-3"
                          style={{ borderColor: "var(--border-hairline)" }}
                        >
                          {inter.evidence.map((ev) => (
                            <button
                              key={`${inter.id}-${ev.questionId}`}
                              type="button"
                              onClick={() =>
                                jumpToQaQuestion(ev.questionId, "all")
                              }
                              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)]"
                              style={{
                                backgroundColor: "var(--bg-canvas)",
                                borderColor: "var(--border-hairline)",
                              }}
                            >
                              <span className="font-medium">
                                {ev.shortLabel}
                              </span>
                              <span className="text-[var(--accent-plum)]">
                                · {ev.answerLabel}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Profile Narrative Breakdown (Collapsible dropdown menu) */}
          <CollapsibleSection
            title={
              isCategoryReport
                ? "Your Category Summary"
                : "Your Preference Landscape"
            }
            subtitle="Communication style, pace & energy, and novelty comfort"
            icon={Fingerprint}
            defaultOpen={false}
          >
            <div
              className={
                result.unmetPreferences && result.unmetPreferences.length > 0
                  ? "grid gap-6 md:grid-cols-2"
                  : "grid gap-6"
              }
            >
              <div>
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {result.profile.summaryParagraph}
                </p>
                {!isCategoryReport && (
                  <dl className="mt-6 space-y-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        Communication Style
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        {result.profile.communicationStyle}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        Pace &amp; Energy
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        {result.profile.paceAndEnergy}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        Initiative Balance
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        {result.profile.initiativeBalance}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        Comfort With Novelty
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        {result.profile.noveltyComfort}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              {result.unmetPreferences && result.unmetPreferences.length > 0 && (
                <div
                  className="rounded-md border p-5 sm:p-6"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  <h3 className="font-display text-xl text-[var(--ink-primary)]">
                    Unmet Preferences &amp; Opportunities
                  </h3>
                  <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {result.unmetPreferences.slice(0, 4).map((u) => (
                      <li
                        key={u.questionId}
                        className="rounded-xl border p-3.5"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          borderColor: "var(--border-hairline)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span>{u.message}</span>
                          <button
                            type="button"
                            onClick={() =>
                              jumpToQaQuestion(u.questionId, "into")
                            }
                            className="shrink-0 font-medium text-[var(--accent-plum)] hover:underline"
                          >
                            View Q&amp;A
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Ranked Preference Buckets (Collapsible dropdown menu) */}
          {!isCategoryReport && (
            <CollapsibleSection
              title="Preference Overview by Category"
              subtitle="Strongly desired, important qualities, curious about, situational, avoid, and firm boundaries"
              icon={Layers}
              defaultOpen={false}
            >
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <PreferenceBucketList
                  title="Strongly Desired"
                  emptyText="No strong core signals highlighted yet."
                  items={result.buckets.stronglyDesired}
                />
                <PreferenceBucketList
                  title="Important Qualities"
                  emptyText="Mark items as Essential or Important to highlight core needs."
                  items={result.buckets.importantQualities}
                />
                <PreferenceBucketList
                  title="Curious About"
                  emptyText="No items marked as 'Curious about trying'."
                  items={result.buckets.curiousAbout}
                />
                <PreferenceBucketList
                  title="Situational"
                  emptyText="No items marked as 'Depends on the situation'."
                  items={result.buckets.situational}
                />
                <PreferenceBucketList
                  title="Prefer to Avoid"
                  emptyText="No items rated low."
                  items={result.buckets.preferToAvoid}
                />
                <PreferenceBucketList
                  title="Firm Boundaries"
                  emptyText="No explicit firm boundaries flagged."
                  items={result.buckets.firmBoundaries}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* Expandable Full Question & Answer Review Accordion */}
          {result.qaSummary && result.qaSummary.length > 0 && (
            <section
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <button
                type="button"
                aria-expanded={qaOpen}
                onClick={() => setQaOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                    Full Question &amp; Answer Breakdown (
                    {result.qaSummary.length})
                  </h2>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    Filter by dimension or signal to trace how every answer
                    shapes your scores.
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-[var(--ink-secondary)] transition-transform",
                    qaOpen && "rotate-180",
                  )}
                />
              </button>

              {qaOpen &&
                (() => {
                  const qaList = result.qaSummary ?? [];
                  const tagLabels: Record<string, string> = {
                    turn_on: "Turn On",
                    want_more: "Want More",
                    curious: "Curious",
                    limit: "Limit",
                    role_signal: "Role Signal",
                  };
                  const intoCount = qaList.filter(
                    (q) =>
                      q.intoTag === "turn_on" ||
                      q.intoTag === "want_more" ||
                      q.intoTag === "curious",
                  ).length;
                  const limitsCount = qaList.filter(
                    (q) => q.firmBoundary || q.intoTag === "limit",
                  ).length;
                  const dimFilters = result.radar
                    .map((dim) => ({
                      key: dim.dimension,
                      label: dim.label,
                      count: qaList.filter((q) =>
                        q.linkedDimensions?.some(
                          (l) => l.dimension === dim.dimension,
                        ),
                      ).length,
                    }))
                    .filter((d) => d.count > 0);

                  const filteredQa = qaList.filter((qa) => {
                    if (qaFilter === "all") return true;
                    if (qaFilter === "into") {
                      return (
                        qa.intoTag === "turn_on" ||
                        qa.intoTag === "want_more" ||
                        qa.intoTag === "curious" ||
                        qa.questionId === highlightedQuestionId
                      );
                    }
                    if (qaFilter === "limits") {
                      return (
                        qa.firmBoundary ||
                        qa.intoTag === "limit" ||
                        qa.questionId === highlightedQuestionId
                      );
                    }
                    return (
                      Boolean(
                        qa.linkedDimensions?.some(
                          (d) => d.dimension === qaFilter,
                        ),
                      ) || qa.questionId === highlightedQuestionId
                    );
                  });

                  return (
                    <div className="mt-6 space-y-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQaFilter("all");
                            setHighlightedQuestionId(null);
                          }}
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                            qaFilter === "all"
                              ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                              : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                          )}
                        >
                          All ({qaList.length})
                        </button>
                        {intoCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQaFilter("into");
                              setHighlightedQuestionId(null);
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                              qaFilter === "into"
                                ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                                : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                            )}
                          >
                            Turn Ons &amp; Curious ({intoCount})
                          </button>
                        )}
                        {limitsCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQaFilter("limits");
                              setHighlightedQuestionId(null);
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                              qaFilter === "limits"
                                ? "border-[var(--accent-rose)] bg-[var(--accent-rose)] text-[var(--accent-plum-contrast)]"
                                : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                            )}
                          >
                            Limits ({limitsCount})
                          </button>
                        )}
                        {dimFilters.map((df) => (
                          <button
                            key={df.key}
                            type="button"
                            onClick={() => {
                              setQaFilter(df.key);
                              setHighlightedQuestionId(null);
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                              qaFilter === df.key
                                ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                                : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]",
                            )}
                          >
                            {df.label} ({df.count})
                          </button>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredQa.map((qa) => {
                          const isHighlighted =
                            highlightedQuestionId === qa.questionId;
                          return (
                            <div
                              key={qa.questionId}
                              id={`qa-row-${qa.questionId}`}
                              className={cn(
                                "rounded-md border p-4 text-xs transition-all",
                                isHighlighted &&
                                  "ring-2 ring-[var(--accent-plum)]",
                              )}
                              style={{
                                backgroundColor: isHighlighted
                                  ? "color-mix(in srgb, var(--accent-plum) 10%, var(--bg-canvas))"
                                  : "var(--bg-canvas)",
                                borderColor: qa.firmBoundary
                                  ? "var(--accent-rose)"
                                  : isHighlighted
                                    ? "var(--accent-plum)"
                                    : "var(--border-hairline)",
                              }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] text-[var(--ink-muted)]">
                                  {qa.sectionTitle}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {qa.intoTag && tagLabels[qa.intoTag] && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                      style={{
                                        backgroundColor:
                                          qa.intoTag === "limit"
                                            ? "color-mix(in srgb, var(--accent-rose) 15%, transparent)"
                                            : "color-mix(in srgb, var(--accent-plum) 15%, transparent)",
                                        color:
                                          qa.intoTag === "limit"
                                            ? "var(--accent-rose)"
                                            : "var(--accent-plum)",
                                      }}
                                    >
                                      {tagLabels[qa.intoTag]}
                                    </span>
                                  )}
                                  {qa.score0to100 !== null &&
                                    qa.score0to100 !== undefined && (
                                      <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ink-secondary)]">
                                        {qa.score0to100}/100
                                      </span>
                                    )}
                                </div>
                              </div>
                              <p className="mt-1 font-medium text-[var(--ink-primary)]">
                                {qa.prompt}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--ink-secondary)]">
                                <span className="font-semibold text-[var(--accent-plum)]">
                                  {qa.firmBoundary
                                    ? "Firm Boundary"
                                    : qa.answerLabel}
                                </span>
                                {!isCategoryReport && (
                                  <span>
                                    · {formatImportanceLabel(qa.importance)}
                                  </span>
                                )}
                                {qa.desireDelta && (
                                  <span>
                                    · {qa.desireDelta.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                              {qa.linkedDimensions &&
                                qa.linkedDimensions.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {qa.linkedDimensions.map((ld) => (
                                      <button
                                        key={`${qa.questionId}-${ld.dimension}`}
                                        type="button"
                                        onClick={() => {
                                          setQaFilter(ld.dimension);
                                          setHighlightedQuestionId(null);
                                        }}
                                        className="rounded-full border px-2 py-0.5 text-[10px] text-[var(--ink-secondary)] hover:border-[var(--accent-plum)] hover:text-[var(--ink-primary)]"
                                        style={{
                                          backgroundColor: "var(--bg-subtle)",
                                          borderColor: "var(--border-hairline)",
                                        }}
                                      >
                                        {ld.label}
                                        {ld.direction === "inverse"
                                          ? " (Inverse)"
                                          : ""}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
            </section>
          )}

          {/* Recommended Next Assessments */}
          {recommendedAssessments.length > 0 && (
            <section className="space-y-4 no-print">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                  Recommended Next Assessments
                </h2>
                <Link
                  href="/explore"
                  className="text-xs font-medium text-[var(--accent-plum)] hover:underline"
                >
                  Explore the test library &rarr;
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {recommendedAssessments.map((rec) => (
                  <Link
                    key={rec.slug}
                    href={`/assess/${rec.slug}`}
                    className="group rounded-md border p-5 transition-colors hover:border-[var(--accent-plum)]"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
                      <AssessmentArtwork
                        slug={rec.slug}
                        category={rec.category}
                        className="h-20 w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
                      <span>{rec.category}</span>
                      <span className="font-mono-tabular">
                        ~{rec.estimatedMinutesComplete} min
                      </span>
                    </div>
                    <p className="mt-2 font-display text-2xl text-[var(--ink-primary)] group-hover:text-[var(--accent-plum)]">
                      {rec.title}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-plum)]">
                      Take assessment <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Tabs.Content>

        {/* TAB 2: DESIRE VS EXPERIENCE SCATTERPLOT */}
        {showScatterTab && (
          <Tabs.Content value="scatterplot" className="mt-8 space-y-8">
            <div
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div className="mb-6">
                <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                  Your Personal Desire vs. Experience Map
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm text-[var(--ink-secondary)]">
                  Want against experience. The interesting corner is high desire
                  and low experience — a craving, not an assignment. A hard
                  limit stays a limit.
                </p>
              </div>
              <DesireExperienceScatterplot
                points={result.scatterPoints}
                experienceUnratedCount={result.experienceUnratedCount}
              />
            </div>
          </Tabs.Content>
        )}

        {/* TAB 3: COMPARE WITH COMMUNITY */}
        {showCommunityTab && (
          <Tabs.Content value="community" className="mt-8 space-y-6">
            <div
              className="rounded-lg border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-hairline)",
              }}
            >
              <div className="flex flex-col justify-between gap-4 border-b pb-6 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                    Compare with the community
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-[var(--ink-secondary)]">
                    Compares your responses solely against opted-in adult
                    platform participants. Aggregates require at least{" "}
                    <span className="font-mono-tabular">
                      {community.minimumThreshold}
                    </span>{" "}
                    valid responses per question and per filtered cohort.
                    Published external surveys (such as the 608-woman
                    Knowingless dataset) are never represented as platform
                    users.
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[var(--ink-primary)]">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => handleToggleOptIn(e.target.checked)}
                      className="h-4 w-4 accent-[var(--accent-plum)]"
                    />
                    Include my anonymized responses in future stats
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 text-[var(--accent-gold)]">
                    <input
                      type="checkbox"
                      checked={demoPreview}
                      onChange={(e) => setDemoPreview(e.target.checked)}
                      className="h-4 w-4 accent-[var(--accent-gold)]"
                    />
                    Preview comparison charts using Synthetic Demo Data
                  </label>
                </div>
              </div>

              {demoPreview && (
                <div
                  className="mt-5 flex items-start gap-3 rounded-md border p-4 text-xs"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-gold) 14%, transparent)",
                    borderColor: "var(--accent-gold)",
                    color: "var(--ink-primary)",
                  }}
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
                  <p>
                    <strong>SYNTHETIC DEMO DATA ACTIVE:</strong> Currently
                    displaying an explicitly generated synthetic preview sample
                    (n=84) to demonstrate percentile calculations and cohort
                    filtering. Turn off demo mode to view actual platform
                    respondent counts ( currently n={community.realOptedInCount}
                    ).
                  </p>
                </div>
              )}

              {/* Cohort Filters */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">
                    Age Group Cohort
                  </span>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                  >
                    <option value="all">All ages</option>
                    <option value="18-24">18 to 24</option>
                    <option value="25-34">25 to 34</option>
                    <option value="35-44">35 to 44</option>
                    <option value="45+">45+</option>
                  </select>
                </label>

                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">
                    Relationship Status
                  </span>
                  <select
                    value={relationshipStatus}
                    onChange={(e) => setRelationshipStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                  >
                    <option value="all">All statuses</option>
                    <option value="single">Single</option>
                    <option value="dating">Dating</option>
                    <option value="partnered">Partnered</option>
                    <option value="married">Married</option>
                  </select>
                </label>

                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">Dating Focus</span>
                  <select
                    value={datingPreference}
                    onChange={(e) => setDatingPreference(e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                  >
                    <option value="all">All preferences</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="all_genders">All genders</option>
                  </select>
                </label>
              </div>

              <div className="mt-6" aria-live="polite">
                {!loadingCommunity && Boolean(community.dimensions?.length) && (
                  <CommunityBenchmarks
                    dimensions={community.dimensions!}
                    minimumThreshold={community.minimumThreshold}
                    isSyntheticDemo={community.isSyntheticDemo}
                  />
                )}
                {!loadingCommunity && (
                  <ArchetypeDistribution
                    archetypes={community.archetypes}
                    isSyntheticDemo={community.isSyntheticDemo}
                  />
                )}
                {loadingCommunity ? (
                  <p className="text-sm text-[var(--ink-muted)]">
                    Loading cohort statistics...
                  </p>
                ) : community.suppressedByPrivacyThreshold ? (
                  <div
                    className="rounded-md border p-6 text-center"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                      Not enough community responses yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--ink-secondary)]">
                      This cohort currently has{" "}
                      <strong className="font-mono-tabular">
                        {community.eligibleCohortParticipants}
                      </strong>{" "}
                      opted-in participant
                      {community.eligibleCohortParticipants === 1 ? "" : "s"}.
                      To protect anonymity and prevent inferring individual
                      answers, community averages unlock strictly at{" "}
                      <span className="font-mono-tabular">
                        n &ge; {community.minimumThreshold}
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <CommunityComparisonChart
                    items={community.items}
                    minimumThreshold={community.minimumThreshold}
                    isSyntheticDemo={community.isSyntheticDemo}
                  />
                )}
              </div>
            </div>
          </Tabs.Content>
        )}

        {/* TAB 4: IDEAL PARTNER ANALYSIS */}
        {showIdealPartnerTab && (
          <Tabs.Content value="ideal-partner" className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                  Your Ideal Partner&apos;s Characteristics
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-primary)]">
                  {result.idealPartner.characteristics.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-plum)]" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 font-display text-2xl text-[var(--ink-primary)]">
                  Relationship Communication Needs
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink-secondary)]">
                  {result.idealPartner.communicationNeeds.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <h2 className="font-display text-3xl text-[var(--ink-primary)]">
                  What Matters Most to You
                </h2>
                {result.idealPartner.whatMattersMost.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--ink-secondary)]">
                    Mark items as Essential or Important to rank your
                    non-negotiable priorities.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {result.idealPartner.whatMattersMost.map((m, i) => (
                      <div
                        key={i}
                        className="rounded-md border p-4"
                        style={{
                          backgroundColor: "var(--bg-subtle)",
                          borderColor: "var(--border-hairline)",
                        }}
                      >
                        <p className="text-sm font-semibold text-[var(--ink-primary)]">
                          {m.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                          {m.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  What to Look For Early in Dating
                </h3>
                <div className="mt-4 space-y-3.5">
                  {result.idealPartner.earlyDatingSignals.map((sig, i) => (
                    <div
                      key={i}
                      className="rounded-md border p-4"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <p className="text-sm font-medium text-[var(--ink-primary)]">
                        {sig.signal}
                      </p>
                      <p className="mt-1.5 text-xs italic text-[var(--ink-secondary)]">
                        {sig.conversationPrompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                  Potential Mismatches &amp; Curiosities
                </h3>
                <div className="mt-4 space-y-3">
                  {result.idealPartner.potentialMismatches.map((mis, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-md border p-4 text-xs"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-hairline)",
                      }}
                    >
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-rose)]" />
                      <div>
                        <p className="font-semibold text-[var(--ink-primary)]">
                          {mis.area}
                        </p>
                        <p className="mt-1 leading-relaxed text-[var(--ink-secondary)]">
                          {mis.note}
                        </p>
                      </div>
                    </div>
                  ))}

                  {result.idealPartner.explorationOpportunities.map((ex, i) => (
                    <div
                      key={`ex-${i}`}
                      className="rounded-md border p-4 text-xs"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--accent-gold)",
                      }}
                    >
                      <p className="font-semibold text-[var(--accent-gold)]">
                        Curiosity Opportunity: {ex.topic}
                      </p>
                      <p className="mt-1 leading-relaxed text-[var(--ink-secondary)]">
                        {ex.framing}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}
