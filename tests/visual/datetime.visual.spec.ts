import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const region of ["basic", "constraints"] as const) {
  test(`datetime ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./datetime.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`datetime-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

test.describe("datetime visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });
  test("datetime in dark", async ({ page }) => {
    await page.goto("./datetime.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("datetime-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
