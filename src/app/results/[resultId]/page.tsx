import type { Metadata } from "next";
import Link from "next/link";
import { OptionalSyncBanner } from "@/components/auth/OptionalSyncBanner";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { brandConfig } from "@/config/brand";
import { areHistoryResultsComparable } from "@/lib/assessment/definition";
import {
  builtInAssessments,
  getCategoryMeta,
} from "@/data/assessments/catalog";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import {
  canAccessResult,
  getCommunityComparisonForResult,
  getMultiRaterSummaryForSubmission,
  getSubmissionResult,
  resolveAssessment,
} from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Personal Results | ${brandConfig.name}`,
  description:
    "Private individual assessment insights and comparison dashboard.",
  robots: { index: false, follow: false },
};

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ resultId: string }>;
  searchParams: Promise<{ access?: string; compare?: string }>;
}) {
  const { resultId } = await params;
  const { access, compare } = await searchParams;
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();

  const authorized = canAccessResult({
    resultId,
    sessionKey,
    uid,
    accessToken: access,
  });

  if (!authorized) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div
          className="rounded-3xl border p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h1 className="font-display text-4xl text-[var(--ink-primary)]">
            Private Result Protected
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            Personal assessment results are only visible inside the browser
            session that created them, or via an explicit expiring private
            access link.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/results"
              className="inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: "var(--accent-plum)",
                color: "var(--accent-plum-contrast)",
              }}
            >
              View My Results
            </Link>
            <Link
              href="/explore"
              className="inline-flex rounded-full border px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)]"
            >
              Explore Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sub = getSubmissionResult(resultId);
  const community = getCommunityComparisonForResult({
    resultId,
    includeSyntheticDemo: false,
  });

  if (!sub || !community) {
    return null;
  }

  const assessment = resolveAssessment(sub.result.assessmentSlug);
  const categoryMeta = assessment
    ? getCategoryMeta(assessment.category)
    : undefined;

  let previousResult = null;
  if (
    compare &&
    compare !== resultId &&
    canAccessResult({ resultId: compare, sessionKey, uid, accessToken: access })
  ) {
    const prevSub = getSubmissionResult(compare);
    if (prevSub && areHistoryResultsComparable(prevSub.result, sub.result)) {
      previousResult = prevSub.result;
    }
  }

  const nextSlugs =
    assessment?.recommendedNextSlugs &&
    assessment.recommendedNextSlugs.length > 0
      ? assessment.recommendedNextSlugs
      : builtInAssessments
          .filter(
            (a) =>
              a.slug !== sub.result.assessmentSlug &&
              a.category === assessment?.category,
          )
          .slice(0, 3)
          .map((a) => a.slug);

  const recommendedAssessments = nextSlugs
    .map((slug) => resolveAssessment(slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      shortTitle: a.shortTitle,
      category: getCategoryMeta(a.category)?.title || a.category,
      estimatedMinutesQuick: a.estimatedMinutesQuick,
      adultsOnly: Boolean(a.adultsOnly),
    }));

  const initialMultiRaterSummary =
    assessment?.supportsMultiRater && (sessionKey || uid)
      ? getMultiRaterSummaryForSubmission({
          submissionId: sub.submissionId,
          sessionKey,
          uid,
        })
      : null;

  return (
    <>
      <div className="site-shell pt-6">
        <OptionalSyncBanner compact />
      </div>
      <ResultsDashboard
        initialResult={sub.result}
        initialOptIn={sub.consent.optInCommunityStats}
        initialCommunity={community}
        assessmentMeta={{
          title:
            assessment?.title ??
            sub.result.assessmentTitle ??
            sub.result.assessmentSlug,
          categoryTitle: categoryMeta?.title ?? "Self-Discovery",
          accentVar: categoryMeta?.accentVar ?? "var(--accent-plum)",
          supportsPartnerMatching: assessment?.supportsPartnerMatching ?? true,
          supportsCommunityComparison:
            assessment?.supportsCommunityComparison ?? true,
          supportsMultiRater: Boolean(assessment?.supportsMultiRater),
          visualizationTypes: assessment?.visualizationTypes ?? [],
          scientificDisclaimer: assessment?.scientificDisclaimer,
        }}
        previousResult={previousResult}
        recommendedAssessments={recommendedAssessments}
        initialMultiRaterSummary={initialMultiRaterSummary}
      />
    </>
  );
}
