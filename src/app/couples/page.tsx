import type { Metadata } from "next";
import { OptionalSyncBanner } from "@/components/auth/OptionalSyncBanner";
import { CouplesHubClient } from "@/components/couples/CouplesHubClient";
import { brandConfig } from "@/config/brand";
import { builtInAssessments, getCategoryMeta } from "@/data/assessments/catalog";

export const metadata: Metadata = {
  title: `Couple & Partner Compatibility Test | ${brandConfig.name}`,
  description:
    "Compare shared desires, kink exploration, BDSM dynamics, love languages, and relationship compatibility privately with a partner on SoulFlame.",
  keywords: [
    "couples compatibility test",
    "partner test",
    "SoulFlame couples",
    "relationship test",
    "kink compatibility",
    "love language compare",
  ],
  alternates: {
    canonical: "https://truth-desire.web.app/couples",
  },
  openGraph: {
    title: `Couple & Partner Compatibility Test | ${brandConfig.name}`,
    description:
      "Compare shared desires, kink exploration, BDSM dynamics, love languages, and relationship compatibility privately with a partner on SoulFlame.",
    url: "https://truth-desire.web.app/couples",
    siteName: brandConfig.name,
    images: ["/og-image.png"],
  },
};

export default function CouplesPage() {
  const partnerPriority = builtInAssessments.filter(
    (a) =>
      a.category === "compatibility" ||
      a.slug === "private-fantasy-matcher" ||
      a.slug === "kink-exploration-map" ||
      a.slug === "bdsm-power-dynamics-test" ||
      a.slug === "intimacy-partner-preferences" ||
      a.slug === "love-affection-preferences" ||
      a.slug === "relationship-dealbreakers-boundaries" ||
      a.slug === "desire-frequency-initiation",
  );

  const couplesAssessments = partnerPriority.map((a) => ({
    slug: a.slug,
    title: a.title,
    categoryTitle: getCategoryMeta(a.category)?.title ?? a.category,
    description: a.audienceNote,
    estimatedMinutesComplete: a.estimatedMinutesComplete,
    adultsOnly: Boolean(a.adultsOnly),
    latestSubmissionId: null,
  }));

  return (
    <>
      <div className="site-shell pt-6">
        <OptionalSyncBanner compact />
      </div>
      <CouplesHubClient
        initialInvitations={[]}
        initialReports={[]}
        couplesAssessments={couplesAssessments}
      />
    </>
  );
}
