import { expect, test } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";
const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
const firstQuestion = assessment.questions[0];

test("real Firebase registration, private result ownership, sign-out, sign-in and account deletion", async ({
  page,
}, info) => {
  test.skip(
    process.env.RUN_LIVE_AUTH_E2E !== "true" ||
      info.project.name !== "Desktop Chrome",
    "Explicitly enabled, isolated live authentication check.",
  );
  test.setTimeout(90000);
  const email = `truth-desire-qa-${Date.now()}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  let idToken = "",
    apiKey = "",
    removed = false;
  page.on("response", async (response) => {
    if (
      /identitytoolkit.*accounts:(signUp|signInWithPassword)/.test(
        response.url(),
      ) &&
      response.ok()
    ) {
      apiKey = new URL(response.url()).searchParams.get("key") || apiKey;
      const body = await response.json().catch(() => ({}));
      if (body.idToken) idToken = body.idToken;
    }
  });
  try {
    const seed = await page.request.post("/api/assessments/submit", {
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
            customValue: 5,
            updatedAt: "",
          },
        },
      },
    });
    expect(seed.ok()).toBe(true);
    const resultId = (await seed.json()).submissionId;
    await page.goto("/");
    await page
      .locator(".home-hero-copy")
      .getByRole("button", { name: "Create account" })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Email address", { exact: true }).fill(email);
    await dialog.getByLabel("Password", { exact: true }).fill(password);
    await dialog
      .getByLabel(/First name or nickname/)
      .fill("Temporary QA account");
    await dialog.locator("button[type=submit]").click();
    await expect(dialog).not.toBeVisible({ timeout: 30000 });
    await expect
      .poll(
        async () =>
          (await (await page.request.get("/api/account/session")).json())
            .signedIn,
        { timeout: 20000 },
      )
      .toBe(true);
    expect((await page.request.get(`/api/results/${resultId}`)).ok()).toBe(
      true,
    );
    await page.goto("/settings");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Account & privacy.",
    );
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect
      .poll(
        async () =>
          (await (await page.request.get("/api/account/session")).json())
            .signedIn,
      )
      .toBe(false);
    expect((await page.request.get(`/api/results/${resultId}`)).status()).toBe(
      404,
    );
    await page
      .locator("main")
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("Email address", { exact: true }).fill(email);
    await dialog.getByLabel("Password", { exact: true }).fill(password);
    await dialog.locator("button[type=submit]").click();
    await expect
      .poll(
        async () =>
          (await (await page.request.get("/api/account/session")).json())
            .signedIn,
        { timeout: 20000 },
      )
      .toBe(true);
    expect((await page.request.get(`/api/results/${resultId}`)).ok()).toBe(
      true,
    );
    const response = await page.request.post("/api/account/delete", {
      data: { idToken, confirmation: "DELETE" },
    });
    expect(response.status(), "Deleting the temporary test account").toBe(200);
    removed = true;
    expect(
      (await (await page.request.get("/api/account/session")).json()).signedIn,
    ).toBe(false);
    const lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    expect(lookup.status).toBe(400);
  } finally {
    if (idToken && apiKey && !removed) {
      const cleanup = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        },
      );
      expect(cleanup.ok, "Temporary QA identity cleanup").toBe(true);
    }
  }
});
