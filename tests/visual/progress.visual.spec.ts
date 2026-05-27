import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["determinate", "sizes"] as const) {
  test(`progress ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./progress.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`progress-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
