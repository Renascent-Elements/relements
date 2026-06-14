import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("context-menu page (closed) has no a11y violations", async ({ page }) => {
  await page.goto("./context-menu.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the open menu is a named role=menu with menuitems", async ({ page }) => {
  await page.goto("./context-menu.html");
  await page.locator("[data-re-context-menu]").focus();
  await page.keyboard.press("Shift+F10");
  const panel = page.locator("#ctx-1");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "menu");
  await expect(panel).toHaveAttribute("aria-label", /.+/);
  await expect(panel.getByRole("menuitem")).not.toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
