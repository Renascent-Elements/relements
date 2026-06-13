import { expect, test } from "@playwright/test";

test.describe("description list", () => {
  test("horizontal layout is a two-column grid with explicit placement", async ({ page }) => {
    await page.goto("./description-list.html");
    const dl = page.getByTestId("horizontal").locator(".re-description-list");
    expect(await dl.evaluate((el) => getComputedStyle(el).display)).toBe("grid");
    const cols = await dl.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(2);

    const term = dl.locator(".re-description-list__term").first();
    const dd = dl.locator(".re-description-list__details").first();
    expect(await term.evaluate((el) => getComputedStyle(el).gridColumnStart)).toBe("1");
    expect(await dd.evaluate((el) => getComputedStyle(el).gridColumnStart)).toBe("2");
  });

  test("a second details in a multi-dd group still lands in column 2", async ({ page }) => {
    await page.goto("./description-list.html");
    const dds = page.getByTestId("multi").locator(".re-description-list__details");
    expect(await dds.nth(1).evaluate((el) => getComputedStyle(el).gridColumnStart)).toBe("2");
  });

  test("--re-dl-term-width sets the term column width", async ({ page }) => {
    await page.goto("./description-list.html");
    const dl = page.getByTestId("horizontal").locator(".re-description-list");
    const firstTrack = await dl.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ")[0],
    );
    expect(parseFloat(firstTrack)).toBeCloseTo(128, 0); // 8rem
  });

  test("stacked layout is block flow with the term above its details", async ({ page }) => {
    await page.goto("./description-list.html");
    const dl = page.getByTestId("stacked").locator(".re-description-list");
    expect(await dl.evaluate((el) => getComputedStyle(el).display)).not.toBe("grid");
    const term = await dl.locator(".re-description-list__term").first().boundingBox();
    const dd = await dl.locator(".re-description-list__details").first().boundingBox();
    expect(term!.y).toBeLessThan(dd!.y);
  });

  test("follows the writing direction (RTL)", async ({ page }) => {
    await page.goto("./description-list.html");
    await page.getByTestId("horizontal").evaluate((el) => el.setAttribute("dir", "rtl"));
    const dl = page.getByTestId("horizontal").locator(".re-description-list");
    const term = await dl.locator(".re-description-list__term").first().boundingBox();
    const dd = await dl.locator(".re-description-list__details").first().boundingBox();
    expect(term!.x).toBeGreaterThan(dd!.x); // term column on the right in RTL
  });
});
