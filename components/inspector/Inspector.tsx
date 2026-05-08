"use client";

/* Inspector — Comment / Edit overlays for the design workspace.
 *
 * Modes:
 *  - off:     no overlay, no listeners
 *  - comment: hover-highlight + click → opens CommentPanel (textarea + copy)
 *  - edit:    hover-highlight + click → opens EditPanel (Figma-style props)
 *
 * Selection is frozen on click; mode persists in localStorage. UI elements
 * own the [data-inspector-ui] attribute so they're skipped by the picker.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnnotationsPanel } from "./AnnotationsPanel";
import { CommentPanel } from "./CommentPanel";
import { EditPanel } from "./EditPanel";
import { InspectorToolbar } from "./InspectorToolbar";
import { PageCommentPanel } from "./PageCommentPanel";
import { getElementSource, type ElementSource } from "./lib/fiber";
import { getCSSPath } from "./lib/cssPath";
import {
  loadAnnotations,
  reapplyEdit,
} from "./lib/annotations";

export type InspectorMode = "off" | "comment" | "edit" | "log";

const MODE_KEY = "whitelabel.inspector.mode";

interface SelectionState {
  el: HTMLElement;
  originalEl: HTMLElement;
  rect: DOMRect;
  source: ElementSource | null;
  cssPath: string;
}

interface HoverState {
  el: HTMLElement;
  leaf: HTMLElement;
  rect: DOMRect;
}

export function Inspector() {
  const [mode, setMode] = useState<InspectorMode>("off");
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [selected, setSelected] = useState<SelectionState | null>(null);
  const [pageCommentOpen, setPageCommentOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  const onCommentClick = useCallback(() => {
    if (mode === "comment") {
      // Already in comment mode → open page-level comment panel.
      setSelected(null);
      setPageCommentOpen(true);
    } else {
      setMode("comment");
      setPageCommentOpen(false);
    }
  }, [mode]);

  // Hydrate mode from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MODE_KEY);
      if (stored === "comment" || stored === "edit") setMode(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  // Reset selection when changing modes
  useEffect(() => {
    setSelected(null);
    setHovered(null);
    if (mode !== "comment") setPageCommentOpen(false);
  }, [mode]);

  const isInspectorUI = useCallback((target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("[data-inspector-ui]"));
  }, []);

  // Re-apply persisted edit annotations on mount (and after route changes
  // settle) so a refresh restores the user's in-progress edits visually.
  useEffect(() => {
    const apply = () => {
      const list = loadAnnotations();
      for (const a of list) {
        if (a.kind === "edit") reapplyEdit(a);
      }
    };
    // Defer one frame so the page has rendered before we touch elements.
    const id = window.setTimeout(apply, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Widen / narrow helpers — shared by hover-time and selected-time controls.
  const widenSelected = useCallback(() => {
    setSelected((prev) => {
      if (!prev) return prev;
      const parent = prev.el.parentElement;
      if (
        !parent ||
        parent === document.body ||
        parent === document.documentElement ||
        parent.closest("[data-inspector-ui]")
      ) {
        return prev;
      }
      return {
        el: parent,
        originalEl: prev.originalEl,
        rect: parent.getBoundingClientRect(),
        source: getElementSource(parent),
        cssPath: getCSSPath(parent),
      };
    });
  }, []);

  const narrowSelected = useCallback(() => {
    setSelected((prev) => {
      if (!prev) return prev;
      if (prev.el === prev.originalEl) return prev;
      if (!prev.el.contains(prev.originalEl)) return prev;
      let next: HTMLElement | null = prev.originalEl;
      while (next && next.parentElement !== prev.el) {
        next = next.parentElement;
      }
      if (!next) return prev;
      return {
        el: next,
        originalEl: prev.originalEl,
        rect: next.getBoundingClientRect(),
        source: getElementSource(next),
        cssPath: getCSSPath(next),
      };
    });
  }, []);

  const widenHover = useCallback(() => {
    setHovered((prev) => {
      if (!prev) return prev;
      const parent = prev.el.parentElement;
      if (
        !parent ||
        parent === document.body ||
        parent === document.documentElement ||
        parent.closest("[data-inspector-ui]")
      ) {
        return prev;
      }
      return { el: parent, leaf: prev.leaf, rect: parent.getBoundingClientRect() };
    });
  }, []);

  const narrowHover = useCallback(() => {
    setHovered((prev) => {
      if (!prev) return prev;
      if (prev.el === prev.leaf) return prev;
      if (!prev.el.contains(prev.leaf)) return prev;
      let next: HTMLElement | null = prev.leaf;
      while (next && next.parentElement !== prev.el) {
        next = next.parentElement;
      }
      if (!next) return prev;
      return { el: next, leaf: prev.leaf, rect: next.getBoundingClientRect() };
    });
  }, []);

  // Picker: hover + click handlers
  useEffect(() => {
    if (mode === "off" || mode === "log") return;
    if (selected) return; // frozen — don't repaint hover
    if (pageCommentOpen) return; // page-level comment open — picker disabled

    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Hovering an inline +/- chip should not retarget the highlight.
      if (target.closest("[data-inspector-keep-hover]")) return;
      if (isInspectorUI(e.target)) {
        setHovered(null);
        return;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setHovered((prev) => {
          // Same leaf — keep any widening the user did.
          if (prev && prev.leaf === target) {
            return { ...prev, rect: prev.el.getBoundingClientRect() };
          }
          return { el: target, leaf: target, rect: target.getBoundingClientRect() };
        });
      });
    };

    const onClick = (e: MouseEvent) => {
      if (isInspectorUI(e.target)) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      // If hover has been widened/narrowed, freeze that element instead of
      // the raw click target.
      const picked = hovered && hovered.el && document.body.contains(hovered.el)
        ? hovered.el
        : target;
      const original = hovered ? hovered.leaf : target;
      const source = getElementSource(picked);
      const cssPath = getCSSPath(picked);
      setSelected({
        el: picked,
        originalEl: original,
        rect: picked.getBoundingClientRect(),
        source,
        cssPath,
      });
      setHovered(null);
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, selected, hovered, isInspectorUI, pageCommentOpen]);

  // Esc to deselect / exit; -/+ widen/narrow whichever is active (selected first, else hovered).
  useEffect(() => {
    if (mode === "off" || mode === "log") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if (typing) return;

      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else setMode("off");
        return;
      }
      if (e.key === "-" || e.key === "_") {
        if (!selected && !hovered) return;
        e.preventDefault();
        if (selected) widenSelected();
        else widenHover();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        if (!selected && !hovered) return;
        e.preventDefault();
        if (selected) narrowSelected();
        else narrowHover();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, selected, hovered, widenSelected, narrowSelected, widenHover, narrowHover]);

  // Global hotkeys: 1 = off/move, 2 = comment, 3 = edit, 4 = annotations log.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "1") setMode("off");
      else if (e.key === "2") onCommentClick();
      else if (e.key === "3") setMode("edit");
      else if (e.key === "4") setMode((m) => (m === "log" ? "off" : "log"));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCommentClick]);

  // Reposition selection rect on resize/scroll while frozen
  useEffect(() => {
    if (!selected) return;
    const update = () => {
      setSelected((prev) =>
        prev ? { ...prev, rect: prev.el.getBoundingClientRect() } : prev,
      );
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selected]);

  const showHover = mode !== "off" && mode !== "log" && hovered && !selected;
  const showSelected = mode !== "off" && mode !== "log" && selected;

  const hoverCanWiden = !!(
    hovered &&
    hovered.el.parentElement &&
    hovered.el.parentElement !== document.body &&
    hovered.el.parentElement !== document.documentElement &&
    !hovered.el.parentElement.closest("[data-inspector-ui]")
  );
  const hoverCanNarrow = !!(hovered && hovered.el !== hovered.leaf);

  const selectedCanWiden = !!(
    selected &&
    selected.el.parentElement &&
    selected.el.parentElement !== document.body &&
    selected.el.parentElement !== document.documentElement &&
    !selected.el.parentElement.closest("[data-inspector-ui]")
  );
  const selectedCanNarrow = !!(selected && selected.el !== selected.originalEl);

  return (
    <>
      <InspectorToolbar mode={mode} setMode={setMode} onCommentClick={onCommentClick} />

      {showHover && hovered && (
        <HighlightBox
          rect={hovered.rect}
          variant="hover"
          label={describe(hovered.el)}
          onWiden={hoverCanWiden ? widenHover : undefined}
          onNarrow={hoverCanNarrow ? narrowHover : undefined}
        />
      )}

      {showSelected && selected && (
        <HighlightBox
          rect={selected.rect}
          variant="selected"
          label={describe(selected.el)}
          onWiden={selectedCanWiden ? widenSelected : undefined}
          onNarrow={selectedCanNarrow ? narrowSelected : undefined}
        />
      )}

      {selected && mode === "comment" && (
        <CommentPanel
          element={selected.el}
          source={selected.source}
          cssPath={selected.cssPath}
          onClose={() => setSelected(null)}
        />
      )}

      {selected && mode === "edit" && (
        <EditPanel
          element={selected.el}
          source={selected.source}
          cssPath={selected.cssPath}
          onClose={() => setSelected(null)}
        />
      )}

      {mode === "log" && (
        <AnnotationsPanel onClose={() => setMode("off")} />
      )}

      {pageCommentOpen && mode === "comment" && (
        <PageCommentPanel onClose={() => setPageCommentOpen(false)} />
      )}
    </>
  );
}

function describe(el: HTMLElement): string {
  let s = el.tagName.toLowerCase();
  if (el.id) s += `#${el.id}`;
  const cls = Array.from(el.classList).slice(0, 2).join(".");
  if (cls) s += `.${cls}`;
  return s;
}

function HighlightBox({
  rect,
  variant,
  label,
  onWiden,
  onNarrow,
}: {
  rect: DOMRect;
  variant: "hover" | "selected";
  label: string;
  onWiden?: () => void;
  onNarrow?: () => void;
}) {
  const color = variant === "selected" ? "#3b82f6" : "#60a5fa";
  const bg = variant === "selected" ? "rgba(59,130,246,0.12)" : "rgba(96,165,250,0.10)";
  return (
    <div
      data-inspector-ui
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: `2px solid ${color}`,
        background: bg,
        pointerEvents: "none",
        zIndex: 9998,
        borderRadius: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -24,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div
          style={{
            background: color,
            color: "white",
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 3,
            whiteSpace: "nowrap",
            maxWidth: "50vw",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        {(onWiden || onNarrow) && (
          <div
            data-inspector-keep-hover
            style={{
              display: "flex",
              gap: 2,
              background: color,
              borderRadius: 3,
              padding: 2,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ChipBtn
              disabled={!onWiden}
              title="Select parent (−)"
              onClick={(e) => {
                e.stopPropagation();
                onWiden?.();
              }}
            >
              −
            </ChipBtn>
            <ChipBtn
              disabled={!onNarrow}
              title="Select child (+)"
              onClick={(e) => {
                e.stopPropagation();
                onNarrow?.();
              }}
            >
              +
            </ChipBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function ChipBtn({
  disabled,
  title,
  onClick,
  children,
}: {
  disabled?: boolean;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-inspector-keep-hover
      disabled={disabled}
      title={title}
      onClick={onClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        width: 18,
        height: 18,
        border: 0,
        borderRadius: 2,
        background: "rgba(255,255,255,0.18)",
        color: "white",
        fontSize: 13,
        lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontFamily: "system-ui, sans-serif",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
