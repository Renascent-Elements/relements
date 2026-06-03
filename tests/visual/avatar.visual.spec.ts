import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("avatar sizes visual snapshot", async ({ page }) => {
  await page.goto("./avatar.html");
  const sizes = page.getByTestId("sizes");
  await expect(sizes).toHaveScreenshot("avatar-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});
