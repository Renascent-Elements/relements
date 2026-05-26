import { expect, test } from "@playwright/test";

test.describe("Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./tabs.html");
  });

  test("server-rendered initial state shows the selected panel only", async ({ page }) => {
    await expect(page.locator("#p-profile")).toBeVisible();
    await expect(page.locator("#p-security")).toBeHidden();
    await expect(page.locator("#p-billing")).toBeHidden();
  });

  test("clicking a tab activates its panel", async ({ page }) => {
    await page.locator("#t-security").click();
    await expect(page.locator("#t-security")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#p-security")).toBeVisible();
    await expect(page.locator("#p-profile")).toBeHidden();
  });

  test("ArrowRight moves focus to next tab", async ({ page }) => {
    await page.locator("#t-profile").focus();
    await page.keyboard.press("ArrowRight");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("t-security");
    // Roving + auto-activate.
    await expect(page.locator("#t-security")).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowLeft wraps to the last tab from the first", async ({ page }) => {
    await page.locator("#t-profile").focus();
    await page.keyboard.press("ArrowLeft");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("t-billing");
  });

  test("Home goes to the first tab", async ({ page }) => {
    await page.locator("#t-billing").focus();
    await page.keyboard.press("Home");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("t-profile");
  });

  test("End goes to the last tab", async ({ page }) => {
    await page.locator("#t-profile").focus();
    await page.keyboard.press("End");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("t-billing");
  });

  test("aria roles match ARIA snapshot", async ({ page }) => {
    await expect(page.getByRole("tablist")).toMatchAriaSnapshot(`
      - tablist "Account":
        - tab "Profile" [selected]
        - tab "Security"
        - tab "Billing"
    `);
  });

  test("re-change event fires with tab and panel ids", async ({ page }) => {
    const detail = await page.evaluate(() => {
      return new Promise<{ tabId: string; panelId: string }>((resolve) => {
        document.getElementById("tabs-1")!.addEventListener(
          "re-change",
          (event) => {
            // @ts-expect-error
            resolve(event.detail);
          },
          { once: true },
        );
        document.getElementById("t-billing")!.click();
      });
    });
    expect(detail).toEqual({ tabId: "t-billing", panelId: "p-billing" });
  });

  test("preventDefault on re-change cancels the change", async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById("tabs-1")!.addEventListener(
        "re-change",
        (event) => event.preventDefault(),
        { once: true },
      );
    });
    await page.locator("#t-security").click();
    await expect(page.locator("#t-profile")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#p-profile")).toBeVisible();
  });

  test("only the active tab is in the tab order (roving tabindex)", async ({ page }) => {
    const tabIndexes = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]')).map((t) => t.tabIndex),
    );
    expect(tabIndexes.filter((i) => i === 0)).toHaveLength(1);
  });

  test("destroy stops keyboard interaction", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__tabsController.destroy();
    });
    await page.locator("#t-profile").focus();
    await page.keyboard.press("ArrowRight");
    // Without enhancement, focus stays where it was.
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("t-profile");
  });
});
