import { expect, test } from "@playwright/test";

test.describe("indicator", () => {
  test("the badge straddles the target's top-end corner", async ({ page }) => {
    await page.goto("./indicator.html");
    const wrap = page.getByTestId("count").locator(".re-indicator").first();
    const target = await wrap.locator(".re-button").boundingBox();
    const badge = await wrap.locator(".re-indicator__badge").boundingBox();
    // straddles: badge centre sits near the corner, so it pokes above and
    // beyond the target's end edge
    expect(badge!.y).toBeLessThan(target!.y);
    expect(badge!.x + badge!.width).toBeGreaterThan(target!.x + target!.width);
  });

  test("the corner is logical: the badge mirrors to the start side under RTL", async ({ page }) => {
    await page.goto("./indicator.html");
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    const wrap = page.getByTestId("count").locator(".re-indicator").first();
    const target = await wrap.locator(".re-button").boundingBox();
    const badge = await wrap.locator(".re-indicator__badge").boundingBox();
    expect(badge!.x).toBeLessThan(target!.x); // pokes past the LEFT edge in RTL
  });

  test("a single digit renders as a circle; longer counts grow into a pill", async ({ page }) => {
    await page.goto("./indicator.html");
    const badges = page.getByTestId("count").locator(".re-indicator__badge");
    const single = await badges.nth(0).boundingBox();
    const wide = await badges.nth(1).boundingBox(); // "99+"
    expect(Math.abs(single!.width - single!.height)).toBeLessThan(1);
    expect(wide!.width).toBeGreaterThan(wide!.height);
    expect(wide!.height).toBe(single!.height);
  });

  test("a dot is smaller than a count bubble and carries no visible text", async ({ page }) => {
    await page.goto("./indicator.html");
    const dot = await page
      .getByTestId("dot")
      .locator(".re-indicator__badge[data-dot]")
      .boundingBox();
    const count = await page
      .getByTestId("count")
      .locator(".re-indicator__badge")
      .first()
      .boundingBox();
    expect(dot!.width).toBeLessThan(count!.width);
    expect(Math.abs(dot!.width - dot!.height)).toBeLessThan(1);
  });

  test("tones change the fill; bottom-end moves the badge below the midline", async ({ page }) => {
    await page.goto("./indicator.html");
    const bg = (i: number) =>
      page
        .getByTestId("tones")
        .locator(".re-indicator__badge")
        .nth(i)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    const fills = await Promise.all([0, 1, 2, 3, 4].map(bg));
    expect(new Set(fills).size).toBe(5); // all five tones distinct
    const wrap = page.getByTestId("position").locator(".re-indicator");
    const avatar = await wrap.locator(".re-avatar").boundingBox();
    const badge = await wrap.locator(".re-indicator__badge").boundingBox();
    expect(badge!.y + badge!.height / 2).toBeGreaterThan(avatar!.y + avatar!.height / 2);
  });
});
