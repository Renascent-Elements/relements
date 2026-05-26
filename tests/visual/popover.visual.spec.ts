import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("popover trigger visual snapshot", async ({ page }) => {
  await page.goto("./popover.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("popover-trigger.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("popover open visual snapshot", async ({ page }) => {
  await page.goto("./popover.html");
  await page.locator("#pop-1-btn").click();
  await expect(page.locator("#pop-1")).toBeVisible();
  await expect(page.locator("#pop-1")).toHaveScreenshot("popover-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
