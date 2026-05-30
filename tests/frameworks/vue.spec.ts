import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("vue example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/vue/dist/index.html");
  await assertContract(page);
});
