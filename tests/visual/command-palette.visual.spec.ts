import { expect, test } from "@playwright/test";

async function open(page: import("@playwright/test").Page) {
  await page.goto("./command-palette.html");
  await page.locator("[data-re-dialog-trigger]").click();
  await expect(page.locator("#cmdk")).toBeVisible();
}

test.describe("command-palette visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("open with grouped results", async ({ page }) => {
    await open(page);
    await expect(page.locator("#cmdk")).toHaveScreenshot("command-palette-open.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("no results", async ({ page }) => {
    await open(page);
    await page.locator(".re-command-palette__input").fill("zzzzz");
    await expect(page.locator("#cmdk")).toHaveScreenshot("command-palette-empty.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("command-palette visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("open (dark)", async ({ page }) => {
    await open(page);
    await expect(page.locator("#cmdk")).toHaveScreenshot("command-palette-open-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
