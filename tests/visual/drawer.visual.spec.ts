import { expect, test } from "@playwright/test";

// reduce motion → the slide collapses to instant (reset.css), so the open-state
// snapshot is deterministic.
test.use({ colorScheme: "light", reducedMotion: "reduce", viewport: { width: 1024, height: 800 } });

test("drawer end open visual snapshot", async ({ page }) => {
  await page.goto("./drawer.html");
  await page.getByRole("button", { name: "End", exact: true }).click();
  await expect(page.locator("#drawer-end")).toBeVisible();
  await expect(page).toHaveScreenshot("drawer-end-open.png", { maxDiffPixelRatio: 0.01 });
});

test("drawer bottom open visual snapshot", async ({ page }) => {
  await page.goto("./drawer.html");
  await page.getByRole("button", { name: "Bottom", exact: true }).click();
  await expect(page.locator("#drawer-bottom")).toBeVisible();
  await expect(page).toHaveScreenshot("drawer-bottom-open.png", { maxDiffPixelRatio: 0.01 });
});
