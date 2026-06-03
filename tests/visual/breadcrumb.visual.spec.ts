import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("breadcrumb visual snapshot", async ({ page }) => {
  await page.goto("./breadcrumb.html");
  const breadcrumb = page.getByTestId("breadcrumb");
  await expect(breadcrumb).toHaveScreenshot("breadcrumb.png", {
    maxDiffPixelRatio: 0.01,
  });
});
