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

  test("warns only when a no-dismiss dialog has no close control", async ({ page }) => {
    await page.goto("./alert-dialog.html");
    const warnings: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "warning") warnings.push(m.text());
    });

    // The shipped no-dismiss dialog HAS a Cancel control → no warning on cancel.
    await page.getByRole("button", { name: "Delete project" }).click();
    await page.keyboard.press("Escape"); // fires cancel (blocked), should NOT warn
    expect(warnings.filter((w) => w.includes("no-dismiss"))).toHaveLength(0);

    // A no-dismiss dialog with no close control → warns.
    await page.evaluate(() => {
      const d = document.createElement("dialog");
      d.id = "trap";
      d.setAttribute("data-re-dialog-no-dismiss", "");
      d.textContent = "no way out";
      document.body.append(d);
      d.showModal();
      d.dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    expect(warnings.filter((w) => w.includes("no-dismiss")).length).toBeGreaterThan(0);
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
