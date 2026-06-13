import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("tags-input basic (with chips) visual snapshot", async ({ page }) => {
  await page.goto("./tags-input.html");
  await expect(page.getByTestId("basic").locator(".re-tags-input")).toBeVisible();
  await expect(page.getByTestId("basic")).toHaveScreenshot("tags-input-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("tags-input max-reached (invalid) visual snapshot", async ({ page }) => {
  await page.goto("./tags-input.html");
  const ed = page.getByTestId("max").locator(".re-tags-input__field");
  await ed.click();
  await ed.fill("js");
  await ed.press("Enter");
  await ed.fill("go");
  await ed.press("Enter"); // rejected → invalid
  await expect(page.getByTestId("max").locator(".re-tags-input")).toHaveAttribute(
    "data-invalid",
    "",
  );
  await ed.fill(""); // clear leftover editor text for a stable shot
  await expect(page.getByTestId("max")).toHaveScreenshot("tags-input-max.png", {
    maxDiffPixelRatio: 0.01,
  });
});
