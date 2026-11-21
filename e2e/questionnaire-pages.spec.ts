import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("question pages have readable tap targets, retain answers and support both themes", async ({
  page,
}, info) => {
  await page.goto("/assess/emotional-availability-reflection?mode=quick");
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: /Begin Questions/ }).click();
  await expect(page.getByRole("article")).toHaveCount(5);
  const first = page.getByRole("article").first();
  const firstPrompt = await first.getByRole("heading").innerText();
  // Click the visible wording to exercise the full answer target.
  await first
    .locator("label")
    .filter({ hasText: /^6Agree$/ })
    .click();
  await expect(
    first.getByRole("radio", { name: "Agree", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Skip question 2", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Questions 1–5",
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Questions 6–10",
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume Draft", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Questions 6–10",
  );
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await expect(
    page
      .getByRole("article", { name: firstPrompt })
      .getByRole("radio", { name: "Agree", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Skip question 2", exact: true }),
  ).toBeDisabled();

  for (const theme of ["dark", "light"] as const) {
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to light theme" }).click();
    const audit = await new AxeBuilder({ page })
      .include(".assessment-workspace")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const smallTargets = await page.locator(".agreement-option").evaluateAll(
      (labels) =>
        labels.filter((label) => {
          const { width, height } = label.getBoundingClientRect();
          return width < 44 || height < 44;
        }).length,
    );
    expect(smallTargets).toBe(0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: info.outputPath(`questionnaire-${theme}.png`),
      fullPage: true,
    });
  }
  if (info.project.name === "Mobile") {
    for (const viewport of [
      { width: 320, height: 740 },
      { width: 375, height: 812 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const clippedLabels = await page
        .locator(".agreement-label")
        .evaluateAll(
          (labels) =>
            labels.filter((label) => label.scrollWidth > label.clientWidth + 1)
              .length,
        );
      expect(clippedLabels).toBe(0);
      await page.screenshot({
        path: info.outputPath(`questionnaire-${viewport.width}.png`),
        fullPage: true,
      });
    }
  }
});
