import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("button variants visual snapshot", async ({ page }) => {
  await page.goto("./button.html");
  const variants = page.getByTestId("variants");
  await expect(variants).toHaveScreenshot("button-variants.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("button sizes visual snapshot", async ({ page }) => {
  await page.goto("./button.html");
  const sizes = page.getByTestId("sizes");
  await expect(sizes).toHaveScreenshot("button-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("button states visual snapshot", async ({ page }) => {
  await page.goto("./button.html");
  const states = page.getByTestId("states");
  await expect(states).toHaveScreenshot("button-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});

// Guards the bg-subtle dark-mode trap: a ghost button's hover fill must stay
// visible in dark (bg-subtle collapses to surface; bg-muted does not).
test.describe("button visual — dark hover", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("ghost button hover stays visible in dark", async ({ page }) => {
    await page.goto("./button.html");
    const variants = page.getByTestId("variants");
    await variants.getByRole("button", { name: "Ghost" }).hover();
    await expect(variants).toHaveScreenshot("button-variants-hover-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
