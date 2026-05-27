import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("toast triggers visual snapshot", async ({ page }) => {
  await page.goto("./toast.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("toast-triggers.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("toast with multiple tones visual snapshot", async ({ page }) => {
  await page.goto("./toast.html");
  await page.locator("#t-success").click();
  await page.locator("#t-danger").click();
  await page.locator("#t-warning").click();
  await expect(page.locator(".re-toast-region")).toHaveScreenshot("toast-region.png", {
    maxDiffPixelRatio: 0.01,
  });
});
