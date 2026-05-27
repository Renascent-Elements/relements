import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const section of ["basic", "sizes", "states"] as const) {
  test(`textarea ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./textarea.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`textarea-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
