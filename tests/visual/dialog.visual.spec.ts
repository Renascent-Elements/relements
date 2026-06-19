import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("dialog closed visual snapshot", async ({ page }) => {
  await page.goto("./dialog.html");
  await expect(page.getByTestId("modal")).toHaveScreenshot("dialog-closed.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("dialog open visual snapshot", async ({ page }) => {
  await page.goto("./dialog.html");
  await page.locator("#open-modal").click();
  await expect(page.locator("#modal")).toBeVisible();
  await expect(page.locator("#modal")).toHaveScreenshot("dialog-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("dialog visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("dialog open dark visual snapshot", async ({ page }) => {
    await page.goto("./dialog.html");
    await page.locator("#open-modal").click();
    await expect(page.locator("#modal")).toBeVisible();
    await expect(page.locator("#modal")).toHaveScreenshot("dialog-open-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

// Guards the bg-subtle dark-mode trap: the close-button hover (shared by drawer)
// must stay visible in dark (bg-subtle collapses to surface; bg-muted does not).
test.describe("dialog visual — dark hover", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("close-button hover stays visible in dark", async ({ page }) => {
    await page.goto("./dialog.html");
    await page.locator("#open-modal").click();
    await expect(page.locator("#modal")).toBeVisible();
    await page.locator("#modal .re-dialog__close").hover();
    await expect(page.locator("#modal")).toHaveScreenshot("dialog-close-hover-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
