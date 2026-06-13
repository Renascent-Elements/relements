import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("rating interactive (3 selected) visual snapshot", async ({ page }) => {
  await page.goto("./rating.html");
  await page.getByTestId("basic").locator(".re-rating").getByLabel("3 stars").check();
  await expect(page.getByTestId("basic")).toHaveScreenshot("rating-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("rating sizes visual snapshot", async ({ page }) => {
  await page.goto("./rating.html");
  await expect(page.getByTestId("sizes")).toHaveScreenshot("rating-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("rating display visual snapshot", async ({ page }) => {
  await page.goto("./rating.html");
  await expect(page.getByTestId("display")).toHaveScreenshot("rating-display.png", {
    maxDiffPixelRatio: 0.01,
  });
});
