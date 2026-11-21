import type { Metadata } from "next";
import { MyResultsClient } from "@/components/results/MyResultsClient";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = {
  title: `My Results & Archives | ${brandConfig.name}`,
  description:
    "Review, compare, download PDF/CSV/JSON exports, or delete completed assessment results.",
  robots: { index: false, follow: false },
};

export default function MyResultsIndexPage() {
  return (
    <MyResultsClient
      initialSubmissions={[]}
      libraryCount={20}
    />
  );
}
