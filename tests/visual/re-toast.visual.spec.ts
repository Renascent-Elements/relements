import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("re-toast triggers visual snapshot", async ({ page }) => {
  await page.goto("./re-toast.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-toast-triggers.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("re-toast with toasts visual snapshot", async ({ page }) => {
  await page.goto("./re-toast.html");
  await page.locator("#rt-success").click();
  await page.locator("#rt-danger").click();
  await expect(page.locator("#toaster")).toHaveScreenshot("re-toast-region.png", {
    maxDiffPixelRatio: 0.01,
  });
});
