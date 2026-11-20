import type { Metadata } from "next";
import { AdminConsoleClient } from "@/components/admin/AdminConsoleClient";
import { brandConfig } from "@/config/brand";
import { isAdminKeyConfigured, isAdminRequest } from "@/lib/server/admin-auth";

export const metadata: Metadata = {
  title: `Admin Console | ${brandConfig.name}`,
  description: "Protected administration dashboard for assessments, scoring simulations, and telemetry.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await isAdminRequest();
  const keyConfigured = isAdminKeyConfigured();
  const devFallbackActive =
    process.env.NODE_ENV !== "production" && !process.env.BETWEEN_US_ADMIN_KEY;

  return (
    <AdminConsoleClient
      initialAuthenticated={authenticated}
      keyConfigured={keyConfigured}
      devFallbackActive={devFallbackActive}
      heading="Admin & Scoring Console"
      defaultTab="telemetry"
    />
  );
}
