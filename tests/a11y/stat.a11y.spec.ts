import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("stat page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./stat.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("every trend states its direction in real text, not colour alone (WCAG 1.4.1)", async ({
  page,
}) => {
  await page.goto("./stat.html");
  const trends = page.locator(".re-stat__trend");
  const count = await trends.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    // A non-empty .re-sr-only direction word is the cue assistive tech actually
    // reads — generated arrow glyphs are not reliably exposed.
    await expect(trends.nth(i).locator(".re-sr-only")).not.toBeEmpty();
  }
});

test("trend direction survives forced colors via arrow shape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "forced-colors emulation is Chromium-only");
  await page.goto("./stat.html");
  await page.emulateMedia({ forcedColors: "active" });
  const up = page.getByTestId("trend").locator('.re-stat__trend[data-trend="up"]');
  // The trend stays visible and keeps its distinguishing arrow shape even when
  // the UA flattens its colour to a system colour.
  await expect(up).toBeVisible();
  const arrow = await up.evaluate((el) => getComputedStyle(el, "::before").content);
  expect(arrow).toContain("↑");
});
