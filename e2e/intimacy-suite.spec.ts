import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
const a = getAssessmentBySlug("desire-reality-map")!;
const consent = {
  confirmedAdult18Plus: true,
  acceptedPrivacyTerms: true,
  optInCommunityStats: false,
  consentedAt: "2026-11-20T00:00:00Z",
};
const sharing = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: false,
  neverExposeRawPrivateAnswers: true,
};
async function begin(page: Page) {
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: /Begin Questions/ }).click();
}
test("independent controls retain limits and drafts, with accessible themes and narrow layouts", async ({
  page,
}, info) => {
  await page.goto(`/assess/${a.slug}?mode=quick`);
  await expect(page.getByRole("button", { name: /^Teaser/ })).toBeVisible();
  await begin(page);
  await expect(page.getByRole("article")).toHaveCount(5);
  const card = page.getByRole("article").first();
  await card
    .getByRole("radio", { name: "Very appealing", exact: true })
    .check();
  await card
    .getByText("Willingness, experience & privacy", { exact: false })
    .click();
  await expect(
    card.getByRole("radio", { name: "Freely interested", exact: true }),
  ).not.toBeChecked();
  await card.getByRole("radio", { name: "Not willing", exact: true }).check();
  await card
    .getByRole("combobox", { name: "Past experience", exact: true })
    .selectOption("1");
  await card
    .getByRole("combobox", { name: "Partner visibility", exact: true })
    .selectOption("private_never_share");
  await card.getByRole("checkbox", { name: /^Hard limit/ }).check();
  await expect(
    card.getByRole("radio", { name: "Very appealing", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Resume Draft", exact: true }).click();
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await expect(
    card.getByRole("radio", { name: "Very appealing", exact: true }),
  ).toBeChecked();
  await expect(
    card.getByRole("checkbox", { name: /^Hard limit/ }),
  ).toBeChecked();
  await card
    .getByText("Willingness, experience & privacy", { exact: false })
    .click();
  await expect(
    card.getByRole("combobox", { name: "Partner visibility", exact: true }),
  ).toHaveValue("private_never_share");
  for (const theme of ["dark", "light"]) {
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to light theme" }).click();
    const audit = await new AxeBuilder({ page })
      .include(".assessment-workspace")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`intimacy-${theme}.png`),
      fullPage: true,
    });
  }
  if (info.project.name === "Mobile") {
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const tooSmall = await card
      .locator(".intimacy-desire-scale label")
      .evaluateAll((labels) =>
        labels.some((label) => label.getBoundingClientRect().width < 44),
      );
    expect(tooSmall).toBe(false);
  }
});

test("partner flow reveals only the permitted counterpart and private synthesis uses owned results", async ({
  page,
  browser,
}, info) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `intimacy-partner-${info.project.name}`,
  });
  const receive = a.questions[0],
    offer = a.questions.find((q) => q.id === receive.complementaryPartnerId)!;
  const hidden = a.questions[2];
  const response = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: a.slug,
      mode: "quick",
      consent,
      answers: {
        [receive.id]: {
          questionId: receive.id,
          enjoyment: 5,
          partnerWillingness: "enthusiastically_enjoy",
          updatedAt: "",
        },
        [hidden.id]: {
          questionId: hidden.id,
          enjoyment: 5,
          firmBoundary: true,
          revealRule: "private_never_share",
          updatedAt: "",
        },
      },
    },
  });
  expect(response.ok()).toBe(true);
  const primary = await response.json();
  const inviteResponse = await page.request.post("/api/invitations", {
    data: {
      creatorDisplayName: "Alex",
      creatorResultId: primary.submissionId,
      creatorSharing: sharing,
    },
  });
  expect(inviteResponse.ok()).toBe(true);
  const invitation = await inviteResponse.json();
  const partner = await browser.newContext({
    viewport: page.viewportSize()!,
    reducedMotion: "reduce",
    extraHTTPHeaders: {
      "x-forwarded-for": `intimacy-response-${info.project.name}`,
    },
  });
  try {
    const p = await partner.newPage();
    await p.goto(`/invite/${invitation.token}`);
    await p
      .getByRole("button", {
        name: "Continue to Consent & Questions",
        exact: true,
      })
      .click();
    await begin(p);
    const counterpart = p.getByRole("article", {
      name: offer.prompt,
      exact: true,
    });
    await counterpart
      .getByRole("radio", { name: "Slightly appealing", exact: true })
      .check();
    await counterpart
      .getByText("Willingness, experience & privacy", { exact: false })
      .click();
    await counterpart
      .getByRole("radio", { name: "Willing for a partner", exact: true })
      .check();
    await p.getByRole("button", { name: "Next page", exact: true }).click();
    await p
      .getByRole("button", { name: "Review & Finish", exact: true })
      .click();
    await p
      .getByRole("button", { name: /Generate Compatibility Report/ })
      .click();
    await expect(p).toHaveURL(/\/compatibility\//);
    await expect(
      p.getByRole("heading", { name: "Mutually welcome topics", exact: true }),
    ).toBeVisible();
    await expect(p.getByText(receive.prompt, { exact: true })).toBeVisible();
    await expect(p.getByText(hidden.prompt, { exact: true })).toHaveCount(0);
    await p.screenshot({
      path: info.outputPath("mutual-topics.png"),
      fullPage: true,
    });
    expect(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  } finally {
    await partner.close();
  }
  const synthesis = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: "personal-erotic-blueprint",
      mode: "quick",
      consent,
      answers: {},
    },
  });
  expect(synthesis.ok()).toBe(true);
  const blueprint = await synthesis.json();
  expect(
    blueprint.result.intimacyBlueprint.sources.map(
      (s: { title: string }) => s.title,
    ),
  ).toEqual([a.title]);
  await page.goto(`/results/${blueprint.submissionId}`);
  await expect(
    page.getByRole("heading", { name: "Across your saved reflections" }),
  ).toBeVisible();
});

test("new collection can be filtered and binary choices do not invent desire", async ({
  page,
}) => {
  await page.goto("/explore");
  await page
    .getByRole("combobox", { name: "Filter by focus" })
    .selectOption("collection");
  await expect(page.locator(".test-card")).toHaveCount(31);
  await page
    .getByRole("searchbox", { name: "Search assessments" })
    .fill("would you rather");
  await expect(page.locator(".test-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Try the teaser" }).click();
  await begin(page);
  const first = page.getByRole("article").first();
  await first
    .getByRole("radio", { name: "Put a date in the calendar", exact: true })
    .check();
  await expect(
    first.getByRole("radio", { name: "Very appealing", exact: true }),
  ).not.toBeChecked();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "10",
  );
});
