import type { Metadata } from "next";
import { OptionalSyncBanner } from "@/components/auth/OptionalSyncBanner";
import { CouplesHubClient } from "@/components/couples/CouplesHubClient";
import { brandConfig } from "@/config/brand";
import { builtInAssessments, getCategoryMeta } from "@/data/assessments/catalog";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import {
  getCompatibilityReport,
  listInvitationsForSession,
  listSubmissionsForSession,
} from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Couples & Partner Space | ${brandConfig.name}`,
  description:
    "Compare shared fantasies, kink exploration, BDSM power dynamics, bucket lists, and compatibility reports privately with a partner.",
};

export default async function CouplesPage() {
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();
  const invitations = sessionKey || uid ? listInvitationsForSession(sessionKey, uid) : [];
  const submissions = sessionKey || uid ? listSubmissionsForSession(sessionKey, uid) : [];

  const reports = invitations
    .filter((i) => i.status === "completed" && i.compatibilityId)
    .map((i) => getCompatibilityReport(i.compatibilityId!))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      compatibilityId: r.compatibilityId,
      inviteId: r.inviteId,
      assessmentSlug: r.assessmentSlug,
      assessmentTitle: r.assessmentTitle ?? r.assessmentSlug,
      overallScore: r.overallScore,
      label: r.label,
      createdAt: r.createdAt,
      bothAnsweredCount: r.bothAnsweredCount,
      totalEligibleCount: r.totalEligibleCount,
    }));

  const latestBySlug = new Map<string, string>();
  for (const s of submissions) {
    if (!latestBySlug.has(s.assessmentSlug)) {
      latestBySlug.set(s.assessmentSlug, s.submissionId);
    }
  }

  const partnerPriority = builtInAssessments.filter(
    (a) =>
      a.category === "compatibility" ||
      a.slug === "erotic-blueprint-style" ||
      a.slug === "partner-ideal-dealbreakers" ||
      a.slug === "desire-reality-map" ||
      a.slug === "aftercare-recovery-style" ||
      a.slug === "love-affection-preferences" ||
      a.slug === "relationship-dealbreakers-boundaries"
  );

  const couplesAssessments = partnerPriority.map((a) => ({
    slug: a.slug,
    title: a.title,
    categoryTitle: getCategoryMeta(a.category)?.title ?? a.category,
    description: a.audienceNote,
    estimatedMinutesQuick: a.estimatedMinutesQuick,
    adultsOnly: Boolean(a.adultsOnly),
    latestSubmissionId: latestBySlug.get(a.slug) ?? null,
  }));

  return (
    <>
      <div className="site-shell pt-6">
        <OptionalSyncBanner compact />
      </div>
      <CouplesHubClient
        initialInvitations={invitations}
        initialReports={reports}
        couplesAssessments={couplesAssessments}
      />
    </>
  );
}
