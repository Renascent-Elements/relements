import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 1000 } });

for (const section of ["basic", "sizes", "states"] as const) {
  test(`input ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./input.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`input-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
