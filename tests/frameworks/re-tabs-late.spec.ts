import { test, expect } from "@playwright/test";

test("re-tabs enhances children projected after connect", async ({ page }) => {
  await page.goto("/tests/fixtures/re-tabs-late.html");
  // Wait for the late children + observer-driven enhancement.
  await expect(page.locator("#l-tab-2")).toBeVisible();

  // A subtree mutation after enhancement must NOT re-trigger enhancement: the
  // one-shot observer should already be disconnected.
  await page.evaluate(() => {
    document.querySelector("#l-panel-1")?.append(" (edited)");
  });

  await page.locator("#l-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("l-tab-2");
  // Exactly one re-change for one activation (no duplicate wiring).
  await expect(page.locator("#change-count")).toHaveText("1");
});
