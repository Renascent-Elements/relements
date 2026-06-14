import { expect, test } from "@playwright/test";

test.describe("empty-state visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("basic", async ({ page }) => {
    await page.goto("./empty-state.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("empty-state-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("compact + bordered", async ({ page }) => {
    await page.goto("./empty-state.html");
    await expect(page.getByTestId("compact")).toHaveScreenshot("empty-state-compact.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("bordered")).toHaveScreenshot("empty-state-bordered.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("in a table", async ({ page }) => {
    await page.goto("./empty-state.html");
    await expect(page.getByTestId("in-table")).toHaveScreenshot("empty-state-in-table.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("empty-state visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("basic (dark)", async ({ page }) => {
    await page.goto("./empty-state.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("empty-state-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
