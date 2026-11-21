import { expect, test } from "@playwright/test";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
test.use({
  extraHTTPHeaders: async ({}, use, info) =>
    use({ "x-forwarded-for": `home-stats-${info.project.name}-${info.title}` }),
});
test("the 3D graph loads owned scores and compatible retakes without exposing them to another visitor", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(60000);
  const slugs = [
    "love-affection-preferences",
    "emotional-availability-reflection",
    "big-five-personality-profile",
    "erotic-blueprint-style",
    "conflict-communication-personality",
  ];
  for (const high of [false, true])
    for (const slug of slugs) {
      const a = getAssessmentBySlug(slug)!;
      const response = await page.request.post("/api/assessments/submit", {
        data: {
          assessmentSlug: slug,
          assessmentVersion: a.version,
          mode: "quick",
          perspective: "primary",
          consent: {
            confirmedAdult18Plus: true,
            acceptedPrivacyTerms: true,
            optInCommunityStats: false,
            consentedAt: "",
          },
          answers: Object.fromEntries(
            a.questions
              .filter((q) => q.quickDiscovery)
              .map((q) => [
                q.id,
                {
                  questionId: q.id,
                  updatedAt: "",
                  ...(a.collection
                    ? { enjoyment: high ? 4 : 2 }
                    : {
                        customValue: q.reverseScored
                          ? high
                            ? 2
                            : 6
                          : high
                            ? 6
                            : 2,
                      }),
                },
              ]),
          ),
        },
      });
      expect(response.ok(), await response.text()).toBe(true);
    }
  const response = await page.request.get("/api/home-profile");
  expect(response.headers()["cache-control"]).toContain("no-store");
  const body = await response.json();
  expect(body.current.measured).toBe(6);
  expect(body.previous.measured).toBe(6);
  expect(
    body.current.axes.find((a: { key: string }) => a.key === "kink").score,
  ).toBe(75);
  expect(
    body.current.axes.find((a: { key: string }) => a.key === "logical").score,
  ).toBe(83);
  expect((await response.body()).length).toBeLessThan(12000);
  expect(JSON.stringify(body)).not.toContain("contributors");
  await page.goto("/");
  await expect(
    page.getByRole("group", { name: "Rotate 3D stats graph" }),
  ).toHaveAttribute("data-personal", "true");
  await expect(
    page.getByRole("heading", { name: "Your profile, in 3D." }),
  ).toBeVisible();
  await expect(page.locator(".stat-data-label")).toContainText("6 of 6");
  await expect(
    page.getByRole("slider", { name: "Example category score" }),
  ).toHaveCount(0);
  await expect(page.locator("[data-series=current]")).toHaveCount(8);
  await expect(page.locator("[data-series=comparison]")).toHaveCount(8);
  await page
    .locator(".stat-axis-buttons button")
    .filter({ hasText: "Logical" })
    .click();
  await expect(page.locator(".stat-axis-detail")).toContainText("View source");
  await page.screenshot({
    path: info.outputPath("owned-3d-profile.png"),
    fullPage: false,
  });
  const visitor = await browser.newContext();
  try {
    const stranger = await visitor.request.get(
      "http://127.0.0.1:3000/api/home-profile",
    );
    const privateBody = await stranger.json();
    expect(privateBody.current.measured).toBe(0);
    expect(
      privateBody.current.axes.every((a: { score: null }) => a.score === null),
    ).toBe(true);
    expect(privateBody.previous).toBeNull();
  } finally {
    await visitor.close();
  }
});

test("the catalogue is compact and retirement redirects preserve full-form intent", async ({
  page,
}) => {
  const response = await page.request.get("/api/assessments"),
    body = await response.json();
  expect(body.total).toBe(16);
  expect(
    body.assessments.every(
      (a: { questionCount: number; questions?: unknown }) =>
        a.questionCount >= 50 && a.questions === undefined,
    ),
  ).toBe(true);
  expect((await response.body()).length).toBeLessThan(60000);
  await page.goto("/assess/bdsm-power-dynamics-test?mode=complete");
  await expect(page).toHaveURL(/power-exchange-intensity\?mode=complete/);
});
