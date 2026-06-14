import { expect, test } from "@playwright/test";

test.describe("tree visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("default (nested, selected leaf, icon)", async ({ page }) => {
    await page.goto("./tree.html");
    await expect(page.getByTestId("default")).toHaveScreenshot("tree-default.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("guide lines", async ({ page }) => {
    await page.goto("./tree.html");
    await expect(page.getByTestId("lines")).toHaveScreenshot("tree-lines.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("compact", async ({ page }) => {
    await page.goto("./tree.html");
    await expect(page.getByTestId("compact")).toHaveScreenshot("tree-compact.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("RTL", async ({ page }) => {
    await page.goto("./tree.html");
    await expect(page.getByTestId("rtl")).toHaveScreenshot("tree-rtl.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("focused current leaf — inset ring composes with the selection bg", async ({ page }) => {
    await page.goto("./tree.html");
    // focus the aria-current leaf so the ring + selection background coexist
    await page.getByTestId("default").locator("[aria-current]").focus();
    await expect(page.getByTestId("default")).toHaveScreenshot("tree-focus.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("tree visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("default (dark) with a HOVERED row — bg-muted must be visible", async ({ page }) => {
    await page.goto("./tree.html");
    // actually hover a row so the baseline captures the hover bg (would catch a
    // bg-subtle-style regression that collapses to surface in dark mode)
    await page.getByTestId("default").getByRole("link", { name: "Button" }).hover();
    await expect(page.getByTestId("default")).toHaveScreenshot("tree-default-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
