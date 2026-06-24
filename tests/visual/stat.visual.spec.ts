import { expect, test } from "@playwright/test";

test.describe("stat visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("basic + trend", async ({ page }) => {
    await page.goto("./stat.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("stat-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("trend")).toHaveScreenshot("stat-trend.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("group + compact", async ({ page }) => {
    await page.goto("./stat.html");
    await expect(page.getByTestId("group")).toHaveScreenshot("stat-group.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("compact")).toHaveScreenshot("stat-compact.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("stat visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("group (dark)", async ({ page }) => {
    await page.goto("./stat.html");
    await expect(page.getByTestId("group")).toHaveScreenshot("stat-group-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
