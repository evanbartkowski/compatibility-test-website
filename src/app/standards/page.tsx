import type { Metadata } from "next";
import { StandardsCalculator } from "@/components/standards/StandardsCalculator";

export const metadata: Metadata = {
  title: "The Delusional Standards Test",
  description: "See what share of adult men or women match the height, age, money, and other filters you set.",
};

export default function StandardsPage() {
  return <StandardsCalculator />;
}
