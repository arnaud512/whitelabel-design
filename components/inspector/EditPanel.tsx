"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type ElementSource } from "./lib/fiber";
import { getOuterHTMLPreview } from "./lib/cssPath";
import { addAnnotation, newId } from "./lib/annotations";
import {
  applyEdit,
  getInlineDiff,
  snapshotStyles,
  type EditableProp,
  type StyleSnapshot,
} from "./lib/styles";

interface Props {
  element: HTMLElement;
  source: ElementSource | null;
  cssPath: string;
  onClose: () => void;
}

export function EditPanel({ element, source, cssPath, onClose }: Props) {
  const snapshotRef = useRef<StyleSnapshot>({});
  const inlineBackupRef = useRef<string>("");
  // Original text content + which text node was edited. We only allow text
  // editing when the element has a single direct text node — replacing
  // textContent on a mixed-children element would wipe child elements.
  const textNodeRef = useRef<Text | null>(null);
  const originalTextRef = useRef<string>("");
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Snapshot computed styles + back up the inline `style` attribute on mount
  useEffect(() => {
    snapshotRef.current = snapshotStyles(element);
    inlineBackupRef.current = element.getAttribute("style") || "";
    // Detect a single editable text node — first direct text child whose
    // siblings are all whitespace or non-text. Common case: <h1>Today</h1>.
    const directText = Array.from(element.childNodes).filter(
      (n): n is Text => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
    );
    if (directText.length === 1) {
      textNodeRef.current = directText[0];
      originalTextRef.current = directText[0].textContent ?? "";
    } else {
      textNodeRef.current = null;
      originalTextRef.current = "";
    }
    setReady(true);
    return () => {
      // Restore on close — non-destructive editing
      if (inlineBackupRef.current) {
        element.setAttribute("style", inlineBackupRef.current);
      } else {
        element.removeAttribute("style");
      }
      if (textNodeRef.current) {
        textNodeRef.current.textContent = originalTextRef.current;
      }
    };
  }, [element]);

  const update = (prop: EditableProp, value: string) => {
    applyEdit(element, prop, value);
    setTick((n) => n + 1);
  };

  const reset = () => {
    if (inlineBackupRef.current) element.setAttribute("style", inlineBackupRef.current);
    else element.removeAttribute("style");
    if (textNodeRef.current) {
      textNodeRef.current.textContent = originalTextRef.current;
    }
    setTick((n) => n + 1);
  };

  const setText = (s: string) => {
    if (!textNodeRef.current) return;
    textNodeRef.current.textContent = s;
    setTick((n) => n + 1);
  };

  const currentText = textNodeRef.current?.textContent ?? "";
  const textChanged = !!textNodeRef.current && currentText !== originalTextRef.current;

  const get = (prop: EditableProp) => {
    const inline = element.style[prop as unknown as keyof CSSStyleDeclaration & string] as
      | string
      | undefined;
    if (inline) return inline;
    return snapshotRef.current[prop] ?? "";
  };

  const diff = useMemo(
    () => getInlineDiff(element, snapshotRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element, tick, ready],
  );

  const html = useMemo(() => getOuterHTMLPreview(element), [element]);
  const totalChanges = diff.length + (textChanged ? 1 : 0);
  const prompt = buildPrompt({
    source,
    cssPath,
    html,
    diff,
    textChange: textChanged
      ? { from: originalTextRef.current, to: currentText }
      : null,
  });

  // Relevance gating: hide sections that don't apply to the selected element
  // so the panel doesn't show nonsense (e.g. Typography on an <svg>).
  const isSvg =
    element.namespaceURI === "http://www.w3.org/2000/svg" ||
    !!element.closest("svg");
  const tagName = element.tagName.toLowerCase();
  const TEXT_BEARING = new Set([
    "p", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "button", "label", "li", "td", "th", "code", "pre",
    "blockquote", "figcaption", "small", "strong", "em", "b", "i", "u",
    "input", "textarea", "select", "option",
  ]);
  const hasDirectText = Array.from(element.childNodes).some(
    (n) => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
  );
  const showTypography = !isSvg && (TEXT_BEARING.has(tagName) || hasDirectText);
  const display = get("display") as string;
  const isFlexOrGrid = display.includes("flex") || display.includes("grid");
  const isReplaced = ["img", "video", "canvas", "iframe", "svg"].includes(tagName);

  // Render nothing until snapshot is captured — avoids a flash of empty fields
  if (!ready) return null;

  const savePrompt = () => {
    if (totalChanges === 0) return;
    addAnnotation({
      id: newId(),
      kind: "edit",
      createdAt: Date.now(),
      route: typeof window !== "undefined" ? window.location.pathname : "",
      source,
      cssPath,
      outerHTMLPreview: html,
      styleDiff: diff,
      textChange: textChanged
        ? { from: originalTextRef.current, to: currentText }
        : null,
    });
    // Don't restore inline styles on close — the saved annotation owns
    // the live edits now and Inspector re-applies them on refresh.
    inlineBackupRef.current = element.getAttribute("style") || "";
    originalTextRef.current = currentText;
    setSaved(true);
    setTimeout(() => onClose(), 400);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      data-inspector-ui
      style={panelStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Edit</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={reset} style={smallBtn} title="Reset all edits">
            Reset
          </button>
          <button onClick={onClose} style={closeBtn} aria-label="Close">×</button>
        </div>
      </header>

      <div style={metaStyle}>
        {source ? (
          <div style={metaLineStrong}>
            {shortenPath(source.fileName)}:{source.lineNumber}
            {source.componentName && (
              <span style={{ color: "#6b7280", fontWeight: 400 }}>
                {" "}· {source.componentName}
              </span>
            )}
          </div>
        ) : (
          <div style={metaLine}>No source info</div>
        )}
        <div style={selectorStyle}>{cssPath}</div>
      </div>

      <div style={scrollBody}>
        {textNodeRef.current && (
          <Section title="Text">
            <textarea
              value={currentText}
              onChange={(e) => setText(e.target.value)}
              rows={Math.min(6, Math.max(1, currentText.split("\n").length))}
              style={{
                width: "calc(100% - 24px)",
                margin: "0 12px 8px",
                padding: 6,
                fontSize: 12,
                fontFamily: "inherit",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                resize: "vertical",
                outline: "none",
              }}
            />
          </Section>
        )}
        {showTypography && (
          <Section title="Typography">
            <Row label="Font">
              <SelectField
                value={get("fontFamily")}
                onChange={(v) => update("fontFamily", v)}
                options={[
                  { label: "—", value: get("fontFamily") },
                  { label: "system", value: "-apple-system, BlinkMacSystemFont, sans-serif" },
                  { label: "SF Pro Text", value: "'SF Pro Text', sans-serif" },
                  { label: "SF Pro Display", value: "'SF Pro Display', sans-serif" },
                  { label: "monospace", value: "ui-monospace, monospace" },
                ]}
              />
            </Row>
            <Row label="Size">
              <PxField value={get("fontSize")} onChange={(v) => update("fontSize", v)} />
            </Row>
            <Row label="Weight">
              <SelectField
                value={get("fontWeight")}
                onChange={(v) => update("fontWeight", v)}
                options={["100", "200", "300", "400", "500", "600", "700", "800", "900"].map(
                  (n) => ({ label: n, value: n }),
                )}
              />
            </Row>
            <Row label="Color">
              <ColorField value={get("color")} onChange={(v) => update("color", v)} />
            </Row>
            <Row label="Align">
              <SelectField
                value={get("textAlign")}
                onChange={(v) => update("textAlign", v)}
                options={["start", "left", "center", "right", "end", "justify"].map((v) => ({
                  label: v,
                  value: v,
                }))}
              />
            </Row>
            <Row label="Line">
              <RawField value={get("lineHeight")} onChange={(v) => update("lineHeight", v)} />
            </Row>
            <Row label="Tracking">
              <PxField value={get("letterSpacing")} onChange={(v) => update("letterSpacing", v)} />
            </Row>
          </Section>
        )}

        <Section title="Size">
          <Row label="Width">
            <RawField value={get("width")} onChange={(v) => update("width", v)} />
          </Row>
          <Row label="Height">
            <RawField value={get("height")} onChange={(v) => update("height", v)} />
          </Row>
        </Section>

        {!isReplaced && (
          <Section title="Layout">
            <Row label="Display">
              <SelectField
                value={get("display")}
                onChange={(v) => update("display", v)}
                options={["block", "flex", "inline-flex", "inline", "inline-block", "grid", "none"].map(
                  (v) => ({ label: v, value: v }),
                )}
              />
            </Row>
            {isFlexOrGrid && (
              <>
                <Row label="Gap">
                  <PxField value={get("gap")} onChange={(v) => update("gap", v)} />
                </Row>
                <Row label="Direction">
                  <SelectField
                    value={get("flexDirection")}
                    onChange={(v) => update("flexDirection", v)}
                    options={["row", "row-reverse", "column", "column-reverse"].map((v) => ({
                      label: v,
                      value: v,
                    }))}
                  />
                </Row>
                <Row label="Justify">
                  <SelectField
                    value={get("justifyContent")}
                    onChange={(v) => update("justifyContent", v)}
                    options={[
                      "flex-start",
                      "center",
                      "flex-end",
                      "space-between",
                      "space-around",
                      "space-evenly",
                    ].map((v) => ({ label: v, value: v }))}
                  />
                </Row>
                <Row label="Align">
                  <SelectField
                    value={get("alignItems")}
                    onChange={(v) => update("alignItems", v)}
                    options={["stretch", "flex-start", "center", "flex-end", "baseline"].map(
                      (v) => ({ label: v, value: v }),
                    )}
                  />
                </Row>
              </>
            )}
          </Section>
        )}

        {isSvg ? (
          <Section title="SVG">
            <Row label="Fill">
              <ColorField value={get("fill")} onChange={(v) => update("fill", v)} />
            </Row>
            <Row label="Stroke">
              <ColorField value={get("stroke")} onChange={(v) => update("stroke", v)} />
            </Row>
            <Row label="Stroke w">
              <PxField value={get("strokeWidth")} onChange={(v) => update("strokeWidth", v)} />
            </Row>
            <Row label="Opacity">
              <RawField value={get("opacity")} onChange={(v) => update("opacity", v)} />
            </Row>
          </Section>
        ) : (
          <Section title="Box">
            <Row label="Fill">
              <ColorField
                value={get("backgroundColor")}
                onChange={(v) => update("backgroundColor", v)}
              />
            </Row>
            <Row label="Opacity">
              <RawField value={get("opacity")} onChange={(v) => update("opacity", v)} />
            </Row>
            <SidesField
              label="Padding"
              top={get("paddingTop")}
              right={get("paddingRight")}
              bottom={get("paddingBottom")}
              left={get("paddingLeft")}
              onChange={(side, v) =>
                update(`padding${side}` as EditableProp, v)
              }
            />
            <SidesField
              label="Margin"
              top={get("marginTop")}
              right={get("marginRight")}
              bottom={get("marginBottom")}
              left={get("marginLeft")}
              onChange={(side, v) =>
                update(`margin${side}` as EditableProp, v)
              }
            />
            <SidesField
              label="Border"
              top={get("borderTopWidth")}
              right={get("borderRightWidth")}
              bottom={get("borderBottomWidth")}
              left={get("borderLeftWidth")}
              onChange={(side, v) =>
                update(`border${side}Width` as EditableProp, v)
              }
            />
            <Row label="Style">
              <SelectField
                value={get("borderStyle")}
                onChange={(v) => update("borderStyle", v)}
                options={["solid", "dashed", "dotted", "none"].map((v) => ({
                  label: v,
                  value: v,
                }))}
              />
            </Row>
            <Row label="Border color">
              <ColorField value={get("borderColor")} onChange={(v) => update("borderColor", v)} />
            </Row>
            <Row label="Radius">
              <PxField value={get("borderRadius")} onChange={(v) => update("borderRadius", v)} />
            </Row>
          </Section>
        )}
      </div>

      <footer style={footerStyle}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>
          {totalChanges} change{totalChanges === 1 ? "" : "s"}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={copyPrompt} style={secondaryBtn} disabled={totalChanges === 0}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={savePrompt} style={copyBtn} disabled={totalChanges === 0}>
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </footer>

      <details style={previewWrap}>
        <summary style={previewSummary}>Preview prompt</summary>
        <pre style={previewPre}>{prompt}</pre>
      </details>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid #f3f4f6" }}>
      <div style={sectionTitle}>{title}</div>
      <div style={{ padding: "0 12px 8px" }}>{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={rowStyle}>
      <span style={rowLabel}>{label}</span>
      <span style={{ flex: 1 }}>{children}</span>
    </label>
  );
}

function PxField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const num = value && value.endsWith("px") ? parseFloat(value) : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        type="number"
        value={num}
        onChange={(e) => onChange(e.target.value === "" ? "" : `${e.target.value}px`)}
        style={inputStyle}
      />
      <span style={unit}>px</span>
    </div>
  );
}

