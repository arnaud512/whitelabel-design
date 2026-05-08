/* Annotation store — comments and edits the user has saved across sessions.
 *
 * Persisted to localStorage under a single global key. Single list, not
 * per-route, so a session of changes can be bundled into one Claude prompt
 * regardless of which page each annotation came from.
 */

import type { ElementSource } from "./fiber";
import type { EditableProp } from "./styles";

const STORAGE_KEY = "whitelabel.inspector.annotations";

export interface CommentAnnotation {
  id: string;
  kind: "comment";
  createdAt: number;
  route: string;
  source: ElementSource | null;
  cssPath: string;
  outerHTMLPreview: string;
  text: string;
}

export interface EditAnnotation {
  id: string;
  kind: "edit";
  createdAt: number;
  route: string;
  source: ElementSource | null;
  cssPath: string;
  outerHTMLPreview: string;
  styleDiff: Array<{ prop: EditableProp; from: string; to: string }>;
  textChange: { from: string; to: string } | null;
}

export type Annotation = CommentAnnotation | EditAnnotation;

export function loadAnnotations(): Annotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAnnotations(list: Annotation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Notify listeners on the same tab — `storage` event only fires across tabs.
    window.dispatchEvent(new CustomEvent("whitelabel:annotations-change"));
  } catch {
    // ignore
  }
}

export function addAnnotation(a: Annotation) {
  const list = loadAnnotations();
  list.push(a);
  saveAnnotations(list);
}

export function updateAnnotation(id: string, patch: Partial<Annotation>) {
  const list = loadAnnotations();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  // Merge while preserving the discriminator
  list[i] = { ...list[i], ...patch } as Annotation;
  saveAnnotations(list);
}

export function removeAnnotation(id: string) {
  const list = loadAnnotations();
  const target = list.find((x) => x.id === id);
  if (target && target.kind === "edit") revertEdit(target);
  saveAnnotations(list.filter((x) => x.id !== id));
}

export function clearAnnotations() {
  const list = loadAnnotations();
  for (const a of list) {
    if (a.kind === "edit") revertEdit(a);
  }
  saveAnnotations([]);
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* Build a single combined Claude prompt out of multiple annotations.
 * One header at the top, then each annotation as its own block.
 */
export function buildBundlePrompt(list: Annotation[]): string {
  if (list.length === 0) return "";
  const header = [
    `I have ${list.length} change${list.length === 1 ? "" : "s"} to apply in the design workspace. For each one, read the file at the listed line, find the element, and apply the change. Translate style edits to Tailwind design tokens (\`p-m\`, \`rounded-lg\`, \`text-accent\`, etc.) where a token matches; use raw values only when no token fits.`,
    "",
  ].join("\n");

  const blocks = list.map((a, i) => {
    const lines: string[] = [];
    lines.push(`--- ${i + 1}/${list.length} — ${a.kind} ---`);
    if (a.source) {
      lines.push(`File: ${a.source.fileName}:${a.source.lineNumber}`);
      if (a.source.componentName) lines.push(`Component: ${a.source.componentName}`);
    } else {
      lines.push("File: (unknown — please grep)");
    }
    lines.push(`Selector: ${a.cssPath}`);
    lines.push(`Element: ${a.outerHTMLPreview}`);
    lines.push("");
    if (a.kind === "comment") {
      lines.push("Comment:");
      lines.push(a.text);
    } else {
      lines.push("Changes:");
      if (a.textChange) {
        lines.push(
          `  - text: ${JSON.stringify(a.textChange.from)} → ${JSON.stringify(a.textChange.to)}`,
        );
      }
      for (const d of a.styleDiff) {
        const kebab = d.prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        lines.push(`  - ${kebab}: ${d.from || "(unset)"} → ${d.to}`);
      }
    }
    return lines.join("\n");
  });

  return header + blocks.join("\n\n");
}

/* Re-apply a single edit annotation's changes to the live DOM. Returns
 * true if the target element was located and edits applied; false if the
 * element couldn't be found (e.g. user navigated, or the source changed).
 */
export function reapplyEdit(a: EditAnnotation): boolean {
  const el = locateAnnotationElement(a);
  if (!el) return false;
  for (const d of a.styleDiff) {
    const kebab = d.prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    el.style.setProperty(kebab, d.to);
  }
  if (a.textChange) {
    const direct = Array.from(el.childNodes).filter(
      (n): n is Text => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
    );
    if (direct.length === 1) direct[0].textContent = a.textChange.to;
  }
  return true;
}

/* Undo an edit annotation on the live DOM. Removes the inline properties
 * the annotation set and restores the prior text. Returns true if the
 * target was located.
 */
export function revertEdit(a: EditAnnotation): boolean {
  const el = locateAnnotationElement(a);
  if (!el) return false;
  for (const d of a.styleDiff) {
    const kebab = d.prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    el.style.removeProperty(kebab);
  }
  if (el.getAttribute("style") === "") el.removeAttribute("style");
  if (a.textChange) {
    const direct = Array.from(el.childNodes).filter(
      (n): n is Text => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
    );
    if (direct.length === 1) direct[0].textContent = a.textChange.from;
  }
  return true;
}

/* Locate the live element for an annotation. Tries `data-source` first
 * (compile-time injected, stable across rerenders) then CSS path fallback.
 */
export function locateAnnotationElement(a: Annotation): HTMLElement | null {
  // data-source match: file:line + component, narrows to the right JSX site.
  if (a.source) {
    const tag = `${a.source.fileName}:${a.source.lineNumber}`;
    const candidates = document.querySelectorAll<HTMLElement>(
      `[data-source^="${cssEscape(tag)}"]`,
    );
    if (candidates.length === 1) return candidates[0];
    // Multiple — pick the first whose tag/classlist matches the saved preview.
    for (const c of Array.from(candidates)) {
      if (c.outerHTML.includes(a.outerHTMLPreview.split(">")[0].slice(0, 40))) {
        return c;
      }
    }
    if (candidates[0]) return candidates[0];
  }
  // CSS path fallback — try as a queryable selector. Works for some paths.
  try {
    const el = document.querySelector<HTMLElement>(a.cssPath);
    if (el) return el;
  } catch {
    // selector may not be valid for query — that's fine.
  }
  return null;
}

function cssEscape(s: string): string {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
  return s.replace(/(["\\])/g, "\\$1");
}
