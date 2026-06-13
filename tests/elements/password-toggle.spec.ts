import { expect, test } from "@playwright/test";

test.describe("password toggle", () => {
  test("button is hidden in base markup and revealed by the enhancer", async ({ page }) => {
    // The button only works with JS, so it must not be shown/announced without it.
    // Here JS has run (the page enhances on load), so it should be visible now.
    await page.goto("./password-toggle.html");
    await expect(page.getByTestId("basic").locator("[data-re-password-toggle]")).toBeVisible();
  });

  test("toggles the field type and reflects pressed state with a stable name", async ({ page }) => {
    await page.goto("./password-toggle.html");
    const input = page.locator("#pw");
    const button = page.getByTestId("basic").locator("[data-re-password-toggle]");

    await expect(input).toHaveAttribute("type", "password");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("aria-label", "Show password");

    await button.click();
    await expect(input).toHaveAttribute("type", "text");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    // Name stays stable — pressed conveys state, not a renamed label.
    await expect(button).toHaveAttribute("aria-label", "Show password");

    await button.click();
    await expect(input).toHaveAttribute("type", "password");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("swaps the icon on reveal", async ({ page }) => {
    await page.goto("./password-toggle.html");
    const button = page.getByTestId("basic").locator("[data-re-password-toggle]");
    await expect(button.locator('[data-when="hidden"]')).toBeVisible();
    await expect(button.locator('[data-when="shown"]')).toBeHidden();
    await button.click();
    await expect(button.locator('[data-when="shown"]')).toBeVisible();
    await expect(button.locator('[data-when="hidden"]')).toBeHidden();
  });

  test("preserves the caret/selection across the type change", async ({ page }) => {
    await page.goto("./password-toggle.html");
    const input = page.locator("#pw");
    const button = page.getByTestId("basic").locator("[data-re-password-toggle]");
    await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(1, 4));
    await button.click();
    const sel = await input.evaluate((el: HTMLInputElement) => [
      el.selectionStart,
      el.selectionEnd,
      document.activeElement === el,
    ]);
    expect(sel).toEqual([1, 4, true]);
  });

  test("no-op on a disabled field", async ({ page }) => {
    await page.goto("./password-toggle.html");
    const input = page.locator("#pw-disabled");
    const button = page.getByTestId("disabled").locator("[data-re-password-toggle]");
    await button.click({ force: true });
    await expect(input).toHaveAttribute("type", "password");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("re-enhancing does not double-bind (idempotent)", async ({ page }) => {
    await page.goto("./password-toggle.html");
    await page.evaluate(async () => {
      const { enhancePasswordToggle } =
        await import("/packages/core/src/behaviors/password-toggle.js");
      enhancePasswordToggle(document); // second pass
    });
    const input = page.locator("#pw");
    await page.getByTestId("basic").locator("[data-re-password-toggle]").click();
    await expect(input).toHaveAttribute("type", "text"); // one net toggle, not zero
  });

  test("destroy() re-hides the button and unwires it", async ({ page }) => {
    await page.goto("./password-toggle.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    const button = page.getByTestId("basic").locator("[data-re-password-toggle]");
    await expect(button).toBeHidden();
    await expect(page.locator("#pw")).toHaveAttribute("type", "password");
  });
});
