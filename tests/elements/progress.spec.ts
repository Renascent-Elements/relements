import { expect, test } from "@playwright/test";

test.describe("Progress", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./progress.html");
  });

  test("renders as <progress>", async ({ page }) => {
    const tag = await page.locator("#pg-50").evaluate((el) => el.tagName);
    expect(tag).toBe("PROGRESS");
  });

  test("determinate value is reflected", async ({ page }) => {
    const value = await page.locator("#pg-50").evaluate((el) => (el as HTMLProgressElement).value);
    expect(value).toBe(50);
  });

  test("max reflects from attribute", async ({ page }) => {
    const max = await page.locator("#pg-50").evaluate((el) => (el as HTMLProgressElement).max);
    expect(max).toBe(100);
  });

  test("indeterminate progress reports no value", async ({ page }) => {
    const value = await page
      .locator("#pg-indeterminate")
      .evaluate((el) => (el as HTMLProgressElement).position);
    // position === -1 for indeterminate progress.
    expect(value).toBe(-1);
  });

  test("size attribute changes height", async ({ page }) => {
    const heights = await page.evaluate(() => ({
      sm: (document.getElementById("pg-sm") as HTMLElement).getBoundingClientRect().height,
      md: (document.getElementById("pg-md") as HTMLElement).getBoundingClientRect().height,
      lg: (document.getElementById("pg-lg") as HTMLElement).getBoundingClientRect().height,
    }));
    expect(heights.sm).toBeLessThan(heights.md);
    expect(heights.md).toBeLessThan(heights.lg);
  });
});
