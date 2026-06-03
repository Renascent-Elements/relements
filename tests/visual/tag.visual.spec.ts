import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("tag variants visual snapshot", async ({ page }) => {
  await page.goto("./tag.html");
  const variants = page.getByTestId("variants");
  await expect(variants).toHaveScreenshot("tag-variants.png", {
    maxDiffPixelRatio: 0.01,
  });
});
