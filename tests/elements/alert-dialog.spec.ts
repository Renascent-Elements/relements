import { expect, test } from "@playwright/test";

test.describe("alert dialog", () => {
  test("exposes alertdialog role + labelling and focuses the safe action", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    const dialog = page.locator("#confirm-delete");
    await page.getByRole("button", { name: "Delete project" }).click();
    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveAttribute("role", "alertdialog");
    await expect(dialog).toHaveAttribute("aria-labelledby", "confirm-delete-title");
    await expect(dialog).toHaveAttribute("aria-describedby", "confirm-delete-desc");
    // autofocus lands on the SAFE (Cancel) action, never the destructive one.
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  });

  test("no-dismiss blocks Escape and backdrop", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    const dialog = page.locator("#confirm-delete");
    await page.getByRole("button", { name: "Delete project" }).click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible(); // Escape blocked
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible(); // backdrop blocked
  });

  test("explicit buttons still close with their returnValue", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    const dialog = page.locator("#confirm-delete");
    const result = page.locator("#ad-result");

    await page.getByRole("button", { name: "Delete project" }).click();
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toBeHidden();
    await expect(result).toHaveText("confirm");

    await page.getByRole("button", { name: "Delete project" }).click();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(result).toHaveText("cancel");
  });

  test("a non-no-dismiss alertdialog still closes on Escape", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    const dialog = page.locator("#session-expiring");
    await page.getByRole("button", { name: "Show alert" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("destroy() removes the cancel guard", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    const dialog = page.locator("#confirm-delete");
    // Re-open imperatively (the trigger's click handler was also removed).
    await dialog.evaluate((el: HTMLDialogElement) => el.showModal());
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden(); // guard gone → Escape closes again
  });
});
