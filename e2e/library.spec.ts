import { test, expect } from "@playwright/test";
import { builtInAssessments } from "../src/data/assessments/catalog";
for (const assessment of builtInAssessments) {
    const mode = "complete";
    test(`${assessment.slug} · ${mode} answers and scores in the browser`, async ({
      page,
    }, info) => {
      test.setTimeout(90000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setExtraHTTPHeaders({
        "x-forwarded-for": `library-${assessment.slug}-${mode}`,
      });
      await page.goto(`/assess/${assessment.slug}`);
      await page.getByLabel(/confirm I am at least/i).check();
      await page.getByLabel(/understand my responses are private/i).check();
      await page.getByRole("button", { name: /Begin Test/i }).click();
      let answered = 0;
      for (let guard = 0; guard < 151; guard++) {
        const cards = page.getByRole("article");
        const total = assessment.questions.length;
        await expect(cards).toHaveCount(Math.min(10, total - answered));
        for (const card of await cards.all()) {
          const prompt = await card.getByRole("heading").innerText();
          const q = assessment.questions.find((q) => q.prompt === prompt);
          expect(q, `Unknown rendered question: ${prompt}`).toBeTruthy();
          if (q!.inputType === "intimacy_profile") {
            if (q!.options?.length)
              await card
                .getByRole("radio", { name: q!.options![0].label, exact: true })
                .check();
            await card
              .getByRole("radio", { name: "Very appealing", exact: true })
              .check();
          } else if (
            q!.inputType === "rating_scale" &&
            q!.scaleConfig!.max === 7
          )
            await card
              .getByRole("radio", { name: "Strongly agree", exact: true })
              .check();
          else if (q!.inputType === "rating_scale")
            await card
              .getByRole("button", {
                name: String(q!.scaleConfig!.max),
                exact: true,
              })
              .click();
          else if (q!.inputType === "slider")
            await card
              .getByRole("button", { name: "Use this position", exact: true })
              .click();
          else if (q!.inputType === "ranking")
            await card
              .getByRole("button", {
                name: "Keep current order as my selection",
                exact: true,
              })
              .click();
          else if (q!.inputType === "curiosity_map")
            await card
              .getByRole("button", { name: /^Very interested/ })
              .click();
          else if (q!.options?.length)
            await card
              .getByRole("button", { name: q!.options![0].label, exact: true })
              .click();
          else
            await card
              .getByRole("button", { name: /5\s*Strongly like/ })
              .click();
          answered++;
        }
        const finish = page.getByRole("button", { name: /Complete & View Results/i });
        if (await finish.isVisible()) { await finish.click(); break; }
        await page.getByRole("button", { name: "Next page", exact: true }).click();
      }
      expect(answered).toBeGreaterThan(0);
      await expect(page).toHaveURL(/\/results(?:\/sub_|\?id=sub_)/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const url = new URL(page.url());
      const id = url.searchParams.get("id") || url.pathname.split("/").pop();
      const response = await page.request.get(`/api/results/${id}`);
      expect(response.ok()).toBe(true);
      const payload = await response.json();
      expect(payload.result.assessmentVersion).toBe(assessment.version);
      expect(payload.result.answeredCount).toBe(answered);
      expect(payload.result.mode).toBe("complete");
      expect(payload.result.totalEligibleInMode).toBe(assessment.questions.length);
      expect(
        payload.result.radar.every(
          (d: { score: number }) =>
            Number.isFinite(d.score) && d.score >= 0 && d.score <= 100,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      if (assessment.slug === "emotional-availability-reflection")
        await page.screenshot({
          path: info.outputPath(`${mode}-result.png`),
          fullPage: false,
        });
    });
  }

test("new submissions cannot use the retired short form", async ({ request }) => {
  const response = await request.post("/api/assessments/submit", {
    data: {
      assessmentSlug: builtInAssessments[0].slug,
      mode: "quick",
      perspective: "primary",
      consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true, optInCommunityStats: false, consentedAt: new Date().toISOString() },
      answers: {},
    },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).error).toMatch(/only full tests.*reload/i);
});
