import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { consolidatedSlugRedirects } from "@/data/assessments/curated";
import { brandConfig } from "@/config/brand";
import { resolveAssessment } from "@/lib/server/store";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import type { AssessmentMode } from "@/lib/assessment/types";
import { builtInAssessments } from "@/data/assessments/catalog";

export const dynamic = "force-static";

export function generateStaticParams() {
  return builtInAssessments.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = resolveAssessment(slug);
  if (!assessment || assessment.status !== "published") {
    return { title: `Assessment Not Found | ${brandConfig.name}` };
  }
  return {
    title: `${assessment.title} | ${brandConfig.name}`,
    description: assessment.audienceNote,
  };
}

export default async function AssessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = resolveAssessment(slug);
  if (!assessment && Object.hasOwn(consolidatedSlugRedirects, slug)) {
    redirect(`/assess/${consolidatedSlugRedirects[slug]}`);
  }

  if (
    !assessment ||
    assessment.status !== "published" ||
    assessment.questions.length === 0
  ) {
    notFound();
  }

  const initialMode: AssessmentMode =
    assessment.supportsQuickMode === false ? "complete" : "quick";
  const previous =
    assessment.version === "4.0.0"
      ? resolveAssessment(assessment.slug, "3.0.0")
      : undefined;

  return (
    <AssessmentRunner
      assessment={assessment}
      previousDraftVersion={
        previous
          ? {
              version: previous.version,
              quickIds: previous.questions
                .filter((q) => q.quickDiscovery)
                .map((q) => q.id),
              completeIds: previous.questions.map((q) => q.id),
            }
          : undefined
      }
      initialMode={initialMode}
      initialCommunityOptIn={false}
    />
  );
}
