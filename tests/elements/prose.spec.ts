import { expect, test } from "@playwright/test";

test.describe("prose", () => {
  test("restores vertical rhythm that reset.css zeroed", async ({ page }) => {
    await page.goto("./prose.html");
    const prose = page.getByTestId("basic").locator(".re-prose");
    const mt = (sel: string) =>
      prose.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).marginBlockStart));
    expect(await mt("h1")).toBe(0); // first child: no leading margin
    const pAfterH1 = await mt("h1 + p");
    const h2AfterFlow = await mt("p + h2");
    expect(pAfterH1).toBeGreaterThan(0);
    expect(h2AfterFlow).toBeGreaterThan(pAfterH1); // headings get extra air above
  });

  test("caps the line length at a readable measure", async ({ page }) => {
    await page.goto("./prose.html");
    const max = await page
      .getByTestId("basic")
      .locator(".re-prose")
      .evaluate((el) => getComputedStyle(el).maxInlineSize);
    expect(max).toMatch(/ch$|px$/);
    expect(max).not.toBe("none");
  });

  test("blockquote carries a start border, muted text, and a byline", async ({ page }) => {
    await page.goto("./prose.html");
    const region = page.getByTestId("quote-figure");
    const quote = region.locator("blockquote");
    const s = await quote.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        borderStart: parseFloat(cs.borderInlineStartWidth),
        color: cs.color,
      };
    });
    expect(s.borderStart).toBeGreaterThan(0);
    // base.css sets color on <p> — prose must hand the muted quote colour back
    const pColor = await quote.locator("p").evaluate((el) => getComputedStyle(el).color);
    expect(pColor).toBe(s.color);
    const proseColor = await region
      .locator(".re-prose")
      .evaluate((el) => getComputedStyle(el).color);
    expect(pColor).not.toBe(proseColor); // quote reads muted vs body
    const citeSize = await quote.locator("cite").evaluate((el) => getComputedStyle(el).fontSize);
    const quoteSize = await quote.locator("p").evaluate((el) => getComputedStyle(el).fontSize);
    expect(parseFloat(citeSize)).toBeLessThan(parseFloat(quoteSize));
  });

  test("the blockquote border flips sides under RTL (logical property)", async ({ page }) => {
    await page.goto("./prose.html");
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    const b = await page
      .getByTestId("quote-figure")
      .locator("blockquote")
      .evaluate((el) => {
        const cs = getComputedStyle(el);
        return { left: parseFloat(cs.borderLeftWidth), right: parseFloat(cs.borderRightWidth) };
      });
    expect(b.right).toBeGreaterThan(0);
    expect(b.left).toBe(0);
  });

  test("figure media is fluid and captioned smaller + muted", async ({ page }) => {
    await page.goto("./prose.html");
    const region = page.getByTestId("quote-figure");
    const imgMax = await region
      .locator("figure img")
      .evaluate((el) => getComputedStyle(el).maxInlineSize);
    expect(imgMax).toBe("100%");
    const caption = region.locator("figcaption");
    const capSize = await caption.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const bodySize = await region
      .locator(".re-prose > p")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(capSize).toBeLessThan(bodySize);
  });

  test("bare tables get full width, collapsed borders, start-aligned headers", async ({ page }) => {
    await page.goto("./prose.html");
    const region = page.getByTestId("code-table");
    const t = await region.locator("table").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { collapse: cs.borderCollapse, width: el.getBoundingClientRect().width };
    });
    expect(t.collapse).toBe("collapse");
    const proseWidth = await region
      .locator(".re-prose")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.abs(t.width - proseWidth)).toBeLessThan(1);
    const thAlign = await region
      .locator("th")
      .first()
      .evaluate((el) => getComputedStyle(el).textAlign);
    expect(["start", "left"]).toContain(thAlign);
  });

  test("component classes dropped inside prose are not overpowered (:where keeps specificity at zero)", async ({
    page,
  }) => {
    await page.goto("./prose.html");
    // Inject a .re-stat inside the prose article; its label colour must come
    // from stat.css, not prose's element rules.
    const labelColor = await page.evaluate(() => {
      const prose = document.querySelector('[data-testid="basic"] .re-prose')!;
      const stat = document.createElement("div");
      stat.className = "re-stat";
      stat.innerHTML = '<span class="re-stat__label">Users</span>';
      prose.appendChild(stat);
      return getComputedStyle(stat.querySelector(".re-stat__label")!).color;
    });
    const probe = await page.evaluate(() => {
      const s = document.createElement("span");
      s.style.color = "var(--re-color-text-muted)";
      document.body.appendChild(s);
      const c = getComputedStyle(s).color;
      s.remove();
      return c;
    });
    expect(labelColor).toBe(probe); // stat's muted label survives inside prose
  });
});
