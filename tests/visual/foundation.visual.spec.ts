import { expect, test } from "@playwright/test";

test.describe("Foundation visual snapshots", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 768 } });

  test("foundation page (light)", async ({ page }) => {
    await page.goto("./foundation.html");
    await expect(page).toHaveScreenshot("foundation-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Foundation visual snapshots — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 768 } });

  test("foundation page (dark)", async ({ page }) => {
    await page.goto("./foundation.html");
    await expect(page).toHaveScreenshot("foundation-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
