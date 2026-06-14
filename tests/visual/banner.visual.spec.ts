import { expect, test } from "@playwright/test";

test.describe("banner visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("variants (four tones, subtle)", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("variants")).toHaveScreenshot("banner-variants.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("solid emphasis (four *-700 fills + white)", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("emphasis")).toHaveScreenshot("banner-emphasis.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("centered measure", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("align-center")).toHaveScreenshot("banner-align-center.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("RTL (row order + dismiss flipped)", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("rtl")).toHaveScreenshot("banner-rtl.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("banner visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("solid emphasis (dark) — *-700 fills + white stay stable", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("emphasis")).toHaveScreenshot("banner-emphasis-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("subtle variants (dark) — surface/border token remap", async ({ page }) => {
    await page.goto("./banner.html");
    await expect(page.getByTestId("variants")).toHaveScreenshot("banner-variants-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
