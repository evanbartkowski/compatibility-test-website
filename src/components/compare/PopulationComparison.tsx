"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { populationInterests, populationStudy } from "@/data/population-research";

const STORAGE_KEY = "between_us_population_views_v1";
type View = "appealing" | "not-appealing";

export function PopulationComparison({ compact = false }: { compact?: boolean }) {
  const [views, setViews] = useState<Record<string, View>>({});
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const valid: Record<string, View> = {};
      for (const topic of populationInterests) {
        if (saved?.[topic.id] === "appealing" || saved?.[topic.id] === "not-appealing") valid[topic.id] = saved[topic.id];
      }
      setViews(valid);
    } catch { /* An empty comparison is valid when browser storage is unavailable. */ }
  }, []);
  const update = (id: string, value: string) => {
    const next = { ...views };
    if (value === "appealing" || value === "not-appealing") next[id] = value;
    else delete next[id];
    setViews(next);
    try {
      if (Object.keys(next).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
      setStorageError("");
    } catch { setStorageError("Your choice works here, but this browser could not save it."); }
  };
  return (
    <section className={`population-research${compact ? " population-research-compact" : ""}`} aria-label="Population research">
      <div className="section-heading">
        <div>
          <h2 className="font-display">How common is it?</h2>
          <p>{compact ? "Interests reported in a U.S. population survey." : "Compare your interests with U.S. adults in a population survey."}</p>
        </div>
        {compact && <Link href="/compare?view=population" className="text-link">Compare with the population</Link>}
      </div>
      <p className="research-context">{populationStudy.population} · {populationStudy.sampleSize.toLocaleString("en-US")} surveyed · Data collected 2014–2015</p>
      <div className="population-stat-grid">
        {populationInterests.slice(0, compact ? 3 : undefined).map(topic => (
          <article key={topic.id} aria-label={topic.label} className="population-stat">
            <div className="population-stat-top"><h3>{topic.label}</h3><strong>{topic.appealing}%</strong></div>
            <p>Found it somewhat or very appealing.</p>
            <div className="research-bar" aria-hidden="true"><i style={{ width: `${topic.appealing}%` }} /></div>
            {!compact && <>
              <p className="research-detail">{topic.detail} · n={topic.respondents.toLocaleString("en-US")}</p>
              {"lifetime" in topic && <p className="research-detail">{topic.lifetime}% reported having tried it at least once (Table 2).</p>}
              <label className="form-field">Your view
                <select value={views[topic.id] || ""} onChange={e => update(topic.id, e.target.value)}>
                  <option value="">Choose, or leave private</option>
                  <option value="appealing">Appeals to me</option>
                  <option value="not-appealing">Doesn’t appeal to me</option>
                </select>
              </label>
              <p className="research-personal" aria-live="polite">{views[topic.id] === "appealing"
                ? `You share this interest with ${topic.appealing}% of surveyed adults.`
                : views[topic.id] === "not-appealing"
                  ? `${(100 - topic.appealing).toFixed(1)}% of surveyed adults also did not find it appealing.`
                  : "Your view is optional. No answer is assumed from your test scores."}</p>
            </>}
          </article>
        ))}
      </div>
      {!compact && <div className="research-local-controls">
        <p>These choices stay on this device. They are separate from your test results.</p>
        {Object.keys(views).length > 0 && <button type="button" className="text-link" onClick={() => {
          setViews({});
          try { localStorage.removeItem(STORAGE_KEY); setStorageError(""); }
          catch { setStorageError("Your choices were cleared here, but saved browser data could not be removed."); }
        }}>Clear my choices</button>}
        {storageError && <p role="status">{storageError}</p>}
      </div>}
      <details className="research-source">
        <summary>Source & what these numbers mean</summary>
        <p><a href={populationStudy.url} target="_blank" rel="noreferrer">{populationStudy.citation}</a>, Tables 2 and 5. {populationStudy.method}</p>
        <p>Interest combines “somewhat” and “very” appealing responses. These historical U.S. estimates do not describe everyone today or identify who has a kink. Interest, experience, and consent are different things.</p>
      </details>
    </section>
  );
}
