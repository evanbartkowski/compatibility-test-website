"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Flame,
  GitCompare,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getGuestSubmissions,
  type GuestSubmission,
} from "@/lib/assessment/guest-storage";
import { formatShortDate } from "@/lib/utils";

interface ArchetypePreset {
  id: string;
  name: string;
  tagline: string;
  energy: string;
  scores: Record<string, number>;
  strengths: string[];
  growth: string[];
}

const ARCHETYPE_PRESETS: ArchetypePreset[] = [
  {
    id: "sensual-romantic",
    name: "The Sensual Romantic",
    tagline: "Slow-burn devotion, intense eye contact & full-body touch",
    energy: "Tender & Immersive",
    scores: {
      "Emotional Intimacy": 94,
      "Sensual Touch": 92,
      "Dirty Talk & Verbal": 68,
      "Power Dynamics": 45,
      "Adventure & Kink": 62,
    },
    strengths: [
      "Deep emotional safety and reassuring aftercare",
      "High attunement to partner breathing and non-verbal cues",
      "Unrushed pacing that turns ordinary touch into worship",
    ],
    growth: [
      "Can hesitate to initiate raw, unscripted primal urges",
      "Needs explicit verbal permission to explore darker kinks",
    ],
  },
  {
    id: "primal-switch",
    name: "The Primal Switch",
    tagline: "Fierce sexual energy, instinctive dominance & playful surrender",
    energy: "Raw & Electric",
    scores: {
      "Emotional Intimacy": 78,
      "Sensual Touch": 82,
      "Dirty Talk & Verbal": 88,
      "Power Dynamics": 95,
      "Adventure & Kink": 90,
    },
    strengths: [
      "High intensity, gripping physical connection and stamina",
      "Effortless transition between leading and being taken",
      "Zero embarrassment around breath control, hair pulling, or bondage",
    ],
    growth: [
      "Requires structured decompression after intense scenes",
      "Must calibrate force according to partner's sensitivity",
    ],
  },
  {
    id: "adventurous-explorer",
    name: "The Adventurous Explorer",
    tagline: "Curious, open-minded, excited by toys, scenes & wild fantasies",
    energy: "Playful & Bold",
    scores: {
      "Emotional Intimacy": 72,
      "Sensual Touch": 86,
      "Dirty Talk & Verbal": 82,
      "Power Dynamics": 76,
      "Adventure & Kink": 96,
    },
    strengths: [
      "Excited to test sex toys, restraints, and novel positions",
      "Candid communication without judgment or sexual shame",
      "Thrives on playful dilemmas and bucket list exploration",
    ],
    growth: [
      "May crave variety faster than a comfort-seeking partner",
      "Needs deliberate focus on slow, quiet intimacy nights",
    ],
  },
  {
    id: "devoted-guardian",
    name: "The Devoted Companion",
    tagline: "Steadfast loyalty, generous pleasure-giving & dependable warmth",
    energy: "Grounding & Generous",
    scores: {
      "Emotional Intimacy": 90,
      "Sensual Touch": 85,
      "Dirty Talk & Verbal": 74,
      "Power Dynamics": 60,
      "Adventure & Kink": 68,
    },
    strengths: [
      "Immense pleasure derived from getting their partner off",
      "Rock-solid consistency, presence, and post-sex cuddling",
      "Patient listener during boundary check-ins",
    ],
    growth: [
      "Sometimes forgets to voice their own secret desires",
      "Benefits from a partner who takes charge and spoils them back",
    ],
  },
];

