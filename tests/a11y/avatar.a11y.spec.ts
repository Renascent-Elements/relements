import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("avatar page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./avatar.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("presence reaches assistive tech as text, never colour alone", async ({ page }) => {
  await page.goto("./avatar.html");
  const avatars = page.getByTestId("presence").locator(".re-avatar");
  const count = await avatars.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const avatar = avatars.nth(i);
    if ((await avatar.getAttribute("role")) === "img") {
      // role="img" makes descendants presentational — the status must live in
      // the aria-label, or AT never hears it.
      await expect(avatar).toHaveAccessibleName(/online|away|busy|offline/i);
    } else {
      // image avatar: the dot itself carries an sr-only status word
      await expect(avatar.locator(".re-avatar__presence .re-sr-only")).not.toBeEmpty();
    }
  }
});
