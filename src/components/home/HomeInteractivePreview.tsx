"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Flame, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { brandConfig } from "@/config/brand";
import { PreferenceRadarChart } from "@/components/charts/PreferenceRadarChart";
import type { RadarDimensionScore } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

type SpecimenMode = "radar" | "desire_gap" | "bdsm_kink";
type RadarArchetypeKey = "slow_burn" | "velvet_switch" | "passionate_comm";

const PREVIEW_PROFILES: Record<
  RadarArchetypeKey,
  {
    shortLabel: string;
    name: string;
    summary: string;
    radar: RadarDimensionScore[];
    unmetHighlight: string;
  }
> = {
  slow_burn: {
    shortLabel: "Slow-Burn Romantic",
    name: "The Slow-Burn Romantic",
    summary:
      "Drawn to 30+ minute foreplay, lingering skin-to-skin buildup, whispered praise, and affectionate aftercare backed by unmistakable consent.",
    unmetHighlight:
      "Illustrative insight: Rates unhurried warmup 5/5 (Essential) while reporting it happens rarely (2/5).",
    radar: [
      { dimension: "communication", label: "Communication", score: 78, answeredCount: 6, contributors: [] },
      { dimension: "sensuality", label: "Sensuality", score: 93, answeredCount: 8, contributors: [] },
      { dimension: "exploration", label: "Exploration", score: 56, answeredCount: 5, contributors: [] },
      { dimension: "assertiveness", label: "Assertiveness", score: 44, answeredCount: 4, contributors: [] },
      { dimension: "emotionalConnection", label: "Emotional Depth", score: 91, answeredCount: 7, contributors: [] },
      { dimension: "playfulness", label: "Playfulness", score: 66, answeredCount: 5, contributors: [] },
      { dimension: "mutualAttentiveness", label: "Attentiveness", score: 88, answeredCount: 7, contributors: [] },
    ],
  },
  velvet_switch: {
    shortLabel: "Velvet Switch",
    name: "The Velvet Switch",
    summary:
      "Thrives on deliberate tension, equally energized by commanding the tempo one evening and melting into trust-filled surrender the next.",
    unmetHighlight:
      "Illustrative insight: Craves playful restraint & clear safeword check-ins (5/5) while seldom naming exact turn-ons early.",
    radar: [
      { dimension: "communication", label: "Communication", score: 86, answeredCount: 7, contributors: [] },
      { dimension: "sensuality", label: "Sensuality", score: 84, answeredCount: 7, contributors: [] },
      { dimension: "exploration", label: "Exploration", score: 89, answeredCount: 8, contributors: [] },
      { dimension: "assertiveness", label: "Assertiveness", score: 81, answeredCount: 7, contributors: [] },
      { dimension: "emotionalConnection", label: "Emotional Depth", score: 79, answeredCount: 6, contributors: [] },
      { dimension: "playfulness", label: "Playfulness", score: 92, answeredCount: 8, contributors: [] },
      { dimension: "mutualAttentiveness", label: "Attentiveness", score: 85, answeredCount: 7, contributors: [] },
    ],
  },
  passionate_comm: {
    shortLabel: "Passionate Communicator",
    name: "The Passionate Communicator",
    summary:
      "Lights up over unfiltered late-night fantasy sharing, verbal encouragement during passion, and attentive mutual feedback afterward.",
    unmetHighlight:
      "Illustrative insight: Values explicit pre-intimacy teasing (5/5) experienced only sometimes (3/5).",
    radar: [
      { dimension: "communication", label: "Communication", score: 94, answeredCount: 8, contributors: [] },
      { dimension: "sensuality", label: "Sensuality", score: 74, answeredCount: 6, contributors: [] },
      { dimension: "exploration", label: "Exploration", score: 83, answeredCount: 7, contributors: [] },
      { dimension: "assertiveness", label: "Assertiveness", score: 71, answeredCount: 5, contributors: [] },
      { dimension: "emotionalConnection", label: "Emotional Depth", score: 82, answeredCount: 6, contributors: [] },
      { dimension: "playfulness", label: "Playfulness", score: 80, answeredCount: 6, contributors: [] },
      { dimension: "mutualAttentiveness", label: "Attentiveness", score: 90, answeredCount: 8, contributors: [] },
    ],
  },
};

