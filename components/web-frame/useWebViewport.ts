"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_DEFAULT_HEIGHT,
  CUSTOM_DEFAULT_WIDTH,
  CUSTOM_MAX_HEIGHT,
  CUSTOM_MAX_WIDTH,
  CUSTOM_MIN_HEIGHT,
  CUSTOM_MIN_WIDTH,
  DEFAULT_WEB_VIEWPORT,
  WEB_VIEWPORTS,
  type WebViewportId,
} from "./viewports";

const VIEWPORT_KEY = "whitelabel.web.viewport";
const FRAME_KEY = "whitelabel.web.frameOn";
const CUSTOM_W_KEY = "whitelabel.web.customWidth";
const CUSTOM_H_KEY = "whitelabel.web.customHeight";

export function useWebViewport() {
  const [viewport, setViewportState] = useState<WebViewportId>(DEFAULT_WEB_VIEWPORT);
  const [frameOn, setFrameOnState] = useState<boolean>(true);
  const [customWidth, setCustomWidthState] = useState<number>(CUSTOM_DEFAULT_WIDTH);
  const [customHeight, setCustomHeightState] = useState<number>(CUSTOM_DEFAULT_HEIGHT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEWPORT_KEY) as WebViewportId | null;
      const f = localStorage.getItem(FRAME_KEY);
      const cw = Number(localStorage.getItem(CUSTOM_W_KEY));
      const ch = Number(localStorage.getItem(CUSTOM_H_KEY));
      if (v && v in WEB_VIEWPORTS) setViewportState(v);
      if (f !== null) setFrameOnState(f === "1");
      if (Number.isFinite(cw) && cw >= CUSTOM_MIN_WIDTH) setCustomWidthState(cw);
      if (Number.isFinite(ch) && ch >= CUSTOM_MIN_HEIGHT) setCustomHeightState(ch);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function setViewport(v: WebViewportId) {
    setViewportState(v);
    try {
      localStorage.setItem(VIEWPORT_KEY, v);
    } catch {
      // ignore
    }
  }

  function setFrameOn(v: boolean) {
    setFrameOnState(v);
    try {
      localStorage.setItem(FRAME_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
  }

  function setCustomSize(width: number, height: number) {
    const w = Math.max(CUSTOM_MIN_WIDTH, Math.min(CUSTOM_MAX_WIDTH, Math.round(width)));
    const h = Math.max(CUSTOM_MIN_HEIGHT, Math.min(CUSTOM_MAX_HEIGHT, Math.round(height)));
    setCustomWidthState(w);
    setCustomHeightState(h);
    try {
      localStorage.setItem(CUSTOM_W_KEY, String(w));
      localStorage.setItem(CUSTOM_H_KEY, String(h));
    } catch {
      // ignore
    }
  }

  return {
    viewport,
    setViewport,
    frameOn,
    setFrameOn,
    customWidth,
    customHeight,
    setCustomSize,
    hydrated,
  };
}
