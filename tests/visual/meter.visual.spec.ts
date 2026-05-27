import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["ranges", "sizes"] as const) {
  test(`meter ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./meter.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`meter-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
