import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("button-group page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./button-group.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("each group exposes role=group with an accessible name", async ({ page }) => {
  await page.goto("./button-group.html");
  const group = page.getByTestId("basic").locator(".re-button-group");
  await expect(group).toHaveAttribute("role", "group");
  await expect(group).toHaveAttribute("aria-label", /.+/);
});

test("members are individually tab-focusable in DOM order", async ({ page }) => {
  await page.goto("./button-group.html");
  const btns = page.getByTestId("basic").locator(".re-button");
  await btns.nth(0).focus();
  for (let i = 1; i < (await btns.count()); i++) {
    await page.keyboard.press("Tab");
    await expect(btns.nth(i)).toBeFocused();
  }
});
