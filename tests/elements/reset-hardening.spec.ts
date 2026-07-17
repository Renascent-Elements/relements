import { expect, test } from "@playwright/test";

/**
 * Hosts commonly ship an unlayered global `* { margin: 0 }` reset (Starlight,
 * Tailwind preflight, most "modern reset" snippets), which outranks the
 * re.components layer and would strip margins that are GEOMETRY, not
 * decoration. index.css re-asserts those in an unlayered block whose classed
 * selectors beat `*` on plain specificity. Each test injects the hostile
 * reset and asserts the geometry survives. (Single-element offsets ride
 * `transform` instead; see choice.spec.ts for that guard.)
 */
const HOSTILE_RESET = "* { margin: 0; }";

test.describe("reset-hardened geometry", () => {
  test("button-group seams stay collapsed in both orientations", async ({ page }) => {
    await page.goto("./button-group.html");
    await page.addStyleTag({ content: HOSTILE_RESET });
    const horizontal = page.getByTestId("basic").locator(".re-button-group > .re-button").nth(1);
    expect(await horizontal.evaluate((el) => getComputedStyle(el).marginInlineStart)).toBe("-1px");
    const vertical = page
      .getByTestId("orientation")
      .locator('.re-button-group[data-orientation="vertical"] > .re-button')
      .nth(1);
    expect(await vertical.evaluate((el) => getComputedStyle(el).marginBlockStart)).toBe("-1px");
  });

  test("toggle-group seams stay collapsed", async ({ page }) => {
    await page.goto("./toggle-group.html");
    await page.addStyleTag({ content: HOSTILE_RESET });
    const second = page.getByTestId("basic").locator(".re-toggle-group__option").nth(1);
    expect(await second.evaluate((el) => getComputedStyle(el).marginInlineStart)).toBe("-1px");
  });

  test("avatar-group keeps its overlap", async ({ page }) => {
    await page.goto("./avatar.html");
    await page.addStyleTag({ content: HOSTILE_RESET });
    const avatars = page.getByTestId("group").locator(".re-avatar-group > .re-avatar");
    const margin = await avatars
      .nth(1)
      .evaluate((el) => parseFloat(getComputedStyle(el).marginInlineStart));
    expect(margin).toBeLessThan(0); // still pulled over its neighbour
    const a = await avatars.nth(0).boundingBox();
    const b = await avatars.nth(1).boundingBox();
    expect(a!.x + a!.width).toBeGreaterThan(b!.x); // visibly overlapping
  });

  test("empty-state stays centered", async ({ page }) => {
    await page.goto("./empty-state.html");
    await page.addStyleTag({ content: HOSTILE_RESET });
    const marginLeft = await page
      .getByTestId("basic")
      .locator(".re-empty-state")
      .evaluate((el) => parseFloat(getComputedStyle(el).marginLeft));
    expect(marginLeft).toBeGreaterThan(0); // auto margins still resolve
  });

  test("a modal dialog stays centered (UA margin:auto is also reset-killed)", async ({ page }) => {
    await page.goto("./dialog.html");
    await page.addStyleTag({ content: HOSTILE_RESET });
    await page.getByTestId("modal").locator("[data-re-dialog-trigger]").first().click();
    const dialog = page.locator(".re-dialog[open]").first();
    await expect(dialog).toBeVisible();
    const m = await dialog.evaluate((el) => ({
      left: parseFloat(getComputedStyle(el).marginLeft),
      top: parseFloat(getComputedStyle(el).marginTop),
    }));
    expect(m.left).toBeGreaterThan(0);
    expect(m.top).toBeGreaterThan(0);
  });
});
