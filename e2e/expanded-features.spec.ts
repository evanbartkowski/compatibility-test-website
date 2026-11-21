import { test, expect, type Page } from "@playwright/test";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
const consent = {
  confirmedAdult18Plus: true,
  acceptedPrivacyTerms: true,
  optInCommunityStats: false,
  consentedAt: "2026-11-20T00:00:00Z",
};
async function seed(page: Page, value = 4) {
  const response = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: assessment.slug,
      assessmentVersion: assessment.version,
      mode: "quick",
      perspective: "primary",
      consent,
      answers: Object.fromEntries(
        assessment.questions
          .filter((q) => q.quickDiscovery)
          .map((q) => [
            q.id,
            {
              questionId: q.id,
              customValue: q.reverseScored ? 8 - value : value,
              updatedAt: "",
            },
          ]),
      ),
    },
  });
  expect(response.ok()).toBe(true);
  return (await response.json()).submissionId as string;
}
test("retake history renders measured category changes and an accessible data table", async ({
  page,
}, info) => {
  await seed(page, 2);
  await seed(page, 4);
  await page.goto("/profile");
  await expect(page.locator(".history-series-controls")).toBeVisible();
  await page.getByText("View history as a table", { exact: true }).click();
  await expect(page.locator(".history-data-table table")).toContainText("17%");
  await expect(page.locator(".history-data-table table")).toContainText("50%");
  const series = page
    .getByRole("group", { name: "History chart categories" })
    .getByRole("button")
    .first();
  await series.click();
  await expect(series).toHaveAttribute("aria-pressed", "false");
  await page.screenshot({
    path: info.outputPath("retake-history.png"),
    fullPage: true,
  });
});

