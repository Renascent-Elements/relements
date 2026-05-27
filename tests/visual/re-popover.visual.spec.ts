import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("re-popover trigger visual snapshot", async ({ page }) => {
  await page.goto("./re-popover.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-popover-trigger.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("re-popover open visual snapshot", async ({ page }) => {
  await page.goto("./re-popover.html");
  await page.locator("#rp-1-btn").click();
  await expect(page.locator("#rp-1")).toBeVisible();
  await expect(page.locator("#rp-1")).toHaveScreenshot("re-popover-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
