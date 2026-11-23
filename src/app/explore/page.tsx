import type { Metadata } from "next";
import { ExploreCatalogClient } from "@/components/explore/ExploreCatalogClient";
import { brandConfig } from "@/config/brand";
import { listPublishedAssessments } from "@/lib/server/store";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

export const metadata: Metadata = {
  title: "Explore Viral Tests | SoulFlame",
  description:
    "Take the viral BDSM test, The Freak Test (kinks), sex toy test, partner compatibility test, IQ test, friendship test, love language test, the racism/homophobia test, the delusional standards test, and deep assessments on SoulFlame.",
  keywords: [
    "SoulFlame tests",
    "BDSM test",
    "The Freak Test (kinks)",
    "the freak test",
    "the sex toy test",
    "partner compatibility test",
    "would you rather (spicy) test",
    "IQ test",
    "friendship test",
    "love language test",
    "the racism/homophobia test",
    "the delusional standards test",
    "delusional standards test",
    "husband wife test",
    "icks test",
    "compatibility test",
    "relationship quiz",
  ],
  alternates: {
    canonical: "https://truth-desire.web.app/explore",
  },
  openGraph: {
    title: "Explore Viral Tests | SoulFlame",
    description:
      "Take the viral BDSM test, The Freak Test (kinks), sex toy test, partner compatibility test, IQ test, friendship test, and relationship assessments on SoulFlame.",
    url: "https://truth-desire.web.app/explore",
    siteName: brandConfig.name,
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Viral Tests | SoulFlame",
    description:
      "Take the viral BDSM test, The Freak Test (kinks), sex toy test, partner compatibility test, IQ test, friendship test, and relationship assessments on SoulFlame.",
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
