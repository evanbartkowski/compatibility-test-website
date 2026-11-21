import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
import { scoreAssessmentSubmission } from "../src/lib/assessment/scoring";

const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
const answers = Object.fromEntries(assessment.questions.filter(q => q.quickDiscovery).map(q => [q.id, { questionId: q.id, customValue: 5, updatedAt: "2026-11-21T12:00:00Z" }]));
const local = {
  submissionId: "sub_guest_profile_qa", assessmentSlug: assessment.slug, assessmentVersion: assessment.version,
  mode: "quick", perspective: "primary", optInCommunityStats: false, createdAt: "2026-11-21T12:00:00Z", answers,
  result: scoreAssessmentSubmission({ resultId: "sub_guest_profile_qa", assessment, mode: "quick", perspective: "primary", answers, createdAt: "2026-11-21T12:00:00Z" }),
};

test("browser profile opens its saved report when API routes return static fallback HTML", async ({ page }, info) => {
  await page.addInitScript(value => localStorage.setItem("between_us_guest_submissions", JSON.stringify([value])), local);
  await page.route("**/api/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Static fallback</title>" }));
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Advice for you" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Past results" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open full result" })).toHaveAttribute("href", "/results?id=sub_guest_profile_qa");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath("profile.png"), fullPage: true });
  await page.getByRole("link", { name: "Read your full advice" }).click();
  await expect(page.locator("#advice-guide-title")).toBeVisible();
});

test("population interests persist, clear, and expose their research source", async ({ page }, info) => {
  await page.goto("/compare");
  const topic = page.getByRole("article", { name: "Bondage", exact: true });
  await expect(topic).toContainText("29.3%");
  await expect(topic.getByLabel("Your view")).toHaveValue("");
  await topic.getByLabel("Your view").selectOption("appealing");
  await expect(topic).toContainText("You share this interest with 29.3%");
  await page.reload();
  await expect(topic.getByLabel("Your view")).toHaveValue("appealing");
  await page.getByText("Source & what these numbers mean", { exact: true }).click();
  await expect(page.getByRole("link", { name: /Herbenick/ })).toHaveAttribute("href", /journals.plos.org/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath("population.png"), fullPage: true });
  await page.getByRole("button", { name: "Clear my choices" }).click();
  await page.reload();
  await expect(topic.getByLabel("Your view")).toHaveValue("");
  await page.getByRole("button", { name: "Community averages", exact: true }).click();
  await expect(page.getByText("Take a test to compare your scores.", { exact: true })).toBeVisible();
});

test("server results load in compare and community suppression stays clear", async ({ page }) => {
  const response = await page.request.post("/api/assessments/submit", { data: {
    assessmentSlug: assessment.slug, assessmentVersion: assessment.version, mode: "quick", perspective: "primary", answers,
    consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: "2026-11-21T12:00:00Z" },
  } });
  expect(response.ok()).toBe(true);
  const { submissionId } = await response.json();
  await page.goto(`/compare?view=community&a=${submissionId}`);
  await expect(page.getByLabel("Your result")).toHaveValue(submissionId);
  await expect(page.getByText(/Not enough community responses yet/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Your scores and community averages" })).toContainText("Pending");
});
