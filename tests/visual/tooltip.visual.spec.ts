import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("tooltip forced-open visual snapshot", async ({ page }) => {
  await page.goto("./tooltip.html");
  const open = page.getByTestId("open");
  await expect(open).toHaveScreenshot("tooltip-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
