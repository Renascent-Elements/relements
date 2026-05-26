import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("re-menu closed visual snapshot", async ({ page }) => {
  await page.goto("./re-menu.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-menu-closed.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("re-menu open visual snapshot", async ({ page }) => {
  await page.goto("./re-menu.html");
  await page.locator("#rm-1-btn").click();
  await expect(page.locator("#rm-1-panel")).toBeVisible();
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-menu-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
