import { expect, test, type Page } from "@playwright/test";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
test.use({
  extraHTTPHeaders: async ({}, use, info) => {
    await use({
      "x-forwarded-for": `platform-${info.project.name}-${info.title}`,
    });
  },
});
const intimacyPartnerPreferencesAssessment = getAssessmentBySlug(
  "intimacy-partner-preferences",
)!;

async function consent(page: Page) {
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: /Begin Questions/i }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
async function completeIntimacy(page: Page, partner = false) {
  for (
    let i = 0;
    i <
    intimacyPartnerPreferencesAssessment.questions.filter(
      (q) => q.quickDiscovery,
    ).length /
      5;
    i++
  ) {
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      `Questions ${i * 5 + 1}–${i * 5 + 5}`,
    );
    const questions = intimacyPartnerPreferencesAssessment.questions
      .filter((q) => q.quickDiscovery)
      .slice(i * 5, i * 5 + 5);
    for (const question of questions) {
      const card = page.getByRole("article", {
        name: partner ? question.partnerPrompt : question.prompt,
      });
      await card.getByText("Agree", { exact: true }).click();
      await expect(
        card.getByRole("radio", { name: "Agree", exact: true }),
      ).toBeChecked();
    }
    await page
      .getByRole("button", { name: /^(Next page|Review & Finish)$/ })
      .click();
  }
  await page
    .getByRole("button", {
      name: partner
        ? /Generate Compatibility Report/i
        : /Complete & View Results/i,
    })
    .click();
}
test("homepage previews, theme, navigation and test filters", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Discover",
  );
  await noOverflow(page);
  await page
    .getByRole("group", { name: "Explore result previews" })
    .getByRole("button", { name: "Compatibility", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Where two worlds meet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hide partner", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Compatibility", exact: true }),
  ).toBeVisible();
  await page.getByRole("slider", { name: "Example category score" }).fill("40");
  await expect(page.locator(".orbit-score-control output")).toHaveText("40%");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: info.outputPath("home-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  if (info.project.name === "Mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeVisible();
  }
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: info.outputPath("home-dark.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Discover your test", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "discover",
  );
  const search = page.getByRole("searchbox", { name: "Search assessments" });
  await search.fill("attachment");
  const attachmentMatches = [
    "attachment-style-discovery",
    "attachment-bedroom",
  ];
  await expect(page.locator(".test-card")).toHaveCount(
    attachmentMatches.length,
  );
  for (const slug of attachmentMatches)
    await expect(
      page.locator(`.test-card a[href^="/assess/${slug}?"]`).first(),
    ).toBeVisible();
  await search.fill("zz-no-matching-test");
  await expect(
    page.getByRole("button", { name: "Reset filters" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  // Another worker can temporarily publish a custom admin fixture.
  await expect
    .poll(() => page.locator(".test-card").count())
    .toBeGreaterThanOrEqual(9);
  await page
    .getByRole("combobox", { name: "Filter by focus" })
    .selectOption("general");
  await expect(page.locator(".mature-tag")).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("library.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await page.goto("/assessments");
  await expect(page).toHaveURL(/\/explore$/);
});

test("answer progress, page navigation, upgrade and complete-mode draft resume", async ({
  page,
}, info) => {
  await page.goto("/assess/attachment-style-discovery?mode=quick");
  await consent(page);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  const first = page.getByRole("article").first();
  const prompt = await first.getByRole("heading").innerText();
  await first
    .getByRole("radio", { name: "Somewhat disagree", exact: true })
    .check();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Questions 6–10",
  );
  await page
    .getByRole("article")
    .first()
    .getByRole("radio", { name: "Somewhat agree", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await expect(
    page
      .getByRole("article", { name: prompt })
      .getByRole("radio", { name: "Somewhat disagree", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: /Switch to Complete/i }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuetext",
    `2 of ${getAssessmentBySlug("attachment-style-discovery")!.questions.length} questions answered`,
  );
  await page
    .getByRole("article")
    .first()
    .getByText("Help with this question", { exact: true })
    .click();
  await expect(
    page
      .getByRole("article")
      .first()
      .getByText(/Choose how closely this describes you/),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Draft", exact: true }).click();
  await expect(
    page
      .getByRole("article", { name: prompt })
      .getByRole("radio", { name: "Somewhat disagree", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuetext",
    `2 of ${getAssessmentBySlug("attachment-style-discovery")!.questions.length} questions answered`,
  );
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("assessment.png"),
    fullPage: true,
  });
});

test("guest results, score explanations, exports, community and partner comparison", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/assess/intimacy-partner-preferences?mode=quick");
  await consent(page);
  await completeIntimacy(page);
  await expect(page).toHaveURL(/\/results\/sub_/);
  await expect(
    page.getByRole("region", { name: "Your category profile" }),
  ).toBeVisible();
  const resultId = new URL(page.url()).pathname.split("/").pop()!;
  await page.getByText(/What shaped your .* score\?/).click();
  await expect(page.getByText(/contribution/).first()).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("results.png"),
    fullPage: false,
  });
  const pdf = await page.request.get(
    `/api/results/${resultId}/export?format=pdf`,
  );
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const json = await page.request.get(
    `/api/results/${resultId}/export?format=json`,
  );
  expect(json.status()).toBe(200);
  await page
    .getByRole("tab", { name: "Community comparison", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your patterns in perspective" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Not enough community responses yet/),
  ).toBeVisible();
  await page
    .getByLabel(/Preview comparison charts using Synthetic Demo Data/i)
    .check();
  await expect(
    page.getByText(/Synthetic example data\. These are demonstration rankings/),
  ).toBeVisible();
  await expect(
    page.locator(".benchmark-stats").filter({ hasText: "Percentile" }).first(),
  ).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: /Compare With Partner/i }).click();
  await page.getByPlaceholder("First name or nickname").fill("Alex");
  await page
    .getByRole("button", { name: /Create Private Invitation/i })
    .click();
  const invitation = page.locator("p").filter({ hasText: "/invite/" });
  await expect(invitation).toBeVisible();
  const inviteUrl = (await invitation.innerText()).trim();
  const partnerContext = await browser.newContext({
    reducedMotion: "reduce",
    viewport: page.viewportSize()!,
    baseURL: "http://127.0.0.1:3000",
  });
  try {
    const partner = await partnerContext.newPage();
    partner.on("pageerror", (e) => errors.push(e.message));
    await partner.goto(inviteUrl);
    await partner.getByRole("button", { name: /Continue to Consent/i }).click();
    await consent(partner);
    await completeIntimacy(partner, true);
    await expect(partner).toHaveURL(/\/compatibility\/cmp_/);
    await expect(
      partner.getByRole("heading", {
        name: "Your connection, in focus.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      partner.getByRole("region", { name: "Side by side category comparison" }),
    ).toBeVisible();
    await noOverflow(partner);
    await partner.screenshot({
      path: info.outputPath("compatibility.png"),
      fullPage: true,
    });
    await page.goto(new URL(partner.url()).pathname);
    await expect(
      page.getByRole("heading", {
        name: "Your connection, in focus.",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await partnerContext.close();
  }
  await page.goto("/results");
  await expect(
    page.getByRole("heading", { name: /^My Saved Results/ }),
  ).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("public comparison, account and empty states stay usable", async ({
  page,
}, info) => {
  for (const route of ["/couples", "/results", "/community", "/settings"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`${route.slice(1)}.png`),
      fullPage: false,
    });
  }
  await page.goto("/community");
  await expect(
    page.getByRole("heading", { name: "Category averages", exact: true }),
  ).toBeVisible();
  const response = await page.request.get("/api/community");
  const payload = await response.json();
  expect(payload).not.toHaveProperty("rawRatingsByQuestion");
  expect(payload.isSyntheticDemo).toBe(false);
});

test("prior results comparison and email form validation", async ({ page }) => {
  const created: string[] = [];
  for (const rating of [2, 5]) {
    const answers = Object.fromEntries(
      intimacyPartnerPreferencesAssessment.questions
        .filter((q) => q.quickDiscovery)
        .map((q) => [
          q.id,
          {
            questionId: q.id,
            customValue: rating,
            updatedAt: "2026-11-20T00:00:00Z",
          },
        ]),
    );
    const response = await page.request.post("/api/assessments/submit", {
      data: {
        assessmentSlug: "intimacy-partner-preferences",
        mode: "quick",
        perspective: "primary",
        consent: {
          confirmedAdult18Plus: true,
          acceptedPrivacyTerms: true,
          optInCommunityStats: false,
          consentedAt: "2026-11-20T00:00:00Z",
        },
        answers,
      },
    });
    expect(response.status()).toBe(200);
    created.push((await response.json()).submissionId);
  }
  await page.goto(`/results/${created[1]}?compare=${created[0]}`);
  await expect(
    page.getByRole("heading", { name: /Change Since Your Attempt/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Your category profile" }),
  ).toContainText("pts");
  await page.getByText("Export & email", { exact: true }).click();
  await page.getByRole("button", { name: "Email Report", exact: true }).click();
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send Verification Code", exact: true }),
  ).toBeDisabled();
  await page.getByPlaceholder("you@example.com").fill("not-an-email");
  await expect(
    page.getByRole("button", { name: "Send Verification Code", exact: true }),
  ).toBeDisabled();
  await noOverflow(page);
});

test("answer buttons support native arrows, numbered shortcuts, skipping and category navigation", async ({
  page,
}, info) => {
  const assessment = getAssessmentBySlug("big-five-personality-profile")!;
  await page.goto("/assess/big-five-personality-profile?mode=complete");
  await consent(page);
  await expect(page.getByRole("radio")).toHaveCount(35);
  for (const radio of await page.getByRole("radio").all())
    await expect(radio).not.toBeChecked();
  const first = page.getByRole("article").first();
  await first
    .getByRole("radio", { name: "Neither agree nor disagree", exact: true })
    .check();
  await page.keyboard.press("ArrowRight");
  await expect(
    first.getByRole("radio", { name: "Somewhat agree", exact: true }),
  ).toBeChecked();
  await page.keyboard.press("7");
  await expect(
    first.getByRole("radio", { name: "Strongly agree", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    String(Math.round(100 / assessment.questions.length)),
  );
  await expect(page.getByRole("heading", { level: 2 })).toContainText("% complete");
  if (info.project.name === "Desktop Chrome") {
    await page
      .getByRole("navigation", { name: "Jump to a category" })
      .getByRole("button", { name: /Social energy/ })
      .click();
    const question = assessment.questions.find((q) =>
      q.sectionTitle.includes("Social energy"),
    )!;
    await expect(
      page.getByRole("article", { name: question.prompt }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: question.prompt }),
    ).toBeFocused();
  }
  await noOverflow(page);
});
