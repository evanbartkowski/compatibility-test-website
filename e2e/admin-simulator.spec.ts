import { expect, test } from "@playwright/test";
test("the scoring tester starts with a published assessment and returns a measured profile", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel(/passphrase/i).fill("between-us-playwright-admin-key");
  await page.getByRole("button", { name: /Unlock Admin Workspace/i }).click();
  await page.getByRole("tab", { name: "Scoring Tester" }).click();
  await expect(
    page.getByRole("combobox", { name: "Target Assessment", exact: true }),
  ).toHaveValue("big-five-personality-profile");
  await page
    .getByRole("button", { name: "Run Simulator", exact: true })
    .click();
  await expect(
    page.getByText("Computed Archetype", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("60 items · 100% coverage", { exact: true }),
  ).toBeVisible();
});
