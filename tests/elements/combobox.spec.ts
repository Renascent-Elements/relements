import { expect, test } from "@playwright/test";

test.describe("combobox", () => {
  test("keeps the select-style chevron at rest and while focused", async ({ page }) => {
    await page.goto("./combobox.html");
    const input = page.getByTestId("basic").getByRole("combobox");

    const bg = () => input.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(await bg()).toContain("linear-gradient");

    await input.focus();
    expect(await bg()).toContain("linear-gradient");
  });
});

test.describe("enhanced combobox", () => {
  const input = (page: import("@playwright/test").Page) =>
    page.getByTestId("enhanced").getByRole("combobox");
  const list = (page: import("@playwright/test").Page) =>
    page.getByTestId("enhanced").locator(".re-combobox__list");

  test("suppresses the native list and exposes the combobox pattern", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await expect(el).not.toHaveAttribute("list");
    await expect(el).toHaveAttribute("role", "combobox");
    await expect(el).toHaveAttribute("aria-autocomplete", "list");
    await expect(el).toHaveAttribute("aria-expanded", "false");
    const controls = await el.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveAttribute("role", "listbox");
  });

  test("typing filters the options and the list is never narrower than the input", async ({
    page,
  }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.pressSequentially("bu");

    const listbox = list(page);
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole("option")).toHaveText([
      "Europe/Budapest",
      "America/Argentina/Buenos_Aires",
    ]);

    const inputBox = await el.boundingBox();
    const listBox = await listbox.boundingBox();
    expect(listBox!.width).toBeGreaterThanOrEqual(inputBox!.width - 1);
  });

  test("ArrowDown highlights, Enter commits and fires input + change", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.evaluate((node) => {
      const w = window as typeof window & { __events: string[] };
      w.__events = [];
      node.addEventListener("input", () => w.__events.push("input"));
      node.addEventListener("change", () => w.__events.push("change"));
    });

    await el.pressSequentially("tokyo");
    await page.keyboard.press("ArrowDown");
    await expect(el).toHaveAttribute("aria-activedescendant", /.+/);

    await page.keyboard.press("Enter");
    await expect(el).toHaveValue("Asia/Tokyo");
    await expect(el).toHaveAttribute("aria-expanded", "false");
    await expect(list(page)).toBeHidden();

    const events = await page.evaluate(() => (window as never as { __events: string[] }).__events);
    expect(events.filter((e) => e === "change")).toHaveLength(1);
    expect(events).toContain("input");
  });

  test("Escape closes without committing", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.pressSequentially("bu");
    await expect(list(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(list(page)).toBeHidden();
    await expect(el).toHaveValue("bu");
  });

  test("clicking an option commits it and keeps focus in the input", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.click();
    await expect(list(page)).toBeVisible();

    await list(page).getByRole("option", { name: "Europe/Lisbon" }).click();
    await expect(el).toHaveValue("Europe/Lisbon");
    await expect(list(page)).toBeHidden();
    await expect(el).toBeFocused();
  });

  test("closes when there are no matches", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.pressSequentially("zzz");
    await expect(list(page)).toBeHidden();
    await expect(el).toHaveAttribute("aria-expanded", "false");
  });

  test("Home/End jump to the first/last option in the open listbox", async ({ page }) => {
    await page.goto("./combobox.html");
    const el = input(page);
    await el.click();
    await expect(list(page)).toBeVisible();

    const ids = await list(page)
      .getByRole("option")
      .evaluateAll((nodes) => nodes.map((n) => n.id));
    const firstId = ids[0];
    const lastId = ids[ids.length - 1];

    await page.keyboard.press("End");
    await expect(el).toHaveAttribute("aria-activedescendant", lastId);

    await page.keyboard.press("Home");
    await expect(el).toHaveAttribute("aria-activedescendant", firstId);
  });
});
