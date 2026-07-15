import { expect, test } from "@playwright/test";

test.describe("prose visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 1400 } });

  test("basic flow", async ({ page }) => {
    await page.goto("./prose.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("prose-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("blockquote + figure", async ({ page }) => {
    await page.goto("./prose.html");
    await expect(page.getByTestId("quote-figure")).toHaveScreenshot("prose-quote-figure.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("code + table", async ({ page }) => {
    await page.goto("./prose.html");
    await expect(page.getByTestId("code-table")).toHaveScreenshot("prose-code-table.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("prose visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 1400 } });

  test("blockquote + figure (dark)", async ({ page }) => {
    await page.goto("./prose.html");
    await expect(page.getByTestId("quote-figure")).toHaveScreenshot("prose-quote-figure-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("code + table (dark)", async ({ page }) => {
    await page.goto("./prose.html");
    await expect(page.getByTestId("code-table")).toHaveScreenshot("prose-code-table-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