const DESIRE_GAP_SPECIMEN_POINTS = [
  {
    id: "foreplay",
    label: "30+ min unhurried buildup",
    desire: 4.8,
    frequency: 1.7,
    zone: "High desire · Untapped opportunity",
    note: "Essential physical & emotional warmup you genuinely crave far more often than it currently unfolds.",
  },
  {
    id: "praise",
    label: "Whispered encouragement & dirty talk",
    desire: 4.5,
    frequency: 2.3,
    zone: "High desire · Worth voicing",
    note: "Vocal intensity that deepens connection without requiring elaborate props or preparation.",
  },
  {
    id: "sensory",
    label: "Blindfold & slow fingertip teasing",
    desire: 4.2,
    frequency: 1.4,
    zone: "High curiosity · Untapped sensation",
    note: "Simple sensory play that heightens anticipation, ideal for a mutually unlocked night.",
  },
  {
    id: "aftercare",
    label: "Extended skin-to-skin aftercare",
    desire: 4.7,
    frequency: 4.3,
    zone: "High desire · Richly fulfilled",
    note: "Warmth, water, and quiet closeness already happening consistently between you.",
  },
  {
    id: "rushed",
    label: "Skipping directly past arousal cues",
    desire: 1.3,
    frequency: 3.1,
    zone: "Low desire · Slow down here",
    note: "Moments moving faster than genuine readiness, signaling when to reset tempo together.",
  },
];

type KinkSpecimenRule = "mutual_only" | "always_share_with_partner" | "private_never_share";

const KINK_SPECIMEN_ITEMS = [
  {
    id: "silk_restraint",
    label: "Soft silk wrist restraint & pinning",
    partnerMatched: true,
    category: "Bondage & Restraint",
  },
  {
    id: "wax_ice",
    label: "Temperature contrast (ice & warm massage candle)",
    partnerMatched: false,
    category: "Sensation & Edge",
  },
  {
    id: "praise_collar",
    label: "Devotional collar ritual & explicit praise",
    partnerMatched: true,
    category: "Power Exchange",
  },
];

