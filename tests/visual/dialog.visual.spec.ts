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
