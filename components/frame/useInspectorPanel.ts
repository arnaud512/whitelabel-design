"use client";

import { useEffect, useState } from "react";

/**
 * Persistent state for the Figma-style right inspector panel: its expanded
 * width and collapsed flag. Stored in localStorage so the layout survives
 * across reloads. Width is clamped to a sane range so resize-drags can't
 * leave the panel unusable.
 */
const KEY_WIDTH = "whitelabel-inspector-width";
const KEY_COLLAPSED = "whitelabel-inspector-collapsed";

export const INSPECTOR_DEFAULT_WIDTH = 320;
export const INSPECTOR_MIN_WIDTH = 280;
export const INSPECTOR_MAX_WIDTH = 520;
/** Width when collapsed — narrow strip that still holds the expand button. */
export const INSPECTOR_COLLAPSED_WIDTH = 36;

export function useInspectorPanel() {
  const [width, setWidthState] = useState(INSPECTOR_DEFAULT_WIDTH);
  const [collapsed, setCollapsedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawW = Number(localStorage.getItem(KEY_WIDTH));
    if (
      Number.isFinite(rawW) &&
      rawW >= INSPECTOR_MIN_WIDTH &&
      rawW <= INSPECTOR_MAX_WIDTH
    ) {
      setWidthState(rawW);
    }
    setCollapsedState(localStorage.getItem(KEY_COLLAPSED) === "1");
    setHydrated(true);
  }, []);

  const setWidth = (w: number) => {
    const clamped = Math.max(INSPECTOR_MIN_WIDTH, Math.min(INSPECTOR_MAX_WIDTH, w));
    setWidthState(clamped);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY_WIDTH, String(Math.round(clamped)));
    }
  };

  const setCollapsed = (c: boolean) => {
    setCollapsedState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY_COLLAPSED, c ? "1" : "0");
    }
  };

  /** Visible width — accounts for collapsed mode. Use for layout offsets. */
  const visibleWidth = collapsed ? INSPECTOR_COLLAPSED_WIDTH : width;

  return { width, setWidth, collapsed, setCollapsed, hydrated, visibleWidth };
}
