import { expect, test } from "@playwright/test";

test.describe("choice card", () => {
  test("clicking a card selects its radio and moves the card-level cue", async ({ page }) => {
    await page.goto("./choice.html");
    const cards = page.getByTestId("basic").locator(".re-choice");
    const borderColor = (i: number) =>
      cards.nth(i).evaluate((el) => getComputedStyle(el).borderColor);

    await expect(cards.nth(0).locator("input")).toBeChecked();
    const checkedBorder = await borderColor(0);
    expect(checkedBorder).not.toBe(await borderColor(1)); // checked card is marked

    await cards.nth(1).click();
    await expect(cards.nth(1).locator("input")).toBeChecked();
    await expect(cards.nth(0).locator("input")).not.toBeChecked();
    // toHaveCSS retries, so the border-color transition can finish first.
    await expect(cards.nth(1)).toHaveCSS("border-color", checkedBorder); // cue moved
  });

  test("keyboard: arrow keys rove the radio group; the CARD carries the focus ring", async ({
    page,
    browserName,
  }) => {
    // Playwright's WebKit never sets :focus-visible on radios (Safari gates that
    // behind Full Keyboard Access, which the harness can't emulate) — same skip
    // rationale as foundation.spec.ts's Tab test.
    test.skip(browserName === "webkit", "WebKit does not keyboard-focus radios by default");
    await page.goto("./choice.html");
    const cards = page.getByTestId("basic").locator(".re-choice");
    // Enter the group with REAL keyboard (Tab), not .focus() — programmatic focus
    // does not set :focus-visible on radios.
    await page.keyboard.press("Tab");
    await expect(cards.nth(0).locator("input")).toBeFocused();
    await page.keyboard.press("ArrowDown"); // native radio roving selects the next option
    await expect(cards.nth(1).locator("input")).toBeChecked();
    await expect
      .poll(() => cards.nth(1).evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe("none"); // :has(:focus-visible) ring on the card
    const inner = await cards
      .nth(1)
      .locator("input")
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(inner).toBe("none"); // the control's own ring is handed to the card
  });

  test("checkbox cards multi-select independently", async ({ page }) => {
    await page.goto("./choice.html");
    const cards = page.getByTestId("multi").locator(".re-choice");
    await expect(cards.nth(0).locator("input")).toBeChecked();
    await cards.nth(1).click();
    await expect(cards.nth(0).locator("input")).toBeChecked(); // still on
    await expect(cards.nth(1).locator("input")).toBeChecked();
  });

  test("a disabled option cannot be selected and shows not-allowed", async ({ page }) => {
    await page.goto("./choice.html");
    const disabledCard = page.getByTestId("disabled").locator(".re-choice").nth(1);
    await disabledCard.click({ force: true });
    await expect(disabledCard.locator("input")).not.toBeChecked();
    const cursor = await disabledCard.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe("not-allowed");
  });

  test("horizontal group lays equal-width cards in a row", async ({ page }) => {
    await page.goto("./choice.html");
    const group = page.getByTestId("horizontal").locator(".re-choice-group");
    expect(await group.evaluate((el) => getComputedStyle(el).flexDirection)).toBe("row");
    const boxes = await group
      .locator(".re-choice")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(boxes[0].y).toBe(boxes[1].y); // same row
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThan(1); // equal widths
  });
});
