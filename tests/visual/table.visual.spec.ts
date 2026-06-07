import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("table basic visual snapshot", async ({ page }) => {
  await page.goto("./table.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("table-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("table zebra visual snapshot", async ({ page }) => {
  await page.goto("./table.html");
  await expect(page.getByTestId("zebra")).toHaveScreenshot("table-zebra.png", {
    maxDiffPixelRatio: 0.01,
  });
});
