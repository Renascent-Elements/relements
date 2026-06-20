import { expect, test } from "@playwright/test";

const CSS_CAROUSEL = "(scroll-marker-group: after) and selector(::scroll-marker)";

// The carousel renders its controls two ways: the UA-generated CSS-Carousel
// markers/buttons where supported (Rung B, e.g. Chromium 135+), and JS-injected
// controls everywhere else (Rung C). Each engine baselines its own render.
async function readyBasic(page: import("@playwright/test").Page) {
  const native = await page.evaluate((q) => CSS.supports(q), CSS_CAROUSEL);
  if (!native) {
    await expect(page.getByTestId("basic").locator(".re-carousel__dot").first()).toHaveAttribute(
      "aria-current",
      "true",
    );
  }
  // Rung B is synchronous CSS — toHaveScreenshot's own stability retry covers it.
}

// Reduced motion is emulated BEFORE navigation so the autoplay carousel
// initializes PAUSED — otherwise it auto-advances and the baseline is unstable.
async function gotoReduced(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./carousel.html");
}

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

test("carousel basic visual snapshot", async ({ page }) => {
  await gotoReduced(page);
  await readyBasic(page);
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
  await expect(page.getByTestId("autoplay")).toHaveScreenshot("carousel-autoplay.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("carousel visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("carousel basic in dark", async ({ page }) => {
    await gotoReduced(page);
    await readyBasic(page);
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
    await expect(page.getByTestId("autoplay")).toHaveScreenshot("carousel-autoplay-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
