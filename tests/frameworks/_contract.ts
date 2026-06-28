import { expect, type Page } from "@playwright/test";

/**
 * Asserts the canonical one-flow contract on an already-loaded page:
 * CSS class surface, enhanceTabs behavior surface, the <re-tabs>
 * custom-element + re-change event surface, and three DOM-injecting behavior
 * surfaces (enhanceMultiSelect, enhanceCarousel, enhanceCommandPalette).
 */
export async function assertContract(page: Page): Promise<void> {
  // CSS surface (the palette trigger adds a second .re-button, so scope to the first).
  await expect(page.locator(".re-button").first()).toBeVisible();

  // Behavior surface: arrow keys move + select within the enhanced region.
  await page.locator("#e-tab-1").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#e-tab-2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#e-tab-1")).toHaveAttribute("aria-selected", "false");

  // Element + event surface: clicking a re-tabs tab fires re-change and the
  // listener writes detail.tabId into <output>.
  await page.locator("#c-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("c-tab-2");

  // DOM-injecting behavior surfaces (the ones tabs doesn't exercise) — each
  // injects behavior-created nodes that must survive the host's reconciler.
  // Carousel + palette first (both end with a clean page); multiselect LAST
  // because it leaves its absolutely-positioned panel open by design.
  await assertCarouselBehavior(page);
  await assertCommandPaletteBehavior(page);
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

/**
 * enhanceCarousel APPENDS its controls as trailing CHILDREN of the host (not a
 * sibling). With autoplay configured, the `.re-carousel__autoplay` pause button
 * is injected on EVERY rung — including Chromium's CSS-controls path (Rung B),
 * where prev/next/dots stand down but autoplay still runs — so it's the one
 * engine-agnostic marker. Assert it's injected and SURVIVES an in-place
 * re-render of the carousel (the reconciler must leave the trailing child alone).
 */
async function assertCarouselBehavior(page: Page): Promise<void> {
  const autoplay = page.locator("#car .re-carousel__autoplay");
  await expect(autoplay).toHaveCount(1); // behavior injected its control onto the host

  await page.locator("#car-rerender").click(); // re-render the carousel component
  await expect(autoplay).toHaveCount(1); // trailing child not reconciled away or duplicated
}

/**
 * enhanceCommandPalette applies combobox/listbox ARIA to existing nodes and
 * injects an sr-only role=status announcer as a sibling of the list (additive —
 * it never moves author DOM); enhanceDialog wires the trigger. Assert both
 * integrated, the palette opens + type-to-filters, and the applied ARIA + the
 * injected announcer SURVIVE an in-place re-render.
 */
async function assertCommandPaletteBehavior(page: Page): Promise<void> {
  const input = page.locator("#cmd-input");
  const status = page.locator("#cmdk .re-sr-only[role='status']");
  await expect(input).toHaveAttribute("role", "combobox"); // enhanceCommandPalette ran
  await expect(status).toHaveCount(1); // injected announcer present

  // enhanceDialog wired the trigger: open the modal, then filter the list.
  await page.locator("#cmd-open").click();
  await expect(page.locator("#cmdk")).toBeVisible();
  await input.fill("alp");
  await expect(page.locator("#cmdk .re-command-palette__item:visible")).toHaveCount(1); // "Alpha"
  // Close deterministically: a type=search input swallows the first Escape to
  // clear its own value (engine-dependent), and Escape semantics aren't the
  // cross-framework property under test — the enhance + injection are.
  await page.locator("#cmdk").evaluate((d) => (d as HTMLDialogElement).close());
  await expect(page.locator("#cmdk")).toBeHidden();

  // Survives an in-place re-render (closed): the applied ARIA + injected status
  // are not reconciled away.
  await page.locator("#cmd-rerender").click();
  await expect(input).toHaveAttribute("role", "combobox");
  await expect(status).toHaveCount(1);
}
