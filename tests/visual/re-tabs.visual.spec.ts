import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("re-tabs initial visual snapshot", async ({ page }) => {
  await page.goto("./re-tabs.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-tabs-initial.png", {
    maxDiffPixelRatio: 0.01,
  });
});
