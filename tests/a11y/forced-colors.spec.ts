import { expect, test } from "@playwright/test";

/**
 * Windows High Contrast / forced-colors conformance. The UA strips box-shadow
 * (our focus rings) and flattens backgrounds (our selected/current/pressed
 * state), so this suite proves @media (forced-colors: active) re-establishes a
 * real outline + system-color state cues. Emulation is Chromium-only, and is
 * applied via page.emulateMedia (the context-level forcedColors option is a
 * no-op in this Playwright version).
 */
test.describe("forced colors (HCM)", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "forced-colors emulation is Chromium-only",
  );
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
  });

  // The resolved value of a system color keyword in the current emulation.
  const resolveSystemColor = (page: import("@playwright/test").Page, keyword: string) =>
    page.evaluate((kw) => {
      const probe = document.createElement("span");
      probe.style.color = kw;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, keyword);
  const resolveHighlight = (page: import("@playwright/test").Page) =>
    resolveSystemColor(page, "Highlight");

  test("the media query is actually active (guards against false greens)", async ({ page }) => {
    await page.goto("./button.html");
    expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  });

  test("focus-visible shows a real outline (base box-shadow ring is stripped)", async ({
    page,
  }) => {
    await page.goto("./button.html");
    const btn = page.locator(".re-button").first();
    await btn.focus();
    const o = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      return { width: parseFloat(s.outlineWidth), style: s.outlineStyle };
    });
    expect(o.style).toBe("solid");
    expect(o.width).toBeGreaterThan(0);
  });

  test("the outline beats components that opt into an inset box-shadow ring", async ({ page }) => {
    // tree rows set `outline: none; box-shadow: inset …`; in HCM box-shadow is
    // gone, so the !important forced-colors outline must win over outline:none.
    await page.goto("./tree.html");
    // the current leaf sits in an open branch, so it is visible + focusable
    const leaf = page.getByTestId("default").locator(".re-tree__leaf[aria-current]").first();
    await leaf.focus();
    const style = await leaf.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(style).toBe("solid");
  });

  test("background-only state is re-established with the Highlight system color", async ({
    page,
  }) => {
    await page.goto("./pagination.html");
    const highlight = await resolveHighlight(page);
    const currentBg = await page
      .locator('.re-pagination__item[aria-current="page"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(currentBg).toBe(highlight); // flattened accent → system Highlight
  });

  test("a selected tab keeps a visible underline indicator in HCM", async ({ page }) => {
    await page.goto("./tabs.html");
    const highlight = await resolveHighlight(page);
    const afterBg = await page
      .getByTestId("basic")
      .locator('.re-tab[aria-selected="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el, "::after").backgroundColor);
    expect(afterBg).toBe(highlight);
  });

  test("a checked checkbox fills with the Highlight system color", async ({ page }) => {
    await page.goto("./checkbox.html");
    const highlight = await resolveHighlight(page);
    const bg = await page
      .locator(".re-checkbox:checked")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(highlight); // accent fill flattens → Highlight
  });

  test("filled rating stars stay distinguishable via Highlight", async ({ page }) => {
    await page.goto("./rating.html");
    const highlight = await resolveHighlight(page);
    // the read-only display overlay paints the filled portion
    const fill = await page
      .locator(".re-rating-display")
      .first()
      .evaluate((el) => getComputedStyle(el, "::before").color);
    expect(fill).toBe(highlight);
  });

  test("a pressed toolbar toggle keeps Highlight even while hovered", async ({ page }) => {
    await page.goto("./toolbar.html");
    const highlight = await resolveHighlight(page);
    const pressed = page.locator('.re-toolbar .re-button[aria-pressed="true"]').first();
    await pressed.hover(); // the authored :hover accent rule is more specific — must not win
    const bg = await pressed.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(highlight);
  });

  test("a focused rating star shows an outline on the visible star (input is sr-only)", async ({
    page,
  }) => {
    await page.goto("./rating.html");
    const input = page.locator(".re-rating input").first();
    await input.focus();
    // the visible star is the input's next sibling; the global outline lands on
    // the 1px sr-only input, so the star itself must carry the forced-colors ring
    const style = await input.evaluate(
      (el) => getComputedStyle(el.nextElementSibling as Element).outlineStyle,
    );
    expect(style).toBe("solid");
  });

  test("the progress ring's arc vanishes but a neutral track ring + the % label survive", async ({
    page,
  }) => {
    // A conic-gradient is a background IMAGE → the UA computes it to `none`, so the
    // arc disappears. The numeric label (never display:none) carries the value and
    // a CanvasText ring keeps the control reading as a ring.
    await page.goto("./progress-ring.html");
    const canvasText = await resolveSystemColor(page, "CanvasText");
    const ring = await page
      .locator(".re-progress-ring")
      .first()
      .evaluate((el) => {
        const before = getComputedStyle(el, "::before");
        const label = el.querySelector(".re-progress-ring__label");
        return {
          bgImage: before.backgroundImage,
          borderColor: before.borderColor,
          labelDisplay: label ? getComputedStyle(label as Element).display : "missing",
        };
      });
    expect(ring.bgImage).toBe("none");
    expect(ring.borderColor).toBe(canvasText);
    expect(ring.labelDisplay).not.toBe("none");
  });

  test("avatar-group separation survives as a real CanvasText border (box-shadow rings are stripped)", async ({
    page,
  }) => {
    await page.goto("./avatar.html");
    const canvasText = await resolveSystemColor(page, "CanvasText");
    const borderColor = await page
      .locator(".re-avatar-group > .re-avatar")
      .nth(1)
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(borderColor).toBe(canvasText);
  });
});
