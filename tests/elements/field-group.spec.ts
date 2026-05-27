import { expect, test } from "@playwright/test";

test.describe("Field group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./field-group.html");
  });

  test("renders fieldset + legend", async ({ page }) => {
    const tag = await page.locator("#fg-vertical").evaluate((el) => el.tagName);
    expect(tag).toBe("FIELDSET");
    await expect(page.locator("#fg-vertical > legend")).toHaveText("Notifications");
  });

  test("vertical items stack in column", async ({ page }) => {
    const dir = await page
      .locator("#fg-vertical .re-field-group__items")
      .evaluate((el) => getComputedStyle(el).flexDirection);
    expect(dir).toBe("column");
  });

  test("horizontal items wrap in row", async ({ page }) => {
    const dir = await page
      .locator("#fg-horizontal .re-field-group__items")
      .evaluate((el) => getComputedStyle(el).flexDirection);
    expect(dir).toBe("row");
  });

  test("disabling the fieldset disables its children", async ({ page }) => {
    await expect(page.locator("#fg-disabled-cb")).toBeDisabled();
  });

  test("legend appears in the accessible name of grouped radios", async ({ page }) => {
    const accName = await page.evaluate(() => {
      const input = document.querySelector('#fg-horizontal input[type="radio"]') as HTMLElement;
      // Heuristic: ancestor fieldset/legend yields a group label.
      const legend = input.closest("fieldset")?.querySelector("legend")?.textContent ?? "";
      return legend;
    });
    expect(accName.trim()).toBe("Theme");
  });
});
