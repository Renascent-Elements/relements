import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("segmented basic visual snapshot", async ({ page }) => {
  await page.goto("./segmented.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("segmented-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("segmented sizes visual snapshot", async ({ page }) => {
  await page.goto("./segmented.html");
  await expect(page.getByTestId("sizes")).toHaveScreenshot("segmented-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});
