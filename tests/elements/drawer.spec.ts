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

  test("an open drawer settles fully on-screen (the slide ends at translate 0)", async ({
    page,
  }) => {
    await page.goto("./drawer.html");
    await page.getByRole("button", { name: "End", exact: true }).click();
    // Wait for the slide to settle, then assert the panel is within the viewport.
    await page.waitForFunction(() => {
      const el = document.getElementById("drawer-end")!;
      const b = el.getBoundingClientRect();
      return Math.abs(b.right - innerWidth) < 1.5;
    });
    const onscreen = await page.locator("#drawer-end").evaluate((el) => {
      const b = el.getBoundingClientRect();
      return b.left >= -1 && b.right <= innerWidth + 1;
    });
    expect(onscreen).toBe(true);
  });

  test("RTL: open end and start drawers dock on-screen on the flipped edges", async ({ page }) => {
    await page.goto("./drawer.html");
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));

    // end → inline-end is the LEFT edge in RTL
    await page.getByRole("button", { name: "End", exact: true }).click();
    await page.waitForFunction(() => {
      const b = document.getElementById("drawer-end")!.getBoundingClientRect();
      return Math.abs(b.left) < 1.5 && b.right <= innerWidth + 1;
    });
    await page.keyboard.press("Escape");

    // start → inline-start is the RIGHT edge in RTL
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.waitForFunction(() => {
      const b = document.getElementById("drawer-start")!.getBoundingClientRect();
      return Math.abs(b.right - innerWidth) < 1.5 && b.left >= -1;
    });
  });

  test("data-size maps to the pin axis", async ({ page }) => {
    await page.goto("./drawer.html");
    await page.locator("#drawer-end").evaluate((el) => el.setAttribute("data-size", "sm"));
    await page.getByRole("button", { name: "End", exact: true }).click();
    const w = (await page.locator("#drawer-end").boundingBox())!.width;
    expect(w).toBeCloseTo(288, 0); // 18rem
  });
});
