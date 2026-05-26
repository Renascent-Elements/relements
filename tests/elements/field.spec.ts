import { expect, test } from "@playwright/test";

test.describe("Field", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./field.html");
  });

  test("renders as a <label> element", async ({ page }) => {
    const tag = await page.locator("#field-basic").evaluate((el) => el.tagName);
    expect(tag).toBe("LABEL");
  });

  test("clicking label text focuses the wrapped input", async ({ page }) => {
    await page.getByText("Email", { exact: true }).click();
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe("field-basic-input");
  });

  test("hint provides supporting copy under the control", async ({ page }) => {
    await expect(page.locator("#field-basic-hint")).toHaveText(/work email/i);
  });

  test("data-required label adds an asterisk via ::after", async ({ page }) => {
    const content = await page
      .locator('[data-testid="required"] [data-required]')
      .evaluate((el) => getComputedStyle(el, "::after").content);
    expect(content).toMatch(/\*/);
  });

  test("aria-describedby connects the validation message to the input", async ({ page }) => {
    const described = await page.locator("#field-invalid-input").getAttribute("aria-describedby");
    expect(described).toBe("field-invalid-msg");
    await expect(page.locator("#field-invalid-msg")).toHaveText(/at least 8/i);
  });

  test("inline field places control beside its label", async ({ page }) => {
    const flexDirection = await page
      .locator("#field-inline-cb")
      .evaluate((el) => getComputedStyle(el.closest(".re-field")!).flexDirection);
    expect(flexDirection).toBe("row");
  });
});
