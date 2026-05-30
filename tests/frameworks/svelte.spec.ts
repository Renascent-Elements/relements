import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("svelte example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/svelte/dist/index.html");
  await assertContract(page);
});
