import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["basic", "required", "invalid", "inline"] as const) {
  test(`field ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./field.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`field-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
