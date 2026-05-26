import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

const variants = ["default", "muted", "subtle", "external"] as const;

for (const variant of variants) {
  test(`link ${variant} variant visual snapshot`, async ({ page }) => {
    await page.goto("./link.html");
    const section = page.getByTestId(variant);
    await expect(section).toHaveScreenshot(`link-${variant}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
