import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("badge variants visual snapshot", async ({ page }) => {
  await page.goto("./badge.html");
  const variants = page.getByTestId("variants");
  await expect(variants).toHaveScreenshot("badge-variants.png", {
    maxDiffPixelRatio: 0.01,
  });
});
