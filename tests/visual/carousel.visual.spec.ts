import { expect, test } from "@playwright/test";

const CSS_CAROUSEL = "(scroll-marker-group: after) and selector(::scroll-marker)";

// Reduced motion is emulated BEFORE navigation so the autoplay carousel
// initializes PAUSED — otherwise it auto-advances and the baseline is unstable.
async function gotoReduced(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./carousel.html");
}

// Pin a carousel to its first slide and nudge an active-state update, so the
// baseline is deterministic regardless of WebKit's initial layout / scroll-snap
// landing. (Rung C draws JS dots to assert against; Rung B has none — its render
// is synchronous CSS that toHaveScreenshot's own stability retry covers.)
async function pin(page: import("@playwright/test").Page, testid: "basic" | "autoplay") {
  const scope = page.getByTestId(testid);
  await scope.locator(".re-carousel__track").evaluate((el) => {
    el.scrollLeft = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  const native = await page.evaluate((q) => CSS.supports(q), CSS_CAROUSEL);
  if (!native) {
    await expect(scope.locator(".re-carousel__dot").first()).toHaveAttribute(
      "aria-current",
      "true",
    );
  }
}

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

test("carousel basic visual snapshot", async ({ page }) => {
  await gotoReduced(page);
  await pin(page, "basic");
  await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("carousel autoplay visual snapshot", async ({ page }) => {
  await gotoReduced(page); // starts paused → stable
  await expect(page.getByTestId("autoplay").locator(".re-carousel__autoplay")).toHaveAttribute(
    "aria-label",
    "Play automatic slideshow",
  );
  await pin(page, "autoplay");
  await expect(page.getByTestId("autoplay")).toHaveScreenshot("carousel-autoplay.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("carousel visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("carousel basic in dark", async ({ page }) => {
    await gotoReduced(page);
    await pin(page, "basic");
    await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("carousel autoplay in dark", async ({ page }) => {
    await gotoReduced(page);
    await expect(page.getByTestId("autoplay").locator(".re-carousel__autoplay")).toHaveAttribute(
      "aria-label",
      "Play automatic slideshow",
    );
    await pin(page, "autoplay");
    await expect(page.getByTestId("autoplay")).toHaveScreenshot("carousel-autoplay-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
