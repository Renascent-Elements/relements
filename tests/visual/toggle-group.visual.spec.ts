import { expect, test } from "@playwright/test";

test.describe("toggle-group visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("basic + icon-only", async ({ page }) => {
    await page.goto("./toggle-group.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("toggle-group-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("icons")).toHaveScreenshot("toggle-group-icons.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("sizes + disabled", async ({ page }) => {
    await page.goto("./toggle-group.html");
    await expect(page.getByTestId("sizes")).toHaveScreenshot("toggle-group-sizes.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("disabled")).toHaveScreenshot("toggle-group-disabled.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("toggle-group visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("basic (dark)", async ({ page }) => {
    await page.goto("./toggle-group.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("toggle-group-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
