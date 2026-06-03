import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("accordion visual snapshot", async ({ page }) => {
  await page.goto("./accordion.html");
  const accordion = page.getByTestId("accordion");
  await expect(accordion).toHaveScreenshot("accordion.png", {
    maxDiffPixelRatio: 0.01,
  });
});
