import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandConfig } from "@/config/brand";
import { resolveAssessment } from "@/lib/server/store";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import type { AssessmentMode } from "@/lib/assessment/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = resolveAssessment(slug);
  if (!assessment) {
    return { title: `Assessment Not Found | ${brandConfig.name}` };
  }
  return {
    title: `${assessment.title} | ${brandConfig.name}`,
    description: assessment.audienceNote,
  };
}

export default async function AssessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const assessment = resolveAssessment(slug);

  if (!assessment || assessment.questions.length === 0) {
    notFound();
  }

  const initialMode: AssessmentMode = mode === "complete" ? "complete" : "quick";

  return <AssessmentRunner assessment={assessment} initialMode={initialMode} />;
}
