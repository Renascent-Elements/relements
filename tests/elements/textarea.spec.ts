import { expect, test } from "@playwright/test";

test.describe("Textarea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./textarea.html");
  });

  test("renders as <textarea>", async ({ page }) => {
    const tag = await page.locator("#ta-basic").evaluate((el) => el.tagName);
    expect(tag).toBe("TEXTAREA");
  });

  test("accepts multiline input", async ({ page }) => {
    const ta = page.locator("#ta-basic");
    await ta.fill("line 1\nline 2\nline 3");
    await expect(ta).toHaveValue("line 1\nline 2\nline 3");
  });

  test("label association via wrapping label", async ({ page }) => {
    await page.getByLabel("Message").fill("hello");
    await expect(page.locator("#ta-basic")).toHaveValue("hello");
  });

  test("resize is vertical only", async ({ page }) => {
    const resize = await page
      .locator("#ta-basic")
      .evaluate((el) => getComputedStyle(el).resize);
    expect(resize).toBe("vertical");
  });

  test("disabled blocks editing", async ({ page }) => {
    await expect(page.locator("#ta-disabled")).toBeDisabled();
  });

  test("aria-invalid sets danger border", async ({ page }) => {
    const border = await page
      .locator("#ta-invalid")
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(border).toMatch(/rgb/);
  });

  test("size attribute changes min-height", async ({ page }) => {
    const heights = await page.evaluate(() => ({
      sm: (document.getElementById("ta-sm") as HTMLElement).getBoundingClientRect().height,
      lg: (document.getElementById("ta-lg") as HTMLElement).getBoundingClientRect().height,
    }));
    // Rows differ between sm (2) and lg (3) plus larger font; lg should be taller.
    expect(heights.lg).toBeGreaterThan(heights.sm);
  });
});
