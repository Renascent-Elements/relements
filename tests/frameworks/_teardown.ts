import { expect, type Page } from "@playwright/test";

/**
 * Drives the example's mount/unmount toggle to verify the framework's teardown
 * path runs without throwing and that a fresh instance re-initializes and works.
 *
 * Scope (be honest about what this does and does NOT prove):
 *   - It DOES catch teardown that crashes (destroy() on null, stale refs in
 *     ngOnDestroy/onUnmounted, etc.) and a remount that fails to re-wire.
 *   - It does NOT prove every listener/controller was released (a silent leak
 *     that neither throws nor changes behaviour would still pass), and because
 *     these specs run against the production `dist/` build it does not exercise
 *     React StrictMode's dev-only double-invoke. `pageerror` also does not
 *     capture `console.error`. This is a teardown smoke test, not a leak detector.
 *
 * Pass an `errors` array populated from `page.on("pageerror", ...)` registered
 * before navigation.
 *
 * Contract every example must satisfy:
 *   - The demo subtree (enhanceTabs region with `#e-tab-1..3` and `<re-tabs id="ce">`
 *     with `#c-tab-1..3` + `<output id="last-tab">`) is MOUNTED by default.
 *   - A `<button id="toggle">` mounts/unmounts that subtree.
 */
export async function assertTeardown(page: Page, errors: string[]): Promise<void> {
  // Mounted by default: the demo subtree is present and wired.
  await expect(page.locator("#e-tab-1")).toBeVisible();

  // Unmount: the lifecycle-bearing subtree is removed.
  await page.locator("#toggle").click();
  await expect(page.locator("#e-tab-1")).toHaveCount(0);
  await expect(page.locator("re-tabs")).toHaveCount(0);

  // Remount: a fresh instance re-initializes and works.
  await page.locator("#toggle").click();
  await expect(page.locator("#e-tab-1")).toBeVisible();
  // Wait until the remounted <re-tabs> is actually enhanced before clicking:
  // enhanceTabs() sets the selected tab's roving tabindex to 0. Without this
  // gate the click can land before the element's delegated listener is wired
  // (the MutationObserver path used when children project after connect).
  await expect(page.locator("#c-tab-1")).toHaveAttribute("tabindex", "0");
  await page.locator("#c-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("c-tab-2");

  // No teardown/remount errors (e.g. destroy() on null, stale refs).
  expect(errors).toEqual([]);
}
