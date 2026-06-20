import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const region of ["basic", "sizes"] as const) {
  test(`progress-ring ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./progress-ring.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`progress-ring-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

// The indeterminate ring spins; freeze it so the baseline is stable.
test("progress-ring indeterminate visual snapshot", async ({ page }) => {
  await page.goto("./progress-ring.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("indeterminate")).toHaveScreenshot(
    "progress-ring-indeterminate.png",
    { maxDiffPixelRatio: 0.01 },
  );
});

test.describe("progress-ring visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("progress-ring in dark", async ({ page }) => {
    await page.goto("./progress-ring.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("progress-ring-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
