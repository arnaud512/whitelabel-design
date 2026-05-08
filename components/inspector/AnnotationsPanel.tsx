"use client";

import { useEffect, useState } from "react";
import {
  buildBundlePrompt,
  clearAnnotations,
  loadAnnotations,
  locateAnnotationElement,
  removeAnnotation,
  type Annotation,
} from "./lib/annotations";

interface Props {
  onClose: () => void;
}

export function AnnotationsPanel({ onClose }: Props) {
  const [items, setItems] = useState<Annotation[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(loadAnnotations());
    refresh();
    window.addEventListener("whitelabel:annotations-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("whitelabel:annotations-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      // ignore
    }
  };

  const copyAll = () => copy(buildBundlePrompt(items), "all");
  const copyOne = (a: Annotation) =>
    copy(buildBundlePrompt([a]), a.id);

  const remove = (id: string) => {
    removeAnnotation(id);
    setItems(loadAnnotations());
  };

  const clear = () => {
    if (items.length === 0) return;
    if (!confirm(`Clear all ${items.length} annotations?`)) return;
    clearAnnotations();
    setItems([]);
  };

  const locate = (a: Annotation) => {
    const el = locateAnnotationElement(a);
    if (!el) {
      alert("Couldn't find this element on the current page.");
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Flash highlight
    const old = el.style.outline;
    el.style.outline = "2px solid #3b82f6";
    el.style.outlineOffset = "2px";
    setTimeout(() => {
      el.style.outline = old;
      el.style.outlineOffset = "";
    }, 1200);
  };

  return (
    <div
      data-inspector-ui
      style={panelStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          Annotations{" "}
          <span style={{ color: "#6b7280", fontWeight: 400 }}>({items.length})</span>
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={copyAll}
            style={primaryBtn}
            disabled={items.length === 0}
          >
            {copied === "all" ? "Copied!" : "Copy all"}
          </button>
          <button onClick={clear} style={smallBtn} disabled={items.length === 0}>
            Clear
          </button>
          <button onClick={onClose} style={closeBtn} aria-label="Close">×</button>
        </div>
      </header>

      <div style={listWrap}>
        {items.length === 0 ? (
          <div style={emptyStyle}>
            No annotations yet. Use Comment (2) or Edit (3) on the canvas, then
            press <strong>Save</strong> in the panel to add one here.
          </div>
        ) : (
          items
            .slice()
            .reverse()
            .map((a) => (
              <Item
                key={a.id}
                a={a}
                onCopy={() => copyOne(a)}
                onLocate={() => locate(a)}
                onRemove={() => remove(a.id)}
                copied={copied === a.id}
              />
            ))
        )}
      </div>
    </div>
  );
}

function Item({
  a,
  onCopy,
  onLocate,
  onRemove,
  copied,
}: {
  a: Annotation;
  onCopy: () => void;
  onLocate: () => void;
  onRemove: () => void;
  copied: boolean;
}) {
  const summary = describe(a);
  const kindColor = a.kind === "comment" ? "#3b82f6" : "#10b981";
  return (
    <div style={itemStyle}>
      <div style={itemHeader}>
        <span
          style={{
            display: "inline-block",
            background: kindColor,
            color: "white",
            fontSize: 9,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "1px 5px",
            borderRadius: 3,
          }}
        >
          {a.kind}
        </span>
        <span style={metaText}>
          {a.source ? (
            <>
              {shortenPath(a.source.fileName)}:{a.source.lineNumber}
              {a.source.componentName && ` · ${a.source.componentName}`}
            </>
          ) : (
            "(no source)"
          )}
        </span>
        <span style={{ flex: 1 }} />
        <IconBtn onClick={onLocate} title="Locate on canvas">
          <CrosshairIcon />
        </IconBtn>
        <IconBtn onClick={onCopy} title="Copy this prompt">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </IconBtn>
        <IconBtn onClick={onRemove} title="Delete" danger>
          <TrashIcon />
        </IconBtn>
      </div>
      <div style={summaryStyle}>{summary}</div>
      <div style={routeStyle}>{a.route}</div>
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
  danger,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (danger ? "#fee2e2" : "#f3f4f6") : "transparent",
        color: hover ? (danger ? "#dc2626" : "#111") : "#6b7280",
        border: 0,
        borderRadius: 6,
        cursor: "pointer",
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 100ms, color 100ms",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function CrosshairIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function describe(a: Annotation): string {
  if (a.kind === "comment") return a.text || "(empty comment)";
  const parts: string[] = [];
  if (a.textChange) parts.push(`text → ${JSON.stringify(a.textChange.to)}`);
  for (const d of a.styleDiff.slice(0, 3)) {
    const kebab = d.prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    parts.push(`${kebab}: ${d.to}`);
  }
  if (a.styleDiff.length > 3) parts.push(`+${a.styleDiff.length - 3} more`);
  return parts.join(" · ") || "(no changes)";
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
  width: 380,
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
  gap: 6,
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

const primaryBtn: React.CSSProperties = {
  background: "#111",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "5px 10px",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 500,
};

const smallBtn: React.CSSProperties = {
  background: "#f3f4f6",
  border: 0,
  borderRadius: 4,
  padding: "5px 10px",
  fontSize: 11,
  cursor: "pointer",
  color: "#374151",
};

const listWrap: React.CSSProperties = {
  overflowY: "auto",
  flex: 1,
};

const emptyStyle: React.CSSProperties = {
  padding: "24px 16px",
  color: "#6b7280",
  fontSize: 12,
  lineHeight: 1.5,
  textAlign: "center",
};

const itemStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const itemHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const metaText: React.CSSProperties = {
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 10,
  color: "#374151",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const summaryStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#111",
  wordBreak: "break-word",
};

const routeStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#9ca3af",
};
