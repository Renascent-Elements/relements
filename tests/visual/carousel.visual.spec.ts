import { expect, test } from "@playwright/test";

const CSS_CAROUSEL = "(scroll-marker-group: after) and selector(::scroll-marker)";

// The carousel renders its controls two ways: the UA-generated CSS-Carousel
// markers/buttons where supported (Rung B, e.g. Chromium 135+), and JS-injected
// controls everywhere else (Rung C). Each engine baselines its own render.
async function ready(page: import("@playwright/test").Page) {
  const native = await page.evaluate((q) => CSS.supports(q), CSS_CAROUSEL);
  if (!native) {
    // Rung C: wait for the behavior to inject the dots + set the initial active.
    await expect(page.getByTestId("basic").locator(".re-carousel__dot").first()).toHaveAttribute(
      "aria-current",
      "true",
    );
  }
  // Rung B is synchronous CSS — toHaveScreenshot's own stability retry covers it.
}

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("carousel basic visual snapshot", async ({ page }) => {
  await page.goto("./carousel.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("carousel visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("carousel in dark", async ({ page }) => {
    await page.goto("./carousel.html");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ready(page);
    await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
