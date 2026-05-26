import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 1000 } });

for (const section of ["vertical", "horizontal", "disabled"] as const) {
  test(`field-group ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./field-group.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`field-group-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
