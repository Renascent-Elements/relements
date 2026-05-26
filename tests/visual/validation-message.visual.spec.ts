import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 1000 } });

for (const section of ["error", "success", "hint", "warning"] as const) {
  test(`validation-message ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./validation-message.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(
      `validation-message-${section}.png`,
      { maxDiffPixelRatio: 0.01 },
    );
  });
}
