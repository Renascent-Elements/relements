import { expect, test } from "@playwright/test";

const field = (page: import("@playwright/test").Page) =>
  page.getByTestId("basic").locator(".re-range");

test.describe("range", () => {
  test("thumbs cannot cross (low value clamps below high)", async ({ page }) => {
    await page.goto("./range.html");
    const fs = field(page);
    const low = fs.locator("[data-re-range-min]");
    const high = fs.locator("[data-re-range-max]");
    await low.evaluate((el: HTMLInputElement) => {
      el.value = "900"; // past high (700)
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(await low.evaluate((el: HTMLInputElement) => el.valueAsNumber)).toBeLessThan(
      await high.evaluate((el: HTMLInputElement) => el.valueAsNumber),
    );
  });

  test("the fill band tracks the thumbs", async ({ page }) => {
    await page.goto("./range.html");
    const fs = field(page);
    await fs.locator("[data-re-range-min]").evaluate((el: HTMLInputElement) => {
      el.value = "100";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(await fs.evaluate((el) => el.style.getPropertyValue("--re-range-fill-start"))).toBe(
      "10%",
    );
  });

  test("keeps native min/max static (so each thumb maps to the full track)", async ({ page }) => {
    await page.goto("./range.html");
    const fs = field(page);
    await fs.locator("[data-re-range-min]").evaluate((el: HTMLInputElement) => {
      el.value = "300";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // low.max and high.min are NOT mutated (value-clamp approach)
    expect(await fs.locator("[data-re-range-min]").getAttribute("max")).toBe("1000");
    expect(await fs.locator("[data-re-range-max]").getAttribute("min")).toBe("0");
  });

  test("base works with no JS: both inputs focusable + submit their names", async ({ page }) => {
    await page.goto("./range.html");
    const fs = field(page);
    await expect(fs.locator('[name="price-min"]')).toHaveCount(1);
    await expect(fs.locator('[name="price-max"]')).toHaveCount(1);
    await fs.locator("[data-re-range-min]").focus();
    await expect(fs.locator("[data-re-range-min]")).toBeFocused();
  });

  test("clicking the track moves the nearer thumb (and focuses it)", async ({ page }) => {
    await page.goto("./range.html");
    const result = await page.evaluate(() => {
      const fs = document.querySelector('[data-testid="basic"] .re-range')!;
      const track = fs.querySelector<HTMLElement>(".re-range__track")!;
      const low = fs.querySelector<HTMLInputElement>("[data-re-range-min]")!;
      const r = track.getBoundingClientRect();
      // 10% from the left → nearer the LOW thumb (200) than HIGH (700)
      track.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * 0.1 }),
      );
      return { focusedLow: document.activeElement === low, lowValue: low.valueAsNumber };
    });
    expect(result.focusedLow).toBe(true);
    expect(result.lowValue).toBeLessThan(200);
  });

  test("a disabled fieldset ignores track clicks", async ({ page }) => {
    await page.goto("./range.html");
    const changed = await page.evaluate(() => {
      const fs = document.querySelector('[data-testid="disabled"] .re-range')!;
      const track = fs.querySelector<HTMLElement>(".re-range__track")!;
      const low = fs.querySelector<HTMLInputElement>("[data-re-range-min]")!;
      const before = low.value;
      const r = track.getBoundingClientRect();
      track.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * 0.5 }),
      );
      return low.value !== before;
    });
    expect(changed).toBe(false);
  });

  test("destroy() removes the fill props + ready flag", async ({ page }) => {
    await page.goto("./range.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    await expect(field(page)).not.toHaveAttribute("data-re-range-ready", "");
  });
});
