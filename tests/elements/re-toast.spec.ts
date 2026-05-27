import { expect, test } from "@playwright/test";

test.describe("<re-toast>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-toast.html");
  });

  test("defines the custom element", async ({ page }) => {
    expect(await page.evaluate(() => Boolean(customElements.get("re-toast")))).toBe(true);
  });

  test("materializes a toast region on connect", async ({ page }) => {
    const role = await page.locator("#toaster").getAttribute("role");
    expect(role).toBe("region");
    await expect(page.locator("#toaster .re-toast-list")).toBeAttached();
  });

  test("show() adds a toast", async ({ page }) => {
    await page.locator("#rt-default").click();
    await expect(page.locator("#toaster .re-toast")).toHaveCount(1);
  });

  test("show() tones land on the right element", async ({ page }) => {
    await page.locator("#rt-success").click();
    const tone = await page.locator("#toaster .re-toast").first().getAttribute("data-tone");
    expect(tone).toBe("success");
  });

  test("danger uses role=alert", async ({ page }) => {
    await page.locator("#rt-danger").click();
    const role = await page.locator("#toaster .re-toast").first().getAttribute("role");
    expect(role).toBe("alert");
  });

  test("multiple toasts stack", async ({ page }) => {
    await page.locator("#rt-default").click();
    await page.locator("#rt-success").click();
    await page.locator("#rt-danger").click();
    await expect(page.locator("#toaster .re-toast")).toHaveCount(3);
  });
});
