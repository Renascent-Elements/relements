import { expect, test } from "@playwright/test";

test.describe("tooltip", () => {
  test("bubble is hidden until the trigger is hovered", async ({ page }) => {
    await page.goto("./tooltip.html");
    const bubble = page.locator("#tip-top");
    await expect(bubble).toBeHidden();

    await page.getByRole("button", { name: "Top", exact: true }).first().hover();
    await expect(bubble).toBeVisible();

    await page.mouse.move(0, 0);
    await expect(bubble).toBeHidden();
  });

  test("bubble shows on keyboard focus and hides on blur", async ({ page }) => {
    await page.goto("./tooltip.html");
    const bubble = page.locator("#tip-bottom");
    const trigger = page.getByRole("button", { name: "Bottom", exact: true }).first();
    await expect(bubble).toBeHidden();

    await trigger.focus();
    await expect(bubble).toBeVisible();

    await trigger.blur();
    await expect(bubble).toBeHidden();
  });

  test("bubble describes the trigger via aria-describedby", async ({ page }) => {
    await page.goto("./tooltip.html");
    const trigger = page.getByRole("button", { name: "Top", exact: true }).first();
    await expect(trigger).toHaveAccessibleDescription("Shown above");
  });

  test("data-open forces the bubble visible without interaction", async ({ page }) => {
    await page.goto("./tooltip.html");
    await expect(page.locator("#tip-open-top")).toBeVisible();
  });
});
