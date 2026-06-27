import { expect, type Page } from "@playwright/test";

/**
 * Asserts the canonical one-flow contract on an already-loaded page:
 * CSS class surface, enhanceTabs behavior surface, the <re-tabs>
 * custom-element + re-change event surface, and the DOM-injecting
 * enhanceMultiSelect behavior surface.
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

  // DOM-injecting behavior surface (the one tabs doesn't exercise).
  await assertMultiselectBehavior(page);
}

/**
 * enhanceMultiSelect INJECTS DOM — it appends a polite live region as a sibling
 * of the host via `host.after()`. That's the surface tabs (attributes/focus
 * only) never covers. Assert it enhances, mirrors the native `change` into its
 * summary + live region, and — the headline cross-framework risk — that the
 * injected region SURVIVES an in-place re-render (each framework reconciles the
 * wrapper's children differently; the live region is outside every vdom).
 */
async function assertMultiselectBehavior(page: Page): Promise<void> {
  const ms = page.locator("#ms");
  const live = page.locator("#ms-wrap [aria-live]");
  await expect(ms).toHaveAttribute("data-re-multiselect-ready", ""); // enhanced
  await expect(live).toHaveCount(1); // the behavior injected its live region

  await ms.locator("summary").click(); // open (native disclosure, not focus)
  await ms.locator('input[value="react"]').check();
  await expect(page.locator("#ms-value")).toHaveText("React");
  await expect(live).toHaveText("1 selected");

  // Survives an in-place re-render: drive the framework's re-render trigger, then
  // assert the injected region is the SAME node (not dropped/re-created) and
  // still wired — the assertion that catches a reconciler eating the sibling.
  await page.locator("#ms-rerender").click(); // (also closes the panel via outside-pointerdown)
  await expect(live).toHaveCount(1); // not reconciled away or duplicated
  await expect(ms).toHaveAttribute("data-re-multiselect-ready", ""); // same enhanced host
  await expect(live).toHaveText("1 selected"); // same node — selection survived
  await ms.locator("summary").click(); // re-open (the re-render click closed it)
  await ms.locator('input[value="vue"]').check();
  await expect(live).toHaveText("2 selected"); // still wired after the re-render
  await expect(page.locator("#ms-value")).toHaveText("React, Vue");
}
