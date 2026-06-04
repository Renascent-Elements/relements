import { describe, expect, it } from "vitest";
import { extractDemo } from "../../docs/web/src/lib/demo.ts";

const page = `<!doctype html>
<html>
  <body>
    <section>
      <!-- demo:start -->
      <button class="re-button">First</button>
      <!-- demo:end -->
    </section>
    <section>
      <!-- demo:start name="removable" -->
      <span class="re-tag" data-re-dismissible>Tag</span>
      <!-- demo:end -->
    </section>
  </body>
</html>`;

describe("extractDemo", () => {
  it("extracts the first unnamed region, trimmed and dedented", () => {
    expect(extractDemo(page)).toBe('<button class="re-button">First</button>');
  });

  it("extracts a named region", () => {
    expect(extractDemo(page, "removable")).toBe(
      '<span class="re-tag" data-re-dismissible>Tag</span>',
    );
  });

  it("dedents multi-line regions to the shallowest indent", () => {
    const multi = `<!-- demo:start -->
        <div class="row">
          <button class="re-button">A</button>
        </div>
      <!-- demo:end -->`;
    expect(extractDemo(multi)).toBe(
      '<div class="row">\n  <button class="re-button">A</button>\n</div>',
    );
  });

  it("throws when the region is missing", () => {
    expect(() => extractDemo("<p>no markers</p>")).toThrow(/demo region/i);
  });

  it("throws when a named region is missing", () => {
    expect(() => extractDemo(page, "nope")).toThrow(/nope/);
  });
});
