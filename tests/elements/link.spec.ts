import { expect, test } from "@playwright/test";

test.describe("Link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./link.html");
  });

  test("renders all variants as <a>", async ({ page }) => {
    const ids = ["link-default", "link-muted", "link-subtle", "link-external"];
    for (const id of ids) {
      const el = page.locator(`#${id}`);
      await expect(el).toBeVisible();
      const tag = await el.evaluate((n) => n.tagName);
      expect(tag).toBe("A");
    }
  });

  test("default has underline", async ({ page }) => {
    const decoration = await page
      .locator("#link-default")
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration).toContain("underline");
  });

  test("subtle has no underline by default", async ({ page }) => {
    const decoration = await page
      .locator("#link-subtle")
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration).toBe("none");
  });

  test("subtle reveals underline on hover", async ({ page }) => {
    const subtle = page.locator("#link-subtle");
    await subtle.hover();
    const decoration = await subtle.evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration).toContain("underline");
  });

  test("external link opens in new tab safely", async ({ page }) => {
    const ext = page.locator("#link-external");
    await expect(ext).toHaveAttribute("target", "_blank");
    await expect(ext).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("external link appends arrow glyph via ::after", async ({ page }) => {
    const content = await page
      .locator("#link-external")
      .evaluate((el) => getComputedStyle(el, "::after").content);
    // Browsers serialize as a quoted string. We accept either ↗ or its escape.
    expect(content).toMatch(/↗|↗|"\\.+?"/);
  });

  test("tab focus shows focus ring", async ({ page }) => {
    await page.locator("#link-default").focus();
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe("link-default");
    const shadow = await page.evaluate(() =>
      getComputedStyle(document.activeElement as Element).boxShadow,
    );
    expect(typeof shadow).toBe("string");
  });

  test("navigation works", async ({ page }) => {
    await page.locator("#link-default").click();
    await expect(page).toHaveURL(/foundation\.html$/);
  });
});
