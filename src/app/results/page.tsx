import { listPublishedAssessments } from "@/lib/server/store";
import type { Metadata } from "next";
import { MyResultsClient } from "@/components/results/MyResultsClient";
import { brandConfig } from "@/config/brand";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { listSubmissionsForSession } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `My Results & Archives | ${brandConfig.name}`,
  description:
    "Review, compare, download PDF/CSV/JSON exports, or delete completed assessment results.",
  robots: { index: false, follow: false },
};

export default async function MyResultsIndexPage() {
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();
  const submissions =
    sessionKey || uid
      ? listSubmissionsForSession(sessionKey, uid).map((s) => ({
          submissionId: s.submissionId,
          assessmentSlug: s.assessmentSlug,
          assessmentVersion: s.assessmentVersion,
          mode: s.mode,
          perspective: s.perspective,
          optInCommunityStats: s.consent.optInCommunityStats,
          createdAt: s.createdAt,
          result: s.result,
        }))
      : [];

  return (
    <MyResultsClient
      initialSubmissions={submissions}
      libraryCount={
        listPublishedAssessments().filter((a) => a.status === "published").length
      }
    />
  );
}
