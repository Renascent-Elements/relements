import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("banner page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./banner.html");
  // covers landmark labelling, button name, and message-text color-contrast on
  // BOTH the subtle tints and the solid *-700 fills (all rendered on the page).
  // The dismiss × uses the same currentColor as the message, so it shares that
  // verified contrast (axe parks the short × glyph in `incomplete`, not here).
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("honesty guard: solid emphasis rendered + every dismiss has an accessible name", async ({
  page,
}) => {
  await page.goto("./banner.html");

  // the solid variant must actually be on the page, or the contrast check above
  // passes vacuously
  const solid = page.getByTestId("emphasis").locator('.re-banner[data-emphasis="solid"]');
  expect(await solid.count()).toBeGreaterThan(0);

  // every dismiss button has a non-empty accessible name (× is decorative)
  const dismisses = page.locator(".re-banner__dismiss");
  const total = await dismisses.count();
  expect(total).toBeGreaterThan(0);
  for (let i = 0; i < total; i++) {
    await expect(dismisses.nth(i)).toHaveAttribute("aria-label", /.+/);
  }
});
