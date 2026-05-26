import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("enhance-dismissible banner visual snapshot", async ({ page }) => {
  await page.goto("./enhance-dismissible.html");
  await expect(page.getByTestId("banner")).toHaveScreenshot("enhance-dismissible-banner.png", {
    maxDiffPixelRatio: 0.01,
  });
});
