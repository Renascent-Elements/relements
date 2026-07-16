import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("indicator page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./indicator.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("every badge means something to assistive tech, not just a floating number", async ({
  page,
}) => {
  await page.goto("./indicator.html");
  const badges = page.locator(".re-indicator__badge");
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const badge = badges.nth(i);
    const hasSrOnly = (await badge.locator(".re-sr-only").count()) > 0;
    if (hasSrOnly) {
      await expect(badge.locator(".re-sr-only")).not.toBeEmpty();
    } else {
      // no sr-only inside: the context must live on the target's accessible
      // name instead (the role="img" avatar case, where descendants are
      // presentational)
      const wrapper = badge.locator("xpath=ancestor::*[contains(@class,'re-indicator')]");
      await expect(wrapper.locator('[role="img"], img').first()).toHaveAccessibleName(/\d|new/i);
    }
  }
});
