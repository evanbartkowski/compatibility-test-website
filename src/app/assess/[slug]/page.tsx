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
  const canonicalUrl = `https://truth-desire.web.app/assess/${assessment.slug}`;
  const title = `${assessment.title} | ${brandConfig.name}`;
  const description = `${assessment.marketingBlurb || assessment.audienceNote} Take the free, candid ${assessment.title} on ${brandConfig.name}.`;
  return {
    title,
    description,
    keywords: [
      assessment.title,
      assessment.shortTitle,
      "SoulFlame test",
      "soulflame quiz",
      "viral quiz",
      "compatibility test",
      "relationship assessment",
      assessment.category,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brandConfig.name,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${assessment.title} - ${brandConfig.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
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
