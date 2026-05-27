import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["vertical", "horizontal", "states"] as const) {
  test(`radio ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./radio.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`radio-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
