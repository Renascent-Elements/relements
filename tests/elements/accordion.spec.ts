import { expect, test } from "@playwright/test";

test.describe("accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./accordion.html");
  });

  test("a summary toggles its panel (native)", async ({ page }) => {
    const details = page.locator(".re-accordion details", {
      has: page.getByText("Does the accordion need JavaScript?"),
    });
    const body = details.locator(".re-disclosure__body");

    await expect(details).not.toHaveAttribute("open", "");
    await expect(body).toBeHidden();

    await details.locator("> summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(body).toBeVisible();

    await details.locator("> summary").click();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(body).toBeHidden();
  });

  test("opening one panel closes its siblings (exclusive via name)", async ({ page }) => {
    const panelA = page.locator(".re-accordion details", {
      has: page.getByText("What is Relements?"),
    });
    const panelB = page.locator(".re-accordion details", {
      has: page.getByText("Does the accordion need JavaScript?"),
    });

    // Panel A ships open in the fixture.
    await expect(panelA).toHaveAttribute("open", "");
    await expect(panelB).not.toHaveAttribute("open", "");

    // Opening B should close A — single-open enforced by native name grouping.
    await panelB.locator("> summary").click();
    await expect(panelB).toHaveAttribute("open", "");
    await expect(panelA).not.toHaveAttribute("open", "");
  });
});
