import type { Metadata } from "next";
import { AccountPrivacyClient } from "@/components/settings/AccountPrivacyClient";
import { brandConfig } from "@/config/brand";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import {
  getUserPrivacyPreferences,
  listInvitationsForSession,
  listSubmissionsForSession,
} from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Account & Privacy Settings | ${brandConfig.name}`,
  description:
    "Manage privacy defaults, opt-in community contribution settings, full JSON export, and permanent deletion.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();
  const prefs =
    sessionKey || uid
      ? getUserPrivacyPreferences(sessionKey, uid)
      : {
          sessionKey: "guest",
          defaultCommunityOptIn: false,
          notifyNewTests: false,
          notifyPartnerReports: false,
          updatedAt: new Date().toISOString(),
        };
  const submissions = sessionKey || uid ? listSubmissionsForSession(sessionKey, uid) : [];
  const invitations = sessionKey || uid ? listInvitationsForSession(sessionKey, uid) : [];

  return (
    <AccountPrivacyClient
      initialPrefs={prefs}
      initialSubmissionCount={submissions.length}
      initialInvitationCount={invitations.length}
    />
  );
}
