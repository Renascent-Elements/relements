import { expect, test } from "@playwright/test";

test.describe("Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./dialog.html");
  });

  test("renders as <dialog>", async ({ page }) => {
    const tag = await page.locator("#modal").evaluate((el) => el.tagName);
    expect(tag).toBe("DIALOG");
  });

  test("showModal opens the dialog", async ({ page }) => {
    await page.locator("#open-modal").click();
    await expect(page.locator("#modal")).toBeVisible();
    const isOpen = await page.locator("#modal").evaluate((el) => (el as HTMLDialogElement).open);
    expect(isOpen).toBe(true);
  });

  test("dialog is hidden when closed", async ({ page }) => {
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator("#form-dialog")).toBeHidden();
  });

  test("close button closes and reports returnValue", async ({ page }) => {
    await page.locator("#open-modal").click();
    await page.locator("#modal-close-x").click();
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator("#modal-result")).toHaveText(/dismissed/);
  });

  test("confirm sets returnValue to confirm", async ({ page }) => {
    await page.locator("#open-modal").click();
    await page.locator("#modal-confirm").click();
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator("#modal-result")).toHaveText(/confirm/);
  });

  test("Escape closes the modal natively", async ({ page }) => {
    await page.locator("#open-modal").click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#modal")).toBeHidden();
  });

  test("form method=dialog closes and surfaces button value", async ({ page }) => {
    await page.locator("#open-form-dialog").click();
    await page.locator("#fd-title").fill("Hello");
    await page.locator("#fd-save").click();
    await expect(page.locator("#form-dialog")).toBeHidden();
    await expect(page.locator("#fd-result")).toHaveText(/save/);
  });

  test("aria-labelledby points to the title", async ({ page }) => {
    const labelledBy = await page.locator("#modal").getAttribute("aria-labelledby");
    expect(labelledBy).toBe("modal-title");
  });

  test("focus moves into the dialog when opened", async ({ page }) => {
    await page.locator("#open-modal").click();
    const focusedInDialog = await page.evaluate(() => {
      const dlg = document.getElementById("modal");
      return dlg?.contains(document.activeElement) ?? false;
    });
    expect(focusedInDialog).toBe(true);
  });
});
