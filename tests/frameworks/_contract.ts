import { expect, type Page } from "@playwright/test";

/**
 * Asserts the canonical one-flow contract on an already-loaded page:
 * CSS class surface, enhanceTabs behavior surface, and the <re-tabs>
 * custom-element + re-change event surface.
 */
export async function assertContract(page: Page): Promise<void> {
  // CSS surface
  await expect(page.locator(".re-button")).toBeVisible();

  // Behavior surface: arrow keys move + select within the enhanced region.
  await page.locator("#e-tab-1").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#e-tab-2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#e-tab-1")).toHaveAttribute("aria-selected", "false");

  // Element + event surface: clicking a re-tabs tab fires re-change and the
  // listener writes detail.tabId into <output>.
  await page.locator("#c-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("c-tab-2");
}
