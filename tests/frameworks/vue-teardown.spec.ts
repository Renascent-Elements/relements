import { test } from "@playwright/test";
import { assertTeardown } from "./_teardown";

test("vue example tears down and remounts cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/docs/examples/frameworks/vue/dist/index.html");
  await assertTeardown(page, errors);
});
