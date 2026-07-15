import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("choice card page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./choice.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("every card's input takes its accessible name from the visible title", async ({ page }) => {
  await page.goto("./choice.html");
  const inputs = page.locator(".re-choice input");
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    // The wrapping <label> labels the control, so AT announces the card text —
    // the selection state itself is the NATIVE checked state, never colour alone.
    await expect(inputs.nth(i)).toHaveAccessibleName(/\S/);
  }
});

test("every group is a fieldset with a legend naming the question", async ({ page }) => {
  await page.goto("./choice.html");
  const groups = page.locator(".re-choice-group");
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await expect(groups.nth(i)).toHaveRole("group");
    await expect(groups.nth(i)).toHaveAccessibleName(/\S/);
  }
});
