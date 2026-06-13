import { expect, test } from "@playwright/test";

test.describe("otp", () => {
  test("is a single native input with one-time-code attributes", async ({ page }) => {
    await page.goto("./otp.html");
    const input = page.getByTestId("basic").locator(".re-otp");
    await expect(input).toHaveAttribute("autocomplete", "one-time-code");
    await expect(input).toHaveAttribute("inputmode", "numeric");
    await expect(input).toHaveAttribute("maxlength", "6");
    await expect(input).toHaveAttribute("pattern", "[0-9]{6}");
    // exactly one field
    await expect(page.getByTestId("basic").locator("input")).toHaveCount(1);
  });

  test("a partial code is invalid and blocks submit; a full code is valid", async ({ page }) => {
    await page.goto("./otp.html");
    const input = page.getByTestId("basic").locator(".re-otp");
    await input.fill("123");
    expect(await input.evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(false);
    await input.fill("123456");
    expect(await input.evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(true);
  });

  test("a pasted code lands in the single field whole", async ({ page }) => {
    await page.goto("./otp.html");
    const input = page.getByTestId("basic").locator(".re-otp");
    await input.fill("654321"); // fill simulates a full set (paste-equivalent)
    await expect(input).toHaveValue("654321");
  });

  test("data-re-otp-numeric strips non-digits", async ({ page }) => {
    await page.goto("./otp.html");
    const input = page.getByTestId("basic").locator(".re-otp");
    await input.pressSequentially("12a3");
    await expect(input).toHaveValue("123");
  });

  test("enhancer tracks the active cell and destroy() cleans up", async ({ page }) => {
    await page.goto("./otp.html");
    const field = page.getByTestId("basic").locator(".re-otp-field");
    const input = field.locator(".re-otp");
    await input.fill("12");
    await input.click();
    await expect
      .poll(() => field.evaluate((el) => el.style.getPropertyValue("--re-otp-active-index")))
      .not.toBe("");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    await expect(input).not.toHaveAttribute("data-re-otp-ready", "");
  });
});
