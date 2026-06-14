import { expect, test } from "@playwright/test";

test.describe("toolbar visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("basic band (groups + separators + menu)", async ({ page }) => {
    await page.goto("./toolbar.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("toolbar-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("focused control — ring not clipped by the band (light)", async ({ page }) => {
    await page.goto("./toolbar.html");
    await page.getByTestId("basic").locator(".re-toolbar").getByLabel("Italic").focus();
    await expect(page.getByTestId("basic")).toHaveScreenshot("toolbar-focus-light.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("vertical band", async ({ page }) => {
    await page.goto("./toolbar.html");
    await expect(page.getByTestId("vertical")).toHaveScreenshot("toolbar-vertical.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("wrapping band", async ({ page }) => {
    await page.goto("./toolbar.html");
    await expect(page.getByTestId("wrap")).toHaveScreenshot("toolbar-wrap.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("toolbar visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("focused control — ring not clipped (dark)", async ({ page }) => {
    await page.goto("./toolbar.html");
    await page.getByTestId("basic").locator(".re-toolbar").getByLabel("Italic").focus();
    await expect(page.getByTestId("basic")).toHaveScreenshot("toolbar-focus-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
