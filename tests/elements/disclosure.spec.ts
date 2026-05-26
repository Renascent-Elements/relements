import { expect, test } from "@playwright/test";

test.describe("Disclosure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./disclosure.html");
  });

  test("renders as <details>", async ({ page }) => {
    const tag = await page.locator("#disc-1").evaluate((el) => el.tagName);
    expect(tag).toBe("DETAILS");
  });

  test("clicking the summary toggles the open attribute", async ({ page }) => {
    const details = page.locator("#disc-1");
    await expect(details).not.toHaveAttribute("open", "");
    await page.locator("#disc-1 > summary").click();
    await expect(details).toHaveAttribute("open", "");
    await page.locator("#disc-1 > summary").click();
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("ships open via the open attribute", async ({ page }) => {
    await expect(page.locator("#disc-2")).toHaveAttribute("open", "");
  });

  test("body is visible only when open", async ({ page }) => {
    const body = page.locator("#disc-1 > .re-disclosure__body");
    await expect(body).toBeHidden();
    await page.locator("#disc-1 > summary").click();
    await expect(body).toBeVisible();
  });

  test("keyboard Enter toggles open", async ({ page }) => {
    await page.locator("#disc-1 > summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#disc-1")).toHaveAttribute("open", "");
  });

  test("focus ring on summary", async ({ page }) => {
    await page.locator("#disc-1 > summary").focus();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe("SUMMARY");
  });

  test("plain variant hides border", async ({ page }) => {
    const border = await page
      .locator("#disc-plain")
      .evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(border).toBe("0px");
  });
});
