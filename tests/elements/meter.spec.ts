import { expect, test } from "@playwright/test";

test.describe("Meter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./meter.html");
  });

  test("renders as <meter>", async ({ page }) => {
    const tag = await page.locator("#mt-ok").evaluate((el) => el.tagName);
    expect(tag).toBe("METER");
  });

  test("value, low, high, optimum are reflected", async ({ page }) => {
    const props = await page.locator("#mt-ok").evaluate((el) => {
      const m = el as HTMLMeterElement;
      return { value: m.value, low: m.low, high: m.high, optimum: m.optimum };
    });
    expect(props).toEqual({ value: 40, low: 60, high: 85, optimum: 30 });
  });

  test("suboptimum value falls outside low/high band", async ({ page }) => {
    const warnValue = await page
      .locator("#mt-warn")
      .evaluate((el) => (el as HTMLMeterElement).value);
    expect(warnValue).toBe(75);
  });

  test("critical value exceeds high threshold", async ({ page }) => {
    const badValue = await page.locator("#mt-bad").evaluate((el) => (el as HTMLMeterElement).value);
    expect(badValue).toBeGreaterThan(85);
  });

  test("size attribute changes height", async ({ page }) => {
    const heights = await page.evaluate(() => ({
      sm: (document.getElementById("mt-sm") as HTMLElement).getBoundingClientRect().height,
      md: (document.getElementById("mt-md") as HTMLElement).getBoundingClientRect().height,
      lg: (document.getElementById("mt-lg") as HTMLElement).getBoundingClientRect().height,
    }));
    expect(heights.sm).toBeLessThan(heights.md);
    expect(heights.md).toBeLessThan(heights.lg);
  });
});
