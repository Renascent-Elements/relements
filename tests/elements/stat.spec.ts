import { expect, test } from "@playwright/test";

test.describe("stat", () => {
  test("renders a label and a prominent value", async ({ page }) => {
    await page.goto("./stat.html");
    const stat = page.getByTestId("basic").locator(".re-stat");
    await expect(stat.locator(".re-stat__label")).toHaveText(/total users/i);
    await expect(stat.locator(".re-stat__value")).toHaveText("12,486");
    // The value is the prominent figure: larger than the label.
    const valueSize = await stat
      .locator(".re-stat__value")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const labelSize = await stat
      .locator(".re-stat__label")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(valueSize).toBeGreaterThan(labelSize);
  });

  test("the value uses tabular figures so columns align", async ({ page }) => {
    await page.goto("./stat.html");
    const fvn = await page
      .getByTestId("basic")
      .locator(".re-stat__value")
      .evaluate((el) => getComputedStyle(el).fontVariantNumeric);
    expect(fvn).toContain("tabular-nums");
  });

  test("trend direction rides a glyph + colour, not colour alone", async ({ page }) => {
    await page.goto("./stat.html");
    const arrow = (testid: string, trend: string) =>
      page
        .getByTestId(testid)
        .locator(`.re-stat__trend[data-trend="${trend}"]`)
        .evaluate((el) => getComputedStyle(el, "::before").content);
    const color = (testid: string, trend: string) =>
      page
        .getByTestId(testid)
        .locator(`.re-stat__trend[data-trend="${trend}"]`)
        .evaluate((el) => getComputedStyle(el).color);

    // Distinct arrow SHAPE per direction (survives forced-colors, where colour flattens).
    expect(await arrow("trend", "up")).toContain("↑");
    expect(await arrow("group", "down")).toContain("↓");
    expect(await arrow("group", "flat")).toContain("→");
    // …and distinct colour as enhancement (up ≠ down).
    expect(await color("group", "up")).not.toBe(await color("group", "down"));
  });

  test("trend carries an author-supplied screen-reader direction word", async ({ page }) => {
    await page.goto("./stat.html");
    const trend = page.getByTestId("trend").locator(".re-stat__trend");
    await expect(trend.locator(".re-sr-only")).toHaveText(/trending up/i);
    // Full reading order: direction word then the delta.
    await expect(trend).toHaveText(/trending up\s*12% vs last month/i);
  });

  test("group lays stats in a row with optional dividers", async ({ page }) => {
    await page.goto("./stat.html");
    const stats = page.getByTestId("group").locator(".re-stat-group > .re-stat");
    await expect(stats).toHaveCount(3);
    // First item has no leading divider; later items do.
    const borderWidth = (i: number) =>
      stats.nth(i).evaluate((el) => parseFloat(getComputedStyle(el).borderInlineStartWidth));
    expect(await borderWidth(0)).toBe(0);
    expect(await borderWidth(1)).toBeGreaterThan(0);
  });

  test("compact (data-size=sm) shrinks the value; centered aligns the column", async ({ page }) => {
    await page.goto("./stat.html");
    const valueSize = (testid: string) =>
      page
        .getByTestId(testid)
        .locator(".re-stat__value")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await valueSize("compact")).toBeLessThan(await valueSize("basic"));
    const align = await page
      .getByTestId("compact")
      .locator(".re-stat")
      .evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe("center");
  });
});
