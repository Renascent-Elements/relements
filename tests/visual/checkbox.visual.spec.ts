import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["basic", "indeterminate", "states"] as const) {
  test(`checkbox ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./checkbox.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`checkbox-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