export function HeroVisualPreview() {
  const [mode, setMode] = useState<SpecimenMode>("radar");
  const [archetype, setArchetype] = useState<RadarArchetypeKey>("slow_burn");
  const [selectedGapId, setSelectedGapId] = useState<string>("foreplay");
  const [kinkRule, setKinkRule] = useState<KinkSpecimenRule>("mutual_only");

  const currentProfile = PREVIEW_PROFILES[archetype];
  const currentGap =
    DESIRE_GAP_SPECIMEN_POINTS.find((p) => p.id === selectedGapId) ??
    DESIRE_GAP_SPECIMEN_POINTS[0];

  const specimenModes: Array<{ id: SpecimenMode; title: string; detail: string }> = [
    {
      id: "radar",
      title: "Preference Radar",
      detail: "7-axis sensual, communication & initiative shape",
    },
    {
      id: "desire_gap",
      title: "Desire vs. Experience",
      detail: "Plot what you crave alongside how often it happens",
    },
    {
      id: "bdsm_kink",
      title: "BDSM & Kink Reveal",
      detail: "Complementary Top/Bottom fit + zero-leak matching",
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-strong)",
        boxShadow: "var(--shadow-lifted)",
      }}
    >
      <div className="grid lg:grid-cols-12">
        {/* Left Specimen Navigation Rail */}
        <aside
          className="flex flex-col justify-between border-b p-6 lg:col-span-4 lg:border-r lg:border-b-0 sm:p-7"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl text-[var(--ink-primary)] sm:text-3xl">
                Interactive Report Folio
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                Switch views to inspect how {brandConfig.name} maps personal desire, pacing gaps,
                and private partner chemistry using synthetic examples.
              </p>
            </div>

            <div className="space-y-2" role="tablist" aria-label="Interactive preview modes">
              {specimenModes.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMode(item.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-[var(--accent-plum)] bg-[var(--bg-elevated)]"
                        : "border-[var(--border-hairline)] bg-transparent hover:border-[var(--border-strong)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          active ? "text-[var(--accent-plum)]" : "text-[var(--ink-primary)]"
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: active ? "var(--accent-plum)" : "var(--border-strong)",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs leading-snug text-[var(--ink-secondary)]">
                      {item.detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border-hairline)" }}>
            <Link
              href={
                mode === "bdsm_kink"
                  ? "/assess/bdsm-power-dynamics-test"
                  : "/assess/intimacy-partner-preferences"
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-plum)] hover:underline"
            >
              {mode === "bdsm_kink"
                ? "Launch BDSM Roles Test"
                : "Take the 56-Item Intimacy Test"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        {/* Right Live Specimen Stage */}
        <div className="p-6 sm:p-8 lg:col-span-8">
          {mode === "radar" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <span className="text-xs text-[var(--ink-muted)]">
                    Illustrative Profile Specimen (Synthetic Example)
                  </span>
                  <h3 className="font-display text-2xl text-[var(--ink-primary)] sm:text-3xl">
                    {currentProfile.name}
                  </h3>
                </div>

                <div
                  className="flex flex-wrap rounded-full border p-1"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  {(
                    [
                      ["slow_burn", "Slow-Burn"],
                      ["velvet_switch", "Velvet Switch"],
                      ["passionate_comm", "Communicator"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setArchetype(key)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        archetype === key
                          ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--ink-secondary)] sm:text-sm">
                {currentProfile.summary}
              </p>

              <div className="mt-4">
                <PreferenceRadarChart dimensions={currentProfile.radar} interactive={false} stacked />
              </div>

              <div
                className="mt-3 rounded-xl border px-4 py-2.5 text-xs text-[var(--ink-secondary)]"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                {currentProfile.unmetHighlight}
              </div>
            </div>
          )}

          {mode === "desire_gap" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-4">
                <div>
                  <span className="text-xs text-[var(--ink-muted)]">
                    Desire vs. Lived Frequency Specimen (Interactive)
                  </span>
                  <h3 className="font-display text-2xl text-[var(--ink-primary)] sm:text-3xl">
                    Where high desire awaits expression
                  </h3>
                </div>
                <span className="font-mono-tabular text-xs text-[var(--accent-gold)]">
                  Click a point to inspect
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-12 md:items-center">
                <div
                  className="rounded-2xl border p-3 md:col-span-7"
                  style={{
                    backgroundColor: "var(--bg-canvas)",
                    borderColor: "var(--border-hairline)",
                  }}
                >
                  <svg
                    viewBox="0 0 360 250"
                    role="img"
                    aria-label="Illustrative Desire versus Experience specimen chart"
                    className="w-full select-none"
                  >
                    {/* Top-left untapped quadrant */}
                    <rect
                      x="42"
                      y="20"
                      width="150"
                      height="98"
                      fill="color-mix(in srgb, var(--accent-plum) 11%, transparent)"
                    />
                    {/* Axis lines */}
                    <line x1="192" y1="20" x2="192" y2="216" stroke="var(--border-strong)" strokeDasharray="3 3" />
                    <line x1="42" y1="118" x2="342" y2="118" stroke="var(--border-strong)" strokeDasharray="3 3" />
                    <rect
                      x="42"
                      y="20"
                      width="300"
                      height="196"
                      fill="none"
                      stroke="var(--border-hairline)"
                    />
                    <text x="50" y="34" className="fill-[var(--accent-plum)] text-[9.5px] font-semibold">
                      Untapped Desire Zone
                    </text>
                    <text x="334" y="34" textAnchor="end" className="fill-[var(--accent-sage)] text-[9.5px] font-medium">
                      Thriving Mutual Rituals
                    </text>
                    <text x="192" y="236" textAnchor="middle" className="fill-[var(--ink-muted)] text-[10px]">
                      How often it happens (1 Never &rarr; 5 Often)
                    </text>
                    <text
                      x="16"
                      y="118"
                      textAnchor="middle"
                      transform="rotate(-90 16 118)"
                      className="fill-[var(--ink-muted)] text-[10px]"
                    >
                      Desire (1&ndash;5)
                    </text>

                    {DESIRE_GAP_SPECIMEN_POINTS.map((pt) => {
                      const cx = 42 + ((pt.frequency - 0.8) / 4.4) * 300;
                      const cy = 216 - ((pt.desire - 0.8) / 4.4) * 196;
                      const active = pt.id === currentGap.id;
                      return (
                        <g
                          key={pt.id}
                          role="button"
                          tabIndex={0}
                          aria-label={pt.label}
                          onClick={() => setSelectedGapId(pt.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedGapId(pt.id);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {active && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={13}
                              fill="color-mix(in srgb, var(--accent-plum) 26%, transparent)"
                            />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={active ? 7 : 5}
                            fill={
                              pt.desire >= 4 && pt.frequency < 3
                                ? "var(--accent-plum)"
                                : pt.desire >= 4
                                  ? "var(--accent-sage)"
                                  : "var(--accent-rose)"
                            }
                            stroke="var(--bg-canvas)"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="space-y-3 md:col-span-5">
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderColor: "var(--border-strong)",
                    }}
                  >
                    <span className="font-mono-tabular text-[11px] font-medium text-[var(--accent-gold)]">
                      {currentGap.zone}
                    </span>
                    <h4 className="mt-1 font-display text-2xl text-[var(--ink-primary)]">
                      {currentGap.label}
                    </h4>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border bg-[var(--bg-elevated)] p-2.5">
                        <span className="text-[var(--ink-muted)]">Desire</span>
                        <p className="font-mono-tabular text-lg font-semibold text-[var(--accent-plum)]">
                          {currentGap.desire}/5
                        </p>
                      </div>
                      <div className="rounded-xl border bg-[var(--bg-elevated)] p-2.5">
                        <span className="text-[var(--ink-muted)]">Experienced</span>
                        <p className="font-mono-tabular text-lg font-semibold text-[var(--ink-primary)]">
                          {currentGap.frequency}/5
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-[var(--ink-secondary)]">
                      {currentGap.note}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {DESIRE_GAP_SPECIMEN_POINTS.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setSelectedGapId(pt.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          pt.id === currentGap.id
                            ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                            : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)]"
                        )}
                      >
                        {pt.label.split(" ").slice(0, 2).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "bdsm_kink" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-4">
                <div>
                  <span className="text-xs text-[var(--ink-muted)]">
                    Power Polarity &amp; Zero-Leak Kink Discovery (Specimen)
                  </span>
                  <h3 className="font-display text-2xl text-[var(--ink-primary)] sm:text-3xl">
                    Complementary roles &amp; mutual-only reveals
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono-tabular text-xs font-semibold text-[var(--accent-gold)]">
                  <Flame className="h-3.5 w-3.5 text-[var(--accent-plum)]" />
                  94% Polarity Fit
                </span>
              </div>

              <div
                className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div>
                  <span className="text-[11px] text-[var(--ink-muted)]">Person A Archetype</span>
                  <p className="font-display text-xl text-[var(--ink-primary)]">
                    The Attentive Sovereign
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    High Dominance / Top &middot; Clear check-ins &amp; structured aftercare
                  </p>
                </div>
                <div className="border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                  <span className="text-[11px] text-[var(--ink-muted)]">Partner B Complement</span>
                  <p className="font-display text-xl text-[var(--accent-plum)]">
                    The Devoted Surrenderer
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    High Submission / Bottom &middot; Enjoys guided control &amp; praise
                  </p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[var(--ink-primary)]">
                    Test Reveal Privacy Rule on Kink Exploration Map:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["mutual_only", "Mutual Only"],
                        ["always_share_with_partner", "Share Openly"],
                        ["private_never_share", "Keep Private"],
                      ] as const
                    ).map(([ruleKey, ruleLabel]) => (
                      <button
                        key={ruleKey}
                        type="button"
                        onClick={() => setKinkRule(ruleKey)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          kinkRule === ruleKey
                            ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                            : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)]"
                        )}
                      >
                        {ruleLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {KINK_SPECIMEN_ITEMS.map((item) => {
                    const visible =
                      kinkRule === "private_never_share"
                        ? false
                        : kinkRule === "always_share_with_partner"
                          ? true
                          : item.partnerMatched;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs"
                        style={{
                          backgroundColor: visible ? "var(--bg-canvas)" : "var(--bg-subtle)",
                          borderColor: visible
                            ? "var(--accent-plum)"
                            : "var(--border-hairline)",
                        }}
                      >
                        <div>
                          <span className="font-medium text-[var(--ink-primary)]">
                            {visible ? item.label : "Concealed from Partner View"}
                          </span>
                          <span className="ml-2 text-[11px] text-[var(--ink-muted)]">
                            {item.category}
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 font-mono-tabular text-[11px] font-semibold"
                          style={{
                            color: visible ? "var(--accent-sage)" : "var(--ink-muted)",
                          }}
                        >
                          {visible ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              {item.partnerMatched ? "Mutual Match" : "Shared Openly"}
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Zero-Leak Protected
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type DemoPartnerState = "enthusiastic_leader" | "willing_collaborator" | "firm_boundary";

export function CompatibilityMatcherDemo() {
  const [partnerMode, setPartnerMode] = useState<DemoPartnerState>("enthusiastic_leader");

  const outcomes: Record<
    DemoPartnerState,
    {
      badge: string;
      score: number;
      toneColor: string;
      explanation: string;
      dialogue: string;
    }
  > = {
    enthusiastic_leader: {
      badge: "Complementary Alignment",
      score: 95,
      toneColor: "var(--accent-sage)",
      explanation:
        "Person A loves a partner confidently taking the lead (5/5 · Important), and Person B enthusiastically enjoys taking the lead within agreed boundaries (5/5).",
      dialogue:
        "Natural fit: ask how both of you like checking in while keeping momentum effortless.",
    },
    willing_collaborator: {
      badge: "Supportive Willingness",
      score: 82,
      toneColor: "var(--accent-gold)",
      explanation:
        "Person B is glad to step into initiative when Person A wants it, even though it isn't Person B's default preference. Scoring distinguishes supportive willingness from intrinsic eagerness.",
      dialogue:
        "Helpful conversation: agree on lighthearted signals for when Person A wants Person B to lead.",
    },
    firm_boundary: {
      badge: "Boundary Protected (Safety Precedence)",
      score: 12,
      toneColor: "var(--accent-rose)",
      explanation:
        "Person B marked a firm boundary here. Even if every other category aligns, firm boundaries are never averaged away or presented as negotiable.",
      dialogue:
        "Clear respect: this dynamic stays off the table unless Person B ever chooses otherwise independently.",
    },
  };

  const active = outcomes[partnerMode];

  return (
    <div
      className="grid gap-8 rounded-3xl border p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-hairline)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div className="space-y-5 lg:col-span-6">
        <h3 className="font-display text-3xl text-[var(--ink-primary)] sm:text-4xl">
          Compatibility isn&apos;t identical answers
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Naive quizzes reward identical clicks. {brandConfig.name} models complementary
          dynamics, pairing what one partner craves with what the other genuinely loves offering
          while protecting firm boundaries unconditionally.
        </p>

        <div
          className="rounded-2xl border p-4"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <p className="text-xs font-medium text-[var(--ink-muted)]">
            Person A (Receiver perspective)
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">
            &ldquo;Enjoys a partner confidently taking the lead&rdquo; &middot; Strongly like (5/5) &middot; Important
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--ink-muted)]">
            Test how Person B&apos;s complementary response changes the match:
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["enthusiastic_leader", "Enjoys leading (5/5)"],
                ["willing_collaborator", "Willing if partner enjoys"],
                ["firm_boundary", "Marks firm boundary"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPartnerMode(key)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                  partnerMode === key
                    ? "border-[var(--accent-plum)] bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={partnerMode}
        initial={{ opacity: 0.7, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border p-6 lg:col-span-6"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: active.toneColor,
            }}
          >
            {partnerMode === "firm_boundary" ? (
              <ShieldAlert className="h-3.5 w-3.5" />
            ) : partnerMode === "enthusiastic_leader" ? (
              <Sparkles className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {active.badge}
          </span>
          <span className="font-mono-tabular text-2xl font-semibold text-[var(--ink-primary)]">
            {active.score}/100
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--ink-primary)]">
          {active.explanation}
        </p>
        <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-[var(--ink-secondary)]">
          {active.dialogue}
        </p>
      </motion.div>
    </div>
  );
}
