"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface Options {
  minScale?: number;
  maxScale?: number;
}

type GestureMode = "idle" | "scroll-inside" | "pan-canvas";

// Trackpad gestures arrive as a stream of wheel events. We treat events
// within this window as part of the same gesture; a longer pause resets it.
const GESTURE_IDLE_MS = 150;

/**
 * Figma-style trackpad/wheel handling for the canvas:
 *
 *   • ctrl/⌘ + wheel       → zoom toward cursor
 *   • trackpad pinch       → zoom toward cursor (macOS sends this as
 *                            `wheel` with `ctrlKey: true`)
 *   • plain wheel / 2-finger swipe → pan
 *
 * Over a phone scroll surface the behavior is gesture-locked: the first
 * event of a gesture decides whether the surface absorbs it (native
 * scroll, e.g. vertical inside `.phone-scroll`) or the canvas pans
 * (e.g. horizontal, which the surface can't scroll). Once a gesture
 * commits to canvas-pan, the remaining events in the gesture pan in
 * both axes — so a horizontal kick-off followed by vertical motion
 * keeps panning the canvas instead of jumping to the inner scroll.
 *
 * react-zoom-pan-pinch's built-in `activationKeys: ["Control"]` only
 * fires on real keydown/keyup, so it ignores the synthetic ctrlKey on
 * pinch events — meaning trackpad pinch zoomed the *browser*, not the
 * canvas. This hook bypasses the library's wheel logic entirely (the
 * caller should set `wheel={{ disabled: true }}`) and drives the
 * transform imperatively via the wrapper's ref.
 *
 * Returned value is a callback ref — pass it to the canvas div.
 */
export function useCanvasZoom(
  transformRef: RefObject<ReactZoomPanPinchRef | null>,
  { minScale = 0.15, maxScale = 4 }: Options = {},
) {
  const elRef = useRef<HTMLElement | null>(null);
  const handlerRef = useRef<((e: WheelEvent) => void) | null>(null);
  const gestureRef = useRef<{ mode: GestureMode; lastAt: number }>({
    mode: "idle",
    lastAt: 0,
  });

  return useCallback(
    (el: HTMLElement | null) => {
      if (elRef.current && handlerRef.current) {
        elRef.current.removeEventListener("wheel", handlerRef.current);
      }
      elRef.current = el;
      if (!el) return;

      const panCanvas = (e: WheelEvent) => {
        const wrapper = transformRef.current;
        if (!wrapper) return;
        const { positionX, positionY, scale } = wrapper.state;
        wrapper.setTransform(
          positionX - e.deltaX,
          positionY - e.deltaY,
          scale,
          0,
        );
      };

      const onWheel = (e: WheelEvent) => {
        const wrapper = transformRef.current;
        if (!wrapper) return;

        const isZoom = e.ctrlKey || e.metaKey;
        const now = e.timeStamp || performance.now();
        const gesture = gestureRef.current;
        if (now - gesture.lastAt > GESTURE_IDLE_MS) gesture.mode = "idle";
        gesture.lastAt = now;

        if (isZoom) {
          e.preventDefault();
          // Zoom toward cursor: keep the canvas point under the cursor
          // fixed in viewport space as scale changes.
          const { positionX, positionY, scale } = wrapper.state;
          const factor = Math.exp(-e.deltaY * 0.01);
          const next = clamp(scale * factor, minScale, maxScale);
          if (next === scale) return;
          const rect = el.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const ratio = next / scale;
          const nx = cx - (cx - positionX) * ratio;
          const ny = cy - (cy - positionY) * ratio;
          wrapper.setTransform(nx, ny, next, 0);
          return;
        }

        // Already locked to canvas pan for this gesture → pan in both axes.
        if (gesture.mode === "pan-canvas") {
          e.preventDefault();
          panCanvas(e);
          return;
        }

        const scrollEl =
          e.target instanceof Element
            ? (e.target.closest(
                ".phone-scroll, .compare-slider",
              ) as HTMLElement | null)
            : null;

        // No scroll surface under cursor → pan canvas (and lock for the
        // rest of the gesture).
        if (!scrollEl) {
          e.preventDefault();
          gesture.mode = "pan-canvas";
          panCanvas(e);
          return;
        }

        // Which axes can the surface itself absorb? Based on overflow,
        // not current scroll position — we don't want overscroll at the
        // top/bottom to suddenly start panning the canvas mid-scroll.
        const canScrollY = scrollEl.scrollHeight > scrollEl.clientHeight;
        const canScrollX = scrollEl.scrollWidth > scrollEl.clientWidth;
        const dominantY = Math.abs(e.deltaY) >= Math.abs(e.deltaX);

        // Dominant axis is one the surface can absorb → let it scroll
        // natively. Stay in scroll-inside mode; a later horizontal-
        // dominant event in the same gesture can still flip us to
        // pan-canvas.
        if ((dominantY && canScrollY) || (!dominantY && canScrollX)) {
          gesture.mode = "scroll-inside";
          return;
        }

        // Dominant axis can't be absorbed → commit to canvas pan for the
        // rest of the gesture.
        e.preventDefault();
        gesture.mode = "pan-canvas";
        panCanvas(e);
      };
      handlerRef.current = onWheel;
      el.addEventListener("wheel", onWheel, { passive: false });
    },
    [transformRef, minScale, maxScale],
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Set canvas scale while anchoring the visible viewport's center — i.e.
 * the point currently in the middle of the canvas viewport stays in the
 * middle after the zoom. Use this for preset-button zooms; without it,
 * `setTransform(x, y, scale)` shrinks toward (0,0) of the canvas content
 * and the framed page slides off-screen.
 */
export function setScaleAroundCenter(
  transformRef: RefObject<ReactZoomPanPinchRef | null>,
  next: number,
) {
  const w = transformRef.current;
  if (!w) return;
  const wrapper = w.instance.wrapperComponent;
  const { positionX, positionY, scale } = w.state;
  if (!wrapper || next === scale) {
    w.setTransform(positionX, positionY, next, 0);
    return;
  }
  const rect = wrapper.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const ratio = next / scale;
  const nx = cx - (cx - positionX) * ratio;
  const ny = cy - (cy - positionY) * ratio;
  w.setTransform(nx, ny, next, 0);
}
