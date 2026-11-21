import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAssessmentBySlug } from "../src/data/assessments/catalog";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("between_us_theme")) localStorage.setItem("between_us_theme", "light");
  });
});

test("navigation has comfortable targets and closes with Escape and outside taps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");
  const toggle = page.getByRole("button", { name: "Open menu", exact: true });
  const rect = await toggle.boundingBox();
  expect(rect!.width).toBeGreaterThanOrEqual(44);
  expect(rect!.height).toBeGreaterThanOrEqual(44);
  await toggle.click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(menu.getByRole("link", { name: "Discover tests", exact: true })).toHaveAttribute("aria-current", "page");
  await menu.getByRole("link", { name: "My profile", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.mouse.click(8, 800);
  await expect(menu).toHaveCount(0);
  await page.setViewportSize({ width: 640, height: 390 });
  await toggle.click();
  await expect(menu.getByRole("button", { name: "Create account", exact: true })).toBeVisible();
  expect(await menu.evaluate(node => node.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
  await menu.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("all seven answers fit on a phone and saved choices survive navigation", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/assess/emotional-availability-reflection");
  await page.getByLabel(/confirm I am at least/i).check();
  await page.getByLabel(/understand my responses are private/i).check();
  await page.getByRole("button", { name: "Begin Test", exact: true }).click();
  const first = page.getByRole("article").first();
  const options = first.locator(".agreement-options");
  expect(await options.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  for (const choice of await first.locator(".agreement-option").all()) {
    const rect = await choice.boundingBox();
    expect(rect!.width).toBeGreaterThanOrEqual(44);
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
  }
  await first.getByRole("radio", { name: "Agree", exact: true }).check();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page.getByRole("button", { name: "Previous page", exact: true }).click();
  await expect(first.getByRole("radio", { name: "Agree", exact: true })).toBeChecked();
  await page.reload();
  await page.getByRole("button", { name: "Resume Draft", exact: true }).click();
  await expect(first.getByRole("radio", { name: "Agree", exact: true })).toBeChecked();
  await page.screenshot({ path: info.outputPath("light-phone-answers.png") });
  expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
});

test("public pages reflow and form controls remain comfortable on phones", async ({ page }, info) => {
  for (const width of [320, 390, 640, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/explore", "/compare", "/profile", "/settings", "/standards"]) {
      await page.goto(route);
      if (route === "/profile") await expect(page.getByText("Loading your saved results…", { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} at ${width}px`).toBe(true);
      const smallControls = await page.locator("main button, main select, main input:not([type=checkbox]):not([type=radio]), header button").evaluateAll(nodes => nodes.filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).map(node => node.getAttribute("aria-label") || node.textContent?.trim().slice(0, 60)));
      if (width <= 800) expect(smallControls, `${route} touch targets at ${width}px`).toEqual([]);
      const smallInputs = await page.locator("main input:not([type=checkbox]):not([type=radio]):not([type=range]), main select").evaluateAll(nodes => nodes.filter(node => node.getBoundingClientRect().width && parseFloat(getComputedStyle(node).fontSize) < 16).length);
      if (width <= 800) expect(smallInputs, `${route} input text at ${width}px`).toBe(0);
      if (width === 390) {
        await page.screenshot({ path: info.outputPath(`light-${route === "/" ? "home" : route.slice(1)}.png`), fullPage: true });
        expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
      }
    }
  }
  await page.screenshot({ path: info.outputPath("light-tablet-calculator.png") });
});

test("account dialog fits short phone viewports and calculator fields stay accessible", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto("/explore");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Create account", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(node => { const r = node.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })).toBe(true);
  await page.screenshot({ path: info.outputPath("light-phone-account.png") });
  expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 360 });
  await dialog.getByRole("textbox").first().focus();
  await expect.poll(() => dialog.evaluate(node => { const r = node.getBoundingClientRect(); return { fits: r.top >= -.5 && r.bottom <= innerHeight + .5, scrolls: node.scrollHeight > node.clientHeight }; })).toEqual({ fits: true, scrolls: true });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto("/standards");
  const controls = page.getByRole("slider");
  await expect(controls).toHaveCount(6);
  await page.getByRole("combobox", { name: "Eyes", exact: true }).selectOption("blue");
  await page.getByRole("button", { name: "Advanced options", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Hair", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("light-phone-calculator.png") });
  expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
});

test("saved profiles and reports remain readable in both themes on phones", async ({ page }, info) => {
  const issues: Array<{ theme: string; route: string; violations: unknown[] }> = [];
  await page.setViewportSize({ width: 390, height: 844 });
  const assessment = getAssessmentBySlug("emotional-availability-reflection")!;
  const response = await page.request.post("/api/assessments/submit", {
    headers: { "x-forwarded-for": `light-profile-${info.project.name}` },
    data: {
      assessmentSlug: assessment.slug, mode: "complete", perspective: "primary",
      consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: new Date().toISOString() },
      answers: Object.fromEntries(assessment.questions.map(q => [q.id, { questionId: q.id, customValue: q.reverseScored ? 2 : 6, updatedAt: "" }])),
    },
  });
  expect(response.ok()).toBe(true);
  const { submissionId } = await response.json();
  for (const theme of ["light", "dark"] as const) {
    for (const route of ["/profile", `/results/${submissionId}`, "/compare", "/history"]) {
      await page.goto(route);
      if (await page.locator("html").getAttribute("data-theme") !== theme) await page.getByRole("button", { name: `Switch to ${theme} theme` }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      if (route === "/profile") await expect(page.locator(".profile-category-list")).toContainText("%");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      // Paint offscreen surfaces before auditing theme changes in WebKit.
      await page.screenshot({ path: info.outputPath(`${theme}-${route.split("/")[1]}.png`), fullPage: true });
      const audit = await new AxeBuilder({ page }).include("main").analyze();
      if (audit.violations.length) issues.push({ theme, route, violations: audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })) })) });
    }
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  }
  expect(issues).toEqual([]);
});