test("measured profile, selective public sharing, revocation, PNG export and deletion", async ({
  page,
  browser,
}, info) => {
  const id = await seed(page);
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: "Your discovery profile." }),
  ).toBeVisible();
  await expect(page.locator(".profile-category-list")).toContainText("%");
  await expect(page.locator(".profile-main")).not.toContainText(
    "Not enough answers yet",
  );
  await expect(page.locator(".profile-radar svg")).toBeVisible();
  await expect(page.locator(".history-empty")).toBeVisible();
  await page.screenshot({
    path: info.outputPath("measured-profile.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Sharing choices", exact: true })
    .click();
  await page.locator(".share-selection summary").click();
  await page.getByLabel("Include test title", { exact: true }).check();
  await page
    .locator(".share-selection-fields label")
    .filter({ hasText: "Sharing your inner world" })
    .getByRole("checkbox")
    .check();
  await page.getByRole("button", { name: /Create.*link/i }).click();
  const link = page.getByLabel("Your private profile link", { exact: true });
  await expect(link).toBeVisible();
  const url = await link.inputValue();
  const stranger = await browser.newContext({
    baseURL: "http://127.0.0.1:3000",
    viewport: page.viewportSize()!,
  });
  try {
    const publicPage = await stranger.newPage();
    await publicPage.goto(url);
    await expect(
      publicPage.getByRole("heading", { name: "My discovery profile" }),
    ).toBeVisible();
    await expect(publicPage.locator("main")).toContainText(
      "Sharing your inner world",
    );
    await expect(publicPage.locator("main")).not.toContainText(
      "Attentive presence",
    );
    expect(await publicPage.content()).not.toContain(id);
    expect((await stranger.request.get(`/api/results/${id}`)).status()).toBe(
      404,
    );
    await page
      .getByRole("button", { name: "Revoke link", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Revoke link", exact: true })
      .click();
    await publicPage.reload();
    await expect(publicPage.getByRole("heading")).toContainText("unavailable");
  } finally {
    await stranger.close();
  }
  await page.goto(`/results/${id}`);
  await page
    .getByText("Create a shareable result card", { exact: false })
    .click();
  await expect(
    page.getByLabel("Include archetype & description"),
  ).not.toBeChecked();
  await page.getByLabel("Include archetype & description").check();
  await page.getByLabel("Include test title").check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const { readFile } = await import("node:fs/promises");
  expect((await readFile(path!)).subarray(0, 8).toString("hex")).toBe(
    "89504e470d0a1a0a",
  );
  await page.screenshot({
    path: info.outputPath("selected-result-card.png"),
    fullPage: false,
  });
  await page.goto("/results");
  await page
    .getByRole("button", { name: "Delete result", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete result", exact: true })
    .click();
  await expect(
    page.getByText("No saved results yet", { exact: true }),
  ).toBeVisible();
  expect((await page.request.get(`/api/results/${id}`)).status()).toBe(404);
});

test("admin draft editing, server validation, immutable versions and preview authorization", async ({
  page,
}, info) => {
  expect((await page.request.get("/api/studio")).status()).toBe(401);
  expect(
    (await page.request.post("/api/studio/preview", { data: {} })).status(),
  ).toBe(401);
  await page.goto("/studio");
  await page.getByLabel(/passphrase/i).fill("between-us-playwright-admin-key");
  await page.getByRole("button", { name: /Unlock Admin Workspace/i }).click();
  await page.getByRole("button", { name: "Create test", exact: true }).click();
  const slug = `browser-draft-${info.project.name.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`;
  await page.getByLabel("URL slug", { exact: true }).fill(slug);
  await page
    .getByLabel("Title", { exact: true })
    .fill("A considered reflection");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Saved A considered reflection" }),
  ).toBeVisible();
  expect((await page.request.get(`/assess/${slug}`)).status()).toBe(404);
  await page
    .getByRole("button", { name: "Publish revision", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "published" }),
  ).toBeVisible();
  expect((await page.request.get(`/assess/${slug}`)).status()).toBe(200);
  await page
    .getByLabel("Question prompt", { exact: true })
    .fill("A changed published question should require a new version.");
  await page
    .getByRole("button", { name: "Publish revision", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: /immutable/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New revision", exact: true }).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /v1.1.0/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview test", exact: true }).click();
  await expect(
    page.getByText(
      "Private preview · no saved result or population contribution",
    ),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("admin-builder.png"),
    fullPage: false,
  });
  const workspace = await (await page.request.get("/api/studio")).json();
  const def = workspace.assessments.find(
    (a: { slug: string }) => a.slug === slug,
  );
  const q = def.questions[0];
  const preview = await page.request.post("/api/studio/preview", {
    data: {
      assessment: def,
      mode: "quick",
      answers: { [q.id]: { questionId: q.id, customValue: 3, updatedAt: "" } },
    },
  });
  expect(preview.ok()).toBe(true);
  expect((await preview.json()).result.resultId).toBe("unsaved-admin-preview");
  const invalid = await page.request.post("/api/studio", {
    data: {
      assessment: {
        ...def,
        questions: [{ ...q, dimensionWeights: { missing: 1 } }],
      },
    },
  });
  expect(invalid.status()).toBe(400);
  expect((await page.request.get(`/assess/${slug}`)).status()).toBe(200);
  await page
    .getByRole("button", { name: "Unpublish live test", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Unpublish live test", exact: true })
    .click();
  expect((await page.request.get(`/assess/${slug}`)).status()).toBe(404);
});

test("saved partner results remain private and a revoked report is inaccessible", async ({
  page,
  browser,
}) => {
  const creatorId = await seed(page),
    sharing = {
      shareCategoryScores: true,
      shareAlignedHighlights: true,
      shareComplementaryHighlights: true,
      shareSharedCuriosities: false,
      shareHighLevelBoundariesWithoutDetails: true,
      neverExposeRawPrivateAnswers: true,
    };
  const invitation = await (
    await page.request.post("/api/invitations", {
      data: {
        creatorDisplayName: "Alex",
        creatorResultId: creatorId,
        creatorSharing: sharing,
      },
    })
  ).json();
  const other = await browser.newContext({
    baseURL: "http://127.0.0.1:3000",
    viewport: page.viewportSize()!,
    reducedMotion: "reduce",
  });
  try {
    const partner = await other.newPage();
    const partnerId = await seed(partner);
    await partner.goto(`/invite/${invitation.token}`);
    await partner
      .getByLabel("Choose a compatible saved result")
      .selectOption(partnerId);
    await partner
      .getByLabel(/I am 18 or older, accept the privacy terms/)
      .check();
    await partner
      .getByRole("button", { name: "Compare my saved result", exact: true })
      .click();
    await expect(partner).toHaveURL(/\/compatibility\/cmp_/);
    const cid = new URL(partner.url()).pathname.split("/").pop();
    const report = await (
      await partner.request.get(`/api/compatibility/${cid}`)
    ).json();
    expect(JSON.stringify(report)).not.toContain("primaryAnswers");
    expect(
      (await other.request.get(`/api/results/${creatorId}`)).status(),
    ).toBe(404);
    expect((await page.request.get(`/api/results/${partnerId}`)).status()).toBe(
      404,
    );
    expect(
      (
        await page.request.delete(
          `/api/invitations?inviteId=${invitation.inviteId}`,
        )
      ).ok(),
    ).toBe(true);
    expect(
      (await other.request.get(`/api/compatibility/${cid}`)).status(),
    ).toBe(404);
  } finally {
    await other.close();
  }
});
