import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const section of ["default", "plain"] as const) {
  test(`disclosure ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./disclosure.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`disclosure-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
