import type { Metadata } from "next";
import { CommunityInsightsClient } from "@/components/community/CommunityInsightsClient";

import { brandConfig } from "@/config/brand";
import {
  getGlobalCommunityAggregates,
  getCommunityReadiness,
} from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Community Insights & Statistics | ${brandConfig.name}`,
  description:
    "Explore anonymous, aggregated relationship and intimacy trends strictly protected behind an n>=50 threshold.",
};

export default function CommunityPage() {
  const slug = "big-five-personality-profile";
  const initial = getGlobalCommunityAggregates({
    assessmentSlug: slug,
    includeSyntheticDemo: false,
  });

  const readiness = getCommunityReadiness();

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
