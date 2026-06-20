import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("avatar sizes visual snapshot", async ({ page }) => {
  await page.goto("./avatar.html");
  const sizes = page.getByTestId("sizes");
  await expect(sizes).toHaveScreenshot("avatar-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("avatar group visual snapshot", async ({ page }) => {
  await page.goto("./avatar.html");
  await expect(page.getByTestId("group")).toHaveScreenshot("avatar-group.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test.describe("avatar visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("avatar group in dark", async ({ page }) => {
    await page.goto("./avatar.html");
    await expect(page.getByTestId("group")).toHaveScreenshot("avatar-group-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
