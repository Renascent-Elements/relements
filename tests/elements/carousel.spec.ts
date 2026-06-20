import { expect, test } from "@playwright/test";

test.describe("Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./carousel.html");
  });

  test("injects controls; the track is a focusable scroll region; prev starts disabled", async ({
    page,
  }) => {
    const host = page.getByTestId("basic").locator(".re-carousel");
    await expect(host.locator(".re-carousel__dot")).toHaveCount(4);
    await expect(host.locator(".re-carousel__track")).toHaveAttribute("tabindex", "0");
    await expect(host.locator('[data-dir="prev"]')).toBeDisabled();
    await expect(host.locator('[data-dir="next"]')).toBeEnabled();
    await expect(host.locator(".re-carousel__dot").first()).toHaveAttribute("aria-current", "true");
  });

  test("next advances the active slide and enables prev", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-carousel");
    await host.locator('[data-dir="next"]').click();
    await expect(host.locator(".re-carousel__dot").nth(1)).toHaveAttribute("aria-current", "true");
    await expect(host.locator('[data-dir="prev"]')).toBeEnabled();
  });

  test("a dot jumps to its slide; next disables at the last slide (no wrap)", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-carousel");
    await host.locator(".re-carousel__dot").nth(3).click();
    await expect(host.locator(".re-carousel__dot").nth(3)).toHaveAttribute("aria-current", "true");
    await expect(host.locator('[data-dir="next"]')).toBeDisabled();
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
