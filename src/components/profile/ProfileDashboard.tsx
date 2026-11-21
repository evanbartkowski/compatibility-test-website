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
const Radar = dynamic(
  () =>
    import("@/components/charts/PreferenceRadarChart").then(
      (m) => m.PreferenceRadarChart,
    ),
  {
    loading: () => (
      <div className="chart-placeholder" aria-label="Loading profile chart" />
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
  submissions,
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setShareLink(`${location.origin}${data.path}`);
      const list = await fetch("/api/profile/shares");
      if (list.ok) setShares((await list.json()).shares);
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
  return (
    <div className="site-shell profile-page">
      <header className="profile-heading">
        <div>
          <span className="intro-pill">
            <LockKeyhole size={13} />
            Your private space
          </span>
          <h1 className="font-display">Your discovery profile.</h1>
          <p>
            A clearer picture, built from your answers. Choose a test to explore
            the patterns you’ve actually measured.
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
      </div>
      {!submissions.length ? (
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
              {latest.map((entry) => {
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
                    </div>
                  </details>
                );
              })}
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button
              type="button"
              className="button button-primary mt-6"
              onClick={createShare}
              disabled={saving}
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
                      href={`/results/${selectedResult.resultId}`}
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
                      {selectedResult.radar.map((d) => (
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
                          {d.description && <p>{d.description}</p>}
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
                  <p className="profile-measurement-note">
                    {selectedResult.answeredCount} answers · Assessment v
                    {selectedResult.assessmentVersion} · Scoring v
                    {selectedResult.scoringEngineVersion}. Scores describe
                    tendencies, rather than a grade or a diagnosis.
                  </p>
                </section>
                <div className="profile-insight-grid">
                  <section className="comparison-panel">
                    <h3 className="font-display text-2xl">
                      What your answers suggest
                    </h3>
                    <p className="mt-4">
                      {selectedResult.profile.summaryParagraph}
                    </p>
                    <Link
                      href={`/results/${selectedResult.resultId}`}
                      className="text-link"
                    >
                      See the answers behind your profile
                    </Link>
                  </section>
                  <section className="comparison-panel cyan">
                    <h3 className="font-display text-2xl">A new perspective</h3>
                    <p className="mt-4">
                      Compare this measured profile with a partner or with a
                      sufficiently large group of opted-in test takers.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      <Link className="text-link" href="/couples">
                        Compare with a partner
                      </Link>
                      <Link
                        className="text-link"
                        href={`/results/${selectedResult.resultId}?tab=community`}
                      >
                        Community perspective
                      </Link>
                    </div>
                  </section>
                </div>
                <section className="comparison-panel mt-6">
                  <div className="section-heading !mb-4">
                    <div>
                      <h3 className="font-display text-2xl">
                        Your profile over time
                      </h3>
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
                          r.assessmentSlug === selectedResult.assessmentSlug &&
                          r.assessmentVersion ===
                            selectedResult.assessmentVersion &&
                          r.scoringEngineVersion ===
                            selectedResult.scoringEngineVersion &&
                          r.mode === selectedResult.mode &&
                          r.perspective === selectedResult.perspective,
                      )}
                  />
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
