import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("tabs initial visual snapshot", async ({ page }) => {
  await page.goto("./tabs.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("tabs-initial.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("tabs after switching visual snapshot", async ({ page }) => {
  await page.goto("./tabs.html");
  await page.locator("#t-security").click();
  await expect(page.getByTestId("basic")).toHaveScreenshot("tabs-switched.png", {
    maxDiffPixelRatio: 0.01,
  });
});
