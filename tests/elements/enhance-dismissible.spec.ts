import { expect, test } from "@playwright/test";

test.describe("enhanceDismissible", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./enhance-dismissible.html");
  });

  test("click dismiss hides the host", async ({ page }) => {
    const banner = page.locator("#banner");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: /dismiss/i }).click();
    await expect(banner).toBeHidden();
  });

  test("keyboard Enter dismisses the host", async ({ page }) => {
    await page.locator("#banner [data-re-dismiss]").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#banner")).toBeHidden();
  });

  test("keyboard Space dismisses the host", async ({ page }) => {
    await page.locator("#banner [data-re-dismiss]").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#banner")).toBeHidden();
  });

  test("cancelable re-dismiss event prevents dismissal", async ({ page }) => {
    const cancelBanner = page.locator("#banner-cancel");
    await cancelBanner.getByRole("button", { name: /dismiss/i }).click();
    await expect(cancelBanner).toBeVisible();
    await expect(page.locator("#cancel-count")).toHaveText("1");
  });

  test("re-dismiss event bubbles", async ({ page }) => {
    const bubbled = await page.evaluate(() => {
      const root = document;
      const host = document.getElementById("banner")!;
      // Re-show in case prior tests hid it (this test runs in isolation, but defensive).
      host.hidden = false;
      const seen: string[] = [];
      root.addEventListener("re-dismiss", () => seen.push("doc"), { once: true });
      host.addEventListener("re-dismiss", () => seen.push("host"), { once: true });
      host.querySelector<HTMLButtonElement>("[data-re-dismiss]")!.click();
      return seen;
    });
    expect(bubbled).toEqual(["host", "doc"]);
  });

  test("destroy removes listeners", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__reController.destroy();
    });
    // Re-show first to test (it was hidden by the click test? No — each test reloads via beforeEach).
    const banner = page.locator("#banner");
    await banner.getByRole("button", { name: /dismiss/i }).click();
    // With destroy called, the banner should NOT be hidden by the enhancer.
    await expect(banner).toBeVisible();
  });
});
