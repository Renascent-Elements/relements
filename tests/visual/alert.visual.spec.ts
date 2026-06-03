import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("alert variants visual snapshot", async ({ page }) => {
  await page.goto("./alert.html");
  const variants = page.getByTestId("variants");
  await expect(variants).toHaveScreenshot("alert-variants.png", {
    maxDiffPixelRatio: 0.01,
  });
});
