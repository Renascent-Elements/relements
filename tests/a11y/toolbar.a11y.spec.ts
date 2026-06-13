import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("toolbar page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./toolbar.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("each toolbar has role=toolbar with an accessible name", async ({ page }) => {
  await page.goto("./toolbar.html");
  const toolbars = page.locator('[role="toolbar"]');
  const count = await toolbars.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(toolbars.nth(i)).toHaveAttribute("aria-label", /.+/);
  }
});

test("only the vertical toolbar declares aria-orientation", async ({ page }) => {
  await page.goto("./toolbar.html");
  await expect(page.getByTestId("vertical").locator(".re-toolbar")).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
  await expect(page.getByTestId("basic").locator(".re-toolbar")).not.toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
});
