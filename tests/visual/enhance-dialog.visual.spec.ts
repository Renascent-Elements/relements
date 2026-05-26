import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("enhance-dialog trigger visual snapshot", async ({ page }) => {
  await page.goto("./enhance-dialog.html");
  await expect(page.getByTestId("trigger")).toHaveScreenshot("enhance-dialog-trigger.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("enhance-dialog open visual snapshot", async ({ page }) => {
  await page.goto("./enhance-dialog.html");
  await page.locator("#ed-open").click();
  await expect(page.locator("#ed-confirm")).toBeVisible();
  await expect(page.locator("#ed-confirm")).toHaveScreenshot("enhance-dialog-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
