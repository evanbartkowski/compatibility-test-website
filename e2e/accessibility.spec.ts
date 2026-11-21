import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("keyboard entry and accessible discovery, profile, consent, account and community screens", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  for (const path of [
    "/",
    "/explore",
    "/profile",
    "/settings",
    "/community",
    "/assess/emotional-availability-reflection?mode=quick",
  ]) {
    await page.goto(path);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});
