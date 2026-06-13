import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("alert-dialog open visual snapshot", async ({ page }) => {
  await page.goto("./alert-dialog.html");
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.locator("#confirm-delete")).toBeVisible();
  await expect(page).toHaveScreenshot("alert-dialog-open.png", { maxDiffPixelRatio: 0.01 });
});
