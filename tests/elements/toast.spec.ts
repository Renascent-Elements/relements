import { expect, test } from "@playwright/test";

test.describe("Toast", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./toast.html");
  });

  test("triggering a default toast appends to the live region", async ({ page }) => {
    await page.locator("#t-default").click();
    await expect(page.locator(".re-toast-list .re-toast")).toHaveCount(1);
    await expect(page.locator(".re-toast-list .re-toast").first()).toContainText(/saved/i);
  });

  test("default tone uses role=status", async ({ page }) => {
    await page.locator("#t-default").click();
    const role = await page.locator(".re-toast-list .re-toast").first().getAttribute("role");
    expect(role).toBe("status");
  });

  test("danger tone uses role=alert", async ({ page }) => {
    await page.locator("#t-danger").click();
    const role = await page.locator(".re-toast-list .re-toast").first().getAttribute("role");
    expect(role).toBe("alert");
  });

  test("data-tone attribute set per tone", async ({ page }) => {
    await page.locator("#t-success").click();
    const tone = await page.locator(".re-toast-list .re-toast").first().getAttribute("data-tone");
    expect(tone).toBe("success");
  });

  test("dismiss button removes the toast", async ({ page }) => {
    await page.locator("#t-default").click();
    await page.locator(".re-toast-list .re-toast .re-toast__dismiss").first().click();
    await expect(page.locator(".re-toast-list .re-toast")).toHaveCount(0);
  });

  test("duration auto-dismisses", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__showToast("Quick", { duration: 100 });
    });
    await expect(page.locator(".re-toast-list .re-toast")).toHaveCount(1);
    await page.waitForTimeout(300);
    await expect(page.locator(".re-toast-list .re-toast")).toHaveCount(0);
  });

  test("toast region uses aria-live=polite", async ({ page }) => {
    const live = await page.locator(".re-toast-list").getAttribute("aria-live");
    expect(live).toBe("polite");
  });

  test("controller dismiss removes a specific toast", async ({ page }) => {
    const counts = await page.evaluate(async () => {
      // @ts-expect-error
      const a = window.__showToast("A", { duration: 0 });
      // @ts-expect-error
      window.__showToast("B", { duration: 0 });
      const before = document.querySelectorAll(".re-toast-list .re-toast").length;
      a.dismiss();
      const after = document.querySelectorAll(".re-toast-list .re-toast").length;
      return { before, after };
    });
    expect(counts.before).toBeGreaterThanOrEqual(2);
    expect(counts.after).toBe(counts.before - 1);
  });

  test("auto-creates a region when none exists", async ({ page }) => {
    // Goto a blank page-like state: navigate to a page without the region.
    await page.goto("./index.html");
    await page.evaluate(async () => {
      const mod = await import("/packages/core/src/behaviors/toast.js");
      mod.showToast("Auto", { duration: 0 });
    });
    await expect(page.locator(".re-toast-region")).toHaveCount(1);
    await expect(page.locator(".re-toast-region .re-toast")).toHaveCount(1);
  });
});
