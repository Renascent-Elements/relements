import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

test("multiselect basic (closed) visual snapshot", async ({ page }) => {
  await page.goto("./multiselect.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("multiselect-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("multiselect open panel visual snapshot", async ({ page }) => {
  await page.goto("./multiselect.html");
  await expect(page.getByTestId("open")).toHaveScreenshot("multiselect-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("multiselect visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });
  test("open panel in dark", async ({ page }) => {
    await page.goto("./multiselect.html");
    await expect(page.getByTestId("open")).toHaveScreenshot("multiselect-open-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
