import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const region of ["stacked", "horizontal", "bordered"]) {
  test(`description-list ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./description-list.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`description-list-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
