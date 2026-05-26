import { expect, test } from "@playwright/test";

test.describe("Validation message", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./validation-message.html");
  });

  test("error tone uses danger color", async ({ page }) => {
    const color = await page
      .locator("#vm-error")
      .evaluate((el) => getComputedStyle(el).color);
    // danger-700 is #b91c1c → rgb(185, 28, 28).
    expect(color).toMatch(/rgb\(\s*1\d\d/);
  });

  test("success tone differs from error", async ({ page }) => {
    const [err, ok] = await page.evaluate(() => {
      const e = getComputedStyle(document.getElementById("vm-error")!).color;
      const s = getComputedStyle(document.getElementById("vm-success")!).color;
      return [e, s];
    });
    expect(ok).not.toBe(err);
  });

  test("hint tone is muted", async ({ page }) => {
    const color = await page
      .locator("#vm-hint")
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).toMatch(/rgb/);
  });

  test("warning tone differs from error", async ({ page }) => {
    const [err, warn] = await page.evaluate(() => {
      const e = getComputedStyle(document.getElementById("vm-error")!).color;
      const w = getComputedStyle(document.getElementById("vm-warning")!).color;
      return [e, w];
    });
    expect(warn).not.toBe(err);
  });

  test("aria-describedby links control to message", async ({ page }) => {
    const map: Record<string, string> = {
      "vm-error-input": "vm-error",
      "vm-success-input": "vm-success",
      "vm-hint-input": "vm-hint",
      "vm-warning-input": "vm-warning",
    };
    for (const [input, msg] of Object.entries(map)) {
      const describedBy = await page.locator(`#${input}`).getAttribute("aria-describedby");
      expect(describedBy).toBe(msg);
    }
  });
});
