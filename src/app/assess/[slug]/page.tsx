import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { consolidatedSlugRedirects } from "@/data/assessments/curated";
import { focusedRedirects } from "@/data/assessments/catalog";
import { brandConfig } from "@/config/brand";
import {
  resolveAssessment,
  getUserPrivacyPreferences,
} from "@/lib/server/store";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import type { AssessmentMode } from "@/lib/assessment/types";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const assessment = resolveAssessment(slug);
  const redirects = { ...consolidatedSlugRedirects, ...focusedRedirects };
  if (!assessment && Object.hasOwn(redirects, slug)) {
    const target = focusedRedirects[redirects[slug]] || redirects[slug];
    redirect(
      `/assess/${target}?mode=${mode === "complete" ? "complete" : "quick"}`,
    );
  }

  if (
    !assessment ||
    assessment.status !== "published" ||
    assessment.questions.length === 0
  ) {
    notFound();
  }

  const initialMode: AssessmentMode =
    mode === "complete" ? "complete" : "quick";
  const previous =
    assessment.version === "4.0.0"
      ? resolveAssessment(assessment.slug, "3.0.0")
      : undefined;

  const prefs = getUserPrivacyPreferences(
    await getReadOnlySessionKey(),
    await getReadOnlyVerifiedUid(),
  );
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
      initialCommunityOptIn={prefs.defaultCommunityOptIn}
    />
  );
}
