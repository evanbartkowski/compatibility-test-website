import type { Metadata } from "next";
import Link from "next/link";
import { PartnerInviteFlow } from "@/components/invite/PartnerInviteFlow";
import { brandConfig } from "@/config/brand";
import { getPublicInvitationByToken, resolveAssessment } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Partner Compatibility Invitation | ${brandConfig.name}`,
  description: "Complete your side of a private partner compatibility assessment.",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { invitation, error } = getPublicInvitationByToken(token);

  if (!invitation) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div
          className="rounded-3xl border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h1 className="font-display text-4xl text-[var(--ink-primary)]">
            Invitation Unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {error || "This private link is invalid, expired, or has been revoked."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const assessment = resolveAssessment(invitation.assessmentSlug);
  if (!assessment) {
    return null;
  }

  return (
    <PartnerInviteFlow
      token={token}
      creatorDisplayName={invitation.creatorDisplayName}
      expiresAt={invitation.expiresAt}
      mode={invitation.mode}
      assessment={assessment}
      existingCompatibilityId={invitation.compatibilityId}
    />
  );
}
