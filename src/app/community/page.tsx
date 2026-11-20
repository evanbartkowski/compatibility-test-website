import type { Metadata } from "next";
import { CommunityInsightsClient } from "@/components/community/CommunityInsightsClient";
import { builtInAssessments, getCategoryMeta } from "@/data/assessments/catalog";
import { brandConfig } from "@/config/brand";
import { getGlobalCommunityAggregates } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Community Insights & Statistics | ${brandConfig.name}`,
  description:
    "Explore anonymous, aggregated relationship and intimacy trends strictly protected behind an n>=50 threshold.",
};

export default function CommunityPage() {
  const slug = "intimacy-partner-preferences";
  const initial = getGlobalCommunityAggregates({
    assessmentSlug: slug,
    includeSyntheticDemo: false,
  });

  const readiness = builtInAssessments.map((a) => {
    const agg = getGlobalCommunityAggregates({
      assessmentSlug: a.slug,
      includeSyntheticDemo: false,
    });
    return {
      slug: a.slug,
      title: a.title,
      category: getCategoryMeta(a.category)?.title ?? a.category,
      realOptedInCount: agg?.realOptedInCount ?? 0,
      minimumThreshold: brandConfig.communityMinimumThreshold,
      unlocked: (agg?.realOptedInCount ?? 0) >= brandConfig.communityMinimumThreshold,
    };
  });

  return (
    <CommunityInsightsClient
      initialData={{
        assessmentSlug: slug,
        eligibleCohortParticipants: initial?.eligibleCohortParticipants ?? 0,
        suppressedByPrivacyThreshold: initial?.suppressedByPrivacyThreshold ?? true,
        minimumThreshold: brandConfig.communityMinimumThreshold,
        realOptedInCount: initial?.realOptedInCount ?? 0,
        isSyntheticDemo: false,
        questions: initial?.questions ?? [],
        readiness,
      }}
    />
  );
}
