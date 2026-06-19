import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const section of ["default", "plain"] as const) {
  test(`disclosure ${section} visual snapshot`, async ({ page }) => {
    await page.goto("./disclosure.html");
    await expect(page.getByTestId(section)).toHaveScreenshot(`disclosure-${section}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

// Guards the bg-subtle dark-mode trap: the summary hover (shared by accordion)
// must stay visible in dark (bg-subtle collapses to surface; bg-muted does not).
test.describe("disclosure visual — dark hover", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("summary hover stays visible in dark", async ({ page }) => {
    await page.goto("./disclosure.html");
    const region = page.getByTestId("default");
    await region.locator(".re-disclosure__summary").first().hover();
    await expect(region).toHaveScreenshot("disclosure-default-hover-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
