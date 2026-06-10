import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("slider sizes visual snapshot", async ({ page }) => {
  await page.goto("./slider.html");
  const sizes = page.getByTestId("sizes");
  await expect(sizes).toHaveScreenshot("slider-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("slider states visual snapshot", async ({ page }) => {
  await page.goto("./slider.html");
  const states = page.getByTestId("states");
  await expect(states).toHaveScreenshot("slider-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});
