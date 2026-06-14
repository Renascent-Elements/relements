import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("command-palette page (closed) has no a11y violations", async ({ page }) => {
  await page.goto("./command-palette.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the open palette is a valid combobox + listbox", async ({ page }) => {
  await page.goto("./command-palette.html");
  await page.locator("[data-re-dialog-trigger]").click();
  await expect(page.locator("#cmdk")).toBeVisible();
  // aria-controls resolves to the listbox; options carry ids for activedescendant
  const controls = await page.locator(".re-command-palette__input").getAttribute("aria-controls");
  await expect(page.locator(`#${controls}`)).toHaveAttribute("role", "listbox");
  const results = await new AxeBuilder({ page })
    .include("#cmdk")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the no-results empty state is announced (role=status)", async ({ page }) => {
  await page.goto("./command-palette.html");
  await page.locator("[data-re-dialog-trigger]").click();
  await page.locator(".re-command-palette__input").fill("zzzzz");
  await expect(page.locator(".re-command-palette__empty [role='status']")).toBeVisible();
});
