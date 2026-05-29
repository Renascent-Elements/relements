import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("angular example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/angular/dist/index.html");
  await assertContract(page);
});
