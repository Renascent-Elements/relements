import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("renascent theme dark wrapper visual snapshot", async ({ page }) => {
  await page.goto("./theme-renascent.html");
  const dark = page.getByTestId("theme-dark");
  await expect(dark).toHaveScreenshot("theme-renascent-dark.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("renascent theme light wrapper visual snapshot", async ({ page }) => {
  await page.goto("./theme-renascent.html");
  const light = page.getByTestId("theme-light");
  await expect(light).toHaveScreenshot("theme-renascent-light.png", {
    maxDiffPixelRatio: 0.01,
  });
});
