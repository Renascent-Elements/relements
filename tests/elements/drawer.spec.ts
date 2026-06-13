import { expect, test } from "@playwright/test";

// reduce motion collapses the slide to instant (reset.css), so geometry is
// measured at the settled open position, not mid-animation.
test.use({ reducedMotion: "reduce" });

test.describe("drawer", () => {
  test("opens as a modal dialog and closes via the close button", async ({ page }) => {
    await page.goto("./drawer.html");
    const drawer = page.locator("#drawer-end");
    await expect(drawer).toBeHidden();

    await page.getByRole("button", { name: "End", exact: true }).click();
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate((el: HTMLDialogElement) => el.matches(":modal"))).toBe(true);

    await drawer.getByRole("button", { name: "Close" }).click();
    await expect(drawer).toBeHidden();
  });

  test("is pinned full-height to the inline-end edge", async ({ page }) => {
    await page.goto("./drawer.html");
    await page.getByRole("button", { name: "End", exact: true }).click();
    const drawer = page.locator("#drawer-end");
    await expect(drawer).toBeVisible();
    // Assert the geometry CONTRACT (inset + size), not the animated x position
    // (the slide's translate is transient and doesn't affect height/width).
    const g = await drawer.evaluate((el) => {
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        insetInlineEnd: cs.insetInlineEnd,
        h: b.height,
        w: b.width,
        vw: innerWidth,
        vh: innerHeight,
      };
    });
    expect(g.insetInlineEnd).toBe("0px"); // pinned to the inline-end edge
    expect(g.h).toBeCloseTo(g.vh, 0); // full height
    expect(g.w).toBeLessThan(g.vw); // not full width
  });

  test("Escape and backdrop both dismiss (no no-dismiss)", async ({ page }) => {
    await page.goto("./drawer.html");
    const drawer = page.locator("#drawer-end");

    await page.getByRole("button", { name: "End", exact: true }).click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    await page.getByRole("button", { name: "End", exact: true }).click();
    await expect(drawer).toBeVisible();
    await page.mouse.click(5, 300); // backdrop, left of the right-pinned panel
    await expect(drawer).toBeHidden();
  });

  test("bottom sheet pins to the block-end edge full width", async ({ page }) => {
    await page.goto("./drawer.html");
    await page.getByRole("button", { name: "Bottom", exact: true }).click();
    const drawer = page.locator("#drawer-bottom");
    await expect(drawer).toBeVisible();
    const g = await drawer.evaluate((el) => {
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        insetBlockEnd: cs.insetBlockEnd,
        h: b.height,
        w: b.width,
        vw: innerWidth,
        vh: innerHeight,
      };
    });
    expect(g.insetBlockEnd).toBe("0px"); // pinned to the block-end edge
    expect(g.w).toBeCloseTo(g.vw, 0); // full width
    expect(g.h).toBeLessThan(g.vh); // not full height
  });
});
