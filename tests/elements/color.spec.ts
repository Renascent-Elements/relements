import { expect, test } from "@playwright/test";

test.describe("Color input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./color.html");
  });

  test("is a native color input with a hex value", async ({ page }) => {
    const el = page.getByLabel("Accent colour");
    await expect(el).toHaveAttribute("type", "color");
    await expect(el).toHaveValue("#2563eb");
  });

  test("value can be set", async ({ page }) => {
    const el = page.getByLabel("Accent colour");
    await el.evaluate((node) => ((node as HTMLInputElement).value = "#000000"));
    await expect(el).toHaveValue("#000000");
  });

  test("data-size changes the swatch footprint", async ({ page }) => {
    const w = async (name: string) => (await page.getByLabel(name).boundingBox())!.width;
    expect(await w("Small")).toBeLessThan(await w("Medium"));
    expect(await w("Medium")).toBeLessThan(await w("Large"));
  });

  test("disabled color input is disabled", async ({ page }) => {
    await expect(page.getByLabel("Disabled")).toBeDisabled();
  });

  test("aria-invalid recolours the border", async ({ page }) => {
    const el = page.getByLabel("Brand colour");
    const before = await el.evaluate((n) => getComputedStyle(n).borderTopColor);
    await el.evaluate((n) => n.setAttribute("aria-invalid", "true"));
    // border-color transitions, so poll until it settles off the start value.
    await expect
      .poll(() => el.evaluate((n) => getComputedStyle(n).borderTopColor))
      .not.toBe(before);
  });
});
