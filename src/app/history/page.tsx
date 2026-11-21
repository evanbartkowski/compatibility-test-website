import type { Metadata } from "next";
import { MyResultsClient } from "@/components/results/MyResultsClient";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = {
  title: `Assessment History & Saved Results | ${brandConfig.name}`,
  description:
    "Review completed assessment attempts, explore your intimacy progression over time, and download private reports on SoulFlame. No login required.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://truth-desire.web.app/history",
  },
};

export default function HistoryPage() {
  return (
    <MyResultsClient
      initialSubmissions={[]}
      libraryCount={20}
    />
  );
}
