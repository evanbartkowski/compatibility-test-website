"use client";
import { useState } from "react";
import type {
  AdviceEvidence,
  AdviceExperiment,
  AdviceInsight,
  ScoredAssessmentResult,
} from "@/lib/assessment/types";

export function AdviceEvidenceNote({
  evidence,
}: {
  evidence: AdviceEvidence[];
}) {
  if (!evidence.length) return null;
  return (
    <details className="advice-evidence">
      <summary>Why this fits</summary>
      <ul>
        {evidence.map((item, i) => (
          <li key={`${item.dimension}-${i}`}>
            <strong>{item.label}</strong>
            {item.score !== undefined
              ? `: ${item.score}/100 from ${item.answeredCount} answers`
              : ": a topic already mutually disclosed"}
            {item.prompt && <span>“{item.prompt}”</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function AdviceInsightList({ items }: { items: AdviceInsight[] }) {
  return (
    <div className="advice-insight-list">
      {items.map((item) => (
        <article key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          {item.script && <blockquote>{item.script}</blockquote>}
          <AdviceEvidenceNote evidence={item.evidence} />
        </article>
      ))}
    </div>
  );
}

export function ExperimentList({
  experiments,
}: {
  experiments: AdviceExperiment[];
}) {
  return (
    <ol className="advice-experiments">
      {experiments.map((experiment, index) => (
        <li key={experiment.id}>
          <div className="advice-experiment-number" aria-hidden="true">
            {index + 1}
          </div>
          <article>
            <div className="advice-experiment-meta">
              <span>
                {experiment.kind === "solo"
                  ? "On your own"
                  : experiment.kind === "curiosity"
                    ? "Curiosity option"
                    : "With a partner"}
              </span>
              <span>
                {experiment.effort === 1
                  ? "Start small"
                  : experiment.effort === 2
                    ? "A little preparation"
                    : "More conversation first"}
              </span>
            </div>
            <h3>{experiment.title}</h3>
            <p>{experiment.body}</p>
            <p className="advice-scope">{experiment.scope}</p>
            <ul className="advice-step-list">
              {experiment.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            <details className="advice-agreements">
              <summary>Pause, consent & care</summary>
              <p>{experiment.stopRule}</p>
              {experiment.aftercare && <p>{experiment.aftercare}</p>}
            </details>
            <AdviceEvidenceNote evidence={experiment.evidence} />
          </article>
        </li>
      ))}
    </ol>
  );
}

export function AdviceGuide({ result }: { result: ScoredAssessmentResult }) {
  const advice = result.advice;
  const [tab, setTab] = useState("try");
  const [copied, setCopied] = useState(false);
  if (!advice) return null;
  if (advice.status !== "ready")
    return (
      <section
        className="advice-guide advice-empty mt-7"
        aria-labelledby="advice-guide-title"
      >
        <h2 id="advice-guide-title" className="font-display">
          {advice.headline}
        </h2>
        <p>{advice.context}</p>
      </section>
    );
  const ranking = result.styleRanking;
  const tabs = [
    { key: "try", label: "What to try" },
    { key: "partner", label: "Who to look for" },
    { key: "optimize", label: "What to optimize" },
    { key: "gaps", label: "Desire & experience" },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(advice.partnerSearchLine);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="advice-guide mt-7" aria-labelledby="advice-guide-title">
      <header className="advice-guide-heading">
        <p className="advice-kicker">Make this useful</p>
        <h2 id="advice-guide-title" className="font-display">
          {advice.headline}
        </h2>
        <p>{advice.context}</p>
      </header>
      {ranking && (
        <div
          className="advice-style-ranking"
          aria-label="Your intimacy style ranking"
        >
          <div>
            <h3>
              {ranking.primary
                ? `${ranking.primary.label} leads your current style`
                : ranking.tied
                  ? "Your leading styles are tied"
                  : "Your style is still taking shape"}
            </h3>
            {ranking.secondary && (
              <p>{ranking.secondary.label} is your secondary preference.</p>
            )}
            <p>{ranking.note}</p>
            {ranking.provisional && (
              <span className="advice-provisional">Provisional ranking</span>
            )}
          </div>
          <ol>
            {ranking.ranked.map((style) => (
              <li key={style.key}>
                <span>{style.label}</span>
                <strong>{style.score}/100</strong>
                <div className="advice-style-bar">
                  <span style={{ width: `${style.score}%` }} />
                </div>
                <small>{style.answeredCount} rated items</small>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div
        className="advice-navigation"
        role="tablist"
        aria-label="Personalized advice"
      >
        {tabs.map((item) => (
          <button
            type="button"
            role="tab"
            id={`advice-tab-${item.key}`}
            aria-controls="advice-panel"
            aria-selected={tab === item.key}
            tabIndex={tab === item.key ? 0 : -1}
            key={item.key}
            onClick={() => setTab(item.key)}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const i = tabs.findIndex((t) => t.key === tab);
              const next =
                tabs[
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? tabs.length - 1
                      : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                        tabs.length
                ];
              setTab(next.key);
              document.getElementById(`advice-tab-${next.key}`)?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="advice-panel"
        aria-labelledby={`advice-tab-${tab}`}
        tabIndex={0}
        className="advice-panel"
      >
        {tab === "try" && (
          <>
            <p className="advice-panel-intro">
              Choose what appeals, or leave it here. These invitations progress
              from private reflection to more preparation; the order is not a
              safety rating.
            </p>
            <ExperimentList experiments={advice.experiments} />
          </>
        )}
        {tab === "partner" && (
          <>
            <AdviceInsightList items={advice.partnerTraits} />
            <div className="advice-wording">
              <h3>Words you can make your own</h3>
              <p>
                Use only what you want to disclose in a profile or conversation.
              </p>
              <blockquote>{advice.partnerSearchLine}</blockquote>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={copy}
              >
                {copied ? "Copied" : "Copy wording"}
              </button>
              <span role="status" className="sr-only">
                {copied ? "Wording copied to clipboard" : ""}
              </span>
            </div>
            <h3 className="advice-subheading">Potential friction to discuss</h3>
            <AdviceInsightList items={advice.frictionPoints} />
          </>
        )}
        {tab === "optimize" && (
          <>
            <AdviceInsightList items={advice.optimizations} />
            {advice.synthesisNote && (
              <p className="advice-synthesis-note">{advice.synthesisNote}</p>
            )}
          </>
        )}
        {tab === "gaps" && (
          <>
            <p className="advice-panel-intro">{advice.gapNote}</p>
            {advice.gaps.length ? (
              <ol className="advice-gap-list">
                {advice.gaps.map((gap) => (
                  <li key={gap.questionId}>
                    <div>
                      <h3>{gap.label}</h3>
                      <span className="advice-gap-path">
                        {
                          {
                            "discuss-first": "Discuss first",
                            "keep-as-fantasy": "May stay fantasy",
                            "respect-limit": "Keep the limit",
                            "keep-private": "Keep private",
                            "needs-context": "More context first",
                          }[gap.path]
                        }
                      </span>
                    </div>
                    <p className="advice-gap-values">
                      Desire {gap.desire}/100 · Experience{" "}
                      {gap.experience === null
                        ? "not rated"
                        : `${gap.experience}/100`}
                      {gap.gap !== null
                        ? ` · Difference ${gap.gap} points`
                        : ""}
                    </p>
                    <p>{gap.explanation}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="advice-no-gap">
                No supported high-desire/low-experience gap stands out in this
                attempt. That is not a task to create one.
              </p>
            )}
          </>
        )}
      </div>
      <p className="advice-privacy-note">
        Your guide is private. A profile, a high score or a shared topic never
        supplies consent or predicts a partner’s behavior.
      </p>
    </section>
  );
}
