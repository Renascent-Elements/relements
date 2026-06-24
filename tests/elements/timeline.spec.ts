import { expect, test } from "@playwright/test";

test.describe("timeline", () => {
  test("is an ordered list whose sequence semantics are kept (no role=list)", async ({ page }) => {
    await page.goto("./timeline.html");
    const list = page.getByTestId("basic").locator(".re-timeline");
    expect(await list.evaluate((el) => el.tagName)).toBe("OL");
    // role="list" would downgrade the <ol> and drop the sequence read — must be absent.
    expect(await list.evaluate((el) => el.getAttribute("role"))).toBeNull();
    expect(await list.evaluate((el) => getComputedStyle(el).listStyleType)).toBe("none");
    await expect(list.locator(".re-timeline__item")).toHaveCount(3);
  });

  test("each event has a marker, a title and a machine-readable time", async ({ page }) => {
    await page.goto("./timeline.html");
    const first = page.getByTestId("basic").locator(".re-timeline__item").first();
    await expect(first.locator(".re-timeline__marker")).toHaveCount(1);
    await expect(first.locator(".re-timeline__title")).toHaveText(/project created/i);
    const time = first.locator("time.re-timeline__time");
    await expect(time).toHaveAttribute("datetime", "2026-01-04");
  });

  test("the connector rail joins every item except the last", async ({ page }) => {
    await page.goto("./timeline.html");
    const items = page.getByTestId("basic").locator(".re-timeline__item");
    const railContent = (i: number) =>
      items.nth(i).evaluate((el) => getComputedStyle(el, "::before").content);
    const railWidth = (i: number) =>
      items.nth(i).evaluate((el) => parseFloat(getComputedStyle(el, "::before").inlineSize));
    // first two items draw a rail segment; the last draws none (no trailing stub).
    expect(await railContent(0)).not.toBe("none");
    expect(await railWidth(0)).toBeGreaterThan(0);
    expect(await railContent(2)).toBe("none");
  });

  test("a current event gets a distinct accent dot + aria-current", async ({ page }) => {
    await page.goto("./timeline.html");
    const current = page.getByTestId("current").locator(".re-timeline__item[data-current]");
    await expect(current).toHaveAttribute("aria-current", "step");
    const currentDot = await current
      .locator(".re-timeline__marker")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const plainDot = await page
      .getByTestId("current")
      .locator(".re-timeline__item:not([data-current]) .re-timeline__marker")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(currentDot).not.toBe(plainDot);
  });

  test("compact (data-size=sm) shrinks the meta type", async ({ page }) => {
    await page.goto("./timeline.html");
    const timeSize = (testid: string) =>
      page
        .getByTestId(testid)
        .locator(".re-timeline__time")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await timeSize("compact")).toBeLessThan(await timeSize("basic"));
  });
});
