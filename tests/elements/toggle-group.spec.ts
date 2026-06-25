import { expect, test } from "@playwright/test";

test.describe("toggle-group", () => {
  test("is a fieldset of native checkboxes (not radios)", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const group = page.getByTestId("basic").locator(".re-toggle-group");
    expect(await group.evaluate((el) => el.tagName)).toBe("FIELDSET");
    const inputs = group.locator("input");
    await expect(inputs).toHaveCount(3);
    for (const type of await inputs.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).type),
    )) {
      expect(type).toBe("checkbox");
    }
  });

  test("supports multiple simultaneous selections (the segmented difference)", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const group = page.getByTestId("basic").locator(".re-toggle-group");
    // Bold + Italic start pressed.
    await expect(group.locator("input:checked")).toHaveCount(2);
    // Pressing a third does NOT clear the others (a radio group would).
    await group.locator('input[value="underline"]').check();
    await expect(group.locator("input:checked")).toHaveCount(3);
    // …and it can be toggled back off independently.
    await group.locator('input[value="bold"]').uncheck();
    await expect(group.locator("input:checked")).toHaveCount(2);
  });

  test("the pressed state is visibly distinct from unpressed", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const group = page.getByTestId("basic").locator(".re-toggle-group");
    const bg = (value: string) =>
      group
        .locator(`input[value="${value}"] + span`)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    // bold is checked, underline is not → different fills.
    expect(await bg("bold")).not.toBe(await bg("underline"));
  });

  test("each toggle carries name + value so the pressed set submits natively", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const inputs = page.getByTestId("basic").locator(".re-toggle-group input");
    for (const attrs of await inputs.evaluateAll((els) =>
      els.map((el) => ({ name: el.getAttribute("name"), value: el.getAttribute("value") })),
    )) {
      expect(attrs.name).toBeTruthy();
      expect(attrs.value).toBeTruthy();
    }
  });

  test("a disabled option cannot be toggled", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const map = page.getByTestId("disabled").locator('input[value="map"]');
    await expect(map).toBeDisabled();
  });

  test("compact (data-size=sm) is smaller than large", async ({ page }) => {
    await page.goto("./toggle-group.html");
    const span = (label: string) =>
      page
        .getByTestId("sizes")
        .locator(`.re-toggle-group[aria-label="${label}"] .re-toggle-group__option > span`)
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await span("Days (small)")).toBeLessThan(await span("Days (large)"));
  });
});
