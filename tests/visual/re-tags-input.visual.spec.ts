import { expect, test } from "@playwright/test";

test.describe("re-tags-input visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("re-tags-input basic (with chips) snapshot", async ({ page }) => {
    await page.goto("./re-tags-input.html");
    await expect(page.getByTestId("basic").locator(".re-tags-input")).toBeVisible();
    await expect(page.getByTestId("basic")).toHaveScreenshot("re-tags-input-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("re-tags-input visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("re-tags-input basic in dark", async ({ page }) => {
    await page.goto("./re-tags-input.html");
    await expect(page.getByTestId("basic").locator(".re-tags-input")).toBeVisible();
    await expect(page.getByTestId("basic")).toHaveScreenshot("re-tags-input-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
