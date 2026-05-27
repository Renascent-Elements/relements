import { expect, test } from "@playwright/test";

test.describe("<re-menu>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-menu.html");
  });

  test("defines the custom element", async ({ page }) => {
    expect(await page.evaluate(() => Boolean(customElements.get("re-menu")))).toBe(true);
  });

  test("starts closed", async ({ page }) => {
    await expect(page.locator("#rm-1-panel")).toBeHidden();
    const open = await page.evaluate(() => {
      // @ts-expect-error
      return document.getElementById("rm-1")!.open;
    });
    expect(open).toBe(false);
  });

  test("clicking the button opens the menu", async ({ page }) => {
    await page.locator("#rm-1-btn").click();
    await expect(page.locator("#rm-1-panel")).toBeVisible();
  });

  test("setting el.open opens the menu", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      document.getElementById("rm-1")!.open = true;
    });
    await expect(page.locator("#rm-1-panel")).toBeVisible();
  });

  test("selecting an item fires re-select on the host", async ({ page }) => {
    const value = await page.evaluate(() => {
      return new Promise<string>((resolve) => {
        document.getElementById("rm-1")!.addEventListener(
          "re-select",
          (event) => {
            // @ts-expect-error
            resolve(event.detail.value);
          },
          { once: true },
        );
        (document.getElementById("rm-rename") as HTMLButtonElement).click();
      });
    });
    expect(value).toBe("rename");
  });

  test("arrow keys traverse menu items", async ({ page }) => {
    await page.locator("#rm-1-btn").focus();
    await page.keyboard.press("ArrowDown");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("rm-rename");
    await page.keyboard.press("ArrowDown");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("rm-duplicate");
  });

  test("disconnect tears down the controller", async ({ page }) => {
    await page.evaluate(() => document.getElementById("rm-1")?.remove());
    const exists = await page.evaluate(() => Boolean(document.getElementById("rm-1")));
    expect(exists).toBe(false);
  });
});
