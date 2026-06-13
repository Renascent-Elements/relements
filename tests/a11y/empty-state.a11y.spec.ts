import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("empty-state page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./empty-state.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the decorative icon is hidden from assistive tech", async ({ page }) => {
  await page.goto("./empty-state.html");
  const icon = page.getByTestId("basic").locator(".re-empty-state__icon");
  await expect(icon).toHaveAttribute("aria-hidden", "true");
});

test("the title is a real heading and actions are focusable", async ({ page }) => {
  await page.goto("./empty-state.html");
  const es = page.getByTestId("basic").locator(".re-empty-state");
  await expect(es.getByRole("heading", { name: /no projects/i })).toBeVisible();
  const actions = es.locator(".re-empty-state__actions .re-button");
  await actions.first().focus();
  await expect(actions.first()).toBeFocused();
});
