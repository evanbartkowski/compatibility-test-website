// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { CompareClient } from "@/components/compare/CompareClient";
import { MyResultsClient } from "@/components/results/MyResultsClient";
import { CommunityAverages } from "@/components/compare/CommunityAverages";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { saveGuestSubmission, getGuestSubmissions, getGuestSubmission } from "@/lib/assessment/guest-storage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
// Charts load in the browser; these checks exercise saved data and navigation.
vi.mock("next/dynamic", () => ({ default: () => () => null }));

const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
function entry(id: string, date = "2026-11-21T12:00:00Z") {
  const answers = Object.fromEntries(assessment.questions.filter(q => q.quickDiscovery).map(q => [q.id, {
    questionId: q.id, customValue: 5, updatedAt: date,
  }]));
  return {
    submissionId: id, assessmentSlug: assessment.slug, assessmentVersion: assessment.version,
    mode: "quick" as const, perspective: "primary" as const, optInCommunityStats: false,
    createdAt: date, answers,
    result: scoreAssessmentSubmission({ resultId: id, assessment, mode: "quick", perspective: "primary", answers, createdAt: date }),
  };
}
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ submissions: [] }), { headers: { "Content-Type": "application/json" } })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("replaces a temporary browser attempt after the server saves that same attempt", () => {
  saveGuestSubmission(entry("temporary"));
  saveGuestSubmission(entry("server-copy"), "temporary");
  expect(getGuestSubmissions().map(s => s.submissionId)).toEqual(["server-copy"]);
  expect(getGuestSubmission("temporary")).toBeNull();
});

it("retains the temporary result when saving its replacement fails", () => {
  saveGuestSubmission(entry("temporary"));
  const original = Storage.prototype.setItem;
  const failing = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key, value) {
    if (key === "between_us_guest_submissions") throw new Error("Storage full");
    original.call(this, key, value);
  });
  try {
    saveGuestSubmission(entry("server-copy"), "temporary");
    expect(getGuestSubmissions().map(s => s.submissionId)).toEqual(["temporary"]);
    expect(getGuestSubmission("temporary")?.result.resultId).toBe("temporary");
  } finally { failing.mockRestore(); }
});

it("keeps browser-only results visible after an empty server refresh and opens their local report", async () => {
  saveGuestSubmission(entry("browser-only"));
  render(React.createElement(ProfileDashboard, { submissions: [], initialShares: [], libraryCount: 40, currentLibrary: [{ slug: assessment.slug, version: assessment.version }] }));
  const open = await screen.findByRole("link", { name: "Open full result" });
  expect(open.getAttribute("href")).toBe("/results?id=browser-only");
  await waitFor(() => expect(screen.getByRole("heading", { name: "Advice for you" })).toBeTruthy());
  expect(screen.queryByText("Get to know your patterns.")).toBeNull();
});

it("chooses the most recent self result even when supplied history is unsorted", async () => {
  const older = entry("older", "2026-11-19T12:00:00Z"), newer = entry("newer");
  render(React.createElement(ProfileDashboard, { submissions: [older, newer], initialShares: [], libraryCount: 40, currentLibrary: [] }));
  expect((await screen.findByRole("link", { name: "Open full result" })).getAttribute("href")).toBe("/results/newer");
  expect(screen.getByRole("heading", { name: "Past results" })).toBeTruthy();
});

it("compares personal interest with a sourced population percentage and remembers only an explicit choice", async () => {
  render(React.createElement(CompareClient));
  const topic = await screen.findByRole("article", { name: "Bondage" });
  expect(topic.textContent).toContain("29.3%");
  const { within } = await import("@testing-library/react");
  const choices = within(topic);
  expect(choices.getByLabelText<HTMLSelectElement>("Your view").value).toBe("");
  fireEvent.change(choices.getByLabelText("Your view"), { target: { value: "appealing" } });
  expect(topic.textContent).toContain("You share this interest with 29.3%");
  cleanup();
  render(React.createElement(CompareClient));
  const restored = await screen.findByRole("article", { name: "Bondage" });
  await waitFor(() => expect(within(restored).getByLabelText<HTMLSelectElement>("Your view").value).toBe("appealing"));
});

it("never invents a personal comparison before a result exists", async () => {
  render(React.createElement(CompareClient));
  fireEvent.click(await screen.findByRole("button", { name: /^Community averages$/ }));
  expect(await screen.findByText("Take a test to compare your scores.")).toBeTruthy();
  expect(screen.queryByText("92%")).toBeNull();
});

it("offers only matching versions and depths for retake comparisons", async () => {
  const self = entry("self"), matching = entry("matching", "2026-11-20T12:00:00Z");
  const different = entry("different", "2026-11-19T12:00:00Z");
  different.result = { ...different.result, assessmentVersion: "0.0.1" };
  [self, matching, different].forEach(s => saveGuestSubmission(s));
  window.history.replaceState({}, "", "/compare?view=history&a=self");
  render(React.createElement(CompareClient));
  const select = await screen.findByLabelText("Earlier attempt");
  await waitFor(() => expect(select.querySelector('option[value="matching"]')).toBeTruthy());
  expect(select.querySelector('option[value="different"]')).toBeNull();
});

it("keeps a browser result in history when the server has no copy", async () => {
  saveGuestSubmission(entry("offline-history"));
  render(React.createElement(MyResultsClient, { initialSubmissions: [], libraryCount: 40 }));
  await waitFor(() => expect(screen.getAllByText(assessment.title).length).toBeGreaterThan(0));
});

it("shows measured community means and suppresses a category without enough respondents", async () => {
  const saved = entry("community-result");
  const first = saved.result.radar[0], second = saved.result.radar[1];
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ community: {
    dimensions: [
      { dimension: first.dimension, label: first.label, available: true, communityMean: 42, respondentCount: 60, percentile: 75 },
      { dimension: second.dimension, label: second.label, available: false, communityMean: null, respondentCount: 2, percentile: null },
    ], minimumThreshold: 50, isSyntheticDemo: false,
  } }), { headers: { "Content-Type": "application/json" } })));
  render(React.createElement(CommunityAverages, { entry: saved, serverSaved: true }));
  expect(await screen.findByText("42/100")).toBeTruthy();
  expect(screen.getByText(/Based on 60 measured participants/)).toBeTruthy();
  expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
});

it("refuses population-like score comparisons across different test versions", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    assessmentVersion: "0.0.1", scoringEngineVersion: "old", dimensions: [],
  }), { headers: { "Content-Type": "application/json" } })));
  render(React.createElement(CommunityAverages, { entry: entry("old-version"), serverSaved: false }));
  expect(await screen.findByText(/earlier test version/)).toBeTruthy();
});
