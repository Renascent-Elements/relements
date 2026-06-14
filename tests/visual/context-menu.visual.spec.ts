import { expect, test } from "@playwright/test";

async function open(page: import("@playwright/test").Page) {
  await page.locator("[data-re-context-menu]").focus();
  await page.keyboard.press("Shift+F10"); // deterministic position (anchored to region)
  await expect(page.locator("#ctx-1")).toBeVisible();
}

test.describe("context-menu visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("open (light)", async ({ page }) => {
    await page.goto("./context-menu.html");
    await open(page);
    await expect(page.locator("#ctx-1")).toHaveScreenshot("context-menu-open.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("context-menu visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("open (dark)", async ({ page }) => {
    await page.goto("./context-menu.html");
    await open(page);
    await expect(page.locator("#ctx-1")).toHaveScreenshot("context-menu-open-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
