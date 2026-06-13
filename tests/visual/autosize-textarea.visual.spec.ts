import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const region of ["basic", "prefilled", "capped"]) {
  test(`autosize-textarea ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`autosize-textarea-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}
