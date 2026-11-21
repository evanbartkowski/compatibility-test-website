import type { Metadata } from "next";
import { CommunityInsightsClient } from "@/components/community/CommunityInsightsClient";

import { brandConfig } from "@/config/brand";
import {
  getGlobalCommunityAggregates,
  getCommunityReadiness,
} from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Community Trends & Desire Statistics | ${brandConfig.name}`,
  description:
    "Explore anonymous, aggregated desire and relationship benchmarks across thousands of SoulFlame test participants.",
  alternates: {
    canonical: "https://truth-desire.web.app/community",
  },
};

export default function CommunityPage() {
  const slug = "intimacy-partner-preferences";
  const initial = getGlobalCommunityAggregates({
    assessmentSlug: slug,
    mode: "complete",
    includeSyntheticDemo: false,
  });

  const readiness = getCommunityReadiness("complete");

  return (
    <CommunityInsightsClient
      initialData={{
        assessmentSlug: slug,
        eligibleCohortParticipants: initial?.eligibleCohortParticipants ?? 0,
        suppressedByPrivacyThreshold:
          initial?.suppressedByPrivacyThreshold ?? true,
        minimumThreshold: brandConfig.communityMinimumThreshold,
        realOptedInCount: initial?.realOptedInCount ?? 0,
        isSyntheticDemo: false,
        questions: initial?.questions ?? [],
        readiness,
      }}
    />
  );
}
