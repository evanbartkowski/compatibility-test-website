import type { Metadata } from "next";
import { CompareClient } from "@/components/compare/CompareClient";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = {
  title: `Compare Profiles & Relationship Compatibility | ${brandConfig.name}`,
  description:
    "Compare past test attempts, measure erotic synergy with a partner, or simulate compatibility with archetypes. 100% private, no login required.",
  keywords: [
    "compatibility test",
    "compare tests",
    "partner compare",
    "kink compatibility compare",
    "love language comparison",
    "SoulFlame compare",
  ],
  alternates: {
    canonical: "https://truth-desire.web.app/compare",
  },
  openGraph: {
    title: `Compare Profiles & Relationship Compatibility | ${brandConfig.name}`,
    description:
      "Compare past test attempts, measure erotic synergy with a partner, or simulate compatibility with archetypes. 100% private, no login required.",
    url: "https://truth-desire.web.app/compare",
    siteName: brandConfig.name,
    images: ["/og-image.png"],
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
