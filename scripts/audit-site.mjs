import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const phase = process.argv[2] === "after" ? "after" : "baseline";
const baseURL = process.env.AUDIT_URL || "http://127.0.0.1:3100";
const output = path.resolve("qa-artifacts/site-audit-2026-11-21");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const measurements = [];
try {
  for (const route of ["/", "/explore"]) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
      await page.addInitScript(() => {
        window.__audit = { lcp: 0, cls: 0 };
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__audit.lcp = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__audit.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
      });
      const response = await page.goto(baseURL + route, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => ({
        ...window.__audit,
        navigation: performance.getEntriesByType("navigation").map(n => ({ ttfb: n.responseStart - n.requestStart, domInteractive: n.domInteractive }))[0],
        resources: performance.getEntriesByType("resource").reduce((out, r) => ({ count: out.count + 1, transferSize: out.transferSize + r.transferSize }), { count: 0, transferSize: 0 }),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      measurements.push({ route, run, status: response.status(), ...result });
      if (run === 1) await page.screenshot({ path: path.join(output, `${phase}-${route === "/" ? "home" : "explore"}.png`) });
      await context.close();
    }
  }
} finally { await browser.close(); }
const report = { phase, baseURL, browser: "Chromium", viewport: "390x844", cpuSlowdown: 4, network: "150ms RTT, 1.6Mbps down, 750Kbps up", cache: "fresh browser context per run", reducedMotion: true, measurements };
await fs.writeFile(path.join(output, `${phase}-performance.json`), JSON.stringify(report, null, 2));
for (const route of ["/", "/explore"]) {
  const rows = measurements.filter(m => m.route === route);
  const lcp = rows.map(m => Math.round(m.lcp)).sort((a, b) => a - b);
  console.log(JSON.stringify({ phase, route, lcpMedianMs: lcp[1], lcpRangeMs: [lcp[0], lcp[2]], cls: rows.map(m => m.cls), transferBytes: rows.map(m => m.resources.transferSize), overflows: rows.some(m => m.overflow) }));
}
