import { expect, test } from "@playwright/test";

test.describe("switch", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./switch.html");
  });

  test("is a native checkbox with role=switch", async ({ page }) => {
    const sw = page.locator(".re-switch").first();
    const tagName = await sw.evaluate((el) => el.tagName);
    expect(tagName).toBe("INPUT");
    expect(await sw.getAttribute("type")).toBe("checkbox");
    expect(await sw.getAttribute("role")).toBe("switch");
  });

  test("click and Space toggle the checked state", async ({ page }) => {
    // The "On" switch in the fixture is checked by default.
    const sw = page.locator(".re-switch").nth(1);
    await expect(sw).toBeChecked();
    await sw.click();
    await expect(sw).not.toBeChecked();
    await sw.focus();
    await page.keyboard.press("Space");
    await expect(sw).toBeChecked();
  });
});
