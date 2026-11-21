import type { Metadata } from "next";
import { ExploreCatalogClient } from "@/components/explore/ExploreCatalogClient";
import { brandConfig } from "@/config/brand";
import { listPublishedAssessments } from "@/lib/server/store";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

export const metadata: Metadata = {
  title: "Explore All 40 Viral Tests | SoulFlame",
  description:
    "Take the viral BDSM test, kink test, love compatibility test, IQ test, friendship test, love language test, sexual desire test, and 40 deep assessments on SoulFlame.",
  keywords: [
    "SoulFlame tests",
    "BDSM test",
    "the kink test",
    "love compatibility test",
    "IQ test",
    "friendship test",
    "love language test",
    "sexual desire test",
    "husband wife test",
    "partner finding test",
    "icks test",
    "compatibility test",
    "relationship quiz",
  ],
  alternates: {
    canonical: "https://truth-desire.web.app/explore",
  },
  openGraph: {
    title: "Explore All 40 Viral Tests | SoulFlame",
    description:
      "Take the viral BDSM test, kink test, love compatibility test, IQ test, friendship test, and 40 relationship assessments on SoulFlame.",
    url: "https://truth-desire.web.app/explore",
    siteName: brandConfig.name,
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore All 40 Viral Tests | SoulFlame",
    description:
      "Take the viral BDSM test, kink test, love compatibility test, IQ test, friendship test, and 40 relationship assessments on SoulFlame.",
    images: ["/og-image.png"],
  },
};

export default function ExplorePage() {
  return (
    <ExploreCatalogClient
      initialAssessments={listPublishedAssessments()
        .filter((a) => a.status === "published")
        .map(summarizeAssessment)}
    />
  );
}
