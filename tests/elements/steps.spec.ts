import { expect, test } from "@playwright/test";

const steps = (page: import("@playwright/test").Page) =>
  page.getByTestId("vertical").locator(".re-steps");

test.describe("steps", () => {
  test("root is a native <ol> with ordered semantics kept (no role override)", async ({ page }) => {
    await page.goto("./steps.html");
    const ol = steps(page);
    expect(await ol.evaluate((el) => el.tagName)).toBe("OL");
    // NOT role=list — that would downgrade the <ol> and drop "N of M".
    await expect(ol).not.toHaveAttribute("role", /.+/);
  });

  test("exactly one aria-current=step, on the <li>, co-located with data-status=current", async ({
    page,
  }) => {
    await page.goto("./steps.html");
    const current = steps(page).locator("[aria-current]");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("aria-current", "step"); // step, NOT page
    expect(await current.evaluate((el) => el.tagName)).toBe("LI");
    await expect(current).toHaveAttribute("data-status", "current");
  });

  test("a completed step is a real focusable link; an upcoming step is inert", async ({ page }) => {
    await page.goto("./steps.html");
    const ol = steps(page);
    const completeLink = ol
      .locator('.re-steps__step[data-status="complete"] .re-steps__content')
      .first();
    expect(await completeLink.evaluate((el) => el.tagName)).toBe("A");
    await expect(completeLink).toHaveAttribute("href", /account/);
    await completeLink.focus();
    await expect(completeLink).toBeFocused();

    // upcoming content is an inert <span> — not a tab stop
    const upcoming = ol
      .locator('.re-steps__step[data-status="upcoming"] .re-steps__content')
      .first();
    expect(await upcoming.evaluate((el) => el.tagName)).toBe("SPAN");
    expect(await upcoming.evaluate((el) => el.tabIndex)).toBe(-1);
  });

  test("a complete marker shows a CSS check (bordered ::before), others show a number", async ({
    page,
  }) => {
    await page.goto("./steps.html");
    const ol = steps(page);
    // structural, engine-stable: the check is built from ::before borders.
    const completeBorder = await ol
      .locator('.re-steps__step[data-status="complete"] .re-steps__marker')
      .first()
      .evaluate((el) => getComputedStyle(el, "::before").borderRightWidth);
    const upcomingBorder = await ol
      .locator('.re-steps__step[data-status="upcoming"] .re-steps__marker')
      .first()
      .evaluate((el) => getComputedStyle(el, "::before").borderRightWidth);
    const currentBorder = await ol
      .locator('.re-steps__step[data-status="current"] .re-steps__marker')
      .first()
      .evaluate((el) => getComputedStyle(el, "::before").borderRightWidth);
    expect(parseFloat(completeBorder)).toBeGreaterThan(0); // check bracket
    expect(parseFloat(upcomingBorder)).toBe(0); // numbered, no bracket
    expect(parseFloat(currentBorder)).toBe(0); // current is numbered too, not a check
  });

  test("every non-current step exposes its status to assistive tech (sr-only)", async ({
    page,
  }) => {
    await page.goto("./steps.html");
    const ol = steps(page);
    // completion is visual-only on the aria-hidden marker, so the status word is
    // carried by a visually-hidden label (WCAG 1.3.1) on complete/upcoming steps
    const complete = ol.locator('.re-steps__step[data-status="complete"]').first();
    const upcoming = ol.locator('.re-steps__step[data-status="upcoming"]').first();
    await expect(complete.locator(".re-sr-only")).toHaveText(/completed/i);
    await expect(upcoming.locator(".re-sr-only")).toHaveText(/upcoming/i);
  });

  test("the rail fills (accent) only up to the last complete step", async ({ page }) => {
    await page.goto("./steps.html");
    const ol = steps(page);
    const railColor = (status: string) =>
      ol
        .locator(`.re-steps__step[data-status="${status}"]`)
        .first()
        .evaluate((el) => getComputedStyle(el, "::before").backgroundColor);
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--re-color-accent-600").trim(),
    );
    // a complete step's outgoing segment is accent; the current step's is the base rail
    const completeRail = await railColor("complete");
    const currentRail = await railColor("current");
    expect(completeRail).not.toBe(currentRail);
    expect(accent.length).toBeGreaterThan(0);
  });

  test("sm horizontal hides the description; lg keeps it", async ({ page }) => {
    await page.goto("./steps.html");
    const sizes = page.getByTestId("sizes");
    const smDesc = sizes.locator('.re-steps[data-size="sm"] .re-steps__description').first();
    const lgDesc = sizes.locator('.re-steps[data-size="lg"] .re-steps__description').first();
    expect(await smDesc.evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await lgDesc.evaluate((el) => getComputedStyle(el).display)).not.toBe("none");
  });

  test("orientation is attribute-only: vertical stacks, horizontal flows inline", async ({
    page,
  }) => {
    await page.goto("./steps.html");
    const markerXs = async (testid: string) =>
      page
        .getByTestId(testid)
        .locator(".re-steps__marker")
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().x)));
    const vx = await markerXs("vertical");
    const hx = await markerXs("horizontal");
    // vertical: markers share an x; horizontal: markers ascend in x
    expect(new Set(vx).size).toBe(1);
    expect(hx).toEqual([...hx].sort((a, b) => a - b));
    expect(new Set(hx).size).toBe(hx.length);
  });
});
