import { expect, test } from "@playwright/test";

test.describe("steps visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("vertical (complete/current/upcoming, with descriptions)", async ({ page }) => {
    await page.goto("./steps.html");
    await expect(page.getByTestId("vertical")).toHaveScreenshot("steps-vertical.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("horizontal (rail behind markers)", async ({ page }) => {
    await page.goto("./steps.html");
    await expect(page.getByTestId("horizontal")).toHaveScreenshot("steps-horizontal.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("sizes (sm + lg)", async ({ page }) => {
    await page.goto("./steps.html");
    await expect(page.getByTestId("sizes")).toHaveScreenshot("steps-sizes.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("RTL horizontal (order + rail + check mirror)", async ({ page }) => {
    await page.goto("./steps.html");
    await expect(page.getByTestId("rtl")).toHaveScreenshot("steps-rtl.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("focused interactive complete step in horizontal — inset ring", async ({ page }) => {
    await page.goto("./steps.html");
    // first horizontal step (Plan) is a complete <a>; focusing it shows the
    // orientation-scoped INSET ring
    await page.getByTestId("horizontal").locator("a.re-steps__content").first().focus();
    await expect(page.getByTestId("horizontal")).toHaveScreenshot("steps-focus.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("steps visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("vertical (dark) with a HOVERED interactive complete step — bg-muted must be visible", async ({
    page,
  }) => {
    await page.goto("./steps.html");
    // hover the first complete <a> so the baseline captures the bg-muted hover
    // (catches a bg-subtle regression that collapses to surface in dark) AND the
    // accent rail/markers against a dark surface
    await page.getByTestId("vertical").locator("a.re-steps__content").first().hover();
    await expect(page.getByTestId("vertical")).toHaveScreenshot("steps-vertical-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
