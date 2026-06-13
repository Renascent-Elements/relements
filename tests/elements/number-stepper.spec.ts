import { expect, test } from "@playwright/test";

test.describe("number stepper", () => {
  test("buttons step the value and fire one bubbling input + change per click", async ({
    page,
  }) => {
    await page.goto("./number-stepper.html");
    const basic = page.getByTestId("basic");
    const input = basic.getByRole("spinbutton");
    // Listen on an ancestor to prove the events bubble; capture types.
    await basic.evaluate((el) => {
      const w = window as typeof window & { __ev: string[] };
      w.__ev = [];
      el.addEventListener("input", (e) => w.__ev.push(`input:${e.constructor.name}`));
      el.addEventListener("change", () => w.__ev.push("change"));
    });

    await expect(input).toHaveValue("1");
    await basic.getByRole("button", { name: "Increase" }).click();
    await expect(input).toHaveValue("2");

    const events = await page.evaluate(() => (window as never as { __ev: string[] }).__ev);
    expect(events).toEqual(["input:InputEvent", "change"]);
  });

  test("disables the step button at min and max bounds", async ({ page }) => {
    await page.goto("./number-stepper.html");
    const basic = page.getByTestId("basic");
    const dec = basic.getByRole("button", { name: "Decrease" });
    const inc = basic.getByRole("button", { name: "Increase" });

    await dec.click(); // 1 -> 0 (min)
    await expect(dec).toBeDisabled();
    await expect(inc).toBeEnabled();

    for (let i = 0; i < 10; i++) await inc.click(); // 0 -> 10 (max)
    await expect(inc).toBeDisabled();
    await expect(dec).toBeEnabled();
  });

  test("the input keeps native spinbutton semantics", async ({ page }) => {
    await page.goto("./number-stepper.html");
    const input = page.getByTestId("basic").getByRole("spinbutton");
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("2");
  });

  test("float step increments by a fractional step", async ({ page }) => {
    await page.goto("./number-stepper.html");
    const group = page.getByTestId("variants").locator(".re-input-group").nth(1);
    const input = group.getByRole("spinbutton");
    await expect(input).toHaveValue("0.5");
    await group.getByRole("button", { name: "Increase" }).click();
    await expect(input).toHaveValue("0.75");
  });

  test("read-only stepper disables both buttons and never changes value", async ({ page }) => {
    await page.goto("./number-stepper.html");
    const group = page.getByTestId("variants").locator(".re-input-group").first();
    const input = group.getByRole("spinbutton");
    await expect(input).toHaveValue("5");
    await expect(group.getByRole("button", { name: "Increase" })).toBeDisabled();
    await expect(group.getByRole("button", { name: "Decrease" })).toBeDisabled();
  });

  test("re-enhancing does not double-step (idempotent)", async ({ page }) => {
    await page.goto("./number-stepper.html");
    await page.evaluate(async () => {
      const { enhanceNumberStepper } =
        await import("/packages/core/src/behaviors/number-stepper.js");
      enhanceNumberStepper(document); // second pass over the same inputs
    });
    const basic = page.getByTestId("basic");
    await basic.getByRole("button", { name: "Increase" }).click();
    await expect(basic.getByRole("spinbutton")).toHaveValue("2"); // not 3
  });

  test("destroy() unwires the buttons", async ({ page }) => {
    await page.goto("./number-stepper.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    const basic = page.getByTestId("basic");
    await basic.getByRole("button", { name: "Increase" }).click({ force: true });
    await expect(basic.getByRole("spinbutton")).toHaveValue("1");
  });
});
