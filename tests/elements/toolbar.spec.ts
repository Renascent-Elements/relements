import { expect, test } from "@playwright/test";

const basic = (page: import("@playwright/test").Page) =>
  page.getByTestId("basic").locator(".re-toolbar");

test.describe("toolbar", () => {
  test("collapses to a single Tab stop after enhancement", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await expect(tb).toHaveAttribute("data-re-toolbar-ready", "");
    const zeroes = await tb.evaluate((host) => {
      const items = [...host.querySelectorAll("button")].filter(
        (b) => !(b as HTMLButtonElement).disabled && !b.closest('[role="menu"]'),
      );
      return items.filter((b) => (b as HTMLElement).tabIndex === 0).length;
    });
    expect(zeroes).toBe(1);
  });

  test("Arrow keys rove focus (horizontal)", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await tb.getByLabel("Bold").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tb.getByLabel("Italic")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tb.getByLabel("Bold")).toBeFocused();
  });

  test("Home/End jump to the ends and ends are clamped (no wrap)", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await tb.getByLabel("Bold").focus();
    await page.keyboard.press("End");
    await expect(tb.getByRole("button", { name: "More" })).toBeFocused();
    await page.keyboard.press("ArrowRight"); // clamp
    await expect(tb.getByRole("button", { name: "More" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tb.getByLabel("Bold")).toBeFocused();
    await page.keyboard.press("ArrowLeft"); // clamp
    await expect(tb.getByLabel("Bold")).toBeFocused();
  });

  test("an aria-disabled item stays in the roving sequence", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await tb.getByRole("button", { name: "Left" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tb.getByRole("button", { name: "Center" })).toBeFocused();
    await expect(tb.getByRole("button", { name: "Center" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("a native-disabled control is skipped by roving", async ({ page }) => {
    await page.goto("./toolbar.html");
    const landed = await page.evaluate(async () => {
      const { enhanceToolbar } = await import("/packages/core/src/behaviors/toolbar.js");
      const host = document.createElement("div");
      host.className = "re-toolbar";
      host.setAttribute("role", "toolbar");
      host.setAttribute("aria-label", "fixture");
      host.setAttribute("data-re-toolbar", "");
      host.innerHTML =
        '<button id="a" class="re-button">A</button>' +
        '<button id="b" class="re-button" disabled>B</button>' +
        '<button id="c" class="re-button">C</button>';
      document.body.appendChild(host);
      enhanceToolbar(host);
      const a = host.querySelector<HTMLButtonElement>("#a")!;
      a.focus();
      a.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      const id = (document.activeElement as HTMLElement).id;
      host.remove();
      return id;
    });
    expect(landed).toBe("c"); // skipped the disabled #b
  });

  test("a focused text input keeps its own Arrow keys (no roving hijack)", async ({ page }) => {
    await page.goto("./toolbar.html");
    const stayed = await page.evaluate(async () => {
      const { enhanceToolbar } = await import("/packages/core/src/behaviors/toolbar.js");
      const host = document.createElement("div");
      host.className = "re-toolbar";
      host.setAttribute("role", "toolbar");
      host.setAttribute("aria-label", "fixture");
      host.setAttribute("data-re-toolbar", "");
      host.innerHTML =
        '<button id="a" class="re-button">A</button>' +
        '<input id="q" type="search" />' +
        '<button id="c" class="re-button">C</button>';
      document.body.appendChild(host);
      enhanceToolbar(host);
      const q = host.querySelector<HTMLInputElement>("#q")!;
      q.focus();
      q.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      const stillInInput = document.activeElement === q;
      host.remove();
      return stillInInput;
    });
    expect(stayed).toBe(true);
  });

  test("Vertical toolbar roves with Up/Down and exposes aria-orientation", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = page.getByTestId("vertical").locator(".re-toolbar");
    await expect(tb).toHaveAttribute("aria-orientation", "vertical");
    await tb.getByRole("button", { name: "Select" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(tb.getByRole("button", { name: "Pen" })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(tb.getByRole("button", { name: "Select" })).toBeFocused();
  });

  test("RTL mirrors the horizontal arrows", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await tb.evaluate((el) => el.setAttribute("dir", "rtl"));
    await tb.getByLabel("Bold").focus();
    await page.keyboard.press("ArrowLeft"); // RTL: left = next
    await expect(tb.getByLabel("Italic")).toBeFocused();
    await page.keyboard.press("ArrowRight"); // RTL: right = previous
    await expect(tb.getByLabel("Bold")).toBeFocused();
  });

  test("a hosted menu governs its own keys while open (no roving theft)", async ({ page }) => {
    await page.goto("./toolbar.html");
    const tb = basic(page);
    await tb.getByRole("button", { name: "More" }).click();
    await expect(tb.locator('[role="menu"]')).toBeVisible();
    // With focus inside the open menu, the toolbar must NOT rove on arrow keys —
    // its keydown handler yields to the menu while a panel descendant is focused.
    await tb.locator('[role="menu"] [role="menuitem"]').first().focus();
    await page.keyboard.press("ArrowDown");
    const inMenu = await page.evaluate(() => !!document.activeElement?.closest('[role="menu"]'));
    expect(inMenu).toBe(true);
  });

  test("re-enhancing is idempotent (no duplicate listeners)", async ({ page }) => {
    await page.goto("./toolbar.html");
    // The page already enhanced via its inline script (window.__reController).
    // A second enhance must be a no-op — so destroying ONLY the first controller
    // must leave NO roving behind. (If the guard were missing, the second pass
    // would attach a second set of listeners that survive this destroy.)
    await page.evaluate(async () => {
      const { enhanceToolbar } = await import("/packages/core/src/behaviors/toolbar.js");
      enhanceToolbar(document); // second pass — guarded no-op
      (window as never as { __reController: { destroy(): void } }).__reController.destroy();
    });
    const tb = basic(page);
    await tb.getByLabel("Bold").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tb.getByLabel("Bold")).toBeFocused(); // no listener left → no rove
  });

  test("destroy() restores N native Tab stops", async ({ page }) => {
    await page.goto("./toolbar.html");
    await page.evaluate(() =>
      (window as never as { __reController: { destroy(): void } }).__reController.destroy(),
    );
    const tb = basic(page);
    await expect(tb).not.toHaveAttribute("data-re-toolbar-ready", "");
    const allZero = await tb.evaluate((host) =>
      [...host.querySelectorAll("button")]
        .filter((b) => !(b as HTMLButtonElement).disabled && !b.closest('[role="menu"]'))
        .every((b) => (b as HTMLElement).tabIndex === 0),
    );
    expect(allZero).toBe(true);
  });
});
