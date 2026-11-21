import type { Metadata } from "next";
import { ExploreCatalogClient } from "@/components/explore/ExploreCatalogClient";
import { brandConfig } from "@/config/brand";
import { builtInAssessments } from "@/data/assessments/catalog";
import { listPublishedAssessments } from "@/lib/server/store";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

export const metadata: Metadata = {
  title: `Explore All ${builtInAssessments.length} Assessments | ${brandConfig.name}`,
  description: `Explore ${builtInAssessments.length} personality, connection, intimacy and compatibility assessments with short teasers, deep dives, five- and seven-point scales and private category reports.`,
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
