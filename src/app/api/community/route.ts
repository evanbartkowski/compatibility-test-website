import { NextRequest, NextResponse } from "next/server";
import { builtInAssessments } from "@/data/assessments/catalog";
import { brandConfig } from "@/config/brand";
import type { CohortFilter } from "@/lib/assessment/community";
import {
  getGlobalCommunityAggregates,
  getCommunityReadiness,
} from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const slug =
    req.nextUrl.searchParams.get("slug") || "intimacy-partner-preferences";
  const includeSyntheticDemo = req.nextUrl.searchParams.get("demo") === "true";

  const ageGroup = (req.nextUrl.searchParams.get("ageGroup") ||
    "all") as CohortFilter["ageGroup"];
  const relationshipStatus = (req.nextUrl.searchParams.get(
    "relationshipStatus",
  ) || "all") as CohortFilter["relationshipStatus"];
  const datingPreference = (req.nextUrl.searchParams.get("datingPreference") ||
    "all") as CohortFilter["datingPreference"];

  const mode =
    req.nextUrl.searchParams.get("mode") === "quick" ? "quick" : "complete";
  const data = getGlobalCommunityAggregates({
    mode,
    assessmentSlug: slug,
    cohortFilter: { ageGroup, relationshipStatus, datingPreference },
    includeSyntheticDemo,
  });

  if (!data) {
    return NextResponse.json(
      { error: "Assessment not found." },
      { status: 404 },
    );
  }

  const readiness = getCommunityReadiness(mode);

  return NextResponse.json({
    ...data,
    mode,
    minimumThreshold: brandConfig.communityMinimumThreshold,
    assessmentSlug: slug,
    totalCatalogCount: builtInAssessments.length,
    readiness,
  });
}
