import { expect, test } from "@playwright/test";

// Branch on field-sizing support: Chromium drives the CSS path, Firefox/WebKit
// at the floor drive the enhanceAutosize scrollHeight fallback. Both must work.
test.describe("autosize textarea", () => {
  test("uses the native CSS path or the JS fallback depending on support", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const supported = await page.evaluate(() => CSS.supports("field-sizing", "content"));
    const ta = page.locator("#ta-autosize");
    if (supported) {
      expect(await ta.evaluate((el) => getComputedStyle(el).fieldSizing)).toBe("content");
    } else {
      await expect(ta).toHaveAttribute("data-re-autosize-ready", "");
    }
  });

  test("grows with content", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const ta = page.locator("#ta-autosize");
    const before = (await ta.boundingBox())!.height;
    await ta.fill("one\ntwo\nthree\nfour\nfive\nsix\nseven\neight");
    // poll: the JS fallback resizes on a rAF, so the height settles async.
    await expect.poll(async () => (await ta.boundingBox())!.height).toBeGreaterThan(before);
  });

  test("a prefilled multi-line value sizes the box on load", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const prefilled = (await page.locator("#ta-prefilled").boundingBox())!.height;
    const empty = (await page.locator("#ta-autosize").boundingBox())!.height;
    expect(prefilled).toBeGreaterThan(empty);
  });

  test("caps at the max and scrolls beyond it", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const ta = page.locator("#ta-capped");
    await ta.fill(Array.from({ length: 40 }, (_, i) => `line ${i}`).join("\n"));
    const max = await ta.evaluate((el) => parseFloat(getComputedStyle(el).maxBlockSize));
    const h = (await ta.boundingBox())!.height;
    expect(h).toBeLessThanOrEqual(max + 1);
    expect(await ta.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
  });

  test("shrinks back when content is removed", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const ta = page.locator("#ta-autosize");
    await ta.fill("one\ntwo\nthree\nfour\nfive\nsix\nseven\neight");
    let grown = 0;
    await expect.poll(async () => (grown = (await ta.boundingBox())!.height)).toBeGreaterThan(60);
    await ta.fill("one");
    await expect.poll(async () => (await ta.boundingBox())!.height).toBeLessThan(grown);
  });

  test("destroy() restores the textarea (fallback path only)", async ({ page }) => {
    await page.goto("./autosize-textarea.html");
    const supported = await page.evaluate(() => CSS.supports("field-sizing", "content"));
    test.skip(supported, "CSS path: enhancer is a no-op, nothing to restore");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    const ta = page.locator("#ta-autosize");
    await expect(ta).not.toHaveAttribute("data-re-autosize-ready", "");
    expect(await ta.evaluate((el) => el.style.height)).toBe("");
  });
});
