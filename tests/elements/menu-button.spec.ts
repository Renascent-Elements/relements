import { expect, test } from "@playwright/test";

test.describe("Menu button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./menu-button.html");
  });

  test("starts closed", async ({ page }) => {
    await expect(page.locator("#mb-1-btn")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mb-1-panel")).toBeHidden();
  });

  test("click opens and closes the menu", async ({ page }) => {
    await page.locator("#mb-1-btn").click();
    await expect(page.locator("#mb-1-btn")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mb-1-panel")).toBeVisible();
    await page.locator("#mb-1-btn").click();
    await expect(page.locator("#mb-1-btn")).toHaveAttribute("aria-expanded", "false");
  });

  test("ArrowDown on button opens menu and focuses first item", async ({ page }) => {
    await page.locator("#mb-1-btn").focus();
    await page.keyboard.press("ArrowDown");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mi-rename");
  });

  test("ArrowDown inside menu cycles items (wraps)", async ({ page }) => {
    await page.locator("#mb-1-btn").focus();
    await page.keyboard.press("ArrowDown"); // → mi-rename
    await page.keyboard.press("ArrowDown"); // → mi-duplicate
    await page.keyboard.press("ArrowDown"); // → mi-delete
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mi-delete");
    await page.keyboard.press("ArrowDown"); // wraps to mi-rename
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mi-rename");
  });

  test("Escape closes and returns focus to the button", async ({ page }) => {
    await page.locator("#mb-1-btn").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(page.locator("#mb-1-panel")).toBeHidden();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mb-1-btn");
  });

  test("selecting a menuitem fires re-select with detail.value", async ({ page }) => {
    const detail = await page.evaluate(() => {
      return new Promise<{ value: string }>((resolve) => {
        document.getElementById("mb-1")!.addEventListener(
          "re-select",
          (event) => {
            // @ts-expect-error
            resolve(event.detail);
          },
          { once: true },
        );
        (document.getElementById("mi-rename") as HTMLButtonElement).click();
      });
    });
    expect(detail.value).toBe("rename");
    await expect(page.locator("#last-action")).toHaveText("rename");
  });

  test("clicking outside closes the menu", async ({ page }) => {
    await page.locator("#mb-1-btn").click();
    await page.mouse.click(10, 10);
    await expect(page.locator("#mb-1-panel")).toBeHidden();
  });

  test("preventDefault on re-select keeps menu open", async ({ page }) => {
    await page.evaluate(() => {
      document
        .getElementById("mb-1")!
        .addEventListener("re-select", (event) => event.preventDefault(), { once: true });
    });
    await page.locator("#mb-1-btn").click();
    await page.locator("#mi-rename").click();
    await expect(page.locator("#mb-1-panel")).toBeVisible();
  });

  test("destroy stops interactions", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__mbController.destroy();
    });
    await page.locator("#mb-1-btn").click();
    await expect(page.locator("#mb-1-panel")).toBeHidden();
  });

  test("first-character typeahead focuses a matching item", async ({ page }) => {
    await page.locator("#mb-1-btn").focus();
    await page.keyboard.press("ArrowDown"); // opens, focuses mi-rename
    // "del" disambiguates Delete from Duplicate (a single "d" matches Duplicate first).
    await page.keyboard.press("d");
    await page.keyboard.press("e");
    await page.keyboard.press("l");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mi-delete");
  });

  test("arrow navigation skips an aria-disabled item", async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById("mi-duplicate")!.setAttribute("aria-disabled", "true");
    });
    await page.locator("#mb-1-btn").focus();
    await page.keyboard.press("ArrowDown"); // → mi-rename
    await page.keyboard.press("ArrowDown"); // skips disabled mi-duplicate → mi-delete
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("mi-delete");
  });
});
