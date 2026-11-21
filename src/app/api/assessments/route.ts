import { NextResponse } from "next/server";
import { listPublishedAssessments } from "@/lib/server/store";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

export async function GET() {
  const published = listPublishedAssessments()
    .filter((a) => a.status === "published" && a.questions.length > 0)
    .map(summarizeAssessment);

  return NextResponse.json({
    total: published.length,
    assessments: published,
  });
}
