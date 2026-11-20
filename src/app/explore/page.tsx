import type { Metadata } from "next";
import { ExploreCatalogClient } from "@/components/explore/ExploreCatalogClient";
import { brandConfig } from "@/config/brand";
import { builtInAssessments } from "@/data/assessments/catalog";

export const metadata: Metadata = {
  title: `Explore All ${builtInAssessments.length} Assessments | ${brandConfig.name}`,
  description: `Browse ${builtInAssessments.length} research-informed personality, romance, intimacy, BDSM, kink, and couples compatibility assessments with visual results.`,
};

export default function ExplorePage() {
  return <ExploreCatalogClient />;
}
