import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("kbd keys visual snapshot", async ({ page }) => {
  await page.goto("./kbd.html");
  const keys = page.getByTestId("keys");
  await expect(keys).toHaveScreenshot("kbd-keys.png", {
    maxDiffPixelRatio: 0.01,
  });
});
