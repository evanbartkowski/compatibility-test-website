import { expect, test } from "@playwright/test";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";

test("browser canvas, readable cards and consolidated links adapt to the viewport", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/explore",
    "/profile",
    "/community",
    "/couples",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const layout = await page.evaluate(() => {
      const shell = document.querySelector("main .site-shell")!;
      return {
        width: shell.getBoundingClientRect().width,
        viewport: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clipped: [
          ...document.querySelectorAll(
            ".test-card-content,.test-card-description,.test-card-actions",
          ),
        ].filter((el) => el.scrollWidth > el.clientWidth + 1).length,
      };
    });
    expect(layout.width / layout.viewport).toBeGreaterThan(
      layout.viewport >= 1200 ? 0.9 : 0.8,
    );
    expect(layout.overflow).toBe(false);
    expect(layout.clipped).toBe(0);
    if (path === "/")
      await expect(page.locator(".orbit-categories button")).toHaveText([
        /Clarity/,
        /Openness/,
        /Presence/,
        /Mutual care/,
        /Capacity/,
      ]);
  }
  for (const [oldSlug, newSlug] of [
    ["private-fantasy-matcher", "sexual-interests-curiosity-map"],
    [
      "couples-communication-conflict-matching",
      "conflict-communication-personality",
    ],
  ]) {
    await page.goto(`/assess/${oldSlug}?mode=complete`);
    await expect(page).toHaveURL(
      new RegExp(`/assess/${newSlug}\\?mode=complete`),
    );
  }
  expect(errors).toEqual([]);
  await page.goto("/explore");
  await page.screenshot({
    path: info.outputPath("focused-library.png"),
    fullPage: true,
  });
});

test("five-question pages produce explainable category scores and a detailed report", async ({
  page,
}, info) => {
  const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
  await page.goto(`/assess/${assessment.slug}?mode=quick`);
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: /Begin Test/ }).click();
  expect(
    await page
      .getByRole("heading", { level: 2 })
      .evaluate((el) => el.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(82);
  await expect(page.getByRole("radio")).toHaveCount(35);
  await expect(
    page.getByRole("button", { name: "Next page", exact: true }),
  ).toBeEnabled();
  const firstCard = page.getByRole("article").first();
  await expect(
    firstCard.getByRole("radio", {
      name: "Neither agree nor disagree",
      exact: true,
    }),
  ).not.toBeChecked();
  await firstCard
    .getByRole("radio", { name: "Neither agree nor disagree", exact: true })
    .check();
  await page.keyboard.press("ArrowRight");
  await expect(
    firstCard.getByRole("radio", { name: "Somewhat agree", exact: true }),
  ).toBeChecked();
  await page.keyboard.press("7");
  await expect(
    firstCard.getByRole("radio", { name: "Strongly agree", exact: true }),
  ).toBeChecked();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: info.outputPath("questionnaire-pages.png"),
    fullPage: true,
  });
  const questions = assessment.questions.filter((q) => q.quickDiscovery);
  for (let index = 0; index < questions.length; index++) {
    const q = questions[index];
    const card = page.getByRole("article", { name: q.prompt });
    await card
      .getByRole("radio", {
        name: q.reverseScored ? "Somewhat disagree" : "Somewhat agree",
        exact: true,
      })
      .check();
    if ((index + 1) % 5 === 0 || index === questions.length - 1)
      await page
        .getByRole("button", { name: /^(Next page|Review & Finish)$/ })
        .click();
  }
  await page.getByRole("button", { name: /Complete & View Results/ }).click();
  await expect(page).toHaveURL(/\/results\/sub_/);
  const response = await page.request.get(
    `/api/results/${new URL(page.url()).pathname.split("/").pop()}`,
  );
  const { result } = await response.json();
  expect(result.radar).toHaveLength(5);
  for (const d of result.radar) {
    expect(d.score).toBe(67);
    expect(d.answeredCount).toBe(10);
    await page.locator(".snapshot-row").filter({ hasText: d.label }).click();
    await expect(page.locator(".category-interpretation")).toContainText(
      d.interpretation.meaning,
    );
    await expect(page.locator(".category-interpretation")).toContainText(
      d.interpretation.reflection,
    );
    await expect(page.locator(".category-interpretation")).toContainText(
      "10 of 10",
    );
  }
  await page.screenshot({
    path: info.outputPath("category-report.png"),
    fullPage: false,
  });
  const pdf = await page.request.get(
    `/api/results/${result.resultId}/export?format=pdf`,
  );
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
