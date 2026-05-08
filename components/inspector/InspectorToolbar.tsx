"use client";

import { useEffect, useState } from "react";
import type { InspectorMode } from "./Inspector";
import { loadAnnotations } from "./lib/annotations";

interface Props {
  mode: InspectorMode;
  setMode: (m: InspectorMode) => void;
  /** Triggered when the user clicks the Comment button. Inspector decides
   *  whether to switch to comment mode or open the page-level comment panel. */
  onCommentClick: () => void;
}

export function InspectorToolbar({ mode, setMode, onCommentClick }: Props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => setCount(loadAnnotations().length);
    refresh();
    window.addEventListener("whitelabel:annotations-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("whitelabel:annotations-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div data-inspector-ui style={wrapStyle}>
      <Btn active={mode === "off"} onClick={() => setMode("off")} label="Move" hotkey="1">
        <CursorIcon />
      </Btn>
      <Btn active={mode === "comment"} onClick={onCommentClick} label={mode === "comment" ? "Comment on page" : "Comment"} hotkey="2">
        <CommentIcon />
      </Btn>
      <Btn active={mode === "edit"} onClick={() => setMode("edit")} label="Edit" hotkey="3">
        <EditIcon />
      </Btn>
      <Btn
        active={mode === "log"}
        onClick={() => setMode(mode === "log" ? "off" : "log")}
        label={`Annotations${count ? ` · ${count}` : ""}`}
        hotkey="4"
      >
        <LogIcon />
        {count > 0 && (
          <span style={badgeStyle}>{count > 99 ? "99+" : count}</span>
        )}
      </Btn>
    </div>
  );
}

function Btn({
  active,
  onClick,
  label,
  hotkey,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hotkey: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const bg = active ? "#111" : hover ? "#f3f4f6" : "transparent";
  const color = active ? "white" : hover ? "#111" : "#6b7280";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      title={`${label} (${hotkey})`}
      aria-pressed={active}
      style={{ ...btnStyle, background: bg, color }}
    >
      {children}
      {hover && !active && (
        <span style={tooltipStyle}>
          {label}
          <span style={tooltipHotkeyStyle}>{hotkey}</span>
        </span>
      )}
    </button>
  );
}

const wrapStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 24,
  left: "calc(var(--sidenav-w, 0px) + 24px)",
  zIndex: 9999,
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  padding: 4,
  display: "flex",
  gap: 2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  transition: "left 200ms",
};

const btnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: 0,
  borderRadius: 999,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 120ms, color 120ms",
  position: "relative",
};

const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#111",
  color: "white",
  fontSize: 11,
  fontWeight: 500,
  padding: "4px 8px",
  borderRadius: 6,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 6,
  pointerEvents: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
};

const tooltipHotkeyStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.18)",
  color: "white",
  fontSize: 10,
  fontWeight: 600,
  padding: "0 5px",
  borderRadius: 3,
  lineHeight: "14px",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: -2,
  right: -2,
  background: "#ef4444",
  color: "white",
  fontSize: 9,
  fontWeight: 700,
  padding: "1px 4px",
  borderRadius: 999,
  minWidth: 14,
  textAlign: "center",
  lineHeight: 1.2,
};

function CursorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}
