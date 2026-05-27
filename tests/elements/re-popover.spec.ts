import { expect, test } from "@playwright/test";

test.describe("<re-popover>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-popover.html");
  });

  test("defines the custom element", async ({ page }) => {
    expect(await page.evaluate(() => Boolean(customElements.get("re-popover")))).toBe(true);
  });

  test("auto-sets the popover attribute", async ({ page }) => {
    const attr = await page.locator("#rp-1").getAttribute("popover");
    expect(attr).toBe("auto");
  });

  test("popovertarget button toggles the element", async ({ page }) => {
    await expect(page.locator("#rp-1")).toBeHidden();
    await page.locator("#rp-1-btn").click();
    await expect(page.locator("#rp-1")).toBeVisible();
    await page.locator("#rp-1-btn").click();
    await expect(page.locator("#rp-1")).toBeHidden();
  });

  test("show() opens the popover", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      document.getElementById("rp-1")!.show();
    });
    await expect(page.locator("#rp-1")).toBeVisible();
  });

  test("hide() closes the popover", async ({ page }) => {
    await page.locator("#rp-1-btn").click();
    await page.evaluate(() => {
      // @ts-expect-error
      document.getElementById("rp-1")!.hide();
    });
    await expect(page.locator("#rp-1")).toBeHidden();
  });

  test("toggle() flips the state", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      document.getElementById("rp-1")!.toggle();
    });
    await expect(page.locator("#rp-1")).toBeVisible();
  });

  test("re-toggle fires with open=true on open", async ({ page }) => {
    await page.locator("#rp-1-btn").click();
    await expect(page.locator("#rp-state")).toHaveText("open");
  });

  test("re-toggle bubbles outside the element", async ({ page }) => {
    const state = await page.evaluate(() => {
      return new Promise<string>((resolve) => {
        document.addEventListener(
          "re-toggle",
          (event) => {
            // @ts-expect-error
            resolve(event.detail.open ? "open" : "closed");
          },
          { once: true },
        );
        document.getElementById("rp-1-btn")!.click();
      });
    });
    expect(state).toBe("open");
  });
});
