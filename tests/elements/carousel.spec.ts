import { expect, test } from "@playwright/test";

const CSS_CAROUSEL = "(scroll-marker-group: after) and selector(::scroll-marker)";

test.describe("Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./carousel.html");
  });

  // Rung A markup — true on every engine, with or without JS.
  test("the track is a focusable scroll region", async ({ page }) => {
    await expect(page.getByTestId("basic").locator(".re-carousel__track")).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  // The two control rungs are mutually exclusive, keyed on the SAME feature test
  // the CSS @supports and the behavior's gate both use.
  test("exactly one control set renders — CSS markers (Rung B) or JS dots (Rung C), never both", async ({
    page,
  }) => {
    const host = page.getByTestId("basic").locator(".re-carousel");
    const native = await page.evaluate((q) => CSS.supports(q), CSS_CAROUSEL);
    const jsDots = await host.locator(".re-carousel__dot").count();
    if (native) {
      expect(jsDots).toBe(0); // the UA draws the markers/buttons; the behavior stood down
      const smg = await host
        .locator(".re-carousel__track")
        .evaluate((el) => getComputedStyle(el).scrollMarkerGroup);
      expect(smg.startsWith("after")).toBe(true);
    } else {
      expect(jsDots).toBe(4); // the behavior injected the dots
    }
  });

  // Rung C — the JS controls. Skipped where the browser draws them itself (Rung B,
  // Chromium 135+); exercised on Firefox/WebKit, which is the a11y-tested path.
  test.describe("JS controls (Rung C)", () => {
    test.skip(
      ({ browserName }) => browserName === "chromium",
      "Chromium 135+ uses the CSS-Carousel pseudos (Rung B); Rung C is tested on Firefox/WebKit",
    );

    test("injects prev/next + dots; prev starts disabled", async ({ page }) => {
      const host = page.getByTestId("basic").locator(".re-carousel");
      await expect(host.locator(".re-carousel__dot")).toHaveCount(4);
      await expect(host.locator('[data-dir="prev"]')).toHaveAttribute("aria-disabled", "true");
      await expect(host.locator('[data-dir="next"]')).toHaveAttribute("aria-disabled", "false");
      await expect(host.locator(".re-carousel__dot").first()).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    test("an end control uses aria-disabled and stays focusable (not dropped to body)", async ({
      page,
    }) => {
      // Native `disabled` removes the button from the a11y tree and yanks focus to
      // <body> at the ends; aria-disabled keeps it focusable + announced (APG).
      const prev = page.getByTestId("basic").locator('[data-dir="prev"]');
      await expect(prev).toHaveAttribute("aria-disabled", "true"); // slide 0
      await prev.focus();
      await expect(prev).toBeFocused(); // a native [disabled] button could not be focused
    });

    test("next advances the active slide and enables prev", async ({ page }) => {
      const host = page.getByTestId("basic").locator(".re-carousel");
      await host.locator('[data-dir="next"]').click();
      await expect(host.locator(".re-carousel__dot").nth(1)).toHaveAttribute(
        "aria-current",
        "true",
      );
      await expect(host.locator('[data-dir="prev"]')).toHaveAttribute("aria-disabled", "false");
    });

    test("a dot jumps to its slide; next disables at the last slide (no wrap)", async ({
      page,
    }) => {
      const host = page.getByTestId("basic").locator(".re-carousel");
      await host.locator(".re-carousel__dot").nth(3).click();
      await expect(host.locator(".re-carousel__dot").nth(3)).toHaveAttribute(
        "aria-current",
        "true",
      );
      await expect(host.locator('[data-dir="next"]')).toHaveAttribute("aria-disabled", "true");
    });

    test("off-screen slides are inert (only the active slide is interactive)", async ({ page }) => {
      const slides = page.getByTestId("basic").locator(".re-carousel__slide");
      await expect(slides.nth(0)).toHaveJSProperty("inert", false);
      await expect(slides.nth(1)).toHaveJSProperty("inert", true);
    });

    test("the settled slide is announced by name + position", async ({ page }) => {
      const host = page.getByTestId("basic").locator(".re-carousel");
      await host.locator('[data-dir="next"]').click();
      await expect(host.locator("[aria-live]")).toHaveText("Forest trail in autumn (2 of 4)");
    });
  });
});

// Autoplay (opt-in) runs on BOTH rungs — the pause button + timer are JS even
// where the UA draws the dots/buttons (Rung B). So these don't skip on Chromium.
test.describe("Carousel autoplay", () => {
  test.use({ reducedMotion: "no-preference" });

  const activeIndex = (host: import("@playwright/test").Locator) =>
    host.evaluate((el) => {
      const track = el.querySelector(".re-carousel__track") as HTMLElement;
      const slides = [...el.querySelectorAll(".re-carousel__slide")];
      const box = track.getBoundingClientRect();
      const c = (box.left + box.right) / 2;
      let best = 0;
      let bd = Infinity;
      slides.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs((r.left + r.right) / 2 - c);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    });

  test("injects a Pause/Play button (the WCAG 2.2.2 stop mechanism) that toggles", async ({
    page,
  }) => {
    await page.goto("./carousel.html");
    const btn = page.getByTestId("autoplay").locator(".re-carousel__autoplay");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("aria-label", "Pause automatic slideshow");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Play automatic slideshow");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Pause automatic slideshow");
  });

  test("advances on a timer, and Pause stops it", async ({ page }) => {
    await page.goto("./carousel.html");
    const host = page.getByTestId("autoplay").locator(".re-carousel");
    const start = await activeIndex(host);
    await expect.poll(() => activeIndex(host), { timeout: 6000 }).not.toBe(start);

    await host.locator(".re-carousel__autoplay").click(); // pause
    const paused = await activeIndex(host);
    await page.waitForTimeout(3500);
    expect(await activeIndex(host)).toBe(paused);
  });

  test("pausing announces the settled slide (Rung C live region)", async ({
    page,
    browserName,
  }) => {
    // The live region only exists on Rung C (no UA-drawn controls); autoplay
    // suppresses announcements while playing, so pausing is when it must speak.
    test.skip(browserName === "chromium", "Rung C live region absent where the UA draws controls");
    await page.goto("./carousel.html");
    const host = page.getByTestId("autoplay").locator(".re-carousel");
    await expect.poll(() => activeIndex(host), { timeout: 6000 }).not.toBe(0); // let it advance
    await host.locator(".re-carousel__autoplay").click(); // pause → announce
    await expect(host.locator("[aria-live]")).toHaveText(/\d+ of \d+/);
  });

  test("hovering pauses the slideshow", async ({ page }) => {
    await page.goto("./carousel.html");
    const host = page.getByTestId("autoplay").locator(".re-carousel");
    await host.hover();
    const at = await activeIndex(host);
    await page.waitForTimeout(3500);
    expect(await activeIndex(host)).toBe(at);
  });

  test("starts paused under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./carousel.html");
    const host = page.getByTestId("autoplay").locator(".re-carousel");
    await expect(host.locator(".re-carousel__autoplay")).toHaveAttribute(
      "aria-label",
      "Play automatic slideshow",
    );
    const at = await activeIndex(host);
    await page.waitForTimeout(3500);
    expect(await activeIndex(host)).toBe(at);
  });

  test("honours the same rung gate (no double controls)", async ({ page }) => {
    await page.goto("./carousel.html");
    const host = page.getByTestId("autoplay").locator(".re-carousel");
    const native = await page.evaluate((q) => CSS.supports(q), CSS_CAROUSEL);
    expect(await host.locator(".re-carousel__dot").count()).toBe(native ? 0 : 3);
  });
});
