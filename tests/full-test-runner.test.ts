// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import { TestCard } from "@/components/explore/TestCard";
import { getAssessmentBySlug } from "@/data/assessments/catalog";
import { summarizeAssessment } from "@/lib/assessment/catalog-summary";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push() {}, refresh() {} }) }));
const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState({}, "", `/assess/${assessment.slug}?mode=quick`);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("offers one full test from discovery, with the full duration and question count", () => {
  render(React.createElement(TestCard, { assessment: summarizeAssessment(assessment) }));
  const start = screen.getByRole("link", { name: "Take the test" });
  expect(start.getAttribute("href")).toBe(`/assess/${assessment.slug}?mode=complete`);
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getByText(new RegExp(`${assessment.questions.length} questions`))).toBeTruthy();
});

it("ignores a legacy short-test URL and starts the full question set without a depth chooser", () => {
  render(React.createElement(AssessmentRunner, { assessment }));
  expect(screen.queryByText("Choose Assessment Depth")).toBeNull();
  fireEvent.click(screen.getByLabelText(/confirm I am at least/i));
  fireEvent.click(screen.getByLabelText(/understand my responses are private/i));
  fireEvent.click(screen.getByRole("button", { name: "Begin Test" }));
  expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Complete & View Results/ })).toBeNull();
  const saved = JSON.parse(localStorage.getItem(`between_us_draft_${assessment.slug}_primary_self_${assessment.version}`)!);
  expect(saved.mode).toBe("complete");
});

it("expands a saved short draft into a full test, preserving answers and starting at missing questions", async () => {
  const first = assessment.questions[0];
  const later = assessment.questions.find((q, index) => index >= 10 && q.quickDiscovery)!;
  const key = `between_us_draft_${assessment.slug}_primary_self_${assessment.version}`;
  localStorage.setItem(key, JSON.stringify({
    assessmentSlug: assessment.slug, assessmentVersion: assessment.version,
    mode: "quick", perspective: "primary", currentQuestionIndex: 2,
    consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: "2026-11-21T00:00:00Z" },
    answers: {
      [first.id]: { questionId: first.id, customValue: 6, updatedAt: "" },
      [later.id]: { questionId: later.id, customValue: 7, updatedAt: "" },
    },
  }));
  render(React.createElement(AssessmentRunner, { assessment }));
  fireEvent.click(await screen.findByRole("button", { name: "Resume Draft" }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem(key)!).mode).toBe("complete"));
  const saved = JSON.parse(localStorage.getItem(key)!);
  expect(saved.answers[first.id].customValue).toBe(6);
  expect(saved.answers[later.id].customValue).toBe(7);
  expect(saved.currentQuestionIndex).toBe(1);
  expect(screen.getByRole("article", { name: assessment.questions[1].prompt })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
});
