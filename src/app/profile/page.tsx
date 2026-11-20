import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Flame, Lock, Sparkles } from "lucide-react";
import { OptionalSyncBanner } from "@/components/auth/OptionalSyncBanner";
import { brandConfig } from "@/config/brand";
import { aggregateDiscoveryProfile } from "@/lib/assessment/profile-aggregator";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { listInvitationsForSession, listSubmissionsForSession } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `My Discovery Profile | ${brandConfig.name}`,
  description:
    "Unified 12-domain cross-assessment profile uniting your personality, romance, intimacy, and compatibility results.",
  robots: { index: false, follow: false },
};

export default async function MyProfilePage() {
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();
  const submissions = sessionKey || uid ? listSubmissionsForSession(sessionKey, uid) : [];
  const invitations = sessionKey || uid ? listInvitationsForSession(sessionKey, uid) : [];
  const profile = aggregateDiscoveryProfile(submissions);

  const ringRadius = 42;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset =
    circumference - (profile.completenessPercent / 100) * circumference;

  const activeCompatibilities = invitations.filter((i) => Boolean(i.compatibilityId));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <OptionalSyncBanner />
      {/* Header & Completeness Ring */}
      <section
        className="grid gap-8 rounded-3xl border p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="flex items-center gap-6 lg:col-span-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r={ringRadius}
                fill="none"
                stroke="var(--bg-inset)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={ringRadius}
                fill="none"
                stroke="var(--accent-plum)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono-tabular text-2xl font-semibold text-[var(--ink-primary)]">
                {profile.completenessPercent}%
              </span>
              <span className="text-[10px] text-[var(--ink-muted)]">explored</span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl text-[var(--ink-primary)] sm:text-4xl">
              Your Discovery Profile
            </h1>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
              <strong className="font-mono-tabular text-[var(--ink-primary)]">
                {profile.completedUniqueCount}
              </strong>{" "}
              of {profile.totalAssessmentsInPlatform} unique assessments completed ·{" "}
              <strong className="font-mono-tabular text-[var(--ink-primary)]">
                {activeCompatibilities.length}
              </strong>{" "}
              couple report{activeCompatibilities.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-7">
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            Every completed quiz fills in your profile without guessing blank domains. Finish two or
            more tests to connect patterns across personality, romance, and desire.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              Explore Next Assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              Manage Saved Results ({submissions.length})
            </Link>
          </div>
        </div>
      </section>

      {/* Traceable Cross-Test Insights */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--accent-gold)]" />
          <h2 className="font-display text-3xl text-[var(--ink-primary)]">
            Traceable Cross-Test Insights
          </h2>
        </div>

        {profile.crossTestInsights.length === 0 ? (
          <div
            className="mt-4 rounded-3xl border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-plum)]" />
              <div>
                <p className="text-sm font-medium text-[var(--ink-primary)]">
                  Complete at least 2 distinct assessments to unlock cross-test synthesis
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  We never extrapolate or fabricate cross-domain claims from a single quiz. Pair an
                  assessment like Intimacy &amp; Partner Preferences with Attachment Style Discovery or
                  Big Five Personality Profile to see how your dimensions connect.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {profile.crossTestInsights.map((ins, i) => (
              <div
                key={i}
                className="rounded-3xl border p-6"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <h3 className="font-display text-2xl text-[var(--ink-primary)]">{ins.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {ins.detail}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ins.sources.map((src) => (
                    <span
                      key={src}
                      className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink-primary)]"
                    >
                      Source: {src}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* What You Are Into Digest across completed assessments */}
      {profile.whatYouAreIntoDigest && (
        <section
          className="mt-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <div className="flex flex-col justify-between gap-3 border-b pb-5 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-plum)]">
                <Flame className="h-4 w-4" />
                Live Profile Digest
              </div>
              <h2 className="mt-1 font-display text-3xl text-[var(--ink-primary)]">
                What You Are Into Across Tests
              </h2>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                Pulled strictly from your completed tests. Click any item to open its full breakdown.
              </p>
            </div>
          </div>

          {profile.whatYouAreIntoDigest.roleLeans.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {profile.whatYouAreIntoDigest.roleLeans.map((role) => (
                <Link
                  key={`${role.resultId}-${role.label}`}
                  href={`/results/${role.resultId}`}
                  className="rounded-2xl border p-4 transition-colors hover:border-[var(--accent-plum)]"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-plum) 10%, var(--bg-subtle))",
                    borderColor: "var(--accent-plum)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold uppercase tracking-wide text-[var(--accent-plum)]">
                      {role.label}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      {role.assessmentTitle}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-primary)]">
                    {role.detail}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(
              [
                {
                  title: "Top Turn Ons",
                  items: profile.whatYouAreIntoDigest.topTurnOns,
                  empty: "Rate items 4 or 5 on any desire or kink test to list your strongest turn ons.",
                  isLimit: false,
                },
                {
                  title: "Want More Of",
                  items: profile.whatYouAreIntoDigest.wantMoreOf,
                  empty: "Flag acts you enjoy and want more often to surface them here.",
                  isLimit: false,
                },
                {
                  title: "Curious To Try",
                  items: profile.whatYouAreIntoDigest.curiousExplorations,
                  empty: "Mark ideas as curious or interested on exploration quizzes to build this list.",
                  isLimit: false,
                },
                {
                  title: "Protected Limits",
                  items: profile.whatYouAreIntoDigest.firmLimits,
                  empty: "Any firm boundary or hard limit you mark appears privately here.",
                  isLimit: true,
                },
              ] as const
            ).map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: group.isLimit ? "var(--accent-rose)" : "var(--border-hairline)",
                }}
              >
                <div className="flex items-baseline justify-between border-b pb-2.5">
                  <h3 className="font-display text-2xl text-[var(--ink-primary)]">{group.title}</h3>
                  <span className="font-mono-tabular text-xs text-[var(--ink-muted)]">
                    {group.items.length}
                  </span>
                </div>
                {group.items.length === 0 ? (
                  <p className="mt-3 text-xs text-[var(--ink-muted)]">{group.empty}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li key={`${group.title}-${item.resultId}-${item.questionId}`}>
                        <Link
                          href={`/results/${item.resultId}`}
                          className="block rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs transition-colors hover:border-[var(--accent-plum)]"
                          style={{ borderColor: "var(--border-hairline)" }}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-medium text-[var(--ink-primary)]">
                              {item.shortLabel}
                            </span>
                            <span
                              className="shrink-0 font-semibold"
                              style={{
                                color: group.isLimit
                                  ? "var(--accent-rose)"
                                  : "var(--accent-plum)",
                              }}
                            >
                              {item.answerLabel}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
                            <span>{item.assessmentTitle}</span>
                            {item.linkedDimension && <span>{item.linkedDimension}</span>}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12 Discovery Domains Grid */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              12 Relationship &amp; Personality Domains
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              Unvisited domains remain blank until you complete a matching assessment.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.domains.map((dom) => {
            const hasData = dom.averageScore !== null;
            return (
              <div
                key={dom.domainKey}
                className="flex flex-col justify-between rounded-2xl border p-5"
                style={{
                  backgroundColor: hasData ? "var(--bg-elevated)" : "var(--bg-subtle)",
                  borderColor: hasData ? "var(--border-strong)" : "var(--border-hairline)",
                }}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl text-[var(--ink-primary)]">
                      {dom.title}
                    </h3>
                    <span
                      className="font-mono-tabular text-sm font-semibold"
                      style={{ color: hasData ? "var(--accent-plum)" : "var(--ink-muted)" }}
                    >
                      {hasData ? `${dom.averageScore}/100` : "--"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {dom.description}
                  </p>

                  {dom.contributors.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {dom.contributors.map((c) => (
                        <Link
                          key={c.resultId}
                          href={`/results/${c.resultId}`}
                          className="flex items-center justify-between rounded-xl border bg-[var(--bg-canvas)] px-3 py-2 text-xs hover:border-[var(--accent-plum)]"
                        >
                          <span className="truncate font-medium text-[var(--ink-primary)]">
                            {c.assessmentTitle}
                          </span>
                          <span className="ml-2 shrink-0 font-mono-tabular text-[var(--accent-plum)]">
                            {c.topDimensionScore}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {dom.contributors.length === 0 && dom.targetSlugs[0] && (
                  <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border-hairline)" }}>
                    <Link
                      href={`/assess/${dom.targetSlugs[0]}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-plum)] hover:underline"
                    >
                      Unlock this domain <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Next Assessments */}
      {profile.recommendedNext.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[var(--accent-sage)]" />
            <h2 className="font-display text-3xl text-[var(--ink-primary)]">
              Recommended Next For Your Profile
            </h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {profile.recommendedNext.map((rec) => (
              <Link
                key={rec.slug}
                href={`/assess/${rec.slug}`}
                className="group rounded-2xl border p-5 transition-colors hover:border-[var(--accent-plum)]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
                  <span>{rec.categoryTitle}</span>
                  <span className="font-mono-tabular">~{rec.estimatedMinutesQuick} min quick</span>
                </div>
                <p className="mt-2 font-display text-2xl text-[var(--ink-primary)] group-hover:text-[var(--accent-plum)]">
                  {rec.title}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-secondary)]">{rec.reason}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
