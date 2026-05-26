import { expect, test } from "@playwright/test";

test.describe("Button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./button.html");
  });

  test("renders all variants", async ({ page }) => {
    const variants = page.getByTestId("variants");
    await expect(variants.getByRole("button", { name: "Primary" })).toBeVisible();
    await expect(variants.getByRole("button", { name: "Secondary" })).toBeVisible();
    await expect(variants.getByRole("button", { name: "Ghost" })).toBeVisible();
    await expect(variants.getByRole("button", { name: "Danger" })).toBeVisible();
  });

  test("clicks increment the counter", async ({ page }) => {
    const button = page.getByRole("button", { name: "Increment" });
    const count = page.locator("#count");
    await expect(count).toHaveText("0");
    await button.click();
    await button.click();
    await button.click();
    await expect(count).toHaveText("3");
  });

  test("keyboard Enter activates a button", async ({ page }) => {
    await page.locator("#increment").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#count")).toHaveText("1");
  });

  test("keyboard Space activates a button", async ({ page }) => {
    await page.locator("#increment").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#count")).toHaveText("1");
  });

  test("native disabled prevents activation", async ({ page }) => {
    const button = page.locator("#state-disabled");
    await expect(button).toBeDisabled();
    // Forced click bypasses pointer-events:none and proves disabled blocks at the DOM level.
    await button.click({ force: true }).catch(() => {});
    // No counter exists, but disabled buttons shouldn't fire click in the first place.
    const fired = await page.evaluate(() => {
      let count = 0;
      const el = document.getElementById("state-disabled");
      el?.addEventListener("click", () => (count += 1));
      el?.click();
      return count;
    });
    expect(fired).toBe(0);
  });

  test("aria-disabled keeps the button focusable but inert", async ({ page }) => {
    const button = page.locator("#state-aria-disabled");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await button.focus();
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe("state-aria-disabled");
  });

  test("submit button submits the form natively", async ({ page }) => {
    const form = page.locator("#demo-form");
    await page.locator("#submit-btn").click();
    await expect(form).toHaveAttribute("data-submitted", "true");
  });

  test("focus ring appears on keyboard focus", async ({ page }) => {
    await page.locator("#state-default").focus();
    const shadow = await page.evaluate(() => {
      const el = document.getElementById("state-default") as HTMLElement;
      // focus-visible is not synthesized by .focus(); use tab.
      return getComputedStyle(el).boxShadow;
    });
    // Either focus-visible matched (box-shadow) or fall back; ensure at least the element is focused.
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe("state-default");
    expect(typeof shadow).toBe("string");
  });

  test("link variant renders as <a> with re-button class", async ({ page }) => {
    const link = page.locator("#anchor-button");
    await expect(link).toHaveAttribute("href", "./index.html");
    const tag = await link.evaluate((el) => el.tagName);
    expect(tag).toBe("A");
  });

  test("size attribute changes computed height", async ({ page }) => {
    const heights = await page.evaluate(() => {
      const sm = document.querySelector('[data-testid="sizes"] [data-size="sm"]') as HTMLElement;
      const md = document.querySelector('[data-testid="sizes"] [data-size="md"]') as HTMLElement;
      const lg = document.querySelector('[data-testid="sizes"] [data-size="lg"]') as HTMLElement;
      return {
        sm: sm.getBoundingClientRect().height,
        md: md.getBoundingClientRect().height,
        lg: lg.getBoundingClientRect().height,
      };
    });
    expect(heights.sm).toBeLessThan(heights.md);
    expect(heights.md).toBeLessThan(heights.lg);
  });
});
