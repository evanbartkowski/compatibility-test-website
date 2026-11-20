import { NextResponse } from "next/server";
import { listAllAssessments } from "@/lib/server/store";

export async function GET() {
  const published = listAllAssessments()
    .filter((a) => a.status === "published" && a.questions.length > 0)
    .map((a) => ({
      ...a,
      // Omit exhaustive question objects for light catalog listing if desired,
      // or include question count cleanly while keeping catalog compatible.
      questionCount: a.questions.length,
    }));

  return NextResponse.json({
    total: published.length,
    assessments: published,
  });
}
