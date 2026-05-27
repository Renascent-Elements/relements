import { expect, test } from "@playwright/test";

test.describe("Radio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./radio.html");
  });

  test("default selection set from HTML", async ({ page }) => {
    await expect(page.locator("#rd-free")).toBeChecked();
  });

  test("clicking a sibling deselects others in the group", async ({ page }) => {
    await page.locator("#rd-pro").check();
    await expect(page.locator("#rd-pro")).toBeChecked();
    await expect(page.locator("#rd-free")).not.toBeChecked();
  });

  test("arrow keys move selection within group", async ({ page }) => {
    await page.locator("#rd-free").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#rd-pro")).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#rd-team")).toBeChecked();
  });

  test("horizontal group selects independently", async ({ page }) => {
    await page.locator("#rd-m").check();
    await expect(page.locator("#rd-m")).toBeChecked();
    // Vertical group's selection remains intact.
    await expect(page.locator("#rd-free")).toBeChecked();
  });

  test("disabled radio cannot be checked", async ({ page }) => {
    await expect(page.locator("#rd-disabled")).toBeDisabled();
  });

  test("aria-invalid sets danger border", async ({ page }) => {
    const border = await page
      .locator("#rd-invalid")
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(border).toMatch(/rgb/);
  });

  test("legend provides accessible group label", async ({ page }) => {
    const legend = page.locator("#rd-free").locator("xpath=ancestor::fieldset/legend").first();
    await expect(legend).toHaveText("Plan");
  });
});
