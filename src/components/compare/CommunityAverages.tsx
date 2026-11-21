"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedResultEntry } from "@/lib/assessment/use-saved-results";
import type { CommunityDimensionComparison } from "@/lib/assessment/community";

interface Comparison {
  dimensions: CommunityDimensionComparison[];
  minimumThreshold: number;
  isSyntheticDemo?: boolean;
}

export function CommunityAverages({ entry, serverSaved }: { entry: SavedResultEntry; serverSaved: boolean }) {
  const [payload, setPayload] = useState<Comparison | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setPayload(null);
    setError("");
    const url = serverSaved ? `/api/results/${encodeURIComponent(entry.submissionId)}`
      : `/api/community?slug=${encodeURIComponent(entry.assessmentSlug)}&mode=${entry.result.mode}`;
    fetch(url, { signal: controller.signal })
      .then(async response => {
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Community averages are unavailable right now. Your result is still saved.");
        const data = await response.json();
        if (!serverSaved && (data.assessmentVersion !== entry.result.assessmentVersion || data.scoringEngineVersion !== entry.result.scoringEngineVersion)) throw new Error("This result uses an earlier test version. Retake the current test for a community comparison.");
        const comparison = serverSaved ? data.community : data;
        if (!Array.isArray(comparison?.dimensions) || comparison.isSyntheticDemo) throw new Error("Community averages are unavailable right now. Your result is still saved.");
        if (!controller.signal.aborted) setPayload(comparison);
      })
      .catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unable to load community averages."); });
    return () => controller.abort();
  }, [entry.submissionId, entry.assessmentSlug, entry.result.assessmentVersion, entry.result.scoringEngineVersion, entry.result.mode, serverSaved]);
  if (error) return <p role="status" className="comparison-notice">{error}</p>;
  if (!payload) return <p role="status" className="comparison-notice">Loading community averages…</p>;
  const measured = entry.result.radar.filter(d => d.answeredCount > 0);
  return <section className="comparison-panel mt-6" aria-label="Your scores and community averages">
    <h2 className="font-display text-2xl">You & other test takers</h2>
    <p>Opted-in adults taking the same test version and depth. This self-selected group differs from the general population.</p>
    {!payload.dimensions.some(d => d.available && d.communityMean !== null) && <p className="comparison-notice">Not enough community responses yet. Each category needs at least {payload.minimumThreshold} measured participants before its average appears.</p>}
    {!measured.length && <p className="comparison-notice">You haven’t answered enough to measure a category yet.</p>}
    <ul className="community-score-list">{measured.map(d => {
      const comparison = payload.dimensions.find(row => row.dimension === d.dimension);
      const average = comparison?.available ? comparison.communityMean : null;
      return <li key={d.dimension}>
        <h3>{d.label}</h3>
        <div className="score-comparison-row"><span>You</span><div className="bar-track"><div className="bar-fill" style={{ width: `${d.score}%` }} /></div><strong>{d.score}/100</strong></div>
        <div className="score-comparison-row community"><span>Average</span><div className="bar-track"><div className="bar-fill" style={{ width: `${average ?? 0}%` }} /></div><strong>{average === null || average === undefined ? "Pending" : `${average}/100`}</strong></div>
        <p>{average === null || average === undefined ? "Not enough responses for this category." : `Based on ${comparison!.respondentCount} measured participants.${comparison!.percentile !== null ? ` Your percentile: ${comparison!.percentile} (ties shared).` : ""}`}</p>
      </li>;
    })}</ul>
    <Link href="/community" className="text-link">Explore community statistics</Link>
  </section>;
}
