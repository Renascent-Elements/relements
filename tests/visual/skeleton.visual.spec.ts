import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("skeleton card visual snapshot", async ({ page }) => {
  await page.goto("./skeleton.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("card")).toHaveScreenshot("skeleton-card.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("skeleton block visual snapshot", async ({ page }) => {
  await page.goto("./skeleton.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("block")).toHaveScreenshot("skeleton-block.png", {
    maxDiffPixelRatio: 0.01,
  });
});
