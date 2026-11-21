import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  builtInAssessments,
  getAssessmentBySlug,
} from "@/data/assessments/catalog";
import { HomeExperience } from "@/components/home/HomeExperience";
import { TestCard } from "@/components/explore/TestCard";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

export default function HomePage() {
  const featured = [
    "big-five-personality-profile",
    "emotional-availability-reflection",
    "erotic-blueprint-style",
  ].map((slug) => getAssessmentBySlug(slug)!);
  return (
    <HomeExperience>
      <section className="home-start" aria-labelledby="home-start-title">
        <div className="section-heading">
          <div>
            <h2 id="home-start-title" className="font-display">
              What would you like to understand?
            </h2>
            <p>
              Start with a teaser. Go deeper at your pace. Five questions at a
              time.
            </p>
          </div>
          <Link href="/explore" className="text-link">
            Explore all {builtInAssessments.length} tests{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-start-grid">
          {featured.map((a) => (
            <TestCard key={a.slug} assessment={summarizeAssessment(a)} />
          ))}
        </div>
      </section>
    </HomeExperience>
  );
}