function RawField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
      placeholder="—"
    />
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = useMemo(() => rgbToHex(value), [value]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="color"
        value={hex || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 22, padding: 0, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}
      />
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  // Make sure the current value is selectable even if not in options
  const has = options.some((o) => o.value === value);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      {!has && <option value={value}>{value || "—"}</option>}
      {options.map((o, i) => (
        <option key={i} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SidesField({
  label,
  top,
  right,
  bottom,
  left,
  onChange,
}: {
  label: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  onChange: (side: "Top" | "Right" | "Bottom" | "Left", v: string) => void;
}) {
  return (
    <div style={{ ...rowStyle, alignItems: "flex-start" }}>
      <span style={rowLabel}>{label}</span>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        <SideInput letter="T" value={top} onChange={(v) => onChange("Top", v)} />
        <SideInput letter="R" value={right} onChange={(v) => onChange("Right", v)} />
        <SideInput letter="B" value={bottom} onChange={(v) => onChange("Bottom", v)} />
        <SideInput letter="L" value={left} onChange={(v) => onChange("Left", v)} />
      </div>
    </div>
  );
}

function SideInput({
  letter,
  value,
  onChange,
}: {
  letter: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = value && value.endsWith("px") ? parseFloat(value) : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ ...unit, width: 10, textAlign: "center" }}>{letter}</span>
      <input
        type="number"
        value={num}
        onChange={(e) => onChange(e.target.value === "" ? "" : `${e.target.value}px`)}
        style={{ ...inputStyle, padding: "3px 5px" }}
      />
    </div>
  );
}

function rgbToHex(rgb: string): string | undefined {
  if (!rgb) return undefined;
  if (rgb.startsWith("#")) return rgb.length === 7 ? rgb : undefined;
  const m = rgb.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return undefined;
  const [, r, g, b] = m;
  const h = (n: string) => Number(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function buildPrompt({
  source,
  cssPath,
  html,
  diff,
  textChange,
}: {
  source: ElementSource | null;
  cssPath: string;
  html: string;
  diff: Array<{ prop: EditableProp; from: string; to: string }>;
  textChange: { from: string; to: string } | null;
}): string {
  const lines: string[] = [];
  lines.push(
    "I edited an element in the design workspace. Apply these changes in the source. For style changes, translate to Tailwind design tokens (`p-m`, `rounded-lg`, `text-accent`, etc.) wherever a token matches; use raw values only when no token fits.",
  );
  lines.push("");
  if (source) {
    lines.push(`File: ${shortenPath(source.fileName)}:${source.lineNumber}`);
    if (source.componentName) lines.push(`Component: ${source.componentName}`);
  } else {
    lines.push("File: (unknown — please grep)");
  }
  lines.push(`Selector: ${cssPath}`);
  lines.push(`Element: ${html}`);
  lines.push("");
  lines.push("Changes:");
  if (textChange) {
    lines.push(`  - text: ${JSON.stringify(textChange.from)} → ${JSON.stringify(textChange.to)}`);
  }
  for (const d of diff) {
    lines.push(`  - ${kebab(d.prop)}: ${d.from || "(unset)"} → ${d.to}`);
  }
  return lines.join("\n");
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function shortenPath(p: string): string {
  const idx = p.indexOf("whitelabel-design/");
  if (idx >= 0) return p.slice(idx + "whitelabel-design/".length);
  return p;
}

const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 80,
  left: "calc(var(--sidenav-w, 0px) + 24px)",
  width: 320,
  maxHeight: "calc(100vh - 120px)",
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
  fontSize: 12,
  color: "#111",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: 0,
  fontSize: 18,
  lineHeight: 1,
  cursor: "pointer",
  color: "#6b7280",
  padding: "0 4px",
};

const smallBtn: React.CSSProperties = {
  background: "#f3f4f6",
  border: 0,
  borderRadius: 4,
  padding: "3px 8px",
  fontSize: 11,
  cursor: "pointer",
  color: "#374151",
};

const metaStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 11,
  color: "#374151",
};

const metaLineStrong: React.CSSProperties = { fontWeight: 600, marginBottom: 2 };
const metaLine: React.CSSProperties = { color: "#6b7280" };
const selectorStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#6b7280",
  wordBreak: "break-all",
};

const scrollBody: React.CSSProperties = {
  overflowY: "auto",
  flex: 1,
};

const sectionTitle: React.CSSProperties = {
  padding: "8px 12px 4px",
  fontSize: 10,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#9ca3af",
  fontWeight: 600,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "3px 0",
};

const rowLabel: React.CSSProperties = {
  width: 70,
  fontSize: 11,
  color: "#6b7280",
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "3px 6px",
  fontSize: 11,
  fontFamily: "inherit",
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  outline: "none",
  background: "white",
  color: "#111",
  boxSizing: "border-box",
};

const unit: React.CSSProperties = {
  fontSize: 10,
  color: "#9ca3af",
};

const footerStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const copyBtn: React.CSSProperties = {
  background: "#111",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 500,
};

const secondaryBtn: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 500,
};

const previewWrap: React.CSSProperties = {
  borderTop: "1px solid #f3f4f6",
  padding: "8px 12px 12px",
  fontSize: 11,
  overflow: "auto",
};
const previewSummary: React.CSSProperties = {
  cursor: "pointer",
  color: "#6b7280",
  userSelect: "none",
};
const previewPre: React.CSSProperties = {
  marginTop: 6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#f9fafb",
  padding: 8,
  borderRadius: 4,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  color: "#111",
};