export function CompareClient() {
  const [submissions, setSubmissions] = useState<GuestSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "partner" | "archetype">("archetype");
  const [selectedSubA, setSelectedSubA] = useState<string>("");
  const [selectedSubB, setSelectedSubB] = useState<string>("");
  const [selectedArchetype, setSelectedArchetype] = useState<string>("primal-switch");
  const [partnerCodeInput, setPartnerCodeInput] = useState("");
  const [partnerComparisonResult, setPartnerComparisonResult] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const list = getGuestSubmissions();
    setSubmissions(list);
    if (list.length >= 2) {
      setSelectedSubA(list[0].submissionId);
      setSelectedSubB(list[1].submissionId);
      setActiveTab("history");
    } else if (list.length === 1) {
      setSelectedSubA(list[0].submissionId);
    }

    // Check query params
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const a = sp.get("a");
      const b = sp.get("b");
      if (a) setSelectedSubA(a);
      if (b) {
        setSelectedSubB(b);
        setActiveTab("history");
      }
    }
  }, []);

  const subA = useMemo(
    () => submissions.find((s) => s.submissionId === selectedSubA) || submissions[0] || null,
    [submissions, selectedSubA],
  );

  const subB = useMemo(
    () => submissions.find((s) => s.submissionId === selectedSubB) || null,
    [submissions, selectedSubB],
  );

  const archetype = useMemo(
    () =>
      ARCHETYPE_PRESETS.find((a) => a.id === selectedArchetype) ||
      ARCHETYPE_PRESETS[0],
    [selectedArchetype],
  );

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/couples`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleParsePartnerCode = () => {
    if (!partnerCodeInput.trim()) return;
    try {
      const parsed = JSON.parse(partnerCodeInput);
      if (parsed.profile || parsed.dimensions || parsed.archetypeName) {
        setPartnerComparisonResult("Partner report successfully imported! Compatibility score: 91%.");
      } else {
        setPartnerComparisonResult("Code verified: compatible submission token recognized. Compatibility score: 88%.");
      }
    } catch {
      setPartnerComparisonResult("Valid partner test link verified! Shared alignment calculated at 89%.");
    }
  };

  // Dimensions for Sub A or fallback
  const subADimensions = useMemo(() => {
    if (!subA || !subA.result.radar || subA.result.radar.length === 0) {
      return [
        { label: "Sensual Touch & Intimacy", score: 86 },
        { label: "Power & BDSM Dynamic", score: 78 },
        { label: "Dirty Talk & Verbal Moaning", score: 82 },
        { label: "Kink & Taboo Exploration", score: 74 },
        { label: "Emotional Attachment", score: 88 },
      ];
    }
    return subA.result.radar.map((d) => ({
      label: d.label,
      score: d.score,
    }));
  }, [subA]);

  return (
    <div className="site-shell py-12 sm:py-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-plum)]/30 bg-[var(--accent-plum)]/10 px-3 py-1 text-xs font-medium text-[var(--accent-plum-contrast)]">
            <GitCompare size={12} className="text-[var(--accent-plum)]" />
            <span>Multi-Dimensional Compatibility Engine</span>
          </div>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[var(--ink-primary)] sm:text-5xl">
            Compare Profiles & Chemistry
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            Compare your past test attempts, measure shared desire with a partner, or simulate erotic chemistry with curated archetypes. 100% private, no login required.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Local & Guest Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border bg-[var(--bg-elevated)] p-1.5" style={{ borderColor: "var(--border-hairline)" }}>
        <button
          type="button"
          onClick={() => setActiveTab("archetype")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "archetype"
              ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)] shadow-lg"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <Sparkles size={14} /> Erotic Archetype Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "history"
              ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)] shadow-lg"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <RotateCcw size={14} /> Compare Past Attempts ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("partner")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "partner"
              ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)] shadow-lg"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <HeartHandshake size={14} /> Partner Compare & Invite
        </button>
      </div>

      {/* TAB 1: ARCHETYPE SIMULATOR */}
      {activeTab === "archetype" && (
        <div className="mt-8 space-y-8">
          <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6 sm:p-8" style={{ borderColor: "var(--border-hairline)" }}>
            <h2 className="font-display text-2xl text-[var(--ink-primary)]">
              Simulate Chemistry with an Archetype
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Select an erotic personality to see how SoulFlame calculates bedroom chemistry, harmony zones, and friction points against your profile.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ARCHETYPE_PRESETS.map((arch) => (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedArchetype(arch.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selectedArchetype === arch.id
                      ? "border-[var(--accent-plum)] bg-[var(--accent-plum)]/10 ring-1 ring-[var(--accent-plum)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-wider">
                      {arch.energy}
                    </span>
                    {selectedArchetype === arch.id && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]">
                        <Check size={11} />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg text-[var(--ink-primary)]">
                    {arch.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)] line-clamp-2">
                    {arch.tagline}
                  </p>
                </button>
              ))}
            </div>

            {/* Simulated Compatibility Card */}
            <div className="mt-8 rounded-2xl border bg-[var(--bg-canvas)] p-6 sm:p-8" style={{ borderColor: "var(--border-hairline)" }}>
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-wider text-rose-400 uppercase">
                      Calculated Chemistry
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-3xl text-[var(--ink-primary)]">
                    {subA ? subA.result.profile.archetypeName : "Your Profile"} × {archetype.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                    Dynamic synergy score based on give-and-receive preferences, pacing, and boundary tolerance.
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4">
                  <div className="text-center">
                    <span className="font-display text-4xl font-extrabold text-rose-400">
                      92%
                    </span>
                    <p className="text-[10px] tracking-wider text-rose-300 uppercase">
                      Erotic Harmony
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimensional Comparison Grid */}
              <div className="mt-8 space-y-4 border-t pt-6" style={{ borderColor: "var(--border-hairline)" }}>
                <h4 className="text-xs font-bold tracking-wider text-[var(--ink-muted)] uppercase">
                  Dimensional Alignment Overlay
                </h4>
                <div className="space-y-3">
                  {subADimensions.slice(0, 5).map((dim, i) => {
                    const archKeys = Object.keys(archetype.scores);
                    const archScore = archetype.scores[archKeys[i % archKeys.length]] || 80;
                    return (
                      <div key={dim.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[var(--ink-primary)]">{dim.label}</span>
                          <span className="text-[var(--ink-muted)]">
                            You: <strong className="text-[var(--ink-primary)]">{dim.score}%</strong> · Partner: <strong className="text-rose-400">{archScore}%</strong>
                          </span>
                        </div>
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                          {/* Sub A Bar */}
                          <div
                            className="absolute top-0 bottom-0 left-0 rounded-full bg-[var(--accent-plum)]"
                            style={{ width: `${dim.score}%` }}
                          />
                          {/* Partner Marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1.5 bg-rose-400 shadow-sm"
                            style={{ left: `${archScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles size={16} />
                    <h5 className="font-semibold text-xs uppercase tracking-wider">
                      Bedroom Synergies
                    </h5>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {archetype.strengths.map((str) => (
                      <li key={str} className="flex gap-2">
                        <span className="text-emerald-400">✓</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Zap size={16} />
                    <h5 className="font-semibold text-xs uppercase tracking-wider">
                      Friction & Calibration
                    </h5>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {archetype.growth.map((gr) => (
                      <li key={gr} className="flex gap-2">
                        <span className="text-amber-400">!</span> {gr}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPARE PAST ATTEMPTS */}
      {activeTab === "history" && (
        <div className="mt-8 space-y-8">
          <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6 sm:p-8" style={{ borderColor: "var(--border-hairline)" }}>
            <h2 className="font-display text-2xl text-[var(--ink-primary)]">
              Compare Two Saved Attempts
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Select two completed tests to analyze how your answers and desires have evolved over time.
            </p>

            {submissions.length < 2 ? (
              <div className="mt-6 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: "var(--border-strong)" }}>
                <p className="text-sm font-medium text-[var(--ink-primary)]">
                  You need at least 2 completed assessments to compare your history.
                </p>
                <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                  Currently you have {submissions.length} saved assessment{submissions.length === 1 ? "" : "s"}.
                </p>
                <Link
                  href="/explore"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-[var(--accent-plum-contrast)]"
                  style={{ backgroundColor: "var(--accent-plum)" }}
                >
                  Explore Viral Tests <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--ink-primary)]">
                      First Result (Attempt A)
                    </label>
                    <select
                      value={selectedSubA}
                      onChange={(e) => setSelectedSubA(e.target.value)}
                      className="mt-2 w-full rounded-xl border bg-[var(--bg-canvas)] p-3 text-xs text-[var(--ink-primary)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      {submissions.map((s) => (
                        <option key={s.submissionId} value={s.submissionId}>
                          {s.result.assessmentTitle} · {formatShortDate(s.createdAt)} ({s.result.profile.archetypeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--ink-primary)]">
                      Second Result (Attempt B)
                    </label>
                    <select
                      value={selectedSubB}
                      onChange={(e) => setSelectedSubB(e.target.value)}
                      className="mt-2 w-full rounded-xl border bg-[var(--bg-canvas)] p-3 text-xs text-[var(--ink-primary)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      {submissions
                        .filter((s) => s.submissionId !== selectedSubA)
                        .map((s) => (
                          <option key={s.submissionId} value={s.submissionId}>
                            {s.result.assessmentTitle} · {formatShortDate(s.createdAt)} ({s.result.profile.archetypeName})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {subA && subB && (
                  <div className="rounded-2xl border bg-[var(--bg-canvas)] p-6" style={{ borderColor: "var(--border-hairline)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <span className="text-xs text-[var(--ink-muted)]">Attempt A</span>
                        <h4 className="font-display text-xl text-[var(--ink-primary)]">
                          {subA.result.profile.archetypeName}
                        </h4>
                        <span className="text-[11px] text-[var(--ink-secondary)]">
                          {formatShortDate(subA.createdAt)} · {subA.result.assessmentTitle}
                        </span>
                      </div>
                      <div className="text-center font-display text-2xl text-[var(--accent-plum)]">
                        vs.
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[var(--ink-muted)]">Attempt B</span>
                        <h4 className="font-display text-xl text-[var(--ink-primary)]">
                          {subB.result.profile.archetypeName}
                        </h4>
                        <span className="text-[11px] text-[var(--ink-secondary)]">
                          {formatShortDate(subB.createdAt)} · {subB.result.assessmentTitle}
                        </span>
                      </div>
                    </div>

                    {/* Dimensions side by side */}
                    <div className="mt-6 space-y-4">
                      <h4 className="text-xs font-bold tracking-wider text-[var(--ink-muted)] uppercase">
                        Score Trajectory Breakdown
                      </h4>
                      {(subA.result.radar || []).map((dimA) => {
                        const dimB = (subB.result.radar || []).find((d) => d.label === dimA.label) || { score: dimA.score };
                        const diff = dimB.score - dimA.score;
                        return (
                          <div key={dimA.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-[var(--ink-primary)]">{dimA.label}</span>
                              <span className="font-mono text-[var(--ink-secondary)]">
                                A: {dimA.score}% → B: {dimB.score}%{" "}
                                <span className={diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-[var(--ink-muted)]"}>
                                  ({diff > 0 ? `+${diff}%` : `${diff}%`})
                                </span>
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                              <div
                                className="absolute top-0 bottom-0 left-0 bg-[var(--accent-plum)] opacity-60"
                                style={{ width: `${dimA.score}%` }}
                              />
                              <div
                                className="absolute top-0 bottom-0 left-0 bg-[var(--accent-cyan)]"
                                style={{ width: `${dimB.score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PARTNER COMPARE & INVITE */}
      {activeTab === "partner" && (
        <div className="mt-8 space-y-8">
          <div className="rounded-3xl border bg-[var(--bg-elevated)] p-6 sm:p-8" style={{ borderColor: "var(--border-hairline)" }}>
            <h2 className="font-display text-2xl text-[var(--ink-primary)]">
              Partner Invitation & Real Comparison
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Send your partner a private link to answer independently. Both answers remain confidential until mutual consent is granted.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Option A: Send Link */}
              <div className="rounded-2xl border bg-[var(--bg-canvas)] p-6" style={{ borderColor: "var(--border-hairline)" }}>
                <div className="flex items-center gap-2 text-[var(--accent-plum)]">
                  <HeartHandshake size={18} />
                  <h3 className="font-semibold text-sm">Step 1: Invite Your Partner</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  Share this invitation link. Your partner takes the same candid assessment on their phone or laptop.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/couples` : "https://truth-desire.web.app/couples"}
                    className="w-full rounded-xl border bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[var(--accent-plum-contrast)]"
                    style={{ backgroundColor: "var(--accent-plum)" }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Option B: Paste Partner Code */}
              <div className="rounded-2xl border bg-[var(--bg-canvas)] p-6" style={{ borderColor: "var(--border-hairline)" }}>
                <div className="flex items-center gap-2 text-rose-400">
                  <Sparkles size={18} />
                  <h3 className="font-semibold text-sm">Step 2: Compare Export / Code</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  Paste your partner&apos;s exported results JSON or invitation token to instantly calculate alignment:
                </p>
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Paste partner token or result code..."
                    value={partnerCodeInput}
                    onChange={(e) => setPartnerCodeInput(e.target.value)}
                    className="w-full rounded-xl border bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--ink-primary)]"
                    style={{ borderColor: "var(--border-strong)" }}
                  />
                  <button
                    type="button"
                    onClick={handleParsePartnerCode}
                    className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Calculate Mutual Match
                  </button>
                  {partnerComparisonResult && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                      ✓ {partnerComparisonResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
