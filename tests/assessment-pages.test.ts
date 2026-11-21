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
  fireEvent.click(screen.getByRole("button", { name: /Begin Test|Begin Questions/ }));
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
  it("focuses a requested category's first question even when it starts a new page", () => {
    begin();
    fireEvent.click(
      screen.getByRole("button", { name: /Switch to Complete/i }),
    );
    const section = assessment.sections[2];
    const question = assessment.questions.find(
      (q) => q.sectionId === section.id,
    )!;
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Jump to a category" }),
      ).getByRole("button", { name: new RegExp(section.title) }),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: question.prompt }),
    );
  });
  it("keeps earlier wording's draft untouched and saves revised answers under their own version", () => {
    const old = getArchivedAssessmentBySlug(assessment.slug, "4.0.0")!;
    const key = `between_us_draft_${assessment.slug}_primary_self`;
    const draft = JSON.stringify({
      assessmentVersion: old.version,
      answers: {
        [old.questions[0].id]: {
          questionId: old.questions[0].id,
          customValue: 6,
        },
      },
    });
    localStorage.setItem(key, draft);
    begin();
    expect(screen.queryByRole("button", { name: "Resume Draft" })).toBeNull();
    fireEvent.click(card(0).getByRole("radio", { name: "Agree" }));
    expect(localStorage.getItem(key)).toBe(draft);
    const fresh = JSON.parse(
      localStorage.getItem(`${key}_${assessment.version}`)!,
    );
    expect(fresh.assessmentVersion).toBe(assessment.version);
    expect(fresh.answers[questions[0].id].customValue).toBe(6);
    expect(fresh.answers[old.questions[0].id]).toBeUndefined();
  });
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
        assessment: getArchivedAssessmentBySlug(assessment.slug, "4.0.0")!,
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
  it("shows ten independently answerable statements without a preselected response", () => {
    begin();
    expect(screen.getAllByRole("radio")).toHaveLength(70);
    for (const q of questions.slice(0, 10)) {
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
    expect(
      card(0).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(
      card(1).getByRole<HTMLInputElement>("radio", { name: "Disagree" })
        .checked,
    ).toBe(true);
    expect(screen.getByRole("heading", { name: `${Math.round((2 / questions.length) * 100)}% complete` })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
      `2 of ${questions.length} questions answered`,
    );
    fireEvent.click(card(2).getByRole("radio", { name: "Agree" }));
    expect(
      card(2).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
  });

  it("allows unanswered pages and preserves choices when navigating back", () => {
    begin();
    fireEvent.click(
      screen.getByRole("button", { name: /Switch to Complete/i }),
    );
    const completeQuestions = assessment.questions;
    fireEvent.click(card(0).getByRole("radio", { name: "Agree" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("heading", { name: /% complete$/ })).toBeTruthy();
    const card11 = within(screen.getByRole("article", { name: completeQuestions[11].prompt }));
    fireEvent.click(card11.getByRole("radio", { name: "Disagree" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(
      card(0).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    const card11Next = within(screen.getByRole("article", { name: completeQuestions[11].prompt }));
    expect(
      card11Next.getByRole<HTMLInputElement>("radio", { name: "Disagree" })
        .checked,
    ).toBe(true);
  });

  it("submits directly from the final question page without a review screen", () => {
    begin();
    expect(screen.queryByText(/Review & Refine Your Answers/i)).toBeNull();
    const submitBtn = screen.getByRole("button", {
      name: /Complete & View Results/i,
    });
    expect(submitBtn).toBeTruthy();
    fireEvent.click(submitBtn);
    expect(screen.queryByText(/Review & Refine Your Answers/i)).toBeNull();
  });

  it("resumes an existing question-index draft on its matching page", () => {
    localStorage.setItem(
      `between_us_draft_${assessment.slug}_primary_self_${assessment.version}`,
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
    expect(screen.getByRole("heading", { name: /% complete$/ })).toBeTruthy();
    expect(
      card(7).getByRole<HTMLInputElement>("radio", { name: "Agree" }).checked,
    ).toBe(true);
    expect(screen.getAllByRole("article")).toHaveLength(10);
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
