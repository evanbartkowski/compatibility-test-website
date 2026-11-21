import type { CompatibilityReport } from "@/lib/assessment/types";
import {
  AdviceInsightList,
  ExperimentList,
} from "@/components/results/AdviceGuide";

export function PairAdviceGuide({ report }: { report: CompatibilityReport }) {
  const advice = report.pairAdvice;
  if (!advice) return null;
  return (
    <section className="advice-guide mt-8" aria-labelledby="pair-advice-title">
      <header className="advice-guide-heading">
        <p className="advice-kicker">Only what you both shared</p>
        <h2 id="pair-advice-title" className="font-display">
          A conversation you can choose together
        </h2>
        <p>{advice.privacyNote}</p>
      </header>
      {advice.status === "no-shared-topics" ? (
        <div className="advice-panel">
          <p>
            No mutually disclosed topics are available for pair-specific advice.
            Private choices and reasons stay private.
          </p>
        </div>
      ) : (
        <div className="advice-panel">
          <details className="advice-pair-disclosure" open>
            <summary>Complementary strengths</summary>
            <AdviceInsightList items={advice.strengths} />
          </details>
          <details className="advice-pair-disclosure">
            <summary>Potential friction to talk about</summary>
            <AdviceInsightList items={advice.frictionPoints} />
          </details>
          <details className="advice-pair-disclosure">
            <summary>Conversation starters</summary>
            <ul className="advice-step-list">
              {advice.conversationStarters.map((starter, i) => (
                <li key={i}>{starter}</li>
              ))}
            </ul>
          </details>
          <h3 className="advice-subheading">Optional next steps</h3>
          <ExperimentList experiments={advice.experiments} />
        </div>
      )}
    </section>
  );
}
