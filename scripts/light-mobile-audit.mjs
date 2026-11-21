import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const phase = process.argv[2] || "baseline";
const baseURL = process.env.AUDIT_URL || "http://127.0.0.1:3125";
const output = path.resolve("qa-artifacts/light-mobile-2026-11-21");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const rows = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", isMobile: width < 600, hasTouch: width < 600 });
    await context.addInitScript(() => localStorage.setItem("between_us_theme", "light"));
    const page = await context.newPage();
    for (const route of ["/", "/explore", "/compare", "/profile", "/assess/emotional-availability-reflection", "/standards"]) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        smallControls: [...document.querySelectorAll("button, input:not([type=checkbox]):not([type=radio]), select, .button")].filter(node => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        }).map(node => ({ text: (node.getAttribute("aria-label") || node.textContent || "").trim().slice(0, 75), width: Math.round(node.getBoundingClientRect().width), height: Math.round(node.getBoundingClientRect().height) })),
      }));
      const name = route === "/" ? "home" : route.split("/").pop();
      await page.screenshot({ path: path.join(output, `${phase}-${name}-${width}.png`) });
      rows.push({ width, route, ...metrics });
    }
    await context.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(output, `${phase}-layout.json`), JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows));
