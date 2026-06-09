import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("separator orientations visual snapshot", async ({ page }) => {
  await page.goto("./separator.html");
  const orientations = page.getByTestId("orientations");
  await expect(orientations).toHaveScreenshot("separator-orientations.png", {
    maxDiffPixelRatio: 0.01,
  });
});
