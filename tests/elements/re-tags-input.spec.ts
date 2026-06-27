import { expect, test } from "@playwright/test";

type TagsEl = HTMLElement & { values: string[]; clear: () => void };

test.describe("<re-tags-input>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-tags-input.html");
  });

  test("seeds chips from the value attribute; editor empty; seeding fires no event", async ({
    page,
  }) => {
    const el = page.getByTestId("basic").locator("re-tags-input");
    await expect(el.locator("[data-re-tags-chip]")).toHaveCount(2);
    await expect(el.locator(".re-tags-input__field")).toHaveValue("");
    expect(await el.evaluate((node) => (node as TagsEl).values)).toEqual(["design", "eng"]);

    // Seeding must NOT fire re-tags-change — verify with a listener attached
    // BEFORE the element connects (so the seed happens under observation).
    const fired = await page.evaluate(async () => {
      let n = 0;
      const el = document.createElement("re-tags-input");
      el.setAttribute("value", "a, b");
      el.setAttribute("aria-label", "Probe");
      el.addEventListener("re-tags-change", () => (n += 1));
      const input = document.createElement("input");
      input.className = "re-input";
      el.appendChild(input);
      document.body.appendChild(el); // connect → enhance → seed
      await new Promise((r) => requestAnimationFrame(r));
      const values = (el as HTMLElement & { values: string[] }).values;
      el.remove();
      return { n, values };
    });
    expect(fired.n).toBe(0);
    expect(fired.values).toEqual(["a", "b"]);
  });

  test("commit fires re-tags-change EXACTLY once on the host with the values", async ({ page }) => {
    const el = page.getByTestId("basic").locator("re-tags-input");
    await el.evaluate((node) => {
      const w = window as unknown as { __n: number; __last: string[] | null };
      w.__n = 0;
      w.__last = null;
      node.addEventListener("re-tags-change", (e) => {
        w.__n += 1;
        w.__last = (e as CustomEvent).detail.values;
      });
    });
    const ed = el.locator(".re-tags-input__field");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    const r = await page.evaluate(() => {
      const w = window as unknown as { __n: number; __last: string[] | null };
      return { n: w.__n, last: w.__last };
    });
    expect(r.n).toBe(1); // not double-fired (no re-dispatch on top of the bubbling event)
    expect(r.last).toEqual(["design", "eng", "ops"]);
    expect(await el.evaluate((node) => (node as TagsEl).values)).toEqual(["design", "eng", "ops"]);
  });

  test(".clear() removes all tags and fires re-tags-change", async ({ page }) => {
    const el = page.getByTestId("basic").locator("re-tags-input");
    const r = await el.evaluate((node) => {
      let n = 0;
      node.addEventListener("re-tags-change", () => (n += 1));
      (node as HTMLElement & { clear: () => void }).clear();
      return {
        n,
        values: (node as HTMLElement & { values: string[] }).values,
        chips: node.querySelectorAll("[data-re-tags-chip]").length,
      };
    });
    expect(r.values).toEqual([]);
    expect(r.chips).toBe(0);
    expect(r.n).toBe(1);
  });

  test("survives disconnect + reconnect (teardown ran, then re-enhanced cleanly)", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = await page.evaluate(async () => {
      const node = document.querySelector('[data-testid="basic"] re-tags-input') as HTMLElement & {
        values: string[];
      };
      node.remove(); // disconnect → destroy()
      document.body.appendChild(node); // reconnect → connectedCallback → re-enhance
      await new Promise((res) => requestAnimationFrame(res));
      return {
        values: node.values,
        chips: node.querySelectorAll("[data-re-tags-chip]").length,
        // one editor only — not double-enhanced into nested groups
        fields: node.querySelectorAll(".re-tags-input__field").length,
      };
    });
    expect(r.values).toEqual(["design", "eng"]); // re-seeded cleanly
    expect(r.chips).toBe(2);
    expect(r.fields).toBe(1);
    expect(errors).toEqual([]);
  });
});
