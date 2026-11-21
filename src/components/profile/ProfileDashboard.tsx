"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Fingerprint,
  LockKeyhole,
  SlidersHorizontal,
  Check,
  Copy,
  Plus,
  Layers,
  History,
  Share2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import type { ResultShareSelection } from "@/lib/assessment/sharing";
import { formatShortDate } from "@/lib/utils";
import { ConfirmAction } from "@/components/ConfirmAction";
import { useSavedResults } from "@/lib/assessment/use-saved-results";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { PopulationComparison } from "@/components/compare/PopulationComparison";
import { areHistoryResultsComparable } from "@/lib/assessment/definition";
import { AssessmentArtwork } from "@/components/assessment/AssessmentArtwork";
const Radar = dynamic(
  () =>
    import("@/components/charts/PreferenceRadarChart").then(
      (m) => m.PreferenceRadarChart,
    ),
  {
    loading: () => (
      <div className="chart-placeholder" role="img" aria-label="Loading profile chart" />
    ),
    ssr: false,
  },
);
const HistoryChart = dynamic(
  () =>
    import("@/components/charts/PreferenceHistoryChart").then(
      (m) => m.PreferenceHistoryChart,
    ),
  { loading: () => <div className="chart-placeholder" />, ssr: false },
);
interface Entry {
  submissionId: string;
  assessmentSlug: string;
  createdAt: string;
  result: ScoredAssessmentResult;
}
interface Share {
  profileId: string;
  displayName: string;
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
  resultCount: number;
}
const emptySelection = (): ResultShareSelection => ({
  dimensionKeys: [],
  includeArchetype: false,
  includeAssessmentTitle: false,
  allowSensitive: false,
});
export function ProfileDashboard({
  submissions: initialSubmissions,
  initialShares,
  libraryCount,
  currentLibrary,
}: {
  submissions: Entry[];
  initialShares: Share[];
  libraryCount: number;
  currentLibrary: Array<{ slug: string; version: string }>;
}) {
  const router = useRouter(),
    search = useSearchParams();
  const { submissions, ready, serverIds, resultHref } = useSavedResults(initialSubmissions);
  const { user, firebaseEnabled, openAuthModal } = useOptionalAuth();
  const latest = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const s of submissions)
      if (!map.has(s.assessmentSlug)) map.set(s.assessmentSlug, s);
    return [...map.values()];
  }, [submissions]);
  const completedCurrent = latest.filter((entry) =>
    currentLibrary.some(
      (a) =>
        a.slug === entry.assessmentSlug &&
        a.version === entry.result.assessmentVersion,
    ),
  ).length;
  const [selectedId, setSelectedId] = useState(latest[0]?.submissionId);
  const selected =
    latest.find((s) => s.submissionId === selectedId) || latest[0];
  const [selections, setSelections] = useState<
    Record<string, ResultShareSelection>
  >({});
  const [displayName, setDisplayName] = useState("My discovery profile"),
    [expires, setExpires] = useState(168);
  const [shares, setShares] = useState(initialShares),
    [shareLink, setShareLink] = useState(""),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false);
  const sharing = search.get("view") === "sharing";
  const activeSelections = Object.entries(selections)
    .filter(
      ([, s]) =>
        s.dimensionKeys.length ||
        s.includeArchetype ||
        s.includeAssessmentTitle,
    )
    .map(([resultId, s]) => ({ resultId, ...s }));
  const updateSelection = (id: string, patch: Partial<ResultShareSelection>) =>
    setSelections((old) => ({
      ...old,
      [id]: { ...(old[id] || emptySelection()), ...patch },
    }));
  const createShare = async () => {
    setError("");
    if (!activeSelections.length) {
      setError("Select the profile fields you want to share first.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/profile/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          expiresInHours: expires,
          selections: activeSelections,
        }),
      });
      const ct = response.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Profile sharing is unavailable offline.");
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error || "Unable to create profile share.");
      setShareLink(`${location.origin}${data.path}`);
      const list = await fetch("/api/profile/shares");
      const listCt = list.headers.get("content-type") || "";
      if (list.ok && listCt.includes("application/json")) {
        const listData = await list.json().catch(() => null);
        if (listData?.shares) setShares(listData.shares);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to create a shared profile.",
      );
    } finally {
      setSaving(false);
    }
  };
  const view = (value: string) =>
    router.replace(`/profile${value === "sharing" ? "?view=sharing" : ""}`, {
      scroll: false,
    });
  const selectedResult = selected?.result;
  const advice = selectedResult?.advice;
  return (
    <div className="site-shell profile-page">
      <header className="profile-heading">
        <div>
          <span className="intro-pill">
            <LockKeyhole size={13} />
            Your private space
          </span>
          <h1 className="font-display">My profile</h1>
          <p>
            Your information, results, and a few useful next steps.
          </p>
        </div>
        <Link href="/explore" className="button button-primary">
          <Plus size={16} />
          Discover a test
        </Link>
      </header>
      <div className="profile-nav" role="group" aria-label="Profile sections">
        <button aria-pressed={!sharing} onClick={() => view("profile")}>
          <Fingerprint size={15} />
          My profile
        </button>
        <button aria-pressed={sharing} onClick={() => view("sharing")}>
          <Share2 size={15} />
          Sharing choices
        </button>
        <Link href="/results">
          <History size={15} />
          All attempts
        </Link>
        <Link href="/compare?view=population">Population comparison</Link>
      </div>
      {!sharing && <section className="profile-account-strip" aria-label="Your information">
        <div><h2>{user?.displayName || (user ? "Your account" : "Guest profile")}</h2>
          <p>{user?.email || "Your saved results are private to this browser session and device."}</p></div>
        <dl>
          <div><dt>Tests explored</dt><dd>{latest.length}</dd></div>
          <div><dt>Saved attempts</dt><dd>{submissions.length}</dd></div>
          <div><dt>Latest result</dt><dd>{submissions[0] ? formatShortDate(submissions[0].createdAt) : "No results yet"}</dd></div>
        </dl>
        {user ? <Link href="/settings" className="text-link">Account & privacy</Link>
          : firebaseEnabled ? <button type="button" className="text-link" onClick={() => openAuthModal("register")}>Create an account</button>
          : <Link href="/settings" className="text-link">Privacy settings</Link>}
      </section>}
      {!ready && !submissions.length ? <p role="status" className="py-8">Loading your saved results…</p> : !submissions.length ? (
        <section className="profile-empty">
          <div className="profile-empty-orbits" aria-hidden="true">
            <Fingerprint size={52} />
          </div>
          <div>
            <span className="muted-label">
              A profile starts with one honest answer.
            </span>
            <h2 className="font-display">Get to know your patterns.</h2>
            <p>
              Explore your attachment tendencies, affection preferences,
              personality, and values. Your first result will appear here, with
              measured category scores and the answers that shaped them.
            </p>
            <Link
              href="/assess/attachment-style-discovery?mode=quick"
              className="button button-primary"
            >
              Start with attachment tendencies
            </Link>
          </div>
        </section>
      ) : sharing ? (
        <div className="profile-sharing-layout">
          <section className="comparison-panel">
            <h2 className="font-display text-3xl">
              Choose what leaves this space.
            </h2>
            <p className="mt-3">
              Nothing is selected by default. The link shows only the fields you
              choose below, and you can revoke it at any time.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-7">
              <label className="form-field">
                Profile name
                <input
                  name="sharedProfileName"
                  autoComplete="nickname"
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
              <label className="form-field">
                Link expires
                <select
                  value={expires}
                  onChange={(e) => setExpires(Number(e.target.value))}
                >
                  <option value={24}>After 24 hours</option>
                  <option value={168}>After 7 days</option>
                  <option value={720}>After 30 days</option>
                </select>
              </label>
            </div>
            <div className="share-selection-list">
              {latest.filter(entry => serverIds.has(entry.submissionId)).map((entry) => {
                const config =
                    selections[entry.submissionId] || emptySelection(),
                  sensitive =
                    entry.result.adultsOnly ||
                    entry.result.assessmentCategory === "sexuality-intimacy",
                  measured = entry.result.radar.filter(
                    (d) => d.answeredCount > 0,
                  ),
                  count =
                    config.dimensionKeys.length +
                    Number(config.includeArchetype) +
                    Number(config.includeAssessmentTitle);
                return (
                  <details key={entry.submissionId} className="share-selection">
                    <summary>
                      <span>
                        {entry.result.assessmentTitle || entry.assessmentSlug}
                      </span>
                      <span>
                        {count ? `${count} fields selected` : "Private"}
                      </span>
                    </summary>
                    <div className="share-selection-fields">
                      <label>
                        <input
                          type="checkbox"
                          checked={config.includeArchetype}
                          onChange={(e) =>
                            updateSelection(entry.submissionId, {
                              includeArchetype: e.target.checked,
                            })
                          }
                        />
                        Include archetype & description
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={config.includeAssessmentTitle}
                          onChange={(e) =>
                            updateSelection(entry.submissionId, {
                              includeAssessmentTitle: e.target.checked,
                            })
                          }
                        />
                        Include test title
                      </label>
                      {measured.map((d) => (
                        <label key={d.dimension}>
                          <input
                            type="checkbox"
                            checked={config.dimensionKeys.includes(d.dimension)}
                            onChange={(e) =>
                              updateSelection(entry.submissionId, {
                                dimensionKeys: e.target.checked
                                  ? [...config.dimensionKeys, d.dimension]
                                  : config.dimensionKeys.filter(
                                      (key) => key !== d.dimension,
                                    ),
                              })
                            }
                          />
                          {d.label}
                          <span>{d.score}%</span>
                        </label>
                      ))}
                      {sensitive && (
                        <label className="sensitive-ack">
                          <input
                            type="checkbox"
                            checked={config.allowSensitive}
                            onChange={(e) =>
                              updateSelection(entry.submissionId, {
                                allowSensitive: e.target.checked,
                              })
                            }
                          />
                          I choose to share the selected sensitive result
                          fields.
                        </label>
      )}
      {!sharing && <PopulationComparison compact />}
    </div>
                  </details>
                );
              })}
            </div>
            {!latest.some(entry => serverIds.has(entry.submissionId)) && <p className="mt-4">Your results are saved on this device. A sharing link needs a result saved to the server.</p>}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button
              type="button"
              className="button button-primary mt-6"
              onClick={createShare}
              disabled={saving || !activeSelections.length}
            >
              {saving
                ? "Creating private link…"
                : "Create selected profile link"}
            </button>
            {shareLink && (
              <div className="share-link-result" role="status">
                <label className="form-field">
                  Your private profile link
                  <input
                    readOnly
                    value={shareLink}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareLink);
                        setCopied(true);
                      } catch {
                        setError(
                          "Copy is unavailable. Select the link and copy it manually.",
                        );
                      }
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <Link
                    href={shareLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Preview shared profile
                  </Link>
                </div>
              </div>
            )}
          </section>
          <aside className="profile-share-sidebar">
            <span className="panel-symbol">
              <LockKeyhole size={20} />
            </span>
            <h2 className="font-display text-2xl">Your links, your control.</h2>
            <p>
              Only selected summaries are copied into a shared profile. Raw
              answers, result identifiers, and unselected tests are never
              included.
            </p>
            <h3 className="text-sm font-medium mt-8 mb-4">Created links</h3>
            {shares.length ? (
              shares.map((share) => (
                <div className="managed-share" key={share.profileId}>
                  <strong>{share.displayName}</strong>
                  <span>
                    {share.resultCount} results ·{" "}
                    {share.revoked
                      ? "Revoked"
                      : Date.parse(share.expiresAt) <= Date.now()
                        ? "Expired"
                        : `Expires ${formatShortDate(share.expiresAt)}`}
                  </span>
                  {!share.revoked &&
                    Date.parse(share.expiresAt) > Date.now() && (
                      <ConfirmAction
                        title="Revoke this shared profile?"
                        description="Anyone with this link will lose access. Your private results remain available to you."
                        confirmLabel="Revoke link"
                        onConfirm={async () => {
                          const response = await fetch(
                            `/api/profile/shares?id=${encodeURIComponent(share.profileId)}`,
                            { method: "DELETE" },
                          );
                          if (!response.ok)
                            throw new Error("Unable to revoke this link.");
                          setShares((old) =>
                            old.map((s) =>
                              s.profileId === share.profileId
                                ? { ...s, revoked: true }
                                : s,
                            ),
                          );
                        }}
                      >
                        Revoke link
                      </ConfirmAction>
                    )}
                </div>
              ))
            ) : (
              <p>No links created. Your profile is private.</p>
            )}
          </aside>
        </div>
      ) : (
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-library-progress">
              <span>
                <Layers size={16} />
                Your library
              </span>
              <strong>
                {completedCurrent}
                <small> / {libraryCount}</small>
              </strong>
              <p>
                Current assessments explored. Earlier results stay in your
                private history.
              </p>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${libraryCount ? Math.min(100, (completedCurrent / libraryCount) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div
              className="profile-result-picker"
              role="group"
              aria-label="Choose a completed test"
            >
              {latest.map((entry) => (
                <button
                  type="button"
                  key={entry.submissionId}
                  aria-pressed={selected?.submissionId === entry.submissionId}
                  onClick={() => setSelectedId(entry.submissionId)}
                >
                  <span>
                    <AssessmentArtwork slug={entry.assessmentSlug} variant="thumb" />
                    {entry.result.assessmentTitle || entry.assessmentSlug}
                  </span>
                  <small>
                    {formatShortDate(entry.createdAt)} ·{" "}
                    {entry.result.mode === "quick" ? "Quick" : "Deep"}
                  </small>
                </button>
              ))}
            </div>
          </aside>
          <div className="profile-main">
            {selectedResult && (
              <>
                <section className="profile-identity">
                  <div className="profile-identity-top">
                    <span className="intro-pill">
                      <SlidersHorizontal size={13} />
                      {selectedResult.assessmentTitle}
                    </span>
                    <Link
                      href={resultHref(selected!)}
                      className="text-link"
                    >
                      Open full result
                    </Link>
                  </div>
                  <h2 className="font-display">
                    {selectedResult.profile.archetypeName}
                  </h2>
                  <p className="profile-archetype-line">
                    {selectedResult.profile.archetypeTagline}
                  </p>
                  <div className="profile-measurement-grid">
                    <div className="profile-radar">
                      <Radar
                        dimensions={selectedResult.radar.filter(
                          (d) => d.answeredCount > 0,
                        )}
                        interactive={false}
                        showDetails={false}
                        stacked
                      />
                    </div>
                    <div className="profile-category-list">
                      {selectedResult.radar.slice(0, 5).map((d) => (
                        <div key={d.dimension}>
                          <div className="snapshot-row-top">
                            <span>{d.label}</span>
                            <strong>
                              {d.answeredCount ? `${d.score}%` : "Not measured"}
                            </strong>
                          </div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: d.answeredCount ? `${d.score}%` : 0,
                              }}
                            />
                          </div>
                          {d.interpretation && (
                            <details className="profile-category-reading">
                              <summary>Read this category</summary>
                              <p>{d.interpretation.meaning}</p>
                              <p>
                                <strong>Try:</strong>{" "}
                                {d.interpretation.experiment}
                              </p>
                              <p>
                                <strong>Reflect:</strong>{" "}
                                {d.interpretation.reflection}
                              </p>
                              <p>
                                {d.answeredCount} of {d.eligibleCount}{" "}
                                statements answered.
                                {d.answeredCount < 3
                                  ? " A tentative reading with limited evidence."
                                  : ""}
                              </p>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedResult.radar.length > 5 && <Link href={resultHref(selected!)} className="text-link">View all {selectedResult.radar.length} categories</Link>}
                  <p className="profile-measurement-note">
                    {selectedResult.answeredCount} answers · {selectedResult.mode === "quick" ? "Quick test" : "Full test"} · {formatShortDate(selected!.createdAt)}.
                    {selectedResult.provisional ? " An early reading; more answers will give a clearer picture." : " Scores describe tendencies, not a grade."}
                  </p>
                </section>
                <div className="profile-insight-grid">
                  <section className="comparison-panel">
                    <h3 className="font-display text-2xl">
                      Advice for you
                    </h3>
                    {advice?.status === "ready" ? <div className="profile-advice-preview">
                      {advice.optimizations.slice(0, 1).map(item => <div key={item.id}><h4>{item.title}</h4><p>{item.body}</p></div>)}
                      {advice.partnerTraits.slice(0, 1).map(item => <details key={item.id}><summary>What to look for in a partner</summary><p>{item.body}</p></details>)}
                      {advice.experiments.slice(0, 1).map(item => <details key={item.id}><summary>One thing to try: {item.title}</summary><p>{item.steps[0] || item.body}</p><p>{item.stopRule}</p></details>)}
                    </div> : <p className="mt-4">{advice?.status === "needs-more-answers" ? "Answer more questions to get advice based on your preferences." : selectedResult.groundedInsights[0] || selectedResult.profile.summaryParagraph}</p>}
                    <Link
                      href={resultHref(selected!, "advice")}
                      className="text-link"
                    >
                      Read your full advice
                    </Link>
                  </section>
                  <section className="comparison-panel cyan">
                    <h3 className="font-display text-2xl">Put your results in context</h3>
                    <p className="mt-4">
                      See how common an interest is, compare scores with test takers, or invite a partner.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      <Link className="text-link" href="/couples">
                        Compare with a partner
                      </Link>
                      <Link
                        className="text-link"
                        href={`/compare?view=community&a=${encodeURIComponent(selected!.submissionId)}`}
                      >
                        Community averages
                      </Link>
                      <Link className="text-link" href="/compare?view=population">Population statistics</Link>
                    </div>
                  </section>
                </div>
                <section className="profile-past-results comparison-panel mt-6" aria-labelledby="past-results-heading">
                  <div className="section-heading !mb-4"><h3 id="past-results-heading" className="font-display text-2xl">Past results</h3><Link href="/results" className="text-link">View all attempts</Link></div>
                  <ul>{submissions.slice(0, 5).map(entry => <li key={entry.submissionId}>
                    <div className="profile-attempt-art"><AssessmentArtwork slug={entry.assessmentSlug} variant="thumb" /><div><Link className="text-link" href={resultHref(entry)}>{entry.result.assessmentTitle || entry.assessmentSlug}</Link><p>{entry.result.profile.archetypeName} · {entry.result.mode === "quick" ? "Quick" : "Full"} · {formatShortDate(entry.createdAt)}</p></div></div>
                    <Link href={`/compare?view=history&a=${encodeURIComponent(entry.submissionId)}`} className="text-link">Compare attempt<span className="sr-only"> from {formatShortDate(entry.createdAt)}</span></Link>
                  </li>)}</ul>
                </section>
                <details className="profile-history comparison-panel mt-6" open={submissions.filter(s => areHistoryResultsComparable(s.result, selectedResult)).length > 1}>
                  <summary className="font-display text-2xl">Your profile over time</summary>
                  <div className="section-heading !mb-4">
                    <div>
                      <p>
                        Matching test version, scoring version, and question
                        depth only. Small changes can reflect ordinary
                        variation.
                      </p>
                    </div>
                    <Link
                      href={`/assess/${selectedResult.assessmentSlug}?mode=${selectedResult.mode}`}
                      className="text-link"
                    >
                      Retake this test
                    </Link>
                  </div>
                  <HistoryChart
                    results={submissions
                      .map((s) => s.result)
                      .filter(
                        (r) =>
                          areHistoryResultsComparable(r, selectedResult),
                      )}
                  />
                </details>
              </>
            )}
          </div>
        </div>
      )}
      {!sharing && <PopulationComparison compact />}
    </div>
  );
}
