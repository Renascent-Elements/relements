import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("react example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/react/dist/index.html");
  await assertContract(page);
});
