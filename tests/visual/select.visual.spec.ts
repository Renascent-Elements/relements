import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 1000 } });

for (const section of ["basic", "optgroup", "multiple", "states"] as const) {
  test(`select ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./select.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`select-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
