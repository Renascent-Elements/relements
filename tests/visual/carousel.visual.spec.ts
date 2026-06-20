import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("carousel basic visual snapshot", async ({ page }) => {
  await page.goto("./carousel.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Wait for the behavior to inject controls + set the initial active dot.
  await expect(page.getByTestId("basic").locator(".re-carousel__dot").first()).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("carousel visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("carousel in dark", async ({ page }) => {
    await page.goto("./carousel.html");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByTestId("basic").locator(".re-carousel__dot").first()).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.getByTestId("basic")).toHaveScreenshot("carousel-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
