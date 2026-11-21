import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
const a = getAssessmentBySlug("erotic-blueprint-style")!;
const consent = {
  confirmedAdult18Plus: true,
  acceptedPrivacyTerms: true,
  optInCommunityStats: false,
  consentedAt: "2026-11-20T00:00:00Z",
};

test("a teaser produces ranked styles, tailored advice and a limit-respecting gap guide", async ({
  page,
}, info) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `advice-ui-${info.project.name}`,
  });
  await page.goto(`/assess/${a.slug}?mode=quick`);
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: /Begin Questions/ }).click();
  const quick = a.questions.filter((q) => q.quickDiscovery);
  for (let offset = 0; offset < quick.length; offset += 5) {
    for (const q of quick.slice(offset, offset + 5)) {
      const card = page.getByRole("article", { name: q.prompt, exact: true });
      await card
        .getByRole("radio", {
          name:
            q.sectionId === "sensual"
              ? "Very appealing"
              : q.sectionId === "energetic"
                ? "Appealing"
                : "Slightly appealing",
          exact: true,
        })
        .check();
      if (q.sectionId === "sensual") {
        await card
          .getByText("Willingness, experience & privacy", { exact: false })
          .click();
        await card
          .getByRole("radio", { name: "Freely interested", exact: true })
          .check();
        await card
          .getByRole("combobox", { name: "Past experience", exact: true })
          .selectOption("1");
        if (q.intimacyRole === "offer")
          await card.getByRole("checkbox", { name: /^Hard limit/ }).check();
      }
    }
    await page
      .getByRole("button", { name: /^(Next page|Review & Finish)$/ })
      .click();
  }
  await page.getByRole("button", { name: /Complete & View Results/ }).click();
  await expect(page).toHaveURL(/\/results\/sub_/);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const guide = page.getByRole("region", {
    name: /Sensual: turn your pattern/,
  });
  await expect(
    guide.getByRole("heading", {
      name: "Sensual leads your current style",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    guide.getByText("Energetic is your secondary preference."),
  ).toBeVisible();
  await expect(guide.locator(".advice-experiments > li")).toHaveCount(4);
  const first = guide.getByRole("tab", { name: "What to try", exact: true });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    guide.getByRole("tab", { name: "Who to look for", exact: true }),
  ).toBeFocused();
  await expect(
    guide.getByText(/Someone high in attentive sensory preferences/),
  ).toBeVisible();
  await expect(
    guide.getByRole("button", { name: "Copy wording", exact: true }),
  ).toBeVisible();
  await guide
    .getByRole("tab", { name: "What to optimize", exact: true })
    .click();
  await expect(
    guide.getByText(/Choose one ordinary sensory condition/),
  ).toBeVisible();
  await guide
    .getByRole("tab", { name: "Desire & experience", exact: true })
    .click();
  await expect(
    guide.getByText("Keep the limit", { exact: true }),
  ).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").pop();
  const data = await (await page.request.get(`/api/results/${id}`)).json();
  const limited = quick.find(
    (q) => q.sectionId === "sensual" && q.intimacyRole === "offer",
  )!;
  expect(
    data.result.advice.experiments.every(
      (e: { evidence: Array<{ questionId?: string }> }) =>
        e.evidence.every((item) => item.questionId !== limited.id),
    ),
  ).toBe(true);
  for (const theme of ["dark", "light"]) {
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to light theme" }).click();
    for (const tab of [
      "What to try",
      "Who to look for",
      "What to optimize",
      "Desire & experience",
    ]) {
      await guide.getByRole("tab", { name: tab, exact: true }).click();
      await expect(guide.getByRole("tabpanel")).toBeVisible();
      // This installed Firefox reproducibly crashes during automated axe injection.
      // Keep its functional/theme checks; Chromium projects audit every tab in both themes.
      if (info.project.name !== "Desktop Firefox") {
        const audit = await new AxeBuilder({ page })
          .include(".advice-guide")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          audit.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
      }
    }
    await guide.getByRole("tab", { name: "What to try", exact: true }).click();
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.screenshot({
      path: info.outputPath(`advice-${theme}.png`),
      fullPage: true,
    });
  }
  if (info.project.name === "Mobile")
    await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("an empty attempt offers no invented advice and a core assessment gets its own practical guide", async ({
  page,
}, info) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `advice-empty-${info.project.name}`,
  });
  const empty = await page.request.post("/api/assessments/submit", {
    data: { assessmentSlug: a.slug, mode: "quick", consent, answers: {} },
  });
  expect(empty.ok()).toBe(true);
  const result = await empty.json();
  await page.goto(`/results/${result.submissionId}`);
  await expect(
    page.getByRole("heading", {
      name: "A useful next step needs a little more evidence",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Personalized advice" }),
  ).toHaveCount(0);
  const core = getAssessmentBySlug("big-five-personality-profile")!;
  const response = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: core.slug,
      mode: "quick",
      consent,
      answers: Object.fromEntries(
        core.questions
          .filter((q) => q.quickDiscovery)
          .map((q) => [
            q.id,
            {
              questionId: q.id,
              customValue: q.reverseScored ? 1 : 7,
              updatedAt: "",
            },
          ]),
      ),
    },
  });
  expect(response.ok()).toBe(true);
  const scored = await response.json();
  await page.goto(`/results/${scored.submissionId}`);
  await expect(
    page.getByRole("heading", { name: "Map a week that fits", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "Desire & experience", exact: true })
    .click();
  await expect(
    page.getByText(
      /This agreement-scale assessment does not measure item-level experience/,
    ),
  ).toBeVisible();
  const tiedResponse = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: a.slug,
      mode: "quick",
      consent,
      answers: Object.fromEntries(
        a.questions
          .filter((q) => q.quickDiscovery)
          .map((q) => [
            q.id,
            {
              questionId: q.id,
              enjoyment: q.sectionId === "sensual" ? 5 : 2,
              updatedAt: "",
            },
          ]),
      ),
    },
  });
  expect(tiedResponse.ok()).toBe(true);
  const tied = await tiedResponse.json();
  expect(tied.result.styleRanking.primary.key).toBe("sensual");
  expect(tied.result.styleRanking.secondary).toBeUndefined();
  expect(tied.result.styleRanking.note).toContain(
    "secondary preferences are tied",
  );
});
