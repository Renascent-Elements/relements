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

test("table sticky-header visual snapshot", async ({ page }) => {
  await page.goto("./table.html");
  // Scroll the wrapper a fixed amount so the sticky <thead> stays pinned at the
  // top while rows scroll under it (a fixed scrollTop keeps the snapshot stable).
  await page.locator('[data-testid="sticky"] .re-table-wrap').evaluate((el) => (el.scrollTop = 80));
  await expect(page.getByTestId("sticky")).toHaveScreenshot("table-sticky.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("table visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("sticky zebra table renders dark tokens", async ({ page }) => {
    await page.goto("./table.html");
    // Mirror the light sticky test: pin the sticky <thead> with a fixed scrollTop
    // so its background, the zebra row striping, and cell borders all render in dark.
    await page
      .locator('[data-testid="sticky"] .re-table-wrap')
      .evaluate((el) => (el.scrollTop = 80));
    await expect(page.getByTestId("sticky")).toHaveScreenshot("table-sticky-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
