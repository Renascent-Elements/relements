import { expect, test } from "@playwright/test";

test.describe("rating", () => {
  test("selecting fills the chosen star and all lower ones", async ({ page }) => {
    await page.goto("./rating.html");
    const fieldset = page.getByTestId("basic").locator(".re-rating");
    await fieldset.getByLabel("3 stars").check();
    await page.mouse.move(0, 0); // clear :hover so we read the :checked fill

    const fillOf = (forId: string) =>
      page.locator(`label[for="${forId}"]`).evaluate((el) => getComputedStyle(el).color);
    const amber = "rgb(245, 158, 11)";
    // poll: the star color transitions over --re-duration-fast.
    await expect.poll(() => fillOf("rate-3")).toBe(amber);
    await expect.poll(() => fillOf("rate-1")).toBe(amber);
    expect(await fillOf("rate-4")).not.toBe(amber);
  });

  test("arrow keys follow visual order (Right = higher, Left = lower)", async ({ page }) => {
    await page.goto("./rating.html");
    const fieldset = page.getByTestId("basic").locator(".re-rating");
    const r3 = fieldset.getByLabel("3 stars");
    await r3.check();
    await r3.focus();
    await page.mouse.move(0, 0);

    await page.keyboard.press("ArrowRight");
    await expect(fieldset.getByRole("radio", { checked: true })).toHaveValue("4");
    await page.keyboard.press("ArrowLeft");
    await expect(fieldset.getByRole("radio", { checked: true })).toHaveValue("3");
  });

  test("submits the selected value natively", async ({ page }) => {
    await page.goto("./rating.html");
    const fieldset = page.getByTestId("basic").locator(".re-rating");
    await fieldset.getByLabel("4 stars").check();
    const value = await fieldset
      .getByRole("radio", { checked: true })
      .evaluate((el: HTMLInputElement) => el.value);
    expect(value).toBe("4");
  });

  test("the read-only display exposes an accessible label", async ({ page }) => {
    await page.goto("./rating.html");
    const display = page.getByTestId("display").locator(".re-rating-display");
    await expect(display).toHaveAttribute("role", "img");
    await expect(display).toHaveAttribute("aria-label", /3\.5 out of 5/);
  });
});
