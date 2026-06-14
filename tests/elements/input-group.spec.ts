import { expect, test } from "@playwright/test";

test.describe("input group", () => {
  test("the group owns the focus ring; the inner input does not double it", async ({ page }) => {
    await page.goto("./input-group.html");
    const group = page.getByTestId("affixes").locator(".re-input-group").first();
    const input = group.locator(".re-input");

    await input.focus();

    const groupShadow = await group.evaluate((el) => getComputedStyle(el).boxShadow);
    const inputShadow = await input.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(groupShadow).not.toBe("none");
    expect(inputShadow).toBe("none");
  });

  test("inner input keeps native semantics (type, value, typing)", async ({ page }) => {
    await page.goto("./input-group.html");
    const input = page.getByTestId("affixes").locator(".re-input").first();
    await input.fill("acme");
    await expect(input).toHaveValue("acme");
  });

  test("reflects the invalid state on the group border", async ({ page }) => {
    await page.goto("./input-group.html");
    const states = page.getByTestId("states");
    const invalid = states.locator(".re-input-group").nth(1); // aria-invalid group
    const valid = states.locator(".re-input-group").first(); // disabled (not invalid)

    const invalidColor = await invalid.evaluate((el) => getComputedStyle(el).borderTopColor);
    const validColor = await valid.evaluate((el) => getComputedStyle(el).borderTopColor);
    const danger = await invalid.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--re-color-danger-border").trim(),
    );
    expect(invalidColor).not.toBe(validColor);
    // The danger token resolves to the same computed color as the border.
    const dangerComputed = await invalid.evaluate((el, tok) => {
      el.style.color = tok;
      return getComputedStyle(el).color;
    }, danger);
    expect(invalidColor).toBe(dangerComputed);
  });

  test("reflects the disabled state on the group", async ({ page }) => {
    await page.goto("./input-group.html");
    const group = page.getByTestId("states").locator(".re-input-group").first();
    const bg = await group.evaluate((el) => getComputedStyle(el).backgroundColor);
    const muted = await group.evaluate((el) => {
      el.style.color = getComputedStyle(el).getPropertyValue("--re-color-bg-muted");
      return getComputedStyle(el).color;
    });
    expect(bg).toBe(muted);
  });
});
