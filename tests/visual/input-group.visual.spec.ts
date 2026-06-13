import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("input-group affixes visual snapshot", async ({ page }) => {
  await page.goto("./input-group.html");
  await expect(page.getByTestId("affixes")).toHaveScreenshot("input-group-affixes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("input-group attached button visual snapshot", async ({ page }) => {
  await page.goto("./input-group.html");
  await expect(page.getByTestId("button")).toHaveScreenshot("input-group-button.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("input-group states visual snapshot", async ({ page }) => {
  await page.goto("./input-group.html");
  await expect(page.getByTestId("states")).toHaveScreenshot("input-group-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});
