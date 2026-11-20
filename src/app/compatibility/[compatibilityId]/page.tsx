import type { Metadata } from "next";
import Link from "next/link";
import { CompatibilityDashboard } from "@/components/compatibility/CompatibilityDashboard";
import { brandConfig } from "@/config/brand";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { canAccessCompatibility, getCompatibilityReport } from "@/lib/server/store";

export const metadata: Metadata = {
  title: `Compatibility Report | ${brandConfig.name}`,
  description: "Private two-person compatibility and mutual discovery report.",
  robots: { index: false, follow: false },
};

export default async function CompatibilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ compatibilityId: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { compatibilityId } = await params;
  const { access } = await searchParams;
  const sessionKey = await getReadOnlySessionKey();
  const uid = await getReadOnlyVerifiedUid();

  const authorized = canAccessCompatibility({
    compatibilityId,
    sessionKey,
    uid,
    accessToken: access,
  });
  const report = authorized ? getCompatibilityReport(compatibilityId) : null;

  if (!report) {
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
            Report Unavailable or Protected
          </h1>
          <p className="mt-3 text-sm text-[var(--ink-secondary)]">
            This compatibility report is private to the two participating partners, has expired, or
            shared access was revoked.
          </p>
          <Link
            href="/couples"
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Go to Couples Hub
          </Link>
        </div>
      </div>
    );
  }

  return <CompatibilityDashboard report={report} />;
}
