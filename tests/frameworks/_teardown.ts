import { expect, type Page } from "@playwright/test";

/**
 * Drives the example's mount/unmount toggle to verify the framework's teardown
 * (enhanceTabs `.destroy()`, listener removal, lifecycle cleanup) and a clean
 * remount, with no runtime errors. Pass an `errors` array populated from
 * `page.on("pageerror", ...)` registered before navigation.
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
  await page.locator("#c-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("c-tab-2");

  // No teardown/remount errors (e.g. destroy() on null, stale refs).
  expect(errors).toEqual([]);
}
