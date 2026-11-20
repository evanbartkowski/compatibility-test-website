import type { Metadata } from "next";
import React from "react";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = {
  title: `Personal Dashboard | ${brandConfig.name}`,
  description: "Private session assessment history and partner invitation controls.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
