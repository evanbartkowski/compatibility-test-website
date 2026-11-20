import path from "node:path";
import { expect, test } from "@playwright/test";

const SHOT_DIR =
  "C:/Users/user-evan/.gemini/antigravity/brain/d137f3ea-7117-4d37-82d1-369a82bed0cb/scratch";

test.describe("Truth Desire End-to-End Platform Verification", () => {
  test("all core flows: noir pink theme, explore 30 tests, optional sign-in modal, BDSM & Kink tests, Test 1 + PDF export, compatibility, profile, couples, community, settings & admin", async ({
    page,
    browser,
  }, testInfo) => {
    test.setTimeout(150_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // 1. Homepage: Obsidian Noir & Pink Default + Specimen Switcher + Light/Dark Toggle
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("heading", { name: /Truth, desire/i })).toBeVisible();

    const overflowHome = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(overflowHome).toBe(false);

    if (testInfo.project.name === "Mobile") {
      await page.screenshot({ path: path.join(SHOT_DIR, "mobile-home.png"), fullPage: true });
    }
    if (testInfo.project.name === "Tablet") {
      await page.screenshot({ path: path.join(SHOT_DIR, "tablet-home.png"), fullPage: false });
    }

    if (testInfo.project.name === "Desktop Chrome") {
      await page.screenshot({ path: path.join(SHOT_DIR, "desktop-dark-home.png"), fullPage: false });

      // Exercise Interactive Report Folio specimen tabs
      await page.getByRole("tab", { name: /Desire vs\. Experience/i }).click();
      await expect(page.getByText(/Untapped Desire Zone/i)).toBeVisible();
      await page.getByRole("tab", { name: /BDSM & Kink Reveal/i }).click();
      await expect(page.getByText(/94% Polarity Fit/i)).toBeVisible();
      await page.getByRole("button", { name: "Keep Private", exact: true }).click();
      await expect(page.getByText(/Concealed from Partner View/i).first()).toBeVisible();
      await page.getByRole("tab", { name: /Preference Radar/i }).click();

      // Test Optional Firebase Sign-In Modal without gating guest flows
      const signInBtn = page.getByRole("button", { name: "Sign In", exact: true });
      await expect(signInBtn).toBeVisible();
      await signInBtn.click();
      await expect(page.getByRole("heading", { name: /Sign in to Truth Desire/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
      await page.screenshot({ path: path.join(SHOT_DIR, "desktop-signin-modal.png"), fullPage: false });
      await page.getByRole("button", { name: /Close sign-in dialog/i }).click();
      await expect(page.getByRole("heading", { name: /Sign in to Truth Desire/i })).not.toBeVisible();
    }

    // Toggle theme (Dark default -> Light -> Dark)
    const themeBtn = page.getByRole("button", { name: /Switch to (dark|light) theme/i });
    await themeBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    if (testInfo.project.name === "Desktop Chrome") {
      await page.screenshot({ path: path.join(SHOT_DIR, "desktop-light-home.png"), fullPage: true });
    }
    await themeBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Interactive Compatibility Matcher Demo
    await page.getByRole("button", { name: "Marks firm boundary" }).click();
    await expect(page.getByText(/Boundary Protected/i)).toBeVisible();

    // Responsive check across /explore & /assessments on Mobile & Tablet
    if (testInfo.project.name !== "Desktop Chrome") {
      await page.goto("/explore");
      await expect(page.getByRole("heading", { name: /Explore Assessments \(30\)/i })).toBeVisible();
      await page.screenshot({
        path: path.join(SHOT_DIR, `${testInfo.project.name.toLowerCase()}-explore.png`),
        fullPage: false,
      });
      const exploreOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(exploreOverflow).toBe(false);

      await page.goto("/assessments");
      await expect(page.getByRole("heading", { name: "Assessment Library" })).toBeVisible();
      const libOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(libOverflow).toBe(false);
      expect(errors).toEqual([]);
      return;
    }

    // 2. Explore 30 Tests Catalog & Search Filter (incl. BDSM & Kink)
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: /Explore Assessments \(30\)/i })).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-explore.png"), fullPage: false });

    await page.getByPlaceholder(/Search by topic/i).fill("BDSM");
    await expect(
      page.getByRole("heading", { name: /BDSM Roles, Power Exchange & Dynamics Test/i })
    ).toBeVisible();
    await page.getByPlaceholder(/Search by topic/i).fill("Kink & Fetish");
    await expect(page.getByRole("heading", { name: /Kink & Fetish Exploration Map/i })).toBeVisible();
    await page.getByPlaceholder(/Search by topic/i).fill("Bucket List");
    await expect(page.getByRole("heading", { name: /Couples Bucket List Matcher/i })).toBeVisible();
    await page.getByPlaceholder(/Search by topic/i).fill("");

    // 3. Take New Test 29: BDSM Roles, Power Exchange & Dynamics Test (Quick mode)
    await page.goto("/assess/bdsm-power-dynamics-test?mode=quick");
    await page.getByLabel(/confirm I am at least/i).check();
    await page.getByLabel(/understand my responses are private/i).check();
    await page.getByRole("button", { name: /Begin Questions/i }).click();

    for (let stepIdx = 0; stepIdx < 12; stepIdx++) {
      const reviewHeading = page.getByRole("heading", { name: /Review & Refine Your Answers/i });
      if (await reviewHeading.isVisible().catch(() => false)) break;

      const slider = page.locator('input[type="range"]');
      const sixBtn = page.getByRole("button", { name: "6", exact: true });
      const choiceBtn = page.getByRole("button", { name: /Slide the blindfold/i });

      if (await slider.isVisible().catch(() => false)) {
        await slider.fill("85");
      } else if (await sixBtn.isVisible().catch(() => false)) {
        await sixBtn.click();
      } else if (await choiceBtn.isVisible().catch(() => false)) {
        await choiceBtn.click();
        await page.screenshot({ path: path.join(SHOT_DIR, "desktop-bdsm.png"), fullPage: false });
      }
      await page.getByRole("button", { name: /^(Next|Review & Finish)$/ }).click();
    }

    await expect(page.getByRole("heading", { name: /Review & Refine Your Answers/i })).toBeVisible();
    await page.getByRole("button", { name: /Complete & View Results/i }).click();
    await expect(page).toHaveURL(/\/results\/sub_/, { timeout: 15000 });

    // 4. Take New Test 30: Kink & Fetish Exploration Map (Quick mode + Zero-Leak Privacy Rules)
    await page.goto("/assess/kink-exploration-map?mode=quick");
    await page.getByLabel(/confirm I am at least/i).check();
    await page.getByLabel(/understand my responses are private/i).check();
    await page.getByRole("button", { name: /Begin Questions/i }).click();

    await expect(page.getByText(/Partner Privacy Rule/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Reveal only if mutual/i })).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-kink.png"), fullPage: false });

    for (let stepIdx = 0; stepIdx < 14; stepIdx++) {
      const reviewHeading = page.getByRole("heading", { name: /Review & Refine Your Answers/i });
      if (await reviewHeading.isVisible().catch(() => false)) break;
      await page.getByRole("button", { name: /Very interested/i }).click();
      await page.getByRole("button", { name: /^(Next|Review & Finish)$/ }).click();
    }
    await expect(page.getByRole("heading", { name: /Review & Refine Your Answers/i })).toBeVisible();
    await page.getByRole("button", { name: /Complete & View Results/i }).click();
    await expect(page).toHaveURL(/\/results\/sub_/, { timeout: 15000 });

    // 5. Assessment Library -> Quick Discovery Assessment (Test 1 Flagship)
    await page.goto("/assessments");
    await expect(page.getByRole("heading", { name: "Assessment Library" })).toBeVisible();
    await page.getByRole("link", { name: /Start Quick Discovery/i }).first().click();
    await expect(page).toHaveURL(/\/assess\/intimacy-partner-preferences\?mode=quick/, {
      timeout: 15000,
    });

    await page.getByLabel(/confirm I am at least/i).check();
    await page.getByLabel(/understand my responses are private/i).check();
    await page.getByRole("button", { name: /Begin Questions/i }).click();

    // Q1: Strongly like + experience frequency Rarely + Essential
    await page.getByRole("button", { name: /5\s*Strongly like/i }).click();
    await page.getByRole("button", { name: /Add past experience frequency/i }).click();
    await page.getByRole("button", { name: "Rarely", exact: true }).click();
    await page.getByRole("button", { name: "Essential to me" }).click();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-quiz-question.png"), fullPage: false });
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Q2: Like + Often
    await page.getByRole("button", { name: /4\s*Like/i }).click();
    const expToggleQ2 = page.getByRole("button", { name: /Add past experience frequency/i });
    if (await expToggleQ2.isVisible().catch(() => false)) {
      await expToggleQ2.click();
    }
    await page.getByRole("button", { name: "Often", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Q3: Curious
    await page.getByRole("button", { name: "Curious about trying" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Q4: Skip
    await page.getByRole("button", { name: "Skip question" }).click();

    // Q5: Firm boundary
    await page.getByRole("button", { name: /Not something I want to do/i }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Q6..Q14
    for (let i = 0; i < 9; i++) {
      await page.getByRole("button", { name: /5\s*Strongly like/i }).click();
      if (i === 0 || i === 1) {
        const expToggleLoop = page.getByRole("button", { name: /Add past experience frequency/i });
        if (await expToggleLoop.isVisible().catch(() => false)) {
          await expToggleLoop.click();
        }
        await page.getByRole("button", { name: i === 0 ? "Never" : "Sometimes", exact: true }).click();
      }
      await page.getByRole("button", { name: /^(Next|Review & Finish)$/ }).click();
    }

    await expect(page.getByRole("heading", { name: /Review & Refine Your Answers/i })).toBeVisible();
    await page.getByRole("button", { name: /Complete & View Results/i }).click();

    // 6. Personal Results Dashboard + What You Are Into + Interactive Q&A Trace + Real Binary PDF Export API
    await expect(page).toHaveURL(/\/results\/sub_/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "What You Are Into" })).toBeVisible();
    await expect(page.getByText(/Interactive Preference Radar/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "How Your Scores Connect" })).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-results.png"), fullPage: false });

    // Exercise "Inspect answer" jump into Full Question & Answer Breakdown
    const inspectBtn = page.getByRole("button", { name: /Inspect answer/i }).first();
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();
    await expect(page.locator('[id^="qa-row-"]').first()).toBeVisible();

    const resultIdMatch = page.url().match(/\/results\/(sub_[a-zA-Z0-9]+)/);
    expect(resultIdMatch).not.toBeNull();
    const pdfRes = await page.request.get(`/api/results/${resultIdMatch![1]}/export?format=pdf`);
    expect(pdfRes.status()).toBe(200);
    expect(pdfRes.headers()["content-type"]).toContain("application/pdf");
    const pdfBuffer = await pdfRes.body();
    expect(pdfBuffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");

    // Tab: Desire vs. Experience Scatterplot
    await page.getByRole("tab", { name: /Desire vs\. Experience/i }).click();
    await expect(page.getByText(/Your Personal Desire vs\. Experience Map/i)).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-scatterplot.png"), fullPage: false });
    await page.getByRole("button", { name: /Accessible Table/i }).click();
    await expect(page.locator("table")).toBeVisible();

    // Tab: Compare With Other Women
    await page.getByRole("tab", { name: /Compare With Other Women/i }).click();
    await expect(page.getByText(/Not enough community responses yet/i)).toBeVisible();
    await page.getByLabel(/Preview comparison charts using Synthetic Demo Data/i).check();
    await expect(page.getByText(/SYNTHETIC DEMO DATA ACTIVE/i)).toBeVisible();

    // Tab: Ideal Partner Analysis
    await page.getByRole("tab", { name: /Ideal Partner Analysis/i }).click();
    await expect(page.getByText(/Your Ideal Partner's Characteristics/i)).toBeVisible();

    // 7. Create Partner Invitation -> Separate Context -> Compatibility Report
    await page.getByRole("button", { name: /Compare With Partner/i }).click();
    await page.getByPlaceholder("First name or nickname").fill("Claire");
    await page.getByRole("button", { name: /Create Private Invitation/i }).click();
    const inviteLinkEl = page.locator("p").filter({ hasText: "/invite/" });
    await expect(inviteLinkEl).toBeVisible();
    const inviteLinkText = await inviteLinkEl.textContent();
    const invitePath = new URL(inviteLinkText!.trim()).pathname;
    await page.getByRole("button", { name: "Close modal" }).click();

    const partnerContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const partnerPage = await partnerContext.newPage();
    await partnerPage.goto(invitePath);
    await expect(partnerPage.getByText(/Claire invited you/i)).toBeVisible();
    await partnerPage.getByRole("button", { name: /Continue to Consent/i }).click();
    await partnerPage.getByLabel(/confirm I am at least/i).check();
    await partnerPage.getByLabel(/understand my responses are private/i).check();
    await partnerPage.getByRole("button", { name: /Begin Questions/i }).click();

    for (let i = 0; i < 14; i++) {
      const enjBtn = partnerPage.getByRole("button", { name: /Enthusiastically enjoy/i });
      if (await enjBtn.isVisible().catch(() => false)) {
        await enjBtn.click();
      } else {
        await partnerPage.getByRole("button", { name: /5\s*Strongly like/i }).click();
      }
      await partnerPage.getByRole("button", { name: /^(Next|Review & Finish)$/ }).click();
    }

    await partnerPage.getByRole("button", { name: /Generate Compatibility Report/i }).click();
    await expect(partnerPage).toHaveURL(/\/compatibility\/cmp_/, { timeout: 15000 });
    await expect(partnerPage.getByText(/Shared Compatibility Overview/i)).toBeVisible();
    await expect(partnerPage.getByText(/Profile Overlay Radar/i)).toBeVisible();
    await partnerPage.waitForTimeout(650);
    await partnerPage.screenshot({
      path: path.join(SHOT_DIR, "desktop-compatibility.png"),
      fullPage: false,
    });
    await partnerContext.close();

    // 8. Take Attachment Style Discovery (Quick 12 items) -> Unlock Cross-Test Discovery Profile
    await page.goto("/assess/attachment-style-discovery?mode=quick");
    await page.getByLabel(/confirm I am at least/i).check();
    await page.getByLabel(/understand my responses are private/i).check();
    await page.getByRole("button", { name: /Begin Questions/i }).click();
    for (let i = 0; i < 12; i++) {
      await page.getByRole("button", { name: /^3\b/ }).first().click();
      await page.getByRole("button", { name: /^(Next|Review & Finish)$/ }).click();
    }
    await page.getByRole("button", { name: /Complete & View Results/i }).click();
    await expect(page).toHaveURL(/\/results\/sub_/, { timeout: 15000 });
    await expect(page.getByText(/Attachment Dynamics Map/i)).toBeVisible();

    // 9. Verify Unified /profile, /couples, /results, /community, /settings
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /Your Discovery Profile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /What You Are Into Across Tests/i })).toBeVisible();
    await expect(page.getByText(/Traceable Cross-Test Insights/i)).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-profile.png"), fullPage: false });

    await page.goto("/couples");
    await expect(page.getByRole("heading", { name: /Couples & Partner Space/i })).toBeVisible();
    await expect(page.getByText(/Shared Compatibility Reports \(1\)/i)).toBeVisible();

    await page.goto("/results");
    await expect(page.getByRole("heading", { name: /My Saved Results/i })).toBeVisible();

    await page.goto("/community");
    await expect(page.getByRole("heading", { name: /Anonymous Community Insights/i })).toBeVisible();
    await expect(page.getByText(/Not enough community responses yet/i)).toBeVisible();

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /Account & Privacy Settings/i })).toBeVisible();

    // 10. Legacy Personal Dashboard & Complete Cleanup
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Personal Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Completed Assessments" })).toBeVisible();
    await page.getByRole("button", { name: /Delete All Stored Data/i }).click();
    await expect(page.getByText(/No completed assessments stored/i)).toBeVisible();

    // 11. Protected Admin / Studio Auth Gate + Reference Chart Editorial Queue + Simulator
    const unauthStudio = await page.request.get("/api/studio");
    expect(unauthStudio.status()).toBe(401);

    await page.goto("/studio");
    await expect(page.getByLabel(/Administrator Passphrase/i)).toBeVisible();
    await page.getByLabel(/Administrator Passphrase/i).fill("between-us-playwright-admin-key");
    await page.getByRole("button", { name: /Unlock Admin Workspace/i }).click();
    await expect(page.getByRole("heading", { name: /Assessment Studio/i })).toBeVisible();
    await page.getByRole("tab", { name: /Reference Chart Editorial Queue/i }).click();
    await expect(page.getByText(/\[OBSCURED\]/).first()).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Admin & Scoring Console/i })).toBeVisible();
    await page.getByRole("tab", { name: /Scoring Tester/i }).click();
    await page.getByRole("button", { name: /Run Simulator/i }).click();
    await expect(page.getByText(/Computed Archetype/i)).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, "desktop-admin.png"), fullPage: false });

    expect(errors).toEqual([]);
  });
});
