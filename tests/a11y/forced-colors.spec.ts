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

  test("presence dots keep their filled/hollow split via system colors", async ({ page }) => {
    await page.goto("./avatar.html");
    const highlight = await resolveHighlight(page);
    const canvasText = await resolveSystemColor(page, "CanvasText");
    const presence = page.getByTestId("presence");
    const onlineBg = await presence
      .locator('.re-avatar__presence[data-presence="online"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const offline = await presence
      .locator('.re-avatar__presence[data-presence="offline"]')
      .evaluate((el) => ({
        bg: getComputedStyle(el).backgroundColor,
        ringColor: getComputedStyle(el, "::after").borderColor,
      }));
    expect(onlineBg).toBe(highlight); // filled dot survives as Highlight
    expect(offline.bg).not.toBe(highlight); // hollow stays unfilled (Canvas)
    expect(offline.ringColor).toBe(canvasText); // …with a real CanvasText ring
  });

  test("a checked toggle-group option fills with the Highlight system color", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const highlight = await resolveHighlight(page);
    // the visible button is the <span> right after the checked checkbox
    const bg = await page
      .getByTestId("basic")
      .locator(".re-toggle-group__option input:checked + span")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(highlight); // accent pressed-fill flattens → Highlight
  });

  test("the timeline's current dot uses Highlight while plain dots stay CanvasText", async ({
    page,
  }) => {
    await page.goto("./timeline.html");
    const highlight = await resolveHighlight(page);
    const canvasText = await resolveSystemColor(page, "CanvasText");
    const current = page.getByTestId("current");
    const currentDot = await current
      .locator(".re-timeline__item[data-current] .re-timeline__marker")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const plainDot = await current
      .locator(".re-timeline__item:not([data-current]) .re-timeline__marker")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(currentDot).toBe(highlight); // accent current-dot flattens → Highlight
    expect(plainDot).toBe(canvasText); // background-fill dot survives as CanvasText
  });

  test("the file picker's focus ring survives as a real Highlight outline on the visible UI", async ({
    page,
  }) => {
    // The native <input> is visually hidden, so :focus-within paints the ring on
    // the visible .re-file-picker__ui; in HCM that must be a real outline (the
    // base box-shadow ring is stripped).
    await page.goto("./file-picker.html");
    const highlight = await resolveHighlight(page);
    await page.getByTestId("basic").locator(".re-file-picker__input").focus();
    const ui = await page
      .getByTestId("basic")
      .locator(".re-file-picker__ui")
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, color: s.outlineColor };
      });
    expect(ui.style).toBe("solid");
    expect(ui.color).toBe(highlight);
  });

  test("a checked choice card keeps its selection border via Highlight", async ({ page }) => {
    await page.goto("./choice.html");
    const highlight = await resolveHighlight(page);
    const border = (card: import("@playwright/test").Locator) =>
      card.evaluate((el) => getComputedStyle(el).borderColor);
    const cards = page.getByTestId("basic").locator(".re-choice");
    expect(await border(cards.nth(0))).toBe(highlight); // checked card → Highlight border
    expect(await border(cards.nth(1))).not.toBe(highlight); // unchecked stays flattened neutral
  });

  // Carousel is intentionally NOT covered here. Its forced-colors cues split by
  // control rung: the JS controls (Rung C — `.re-carousel__dot` → Highlight,
  // `.re-carousel__control` → ButtonText) only render on engines WITHOUT the CSS
  // Carousel feature, i.e. Firefox/WebKit — but forced-colors emulation is
  // Chromium-only, and Chromium draws Rung B (UA `::scroll-marker` /
  // `::scroll-button` pseudo-elements, whose computed styles aren't reliably
  // reachable). The two correct @media (forced-colors) blocks live in
  // carousel.css; they just aren't machine-assertable with this harness.
});
