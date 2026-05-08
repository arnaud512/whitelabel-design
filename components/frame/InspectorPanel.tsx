"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  INSPECTOR_COLLAPSED_WIDTH,
  type useInspectorPanel,
} from "./useInspectorPanel";

/**
 * Figma-style right inspector panel. Hosts the device toolbar, scenario/step
 * switchers, tweaks, and compare controls in a single resizable column docked
 * to the viewport's right edge. Two affordances:
 *
 *   • Collapse/expand button (top header) — toggles a persistent flag
 *   • Drag handle on the left edge — width clamped to sane min/max
 *
 * The handle drives the same `setWidth` that `useInspectorPanel` persists,
 * so a drag is restored on next reload.
 */
interface Props {
  panel: ReturnType<typeof useInspectorPanel>;
  children: React.ReactNode;
}

export function InspectorPanel({ panel, children }: Props) {
  const { width, setWidth, collapsed, setCollapsed } = panel;
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      // Resizing from the LEFT edge of a right-docked panel: panel width is
      // the distance from cursor to viewport's right edge.
      setWidth(window.innerWidth - e.clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging, setWidth]);

  const renderedWidth = collapsed ? INSPECTOR_COLLAPSED_WIDTH : width;

  return (
    <aside
      className="pointer-events-auto fixed right-0 top-0 bottom-0 z-40 flex flex-col border-l border-border bg-card shadow-[-2px_0_8px_rgba(0,0,0,0.04)]"
      style={{ width: renderedWidth }}
    >
      {/* Drag handle — only when expanded */}
      {!collapsed && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          aria-label="Resize inspector panel"
          role="separator"
          className={cn(
            "absolute left-0 top-0 bottom-0 z-10 w-1 cursor-col-resize transition-colors hover:bg-primary/40",
            dragging && "bg-primary/40",
          )}
        />
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-xs py-xxs">
        {!collapsed && (
          <span className="px-xxs text-body-label-caps uppercase tracking-wide text-muted-foreground">
            Inspector
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand inspector" : "Collapse inspector"}
          aria-expanded={!collapsed}
          className={cn(
            "ml-auto flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          )}
        >
          <svg
            viewBox="0 0 16 16"
            className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 3 11 8 6 13" />
          </svg>
        </button>
      </div>

      {/* Body — scrollable column of flat sections divided by hairline rules. */}
      {!collapsed && (
        <div className="flex flex-1 flex-col divide-y divide-border overflow-y-auto">
          {children}
        </div>
      )}
    </aside>
  );
}
