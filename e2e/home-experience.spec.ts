import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("a concise homepage has a rotatable, adjustable profile and pausable living background", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("main section")).toHaveCount(2);
  await expect(page.locator("main .test-card")).toHaveCount(3);
  const stage = page.getByRole("group", { name: "Rotate 3D stats graph" });
  await expect(stage.getByRole("img")).toBeVisible();
  await expect(stage.locator("polygon[data-series=current]")).toHaveCount(8);
  await expect(page.locator(".stat-axis-buttons button")).toHaveCount(6);
  const before = await stage.getAttribute("data-yaw");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await expect(stage).not.toHaveAttribute("data-yaw", before!);
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(stage).toHaveAttribute("data-yaw", before!);
  const bounds = (await stage.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.35,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.65,
    bounds.y + bounds.height * 0.55,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(stage).not.toHaveAttribute("data-yaw", before!);
  await page.getByRole("slider", { name: "Example category score" }).fill("40");
  await expect(page.locator(".orbit-score-control output")).toHaveText(
    "40 / 100",
  );
  await page
    .getByRole("button", { name: "Hide comparison", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Compare profiles", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".living-backdrop")).toHaveAttribute(
    "data-moving",
    "false",
  );
  await page.getByRole("button", { name: "Turn motion on" }).click();
  await expect(page.locator(".living-backdrop")).toHaveAttribute(
    "data-moving",
    "true",
  );
  const backgroundPixels = () =>
    page.locator(".living-backdrop").evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 2166136261;
      for (let index = 0; index < pixels.length; index += 97)
        hash = Math.imul(hash ^ pixels[index], 16777619);
      return hash;
    });
  const firstFrame = await backgroundPixels();
  await expect.poll(backgroundPixels).not.toBe(firstFrame);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.locator(".living-backdrop")).toHaveAttribute(
    "data-moving",
    "false",
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("home-interactive.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("homepage visitors can open registration, show their password and return to sign-in", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".home-hero-copy")
    .getByRole("button", { name: "Create account" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();
  await expect(
    dialog.getByLabel("Email address", { exact: true }),
  ).toBeVisible();
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("Example-password-123");
  await dialog.getByRole("button", { name: "Show password" }).click();
  await expect(dialog.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await dialog.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: /Sign in to/ }),
  ).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
