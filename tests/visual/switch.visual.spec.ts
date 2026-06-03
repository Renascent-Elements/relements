import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("switch states visual snapshot", async ({ page }) => {
  await page.goto("./switch.html");
  const states = page.getByTestId("states");
  await expect(states).toHaveScreenshot("switch-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});
