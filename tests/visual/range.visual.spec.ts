import { expect, test } from "@playwright/test";

test.describe("range visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("basic", async ({ page }) => {
    await page.goto("./range.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("range-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("sizes", async ({ page }) => {
    await page.goto("./range.html");
    await expect(page.getByTestId("sizes")).toHaveScreenshot("range-sizes.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("disabled", async ({ page }) => {
    await page.goto("./range.html");
    await expect(page.getByTestId("disabled")).toHaveScreenshot("range-disabled.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("range visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("basic (dark)", async ({ page }) => {
    await page.goto("./range.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("range-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
