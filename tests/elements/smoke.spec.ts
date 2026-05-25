import { expect, test } from "@playwright/test";

test("examples index loads", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Relements" })).toBeVisible();
});
