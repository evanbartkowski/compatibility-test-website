import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import {
  listSubmissionsForSession,
  listSharedProfiles,
  listPublishedAssessments,
} from "@/lib/server/store";
export const metadata: Metadata = {
  title: "My discovery profile",
  description:
    "Your measured personality and relationship profiles, private history, and sharing choices.",
  robots: { index: false, follow: false },
};
export default async function ProfilePage() {
  const session = await getReadOnlySessionKey(),
    uid = await getReadOnlyVerifiedUid();
  const submissions = (
    session || uid ? listSubmissionsForSession(session, uid) : []
  ).map((s) => ({
    submissionId: s.submissionId,
    assessmentSlug: s.assessmentSlug,
    createdAt: s.createdAt,
    result: s.result,
  }));
  const currentLibrary = listPublishedAssessments()
    .filter((a) => a.status === "published")
    .map((a) => ({ slug: a.slug, version: a.version }));
  return (
    <ProfileDashboard
      submissions={submissions}
      initialShares={listSharedProfiles(session, uid)}
      libraryCount={currentLibrary.length}
      currentLibrary={currentLibrary}
    />
  );
}
