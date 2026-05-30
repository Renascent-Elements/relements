import { test } from "@playwright/test";
import { assertTeardown } from "./_teardown";

test("angular example tears down and remounts cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/docs/examples/frameworks/angular/dist/index.html");
  await assertTeardown(page, errors);
});
