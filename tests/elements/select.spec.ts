import { expect, test } from "@playwright/test";

test.describe("Select", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./select.html");
  });

  test("renders as native <select>", async ({ page }) => {
    const tag = await page.locator("#sel-basic").evaluate((el) => el.tagName);
    expect(tag).toBe("SELECT");
  });

  test("selecting an option updates value", async ({ page }) => {
    await page.locator("#sel-basic").selectOption("hu");
    await expect(page.locator("#sel-basic")).toHaveValue("hu");
  });

  test("optgroups render their children", async ({ page }) => {
    const groups = await page.locator("#sel-optgroup optgroup").count();
    expect(groups).toBe(2);
    const optionLabels = await page.locator("#sel-optgroup option").allTextContents();
    expect(optionLabels).toContain("Euro");
    expect(optionLabels).toContain("Dollar");
  });

  test("multiple selection works", async ({ page }) => {
    await page.locator("#sel-multiple").selectOption(["en", "hu"]);
    const values = await page.locator("#sel-multiple").evaluate((el) => {
      const sel = el as HTMLSelectElement;
      return Array.from(sel.selectedOptions).map((o) => o.value);
    });
    expect(values).toEqual(expect.arrayContaining(["en", "hu"]));
  });

  test("disabled select blocks change", async ({ page }) => {
    await expect(page.locator("#sel-disabled")).toBeDisabled();
  });

  test("aria-invalid sets danger border", async ({ page }) => {
    const border = await page
      .locator("#sel-invalid")
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(border).toMatch(/rgb/);
  });

  test("multiple variant hides the dropdown arrow", async ({ page }) => {
    const bg = await page
      .locator("#sel-multiple")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toBe("none");
  });
});
