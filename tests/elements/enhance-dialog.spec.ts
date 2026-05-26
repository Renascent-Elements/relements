import { expect, test } from "@playwright/test";

test.describe("enhanceDialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./enhance-dialog.html");
  });

  test("trigger opens the dialog", async ({ page }) => {
    await page.locator("#ed-open").click();
    const open = await page
      .locator("#ed-confirm")
      .evaluate((el) => (el as HTMLDialogElement).open);
    expect(open).toBe(true);
  });

  test("close button closes with its value as returnValue", async ({ page }) => {
    await page.locator("#ed-open").click();
    await page.locator("#ed-confirm-btn").click();
    const isOpen = await page
      .locator("#ed-confirm")
      .evaluate((el) => (el as HTMLDialogElement).open);
    expect(isOpen).toBe(false);
    await expect(page.locator("#ed-result")).toHaveText(/confirm/);
  });

  test("clicking outside the dialog closes it with backdrop returnValue", async ({ page }) => {
    await page.locator("#ed-open").click();
    // Click far above the dialog content (backdrop area at top-left corner of viewport).
    await page.mouse.click(2, 2);
    const isOpen = await page
      .locator("#ed-confirm")
      .evaluate((el) => (el as HTMLDialogElement).open);
    expect(isOpen).toBe(false);
    await expect(page.locator("#ed-result")).toHaveText(/backdrop/);
  });

  test("destroy stops binding triggers", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__edController.destroy();
    });
    await page.locator("#ed-open").click();
    const isOpen = await page
      .locator("#ed-confirm")
      .evaluate((el) => (el as HTMLDialogElement).open);
    expect(isOpen).toBe(false);
  });
});
