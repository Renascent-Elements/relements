import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("timeline page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./timeline.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("dots are decorative — hidden from assistive tech", async ({ page }) => {
  await page.goto("./timeline.html");
  const markers = page.getByTestId("basic").locator(".re-timeline__marker");
  const count = await markers.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(markers.nth(i)).toHaveAttribute("aria-hidden", "true");
  }
});

test("the current event is programmatically current, not colour-only", async ({ page }) => {
  await page.goto("./timeline.html");
  // The accent dot is reinforcement; aria-current is the cue AT actually hears.
  await expect(
    page.getByTestId("current").locator(".re-timeline__item[data-current]"),
  ).toHaveAttribute("aria-current", "step");
});
