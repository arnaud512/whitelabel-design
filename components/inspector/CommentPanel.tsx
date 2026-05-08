"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type ElementSource } from "./lib/fiber";
import { getOuterHTMLPreview } from "./lib/cssPath";
import { addAnnotation, newId } from "./lib/annotations";

interface Props {
  element: HTMLElement;
  source: ElementSource | null;
  cssPath: string;
  onClose: () => void;
}

export function CommentPanel({ element, source, cssPath, onClose }: Props) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  const html = useMemo(() => getOuterHTMLPreview(element), [element]);

  const prompt = buildPrompt({ source, cssPath, html, comment: text });

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const onSave = () => {
    if (!text.trim()) return;
    addAnnotation({
      id: newId(),
      kind: "comment",
      createdAt: Date.now(),
      route: typeof window !== "undefined" ? window.location.pathname : "",
      source,
      cssPath,
      outerHTMLPreview: html,
      text: text.trim(),
    });
    setSaved(true);
    setTimeout(() => onClose(), 400);
  };

  return (
    <div
      data-inspector-ui
      style={panelStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Comment</span>
        <button onClick={onClose} style={closeBtn} aria-label="Close">×</button>
      </header>

      <div style={metaStyle}>
        {source ? (
          <>
            <div style={metaLineStrong}>
              {shortenPath(source.fileName)}:{source.lineNumber}
            </div>
            {source.componentName && (
              <div style={metaLine}>{source.componentName}</div>
            )}
          </>
        ) : (
          <div style={metaLine}>No source info (prod build?)</div>
        )}
        <div style={selectorStyle}>{cssPath || "(no path)"}</div>
      </div>

      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the change you want…"
        style={textareaStyle}
        rows={5}
      />

      <div style={footerStyle}>
        <button onClick={onCopy} style={secondaryBtn} disabled={!text.trim()}>
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={onSave} style={copyBtn} disabled={!text.trim()}>
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

      <details style={previewWrap}>
        <summary style={previewSummary}>Preview prompt</summary>
        <pre style={previewPre}>{prompt}</pre>
      </details>
    </div>
  );
}

function buildPrompt({
  source,
  cssPath,
  html,
  comment,
}: {
  source: ElementSource | null;
  cssPath: string;
  html: string;
  comment: string;
}): string {
  const lines: string[] = [];
  lines.push("I selected an element in the design workspace. Please make this change:");
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
  lines.push("Comment:");
  lines.push(comment.trim());
  return lines.join("\n");
}

function shortenPath(p: string): string {
  // strip /Users/.../whitelabel-design/ prefix if present
  const idx = p.indexOf("whitelabel-design/");
  if (idx >= 0) return p.slice(idx + "whitelabel-design/".length);
  return p;
}

const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 80,
  left: "calc(var(--sidenav-w, 0px) + 24px)",
  width: 360,
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

const metaStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: 11,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  color: "#374151",
};

const metaLineStrong: React.CSSProperties = { fontWeight: 600, marginBottom: 2 };
const metaLine: React.CSSProperties = { color: "#6b7280", marginBottom: 2 };
const selectorStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#6b7280",
  wordBreak: "break-all",
};

const textareaStyle: React.CSSProperties = {
  margin: 12,
  padding: 8,
  fontSize: 13,
  fontFamily: "inherit",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  resize: "vertical",
  outline: "none",
};

const footerStyle: React.CSSProperties = {
  padding: "0 12px 12px",
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
};

const copyBtn: React.CSSProperties = {
  background: "#111",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 500,
};

const secondaryBtn: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 13,
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
