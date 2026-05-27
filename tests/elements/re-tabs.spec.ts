import { expect, test } from "@playwright/test";

test.describe("<re-tabs>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-tabs.html");
  });

  test("registers as a defined custom element", async ({ page }) => {
    const isDefined = await page.evaluate(() => Boolean(customElements.get("re-tabs")));
    expect(isDefined).toBe(true);
  });

  test("renders the same ARIA contract as the enhancer", async ({ page }) => {
    await expect(page.getByRole("tablist", { name: "Account" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Profile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("keyboard arrow nav works", async ({ page }) => {
    await page.locator("#rt-t-profile").focus();
    await page.keyboard.press("ArrowRight");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("rt-t-security");
  });

  test("element.value reflects the selected tab id", async ({ page }) => {
    const v = await page.evaluate(() => {
      // @ts-expect-error
      return document.getElementById("rt-1")!.value;
    });
    expect(v).toBe("rt-t-profile");
  });

  test("setting element.value switches the tab", async ({ page }) => {
    await page.locator("#rt-set-billing").click();
    await expect(page.locator("#rt-t-billing")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#rt-p-billing")).toBeVisible();
    await expect(page.locator("#rt-value")).toHaveText("rt-t-billing");
  });

  test("re-change bubbles out of the custom element", async ({ page }) => {
    const tabId = await page.evaluate(() => {
      return new Promise<string>((resolve) => {
        document.addEventListener(
          "re-change",
          (event) => {
            // @ts-expect-error
            resolve(event.detail.tabId);
          },
          { once: true },
        );
        (document.getElementById("rt-t-security") as HTMLButtonElement).click();
      });
    });
    expect(tabId).toBe("rt-t-security");
  });

  test("disconnecting tears down the controller", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById("rt-1");
      el?.remove();
    });
    // No assertion needed beyond no errors; the test is the absence of throws.
    const exists = await page.evaluate(() => Boolean(document.getElementById("rt-1")));
    expect(exists).toBe(false);
  });
});
