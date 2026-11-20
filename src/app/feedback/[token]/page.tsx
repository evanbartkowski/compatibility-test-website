import type { Metadata } from "next";
import Link from "next/link";
import { PeerFeedbackClient } from "@/components/feedback/PeerFeedbackClient";
import { brandConfig } from "@/config/brand";
import { getPublicMultiRaterInviteByToken, resolveAssessment } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Anonymous Peer Perspective | ${brandConfig.name}`,
  description: "Share anonymous 360-degree perspective for a trusted person.",
  robots: { index: false, follow: false },
};

export default async function PeerFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pub = getPublicMultiRaterInviteByToken(token);
  const assessment = pub.invite ? resolveAssessment(pub.invite.assessmentSlug) : null;

  if (!pub.invite || !assessment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div
          className="rounded-3xl border p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <h1 className="font-display text-4xl text-[var(--ink-primary)]">
            Feedback Link Unavailable
          </h1>
          <p className="mt-3 text-sm text-[var(--ink-secondary)]">
            {pub.error || "This peer feedback invitation has expired or was revoked."}
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Explore Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PeerFeedbackClient
      token={token}
      ownerDisplayName={pub.invite.ownerDisplayName}
      minRespondents={pub.invite.minRespondents}
      questions={assessment.questions.map((q) => ({
        id: q.id,
        order: q.order,
        sectionTitle: q.sectionTitle,
        prompt: q.observerPrompt || q.partnerPrompt || q.prompt,
        helperText: q.helperText,
      }))}
    />
  );
}
