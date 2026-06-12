import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("combobox basic visual snapshot", async ({ page }) => {
  await page.goto("./combobox.html");
  const basic = page.getByTestId("basic");
  await expect(basic).toHaveScreenshot("combobox-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("combobox sizes visual snapshot", async ({ page }) => {
  await page.goto("./combobox.html");
  const sizes = page.getByTestId("sizes");
  await expect(sizes).toHaveScreenshot("combobox-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("combobox enhanced open visual snapshot", async ({ page }) => {
  await page.goto("./combobox.html");
  const enhanced = page.getByTestId("enhanced");
  await enhanced.getByRole("combobox").click();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".re-combobox__list")).toBeVisible();
  await expect(enhanced).toHaveScreenshot("combobox-enhanced-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});
