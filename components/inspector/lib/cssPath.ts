/* Build a stable-ish CSS selector path for a given element, walking up to the
 * nearest element with an `id` or to <body>. Each step prefers the tag plus a
 * couple of distinguishing classes; falls back to `:nth-of-type(n)`.
 *
 * The output is meant to be human-readable in the prompt copy, not used to
 * re-query the element.
 */
/** Stops climbing once we hit one of these — keeps the path readable. */
const SEMANTIC_STOPS = new Set([
  "main",
  "article",
  "section",
  "nav",
  "header",
  "footer",
  "aside",
  "form",
]);
const MAX_SEGMENTS = 5;

export function getCSSPath(el: Element, root?: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  const stop = root ?? document.body;
  while (current && current !== stop && current.nodeType === 1) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }
    const classes = Array.from(current.classList)
      .filter((c) => !c.startsWith("__") && !c.includes(":"))
      .slice(0, 2);
    if (classes.length) part += "." + classes.join(".");
    const parent = current.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName,
      );
      if (sameTag.length > 1) {
        const idx = sameTag.indexOf(current) + 1;
        part += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(part);
    if (SEMANTIC_STOPS.has(current.tagName.toLowerCase()) && parts.length > 1) break;
    if (parts.length >= MAX_SEGMENTS) break;
    current = current.parentElement;
  }
  return parts.join(" > ");
}

/** Truncate outerHTML for prompt context — first 240 chars, single line.
 * Strips the loader-injected `data-source="..."` attributes since they're
 * already surfaced via the File: line and only add noise to the preview.
 */
export function getOuterHTMLPreview(el: Element, max = 240): string {
  const html = el.outerHTML
    .replace(/\s+data-source="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (html.length <= max) return html;
  return html.slice(0, max) + "…";
}
