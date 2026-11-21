// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import {
  getAssessmentBySlug,
  getArchivedAssessmentBySlug,
} from "@/data/assessments/catalog";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
const questions = assessment.questions.filter((q) => q.quickDiscovery);

function begin() {
  render(React.createElement(AssessmentRunner, { assessment }));
  fireEvent.click(screen.getByLabelText(/confirm I am at least/i));
  fireEvent.click(
    screen.getByLabelText(/understand my responses are private/i),
  );
  fireEvent.click(screen.getByRole("button", { name: /Begin Questions/ }));
}

function card(index: number) {
  return within(screen.getByRole("article", { name: questions[index].prompt }));
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});
afterEach(cleanup);

describe("Questionnaire pages", () => {
  it("keeps prior-version draft answers and relocates their old question index", () => {
    const previous = getArchivedAssessmentBySlug(assessment.slug, "3.0.0")!;
    const quick = previous.questions.filter((q) => q.quickDiscovery);
    localStorage.setItem(
      `between_us_draft_${assessment.slug}_primary_self`,
      JSON.stringify({
        assessmentVersion: previous.version,
        mode: "quick",
        currentQuestionIndex: 7,
        consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true },
        answers: {
          [quick[7].id]: {
            questionId: quick[7].id,
            customValue: 6,
            updatedAt: "",
          },
        },
      }),
    );
    render(
      React.createElement(AssessmentRunner, {
        assessment,
        previousDraftVersion: {
          version: previous.version,
          quickIds: quick.map((q) => q.id),
          completeIds: previous.questions.map((q) => q.id),
        },
      }),
    );
    expect(
      screen.getByText(/Your previous answers have been kept/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Resume Draft" }));
    expect(
      within(
        screen.getByRole("article", { name: quick[7].prompt }),
      ).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: quick[7].prompt }),
    );
  });
  it("shows five independently answerable statements without a preselected response", () => {
    begin();
    expect(screen.getAllByRole("radio")).toHaveLength(35);
    for (const q of questions.slice(0, 5)) {
      expect(screen.getByRole("heading", { name: q.prompt })).toBeTruthy();
    }
    expect(
      screen
        .getAllByRole<HTMLInputElement>("radio")
        .every((radio) => !radio.checked),
    ).toBe(true);
  });

  it("answers and skips individual questions without moving the page or changing another answer", () => {
    begin();
    fireEvent.click(card(0).getByRole("radio", { name: "Agree" }));
    fireEvent.click(card(1).getByRole("radio", { name: "Disagree" }));
    fireEvent.click(card(2).getByRole("button", { name: "Skip question 3" }));
    expect(
      card(0).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(
      card(1).getByRole<HTMLInputElement>("radio", { name: "Disagree" })
        .checked,
    ).toBe(true);
    expect(
      card(2).getByRole<HTMLButtonElement>("button", {
        name: "Skip question 3",
      }).disabled,
    ).toBe(true);
    expect(screen.getByRole("heading", { name: "Questions 1–5" })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
      `2 of ${questions.length} questions answered`,
    );
    fireEvent.click(card(2).getByRole("radio", { name: "Agree" }));
    expect(
      card(2).getByRole<HTMLButtonElement>("button", {
        name: "Skip question 3",
      }).disabled,
    ).toBe(false);
  });

  it("allows unanswered pages and preserves choices when navigating back", () => {
    begin();
    fireEvent.click(card(0).getByRole("radio", { name: "Agree" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(
      screen.getByRole("heading", { name: "Questions 6–10" }),
    ).toBeTruthy();
    fireEvent.click(card(6).getByRole("radio", { name: "Disagree" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(
      card(0).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(
      card(6).getByRole<HTMLInputElement>("radio", { name: "Disagree" })
        .checked,
    ).toBe(true);
  });

  it("opens the correct page and focuses the requested question when editing a review", () => {
    begin();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: /Review answers/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[7]);
    expect(
      screen.getByRole("heading", { name: "Questions 6–10" }),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: questions[7].prompt }),
    );
  });

  it("resumes an existing question-index draft on its matching page", () => {
    localStorage.setItem(
      `between_us_draft_${assessment.slug}_primary_self`,
      JSON.stringify({
        assessmentVersion: assessment.version,
        mode: "quick",
        currentQuestionIndex: 7,
        consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true },
        answers: {
          [questions[7].id]: {
            questionId: questions[7].id,
            customValue: 6,
            updatedAt: "",
          },
        },
      }),
    );
    render(React.createElement(AssessmentRunner, { assessment }));
    fireEvent.click(screen.getByRole("button", { name: "Resume Draft" }));
    expect(
      screen.getByRole("heading", { name: "Questions 6–10" }),
    ).toBeTruthy();
    expect(
      card(7).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  it("keeps answers when switching to the full assessment", () => {
    begin();
    fireEvent.click(card(0).getByRole("radio", { name: "Agree" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Switch to Complete/i }),
    );
    expect(
      card(0).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
      `1 of ${assessment.questions.length} questions answered`,
    );
  });
});
