import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("code block visual snapshot", async ({ page }) => {
  await page.goto("./code.html");
  const block = page.getByTestId("block");
  await expect(block).toHaveScreenshot("code-block.png", {
    maxDiffPixelRatio: 0.01,
  });
});
