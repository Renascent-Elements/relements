import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("password-toggle hidden visual snapshot", async ({ page }) => {
  await page.goto("./password-toggle.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("password-toggle-hidden.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("password-toggle revealed visual snapshot", async ({ page }) => {
  await page.goto("./password-toggle.html");
  const basic = page.getByTestId("basic");
  await basic.getByRole("button", { name: "Show password" }).click();
  await expect(basic).toHaveScreenshot("password-toggle-revealed.png", {
    maxDiffPixelRatio: 0.01,
  });
});
