import { test, expect } from "@playwright/test";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
const firstQuestion = assessment.questions[0];
test("Firebase emulator registration, guest claim, sign-out isolation, sign-in and complete account deletion", async ({
  page,
}, info) => {
  test.skip(
    process.env.RUN_FIREBASE_E2E !== "true",
    "Run against local Auth and Firestore emulators.",
  );
  test.setTimeout(90000);
  const response = await page.request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: "emotional-availability-reflection",
      assessmentVersion: assessment.version,
      mode: "quick",
      perspective: "primary",
      consent: {
        confirmedAdult18Plus: true,
        acceptedPrivacyTerms: true,
        optInCommunityStats: false,
        consentedAt: "",
      },
      answers: {
        [firstQuestion.id]: {
          questionId: firstQuestion.id,
          customValue: 4,
          updatedAt: "",
        },
      },
    },
  });
  expect(response.ok()).toBe(true);
  const id = (await response.json()).submissionId;
  const email = `browser-${info.project.name.toLowerCase().replaceAll(" ", "-")}-${Date.now()}@example.invalid`,
    password = "Local-only-password-123";
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  let modal = page.getByRole("dialog");
  await modal.getByLabel("Email address", { exact: true }).fill(email);
  await modal.getByLabel("Password", { exact: true }).fill(password);
  await modal.getByLabel(/First name or nickname/).fill("Local tester");
  await modal.locator("button[type=submit]").click();
  await expect(modal).not.toBeVisible();
  await expect
    .poll(
      async () =>
        (await (await page.request.get("/api/account/session")).json())
          .signedIn,
    )
    .toBe(true);
  expect((await page.request.get(`/api/results/${id}`)).ok()).toBe(true);
  expect(
    (
      await page.request.patch("/api/account/privacy", {
        data: {
          displayName: "Account preference",
          defaultCommunityOptIn: true,
        },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/settings");
  await expect(page.locator("main")).toContainText(email);
  await page.screenshot({
    path: info.outputPath("account-connected.png"),
    fullPage: false,
  });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await page.request.get("/api/account/session")).json())
          .signedIn,
    )
    .toBe(false);
  expect((await page.request.get(`/api/results/${id}`)).status()).toBe(404);
  expect(
    (
      await page.request.patch("/api/account/privacy", {
        data: { displayName: "Guest preference", defaultCommunityOptIn: false },
      })
    ).ok(),
  ).toBe(true);
  await page
    .locator("main")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  modal = page.getByRole("dialog");
  await modal.getByLabel("Email address", { exact: true }).fill(email);
  await modal.getByLabel("Password", { exact: true }).fill(password);
  await modal.locator("button[type=submit]").click();
  await expect
    .poll(
      async () =>
        (await (await page.request.get("/api/account/session")).json())
          .signedIn,
    )
    .toBe(true);
  expect((await page.request.get(`/api/results/${id}`)).ok()).toBe(true);
  const preferences = await (
    await page.request.get("/api/account/privacy")
  ).json();
  expect(preferences.prefs).toMatchObject({
    displayName: "Account preference",
    defaultCommunityOptIn: true,
  });
  const cookies = await page.context().cookies();
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Delete account permanently", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete my account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "account and saved app data were deleted",
  );
  expect((await page.request.get(`/api/results/${id}`)).status()).toBe(404);
  // A stolen pre-deletion cookie cannot recover a revoked account session.
  const stale = cookies.find((c) => c.name === "between_us_uid");
  expect(stale).toBeTruthy();
  await page.context().addCookies([stale!]);
  expect(
    (await (await page.request.get("/api/account/session")).json()).signedIn,
  ).toBe(false);
  const users = await page.request.get(
    "http://127.0.0.1:9099/emulator/v1/projects/demo-truth-desire/accounts",
  );
  expect(
    (await users.json()).users?.some(
      (u: { email: string }) => u.email === email,
    ) || false,
  ).toBe(false);
});
