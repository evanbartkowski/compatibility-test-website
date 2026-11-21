import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("API writes reject foreign origins, simple form bodies, and oversized JSON", async ({ request }) => {
  expect((await request.post("/api/assessments/submit", { headers: { Origin: "https://untrusted.example", "Content-Type": "application/json" }, data: {} })).status()).toBe(403);
  expect((await request.post("/api/assessments/submit", { headers: { "Content-Type": "text/plain" }, data: "{}" })).status()).toBe(415);
  expect((await request.post("/api/assessments/submit", { data: { input: "x".repeat(1_100_000) } })).status()).toBe(413);
});

test("public pages have defensive headers and render without emoji or duplicate artwork IDs", async ({ page }) => {
  const policyErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && /violates the following Content Security Policy/.test(message.text())) policyErrors.push(message.text());
  });
  for (const path of ["/", "/explore", "/profile", "/compare", "/privacy", "/terms"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"].split(";").find(rule => rule.trim().startsWith("script-src "))).toContain("https://apis.google.com");
    expect(headers["referrer-policy"]).toBe("no-referrer");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\p{Emoji_Presentation}|\uFE0F/u);
    const ids = await page.locator("svg [id]").evaluateAll(nodes => nodes.map(n => n.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect(policyErrors).toEqual([]);
});

test("discovery and population controls work with light theme, keyboard, and reduced motion", async ({ page }, info) => {
  await page.goto("/compare");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  await expect.poll(() => page.locator(".brand-link").first().evaluate(node => getComputedStyle(node).color)).toBe("rgb(25, 22, 38)");
  await expect(page.getByRole("heading", { name: "How common is it?", exact: true })).toHaveCSS("color", "rgb(25, 22, 38)");
  const topic = page.getByRole("article", { name: "Blindfolds", exact: true });
  await topic.getByLabel("Your view").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(topic.getByLabel("Your view")).toHaveValue("appealing");
  // Audit the painted theme; WebKit can expose the previous inherited colors
  // to accessibility tooling until its next rendering opportunity.
  await page.screenshot({ path: info.outputPath("small-art-light.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath("small-art-light.png"), fullPage: true });
});
