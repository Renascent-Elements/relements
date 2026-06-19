import { expect, test } from "@playwright/test";

test.describe("File input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./file.html");
  });

  test("is a native file input", async ({ page }) => {
    await expect(page.getByLabel("Resume")).toHaveAttribute("type", "file");
  });

  test("multiple attribute is honored", async ({ page }) => {
    await expect(page.getByLabel("Attachments")).toHaveJSProperty("multiple", true);
  });

  test("data-size changes the control height", async ({ page }) => {
    const h = async (name: string) => (await page.getByLabel(name).boundingBox())!.height;
    expect(await h("Small file input")).toBeLessThan(await h("Medium file input"));
    expect(await h("Medium file input")).toBeLessThan(await h("Large file input"));
  });

  test("disabled file input is disabled", async ({ page }) => {
    await expect(page.getByLabel("Disabled file input")).toBeDisabled();
  });

  test("aria-invalid recolours the border", async ({ page }) => {
    const border = (name: string) =>
      page.getByLabel(name).evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(await border("Invalid file input")).not.toBe(await border("Medium file input"));
  });
});
