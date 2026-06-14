import { expect, test } from "@playwright/test";

test.describe("empty-state", () => {
  test("is centered with a title, description and actions", async ({ page }) => {
    await page.goto("./empty-state.html");
    const es = page.getByTestId("basic").locator(".re-empty-state");
    expect(await es.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    expect(await es.evaluate((el) => getComputedStyle(el).marginInlineStart)).not.toBe("0px");
    await expect(es.locator(".re-empty-state__title")).toHaveText(/no projects/i);
    await expect(es.locator(".re-empty-state__actions .re-button")).toHaveCount(2);
  });

  test("compact (data-size=sm) shrinks padding, icon and title vs the default", async ({
    page,
  }) => {
    await page.goto("./empty-state.html");
    const titleSize = (testid: string) =>
      page
        .getByTestId(testid)
        .locator(".re-empty-state__title")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const padBlock = (testid: string) =>
      page
        .getByTestId(testid)
        .locator(".re-empty-state")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingBlockStart));
    expect(await titleSize("compact")).toBeLessThan(await titleSize("basic"));
    expect(await padBlock("compact")).toBeLessThan(await padBlock("basic"));
  });

  test("bordered variant adds a dashed border", async ({ page }) => {
    await page.goto("./empty-state.html");
    const es = page.getByTestId("bordered").locator(".re-empty-state");
    expect(await es.evaluate((el) => getComputedStyle(el).borderStyle)).toContain("dashed");
  });

  test("in a table cell: no double padding, owns its font (transparent bg)", async ({ page }) => {
    await page.goto("./empty-state.html");
    const cell = page.getByTestId("in-table").locator("td.re-empty-state-cell");
    expect(await cell.evaluate((el) => getComputedStyle(el).padding)).toBe("0px");
    const es = cell.locator(".re-empty-state");
    expect(await es.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      "rgba(0, 0, 0, 0)",
    );
    // no horizontal overflow inside the cell
    const overflow = await cell.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    // The load-bearing font override: the helper resets the inherited small table
    // font (sm/14px) back to md (16px). Assert it actually wins over `.re-table`.
    const cellFont = await cell.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const plainTdFont = await page
      .getByTestId("in-table")
      .locator("thead th")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(cellFont).toBeGreaterThan(plainTdFont);
    expect(cellFont).toBe(16);
  });

  test("omitting the icon and actions still spaces correctly (gap-driven)", async ({ page }) => {
    await page.goto("./empty-state.html");
    const es = page.getByTestId("compact").locator(".re-empty-state");
    await expect(es.locator(".re-empty-state__icon")).toHaveCount(0);
    // title has no stray margin (rhythm comes from the flex gap)
    const title = es.locator(".re-empty-state__title");
    expect(await title.evaluate((el) => getComputedStyle(el).marginBlockStart)).toBe("0px");
  });
});
