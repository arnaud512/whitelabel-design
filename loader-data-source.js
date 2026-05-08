/* Webpack loader: inject `data-source="<file>:<line>:<col>"` on every JSX
 * opening element so the design-workspace inspector can recover source
 * info browser-agnostically — no fiber walking, no Error.stack parsing.
 *
 * Runs in dev only, only on workspace .tsx/.jsx files (node_modules
 * excluded via the rule's `exclude`). Doesn't fight SWC: this loader
 * surgically edits the source string before SWC sees it. SWC continues
 * to compile, which means `next/font` and the rest of the SWC-only
 * features keep working.
 *
 * Implementation: parse with @babel/parser (no transform pipeline), walk
 * with @babel/traverse, splice attribute strings in via magic-string.
 */
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const MagicString = require("magic-string").default;

module.exports = function dataSourceLoader(source) {
  const filename = this.resourcePath;
  if (!filename) return source;
  if (filename.includes("/node_modules/")) return source;

  let ast;
  try {
    ast = parser.parse(source, {
      sourceType: "module",
      sourceFilename: filename,
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "topLevelAwait",
        "importMeta",
      ],
    });
  } catch (err) {
    // Don't break the build — let SWC report the parse error itself.
    return source;
  }

  const cwd = this.rootContext || process.cwd();
  let rel = path.relative(cwd, filename).split(path.sep).join("/");
  if (rel.startsWith("./")) rel = rel.slice(2);

  const ms = new MagicString(source);
  let touched = false;

  traverse(ast, {
    JSXOpeningElement(nodePath) {
      const node = nodePath.node;
      if (!node.loc) return;

      // Skip if `data-source` is already present (manual override wins).
      if (
        node.attributes.some(
          (a) =>
            a.type === "JSXAttribute" &&
            a.name &&
            a.name.type === "JSXIdentifier" &&
            a.name.name === "data-source",
        )
      ) {
        return;
      }

      // Insertion point: just before the closing `>` or `/>` of the opening tag.
      // Use the tag-name node's end as a stable anchor; we insert " data-source=..."
      // right after the tag name (and after any spread attrs already there is fine —
      // attribute order doesn't matter for HTML, only the last one wins on conflict).
      const insertAt = node.name.end;
      if (insertAt == null) return;

      const value = `${rel}:${node.loc.start.line}:${node.loc.start.column + 1}`;
      ms.appendRight(insertAt, ` data-source="${value}"`);
      touched = true;
    },
  });

  if (!touched) return source;
  return ms.toString();
};
