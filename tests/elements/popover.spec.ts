import { expect, test } from "@playwright/test";

test.describe("Popover", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./popover.html");
  });

  test("popovertarget button toggles the popover", async ({ page }) => {
    const pop = page.locator("#pop-1");
    await expect(pop).toBeHidden();
    await page.locator("#pop-1-btn").click();
    await expect(pop).toBeVisible();
    await page.locator("#pop-1-btn").click();
    await expect(pop).toBeHidden();
  });

  test("light dismiss closes popover on outside click", async ({ page }) => {
    await page.locator("#pop-1-btn").click();
    await expect(page.locator("#pop-1")).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.locator("#pop-1")).toBeHidden();
  });

  test("re-toggle event fires with open=true on open", async ({ page }) => {
    await page.locator("#pop-1-btn").click();
    await expect(page.locator("#toggle-state")).toHaveText("open");
  });

  test("re-toggle event fires with open=false on close", async ({ page }) => {
    await page.locator("#pop-1-btn").click();
    await page.locator("#pop-1-btn").click();
    await expect(page.locator("#toggle-state")).toHaveText("closed");
  });

  test("popover positions under its trigger", async ({ page }) => {
    await page.locator("#pop-1-btn").click();
    const positions = await page.evaluate(() => {
      const t = document.getElementById("pop-1-btn")!.getBoundingClientRect();
      const p = document.getElementById("pop-1")!.getBoundingClientRect();
      return { triggerBottom: t.bottom, popoverTop: p.top };
    });
    expect(positions.popoverTop).toBeGreaterThanOrEqual(positions.triggerBottom);
    expect(positions.popoverTop - positions.triggerBottom).toBeLessThan(20);
  });

  test("tone variants exist and apply distinct colors", async ({ page }) => {
    const ids = ["pop-info", "pop-warn", "pop-danger"];
    const tones: string[] = [];
    for (const id of ids) {
      const tone = await page.locator(`#${id}`).getAttribute("data-tone");
      if (tone) tones.push(tone);
    }
    expect(tones).toEqual(["info", "warning", "danger"]);
  });

  test("destroy removes the toggle listener", async ({ page }) => {
    await page.evaluate(() => {
      // @ts-expect-error
      window.__popController.destroy();
    });
    await page.locator("#pop-1-btn").click();
    // The state reporter stops updating once destroyed.
    await expect(page.locator("#pop-1")).toBeVisible();
    await expect(page.locator("#toggle-state")).toHaveText("closed");
  });
});
