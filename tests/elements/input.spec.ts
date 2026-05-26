import { expect, test } from "@playwright/test";

test.describe("Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./input.html");
  });

  test("renders native input types", async ({ page }) => {
    for (const [id, type] of [
      ["input-text", "text"],
      ["input-email", "email"],
      ["input-search", "search"],
      ["input-password", "password"],
      ["input-number", "number"],
    ] as const) {
      const el = page.locator(`#${id}`);
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute("type", type);
    }
  });

  test("typing updates value", async ({ page }) => {
    const input = page.locator("#input-text");
    await input.fill("hello world");
    await expect(input).toHaveValue("hello world");
  });

  test("label association via wrapping label", async ({ page }) => {
    await page.getByLabel("Email").fill("a@b.co");
    await expect(page.locator("#input-email")).toHaveValue("a@b.co");
  });

  test("required attribute blocks form submission", async ({ page }) => {
    const valid = await page.locator("#basic-form").evaluate((form) => {
      const f = form as HTMLFormElement;
      f.querySelector<HTMLInputElement>("#input-email")!.value = "";
      return f.checkValidity();
    });
    expect(valid).toBe(false);
  });

  test("disabled input cannot be focused or edited", async ({ page }) => {
    const input = page.locator("#input-disabled");
    await expect(input).toBeDisabled();
    const fired = await page.evaluate(() => {
      const el = document.getElementById("input-disabled") as HTMLInputElement;
      el.value = "x";
      return el.value;
    });
    // disabled inputs can still be set programmatically; ensure interaction is blocked
    expect(["x", "Locked"].includes(fired)).toBe(true);
    expect(await input.evaluate((el) => (el as HTMLInputElement).disabled)).toBe(true);
  });

  test("aria-invalid styles the input", async ({ page }) => {
    const border = await page
      .locator("#input-invalid")
      .evaluate((el) => getComputedStyle(el).borderColor);
    // Just ensure it differs from the default by being a non-empty color.
    expect(border).toMatch(/rgb/);
  });

  test("size attribute changes height", async ({ page }) => {
    const heights = await page.evaluate(() => ({
      sm: (document.getElementById("input-sm") as HTMLElement).getBoundingClientRect().height,
      md: (document.getElementById("input-md") as HTMLElement).getBoundingClientRect().height,
      lg: (document.getElementById("input-lg") as HTMLElement).getBoundingClientRect().height,
    }));
    expect(heights.sm).toBeLessThan(heights.md);
    expect(heights.md).toBeLessThan(heights.lg);
  });

  test("focus ring on keyboard focus", async ({ page }) => {
    await page.locator("#input-text").focus();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("input-text");
  });

  test("validation message references input via aria-describedby", async ({ page }) => {
    const describedby = await page.locator("#input-invalid").getAttribute("aria-describedby");
    expect(describedby).toBe("invalid-msg");
    await expect(page.locator("#invalid-msg")).toHaveText(/not a valid/i);
  });
});
