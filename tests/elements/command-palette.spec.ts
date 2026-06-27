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

  test("announces the result count + empty state to a polite status region", async ({ page }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    // The announcer is present at rest (NOT toggled hidden like the visible card),
    // so it can reliably announce a later mutation.
    const status = page.locator("#cmdk [role=status].re-sr-only");
    await expect(status).toHaveCount(1);
    await input.fill("go"); // "Go to Dashboard" + "Go to Settings"
    await expect(status).toHaveText("2 results");
    await input.fill("settings"); // one match
    await expect(status).toHaveText("1 result");
    await input.fill("zzzzz"); // none
    await expect(status).toHaveText(/^No results for/);
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

  test("Home/End jump to the first/last visible option", async ({ page }) => {
    await openPalette(page);
    const input = page.locator(".re-command-palette__input");
    await input.press("End");
    const endId = await input.getAttribute("aria-activedescendant");
    expect(endId).toBeTruthy();
    // last VISIBLE non-disabled row — the disabled "Delete workspace" is skipped
    const endRow = page.locator(`#${endId}`);
    await expect(endRow).not.toHaveAttribute("aria-disabled", "true");
    await expect(endRow).toContainText("Invite teammate");
    await input.press("Home");
    const homeId = await input.getAttribute("aria-activedescendant");
    expect(homeId).toBeTruthy();
    await expect(page.locator(`#${homeId}`)).toContainText("Go to Dashboard");
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

  test("the hotkey claims the combo — a window-level ⌘K handler does NOT also fire", async ({
    page,
  }) => {
    await page.goto("./command-palette.html");
    // mimic a page-wide ⌘K search bound on window (e.g. the docs site's Pagefind)
    const windowSawIt = await page.evaluate(() => {
      let seen = false;
      window.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") seen = true;
      });
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
      );
      return seen;
    });
    await expect(page.locator("#cmdk")).toBeVisible(); // palette opened
    expect(windowSawIt).toBe(false); // …and the event never reached the window handler
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
