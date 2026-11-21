import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { builtInAssessments, getAssessmentBySlug } from "@/data/assessments/catalog";
import { HomeExperience } from "@/components/home/HomeExperience";
import { TestCard } from "@/components/explore/TestCard";
import { standardsCard, summarizeAssessment } from "@/lib/assessment/catalog-summary";

export default function HomePage() {
  const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
  const example = (offset: number) => {
    const result = scoreAssessmentSubmission({
      assessment,
      resultId: "example",
      mode: "complete",
      perspective: "primary",
      createdAt: "2026-11-20T00:00:00Z",
      answers: Object.fromEntries(
        assessment.questions.map((q, index) => {
          const category = assessment.dimensions!.findIndex(
            (d) => d.key === q.sectionId,
          );
          const value = Math.max(
            1,
            Math.min(
              7,
              [6, 5, 4, 6, 3][category] +
                (index % 5 === 1 ? 1 : index % 5 === 4 ? -1 : 0) -
                offset,
            ),
          );
          return [
            q.id,
            {
              questionId: q.id,
              customValue: q.reverseScored ? 8 - value : value,
              updatedAt: "",
            },
          ];
        }),
      ),
    });
    return {
      archetype: result.profile.archetypeName,
      tagline: result.profile.archetypeTagline,
      answered: result.answeredCount,
      dimensions: result.radar.map((d) => ({
        key: d.dimension,
        label: d.label,
        score: d.score,
        shortLabel: assessment.dimensions?.find(
          (meta) => meta.key === d.dimension,
        )?.shortLabel,
      })),
    };
  };
  const featured = [
    "bdsm-power-dynamics-test",
    "sexual-interests-curiosity-map",
    "toys-tools-gear-preferences",
    "attachment-style-discovery",
    "intimacy-partner-preferences",
    "love-affection-preferences",
    "long-term-dynamic-vision",
    "partner-ideal-dealbreakers",
    "relationship-dealbreakers-boundaries",
    "big-five-personality-profile",
    "emotional-availability-reflection",
    "myers-briggs-type-test",
    "gay-lgbt-attraction-test",
    "bias-self-check",
  ].map((slug) => getAssessmentBySlug(slug)!);
  return (
    <HomeExperience example={example(0)} partner={example(1)}>
      <section className="home-start" aria-labelledby="home-start-title">
        <div className="section-heading">
          <div>
            <h2 id="home-start-title" className="font-display">
              Which test are you actually curious about?
            </h2>
            <p>
              The BDSM test, the kink test, the personality type test, the gay test, the bias test, and the standards calculator. Every test includes the full question set.
            </p>
          </div>
            <Link href="/explore" className="text-link">
            Explore all {builtInAssessments.length} tests <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-start-grid">
          <TestCard assessment={standardsCard} href="/standards" featured />
          {featured.map((a) => (
            <TestCard key={a.slug} assessment={summarizeAssessment(a)} />
          ))}
        </div>
      </section>
    </HomeExperience>
  );
}
