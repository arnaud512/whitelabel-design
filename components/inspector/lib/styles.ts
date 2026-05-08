/* Property reading + style diffing for the Edit panel.
 *
 * On entry we snapshot the relevant computed styles. As the user edits, we
 * apply changes via inline `style` (so they're visible immediately and don't
 * conflict with Tailwind class state). The diff against the snapshot is what
 * we serialize into the Claude prompt.
 */

export type EditableProp =
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "color"
  | "textAlign"
  | "lineHeight"
  | "letterSpacing"
  | "width"
  | "height"
  | "gap"
  | "flexDirection"
  | "justifyContent"
  | "alignItems"
  | "display"
  | "backgroundColor"
  | "opacity"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "borderTopWidth"
  | "borderRightWidth"
  | "borderBottomWidth"
  | "borderLeftWidth"
  | "borderStyle"
  | "borderColor"
  | "borderRadius"
  | "fill"
  | "stroke"
  | "strokeWidth";

export type StyleSnapshot = Partial<Record<EditableProp, string>>;

const PROPS: EditableProp[] = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "color",
  "textAlign",
  "lineHeight",
  "letterSpacing",
  "width",
  "height",
  "gap",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "display",
  "backgroundColor",
  "opacity",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "fill",
  "stroke",
  "strokeWidth",
];

export function snapshotStyles(el: Element): StyleSnapshot {
  const cs = getComputedStyle(el);
  const out: StyleSnapshot = {};
  for (const p of PROPS) {
    out[p] = cs[p as unknown as keyof CSSStyleDeclaration] as string;
  }
  return out;
}

export function applyEdit(el: HTMLElement, prop: EditableProp, value: string) {
  // Use setProperty with kebab-case so TS doesn't complain about readonly keys
  // (length/parentRule on CSSStyleDeclaration). Empty string clears.
  const kebab = prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  if (value === "") {
    el.style.removeProperty(kebab);
  } else {
    el.style.setProperty(kebab, value);
  }
}

/** Returns a normalized diff between snapshot and current inline style only. */
export function getInlineDiff(
  el: HTMLElement,
  snapshot: StyleSnapshot,
): Array<{ prop: EditableProp; from: string; to: string }> {
  const diff: Array<{ prop: EditableProp; from: string; to: string }> = [];
  for (const p of PROPS) {
    const inline = el.style[p as unknown as keyof CSSStyleDeclaration & string] as
      | string
      | undefined;
    if (!inline) continue;
    const from = snapshot[p] ?? "";
    if (inline !== from) diff.push({ prop: p, from, to: inline });
  }
  return diff;
}

/** Convert a px value string ("16px") to number; "" / "auto" → undefined. */
export function pxToNum(v?: string): number | undefined {
  if (!v) return undefined;
  if (v.endsWith("px")) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}
