import { test, expect } from "@playwright/test";

test("re-tabs enhances children projected after connect", async ({ page }) => {
  await page.goto("/tests/fixtures/re-tabs-late.html");
  // Wait for the late children + observer-driven enhancement.
  await expect(page.locator("#l-tab-2")).toBeVisible();
  await page.locator("#l-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("l-tab-2");
});
