/**
 * Extract a delimited demo region from an example page's raw HTML.
 *
 * Unnamed: `<!-- demo:start -->` … `<!-- demo:end -->`
 * Named:   `<!-- demo:start name="x" -->` … `<!-- demo:end -->`
 *
 * Returns the inner markup, trimmed and dedented to its shallowest indent.
 * Throws when the requested region is absent.
 */
export function extractDemo(html: string, name?: string): string {
  const startPattern = name
    ? new RegExp(`<!--\\s*demo:start\\s+name="${escapeRegExp(name)}"\\s*-->`)
    : /<!--\s*demo:start\s*-->/;

  const startMatch = startPattern.exec(html);
  if (!startMatch) {
    throw new Error(
      name
        ? `demo region name="${name}" not found`
        : "demo region not found (expected <!-- demo:start -->)",
    );
  }

  const afterStart = startMatch.index + startMatch[0].length;
  const endIndex = html.indexOf("<!-- demo:end -->", afterStart);
  if (endIndex === -1) {
    throw new Error("demo region missing closing <!-- demo:end -->");
  }

  return dedent(html.slice(afterStart, endIndex));
}

function dedent(block: string): string {
  const lines = block.replace(/^\n+/, "").replace(/\s+$/, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(min)).join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
