import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("menu-button closed visual snapshot", async ({ page }) => {
  await page.goto("./menu-button.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("menu-button-closed.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("menu-button open visual snapshot", async ({ page }) => {
  await page.goto("./menu-button.html");
  await page.locator("#mb-1-btn").click();
  await expect(page.locator("#mb-1-panel")).toBeVisible();
  await expect(page.getByTestId("basic")).toHaveScreenshot("menu-button-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
