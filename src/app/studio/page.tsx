import type { Metadata } from "next";
import { AdminConsoleClient } from "@/components/admin/AdminConsoleClient";
import { brandConfig } from "@/config/brand";
import { isAdminKeyConfigured, isAdminRequest } from "@/lib/server/admin-auth";

export const metadata: Metadata = {
  title: `Assessment Studio & Reference Audit | ${brandConfig.name}`,
  description: "Protected internal workspace for authoring assessments and reviewing obscured chart references.",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  const authenticated = await isAdminRequest();
  const keyConfigured = isAdminKeyConfigured();
  const devFallbackActive =
    process.env.NODE_ENV !== "production" && !process.env.BETWEEN_US_ADMIN_KEY;

  return (
    <AdminConsoleClient
      initialAuthenticated={authenticated}
      keyConfigured={keyConfigured}
      devFallbackActive={devFallbackActive}
      heading="Assessment Studio & Reference Audit"
      defaultTab="builder"
    />
  );
}
