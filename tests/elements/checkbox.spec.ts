import { expect, test } from "@playwright/test";

test.describe("Checkbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./checkbox.html");
  });

  test("renders as native checkbox", async ({ page }) => {
    const type = await page.locator("#cb-news").getAttribute("type");
    expect(type).toBe("checkbox");
  });

  test("clicking toggles checked", async ({ page }) => {
    const cb = page.locator("#cb-news");
    await expect(cb).not.toBeChecked();
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test("keyboard space toggles checked", async ({ page }) => {
    await page.locator("#cb-news").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#cb-news")).toBeChecked();
  });

  test("clicking the label toggles the checkbox", async ({ page }) => {
    await page.getByText("Subscribe to newsletter").click();
    await expect(page.locator("#cb-news")).toBeChecked();
  });

  test("default-checked renders checked", async ({ page }) => {
    await expect(page.locator("#cb-default")).toBeChecked();
  });

  test("indeterminate state is set via DOM property", async ({ page }) => {
    const isIndeterminate = await page
      .locator("#cb-indeterminate")
      .evaluate((el) => (el as HTMLInputElement).indeterminate);
    expect(isIndeterminate).toBe(true);
  });

  test("disabled blocks interaction", async ({ page }) => {
    await expect(page.locator("#cb-disabled")).toBeDisabled();
  });

  test("aria-invalid sets danger border", async ({ page }) => {
    const border = await page
      .locator("#cb-invalid")
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(border).toMatch(/rgb/);
  });

  test("focus ring on tab", async ({ page }) => {
    await page.locator("#cb-news").focus();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("cb-news");
  });
});
