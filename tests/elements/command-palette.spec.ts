import { expect, test } from "@playwright/test";

const openPalette = async (page: import("@playwright/test").Page) => {
  await page.goto("./command-palette.html");
  await page.locator("[data-re-dialog-trigger]").click();
  await expect(page.locator("#cmdk")).toBeVisible();
};

test.describe("command-palette", () => {
  test("opens, focuses the input, and adds combobox ARIA via JS", async ({ page }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("role", "combobox");
    await expect(page.locator(".re-command-palette__list")).toHaveAttribute("role", "listbox");
    await expect(page.locator(".re-command-palette__item").first()).toHaveAttribute(
      "role",
      "option",
    );
  });

  test("typing filters; no match shows the empty state + collapses aria-expanded", async ({
    page,
  }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    await input.fill("create");
    const visible = page.locator(".re-command-palette__item:not([hidden])");
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText("Create document");
    await input.fill("zzzzz");
    await expect(page.locator(".re-command-palette__empty")).toBeVisible();
    await expect(input).toHaveAttribute("aria-expanded", "false");
  });

  test("arrow keys move aria-activedescendant across visible options (skip disabled)", async ({
    page,
  }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    await input.press("ArrowDown"); // first → second
    const id = await input.getAttribute("aria-activedescendant");
    expect(id).toBeTruthy();
    await expect(page.locator(`#${id}`)).toHaveAttribute("aria-selected", "true");
    // the disabled "Delete workspace" never becomes active
    await input.press("ArrowDown");
    await input.press("ArrowDown");
    await input.press("ArrowDown");
    const active = await input.getAttribute("aria-activedescendant");
    await expect(page.locator(`#${active}`)).not.toHaveAttribute("aria-disabled", "true");
  });

  test("Enter activates exactly once (re-command) and closes", async ({ page }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    await input.fill("create");
    const count = await page.evaluate(() => {
      let n = 0;
      document.getElementById("cmdk")!.addEventListener("re-command", () => (n += 1));
      return new Promise<number>((resolve) => {
        const i = document.querySelector(".re-command-palette__input") as HTMLInputElement;
        i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        setTimeout(() => resolve(n), 30);
      });
    });
    expect(count).toBe(1);
    await expect(page.locator("#cmdk")).toBeHidden();
  });

  test("the global hotkey opens the palette", async ({ page }) => {
    await page.goto("./command-palette.html");
    await expect(page.locator("#cmdk")).toBeHidden();
    await page.evaluate(() => {
      // both modifiers to cover the mac (meta) and non-mac (ctrl) branches
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
      );
    });
    await expect(page.locator("#cmdk")).toBeVisible();
  });

  test("destroy() restores the input (combobox role) + list role + link href", async ({ page }) => {
    await openPalette(page);
    const firstAction = page
      .locator(".re-command-palette__item")
      .first()
      .locator(".re-command-palette__action");
    await expect(firstAction).not.toHaveAttribute("href", /.+/); // href lifted to data on enhance
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    await expect(page.locator(".re-command-palette__input")).not.toHaveAttribute(
      "role",
      "combobox",
    );
    await expect(page.locator(".re-command-palette__list")).not.toHaveAttribute("role", "listbox");
    await expect(firstAction).toHaveAttribute("href", "#dashboard"); // restored
  });
});
