/* Fiber traversal — recovers source info from a DOM node.
 *
 * React 18 used `_debugSource` ({fileName, lineNumber}). React 19 dropped that
 * in favor of `_debugStack` (an Error whose stack contains the JSX call site).
 * We support both, walking up to the closest fiber that yields a usable hit.
 */

export interface ElementSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  componentName?: string;
}

interface DebugSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

interface Fiber {
  type?: unknown;
  elementType?: unknown;
  return?: Fiber | null;
  _debugSource?: DebugSource;
  _debugOwner?: Fiber | null;
  _debugStack?: Error;
}

function fiberKey(node: Element): string | undefined {
  return Object.keys(node).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  );
}

function getFiber(node: Element): Fiber | null {
  const key = fiberKey(node);
  if (!key) return null;
  return (node as unknown as Record<string, Fiber>)[key] ?? null;
}

function componentName(type: unknown): string | undefined {
  if (typeof type === "function") {
    return (type as { displayName?: string; name?: string }).displayName ||
      (type as { name?: string }).name ||
      undefined;
  }
  if (typeof type === "object" && type !== null) {
    const t = type as { displayName?: string; render?: { name?: string } };
    return t.displayName || t.render?.name;
  }
  return undefined;
}

/* Parse the first project frame out of an Error stack.
 *
 * React 19 puts a synthetic Error in `fiber._debugStack`. The frame just below
 * `jsxDEV` / `fakeJSXCallSite` is the user's JSX site, e.g.:
 *   at HomeScreen (webpack-internal:///(app-pages-browser)/./app/reference/home/HomeScreen.tsx:89:104)
 *
 * Webpack-internal URLs contain the project-relative path which is exactly
 * what we want for the prompt.
 */
function parseStack(err: Error | undefined): {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  componentName?: string;
} | null {
  if (!err || !err.stack) return null;
  const lines = err.stack.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // V8 (Chrome): "at <Func> (<url>:<L>:<C>)" or "at <url>:<L>:<C>"
    // JSC (Safari): "<Func>@<url>:<L>:<C>" or "@<url>:<L>:<C>"
    const m =
      line.match(/^at\s+([^\s(]+)\s+\((.+):(\d+):(\d+)\)$/) ||
      line.match(/^at\s+(.+):(\d+):(\d+)$/) ||
      line.match(/^([^@\s]*)@(.+):(\d+):(\d+)$/);
    if (!m) continue;
    let func: string | undefined;
    let url: string;
    let lineNum: string;
    let colNum: string;
    if (m.length === 5) {
      // V8 with func, or Safari (func may be empty string for anonymous)
      func = m[1] || undefined;
      url = m[2];
      lineNum = m[3];
      colNum = m[4];
    } else {
      // V8 anonymous: "at <url>:<L>:<C>"
      url = m[1];
      lineNum = m[2];
      colNum = m[3];
    }
    // Skip framework / runtime frames. Note: do NOT filter `about://` — RSC
    // frames are wrapped as `about://React/Server/webpack-internal:///...`
    // and contain the actual project source path.
    if (
      url.includes("/node_modules/") ||
      url.includes("react-stack") ||
      func === "jsxDEV" ||
      func === "fakeJSXCallSite" ||
      func === "Object.jsxDEV" ||
      func === "exports.jsxDEV"
    ) {
      continue;
    }
    // Normalize: strip RSC + webpack-internal prefixes, leave project-relative
    // path. Drop trailing `?<digit>` cache-buster suffixes.
    const cleanedUrl = url
      .replace(/^about:\/\/React\/Server\//, "")
      .replace(/^webpack-internal:\/\/\/(\([^)]+\)\/)?\.\//, "")
      .replace(/^webpack:\/\/\//, "")
      .replace(/^[a-z]+:\/\/[^/]+\//, "")
      .replace(/\?\d+$/, "");
    // After cleaning, anything still containing a protocol scheme isn't a
    // real source — bail to the next frame.
    if (cleanedUrl.includes("://")) continue;
    // Skip bundled chunks. Safari/JSC doesn't apply source maps to
    // Error.stack, so .tsx frames surface as `_next/static/chunks/foo.js`.
    // Require a project-source extension to avoid leading the user to a
    // useless bundle path.
    if (!/\.(tsx|ts|jsx|mjs|cjs)$/.test(cleanedUrl)) continue;
    if (cleanedUrl.startsWith("_next/")) continue;
    return {
      fileName: cleanedUrl,
      lineNumber: parseInt(lineNum, 10),
      columnNumber: parseInt(colNum, 10),
      componentName: func && /^[A-Z]/.test(func) ? func : undefined,
    };
  }
  return null;
}

/* Read the Babel-injected `data-source` attribute on this element or the
 * nearest ancestor that has one. Format: "components/.../File.tsx:42:5".
 * Cross-browser: works in Safari/Firefox/Chrome identically.
 */
function readDataSource(node: Element): ElementSource | null {
  const el = node.closest("[data-source]");
  if (!el) return null;
  const raw = el.getAttribute("data-source");
  if (!raw) return null;
  const m = raw.match(/^(.+):(\d+):(\d+)$/);
  if (!m) return null;
  return {
    fileName: m[1],
    lineNumber: parseInt(m[2], 10),
    columnNumber: parseInt(m[3], 10),
  };
}

export function getElementSource(node: Element): ElementSource | null {
  // Prefer the compile-time `data-source` annotation if it's present.
  const fromAttr = readDataSource(node);
  if (fromAttr) {
    const owner = getOwningComponent(node);
    return owner ? { ...fromAttr, componentName: owner } : fromAttr;
  }

  const fiber = getFiber(node);
  if (!fiber) return null;

  let current: Fiber | null = fiber;
  while (current) {
    // React 18 path
    if (current._debugSource) {
      const src = current._debugSource;
      const owner = current._debugOwner;
      return {
        fileName: src.fileName,
        lineNumber: src.lineNumber,
        columnNumber: src.columnNumber,
        componentName: owner ? componentName(owner.type) : componentName(current.type),
      };
    }
    // React 19 path
    if (current._debugStack) {
      const parsed = parseStack(current._debugStack);
      if (parsed) {
        return {
          ...parsed,
          componentName:
            parsed.componentName ??
            (current._debugOwner
              ? componentName(current._debugOwner.type)
              : componentName(current.type)),
        };
      }
    }
    current = current.return ?? null;
  }
  return null;
}

/** Find the nearest function-component fiber's name (e.g. "HomeCalendar") */
export function getOwningComponent(node: Element): string | undefined {
  const fiber = getFiber(node);
  if (!fiber) return undefined;
  let current: Fiber | null = fiber;
  while (current) {
    const name = componentName(current.type);
    if (name && /^[A-Z]/.test(name)) return name;
    current = current.return ?? null;
  }
  return undefined;
}
