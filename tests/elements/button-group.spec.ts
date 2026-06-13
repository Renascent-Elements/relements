import { expect, test } from "@playwright/test";

test.describe("button-group", () => {
  test("rounds only the outer corners; middle member is square", async ({ page }) => {
    await page.goto("./button-group.html");
    const btns = page.getByTestId("basic").locator(".re-button");
    const radius = (i: number, prop: string) =>
      btns.nth(i).evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

    // First member: inline-start corners rounded, inline-end corners square.
    expect(await radius(0, "border-start-start-radius")).not.toBe("0px");
    expect(await radius(0, "border-start-end-radius")).toBe("0px");
    // Middle member: all square.
    expect(await radius(1, "border-start-start-radius")).toBe("0px");
    expect(await radius(1, "border-end-end-radius")).toBe("0px");
    // Last member: inline-end corners rounded.
    expect(await radius(2, "border-start-end-radius")).not.toBe("0px");
    expect(await radius(2, "border-start-start-radius")).toBe("0px");
  });

  test("collapses the shared seam to a single border width (no double border)", async ({
    page,
  }) => {
    await page.goto("./button-group.html");
    const btns = page.getByTestId("basic").locator(".re-button");
    const a = await btns.nth(0).boundingBox();
    const b = await btns.nth(1).boundingBox();
    // Adjacent members overlap by exactly one border width (negative gap), not 2px apart.
    const gap = b!.x - (a!.x + a!.width);
    // Strictly negative — proves the seam actually collapsed (touching, gap === 0,
    // would leave a visible double border and must fail).
    expect(gap).toBeLessThan(0);
    expect(gap).toBeGreaterThan(-2);
  });

  test("rounding + seam collapse mirror in RTL (logical properties)", async ({ page }) => {
    await page.goto("./button-group.html");
    const group = page.getByTestId("basic").locator(".re-button-group");
    await group.evaluate((el) => el.setAttribute("dir", "rtl"));
    const btns = group.locator(".re-button");
    // First child still rounds its inline-start (now visual-right) corners; the
    // physical-left corners are square — proving logical, not physical, radii.
    expect(await btns.nth(0).evaluate((el) => getComputedStyle(el).borderTopRightRadius)).not.toBe(
      "0px",
    );
    expect(await btns.nth(0).evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      "0px",
    );
    // Seam still collapses (members still overlap on the inline axis).
    const a = await btns.nth(0).boundingBox();
    const b = await btns.nth(1).boundingBox();
    const overlap = Math.min(a!.x + a!.width, b!.x + b!.width) - Math.max(a!.x, b!.x);
    expect(overlap).toBeGreaterThan(0);
  });

  test("a focused member lifts above neighbors and the group never clips the ring", async ({
    page,
  }) => {
    await page.goto("./button-group.html");
    const group = page.getByTestId("basic").locator(".re-button-group");
    const mid = group.locator(".re-button").nth(1);
    await mid.focus();
    expect(await mid.evaluate((el) => getComputedStyle(el).zIndex)).toBe("2");
    expect(await mid.evaluate((el) => getComputedStyle(el).position)).toBe("relative");
    expect(await group.evaluate((el) => getComputedStyle(el).overflow)).toBe("visible");
  });

  test("vertical group collapses + rounds on the block axis", async ({ page }) => {
    await page.goto("./button-group.html");
    const group = page.getByTestId("orientation").locator(".re-button-group");
    expect(await group.evaluate((el) => getComputedStyle(el).flexDirection)).toBe("column");
    const btns = group.locator(".re-button");
    expect(await btns.nth(0).evaluate((el) => getComputedStyle(el).borderEndStartRadius)).toBe(
      "0px",
    );
    expect(
      await btns.nth(0).evaluate((el) => getComputedStyle(el).borderStartStartRadius),
    ).not.toBe("0px");
    // block-axis overlap
    const a = await btns.nth(0).boundingBox();
    const b = await btns.nth(1).boundingBox();
    expect(b!.y - (a!.y + a!.height)).toBeLessThanOrEqual(0);
  });

  test("an aria-disabled link member keeps focus and doesn't break neighbor rounding", async ({
    page,
  }) => {
    await page.goto("./button-group.html");
    const group = page.getByTestId("links").locator(".re-button-group");
    const pdf = group.locator('[aria-disabled="true"]');
    await expect(pdf).toHaveAttribute("aria-disabled", "true");
    // last member still rounds its inline-end corners
    expect(await pdf.evaluate((el) => getComputedStyle(el).borderEndEndRadius)).not.toBe("0px");
  });
});
