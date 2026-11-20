import { NextRequest, NextResponse } from "next/server";
import { builtInAssessments, getCategoryMeta } from "@/data/assessments/catalog";
import { brandConfig } from "@/config/brand";
import type { CohortFilter } from "@/lib/assessment/community";
import { getGlobalCommunityAggregates, listAllAssessments } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const slug =
    req.nextUrl.searchParams.get("slug") || "intimacy-partner-preferences";
  const includeSyntheticDemo = req.nextUrl.searchParams.get("demo") === "true";

  const ageGroup = (req.nextUrl.searchParams.get("ageGroup") || "all") as CohortFilter["ageGroup"];
  const relationshipStatus = (req.nextUrl.searchParams.get("relationshipStatus") ||
    "all") as CohortFilter["relationshipStatus"];
  const datingPreference = (req.nextUrl.searchParams.get("datingPreference") ||
    "all") as CohortFilter["datingPreference"];

  const data = getGlobalCommunityAggregates({
    assessmentSlug: slug,
    cohortFilter: { ageGroup, relationshipStatus, datingPreference },
    includeSyntheticDemo,
  });

  if (!data) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const all = listAllAssessments();
  const readiness = all.map((a) => {
    const agg = getGlobalCommunityAggregates({
      assessmentSlug: a.slug,
      includeSyntheticDemo: false,
    });
    return {
      slug: a.slug,
      title: a.title,
      category: getCategoryMeta(a.category)?.title ?? a.category,
      realOptedInCount: agg?.realOptedInCount ?? 0,
      minimumThreshold: brandConfig.communityMinimumThreshold,
      unlocked: (agg?.realOptedInCount ?? 0) >= brandConfig.communityMinimumThreshold,
    };
  });

  return NextResponse.json({
    ...data,
    minimumThreshold: brandConfig.communityMinimumThreshold,
    assessmentSlug: slug,
    totalCatalogCount: builtInAssessments.length,
    readiness,
  });
}
