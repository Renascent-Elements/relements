import { expect, test } from "@playwright/test";

test.describe("indicator visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("count + dot", async ({ page }) => {
    await page.goto("./indicator.html");
    await expect(page.getByTestId("count")).toHaveScreenshot("indicator-count.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("dot")).toHaveScreenshot("indicator-dot.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("tones + position", async ({ page }) => {
    await page.goto("./indicator.html");
    await expect(page.getByTestId("tones")).toHaveScreenshot("indicator-tones.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("position")).toHaveScreenshot("indicator-position.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("indicator visual, dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("tones (dark)", async ({ page }) => {
    await page.goto("./indicator.html");
    await expect(page.getByTestId("tones")).toHaveScreenshot("indicator-tones-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
