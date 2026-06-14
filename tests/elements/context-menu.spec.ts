import { expect, test } from "@playwright/test";

async function openAtPointer(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const region = document.querySelector("[data-re-context-menu]")!;
    const r = region.getBoundingClientRect();
    region.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: Math.round(r.left + 60),
        clientY: Math.round(r.top + 40),
      }),
    );
  });
}

test.describe("context-menu", () => {
  test("right-click opens the menu near the pointer and focuses the first item", async ({
    page,
  }) => {
    await page.goto("./context-menu.html");
    await openAtPointer(page);
    const panel = page.locator("#ctx-1");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("menuitem").first()).toBeFocused();
  });

  test("right-click opens AND stays open (deferred outside-close)", async ({ page }) => {
    await page.goto("./context-menu.html");
    await openAtPointer(page);
    await page.waitForTimeout(50); // let the deferred document listeners attach
    await expect(page.locator("#ctx-1")).toBeVisible();
  });

  test("selecting an item dispatches re-select and closes", async ({ page }) => {
    await page.goto("./context-menu.html");
    await openAtPointer(page);
    const value = await page.evaluate(() => {
      return new Promise<string>((resolve) => {
        document
          .querySelector("[data-re-context-menu]")!
          .addEventListener("re-select", (e) => resolve((e as CustomEvent).detail.value), {
            once: true,
          });
        (document.querySelector('#ctx-1 [data-value="rename"]') as HTMLElement).click();
      });
    });
    expect(value).toBe("rename");
    await expect(page.locator("#ctx-1")).toBeHidden();
  });

  test("Escape closes and returns focus to the region", async ({ page }) => {
    await page.goto("./context-menu.html");
    await openAtPointer(page);
    await page.keyboard.press("Escape");
    await expect(page.locator("#ctx-1")).toBeHidden();
    await expect(page.locator("[data-re-context-menu]")).toBeFocused();
  });

  test("preventDefault() on re-select keeps the menu open", async ({ page }) => {
    await page.goto("./context-menu.html");
    await page.evaluate(() => {
      document
        .querySelector("[data-re-context-menu]")!
        .addEventListener("re-select", (e) => e.preventDefault());
    });
    await openAtPointer(page);
    await page.locator('#ctx-1 [data-value="open"]').click();
    await expect(page.locator("#ctx-1")).toBeVisible();
  });

  test("a region inside a hosted .re-menu is skipped", async ({ page }) => {
    await page.goto("./context-menu.html");
    const ready = await page.evaluate(async () => {
      const { enhanceContextMenu } = await import("/packages/core/src/behaviors/context-menu.js");
      const host = document.createElement("div");
      host.setAttribute("data-re-menu", "");
      host.innerHTML =
        '<div id="rgn" data-re-context-menu="p2">x</div>' +
        '<div id="p2" role="menu" hidden><button role="menuitem">A</button></div>';
      document.body.appendChild(host);
      enhanceContextMenu(host);
      const r = host.querySelector("#rgn")!.hasAttribute("data-re-context-menu-ready");
      host.remove();
      return r;
    });
    expect(ready).toBe(false); // not wired — the hosted menu owns this subtree
  });

  test("Shift+F10 opens from the focused region", async ({ page }) => {
    await page.goto("./context-menu.html");
    await page.locator("[data-re-context-menu]").focus();
    await page.keyboard.press("Shift+F10");
    await expect(page.locator("#ctx-1")).toBeVisible();
  });

  test("destroy() cleans up", async ({ page }) => {
    await page.goto("./context-menu.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    await expect(page.locator("[data-re-context-menu]")).not.toHaveAttribute(
      "data-re-context-menu-ready",
      "",
    );
  });
});
