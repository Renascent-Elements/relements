import { expect, test } from "@playwright/test";

const dismissible = (page: import("@playwright/test").Page) => page.locator("#dismissible-banner");

test.describe("banner", () => {
  test("clicking the dismiss button hides the host", async ({ page }) => {
    await page.goto("./banner.html");
    const host = dismissible(page);
    await expect(host).toBeVisible();
    await host.locator("[data-re-dismiss]").click();
    await expect(host).toBeHidden();
  });

  test("Enter on a focused dismiss button hides the host", async ({ page }) => {
    await page.goto("./banner.html");
    const host = dismissible(page);
    await host.locator("[data-re-dismiss]").focus();
    await page.keyboard.press("Enter");
    await expect(host).toBeHidden();
  });

  test("Space on a focused dismiss button hides the host", async ({ page }) => {
    await page.goto("./banner.html");
    const host = dismissible(page);
    await host.locator("[data-re-dismiss]").focus();
    await page.keyboard.press(" ");
    await expect(host).toBeHidden();
  });

  test("a re-dismiss listener can preventDefault to keep the banner open", async ({ page }) => {
    await page.goto("./banner.html");
    const host = dismissible(page);
    await host.evaluate((el) =>
      el.addEventListener("re-dismiss", (e) => e.preventDefault(), { once: true }),
    );
    await host.locator("[data-re-dismiss]").click();
    await expect(host).toBeVisible();
  });

  test("the re-dismiss event bubbles from host to document", async ({ page }) => {
    await page.goto("./banner.html");
    const order = await page.evaluate(() => {
      const seen: string[] = [];
      const host = document.getElementById("dismissible-banner")!;
      host.addEventListener("re-dismiss", () => seen.push("host"), { once: true });
      document.addEventListener("re-dismiss", () => seen.push("doc"), { once: true });
      (host.querySelector("[data-re-dismiss]") as HTMLElement).click();
      return seen;
    });
    expect(order).toEqual(["host", "doc"]);
  });

  test("a sticky banner stays pinned to the top of its scroll container", async ({ page }) => {
    await page.goto("./banner.html");
    const region = page.getByTestId("sticky").locator("div").first();
    const banner = region.locator(".re-banner");
    expect(await banner.evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
    const offset = async () =>
      banner.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const c = (el.closest("[style*=overflow]") as HTMLElement).getBoundingClientRect();
        return Math.round(r.top - c.top);
      });
    const before = await offset();
    await region.evaluate((el) => (el.scrollTop = 80));
    expect(await offset()).toBe(before); // pinned
  });

  test("data-align=center caps and centers the message", async ({ page }) => {
    await page.goto("./banner.html");
    const msg = page.getByTestId("align-center").locator(".re-banner__message");
    const host = page.getByTestId("align-center").locator(".re-banner");
    const { marginAuto, narrower } = await msg.evaluate((m) => {
      const cs = getComputedStyle(m);
      const host = m.closest(".re-banner") as HTMLElement;
      return {
        marginAuto: cs.marginInlineStart === cs.marginInlineEnd && cs.marginInlineStart !== "0px",
        narrower: m.getBoundingClientRect().width < host.getBoundingClientRect().width,
      };
    });
    expect(marginAuto).toBe(true);
    expect(narrower).toBe(true);
    await expect(host).toBeVisible();
  });
});
