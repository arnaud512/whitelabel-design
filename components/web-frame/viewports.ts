/**
 * Viewport sizes for the web prototype track (`app/web/*`).
 * Distinct from `frame/devices.ts`, which is iPhone-only and used by
 * the iOS prototype shell.
 */
export type WebViewportId = "wide" | "desktop" | "laptop" | "custom" | "mobile";

/** Default size when first switching into the freely-resizable viewport. */
export const CUSTOM_DEFAULT_WIDTH = 1024;
export const CUSTOM_DEFAULT_HEIGHT = 768;
export const CUSTOM_MIN_WIDTH = 320;
export const CUSTOM_MIN_HEIGHT = 320;
export const CUSTOM_MAX_WIDTH = 3840;
export const CUSTOM_MAX_HEIGHT = 2400;

export interface WebViewportSpec {
  id: WebViewportId;
  label: string;
  /** CSS pixels — what the rendered page sees as `100vw`. */
  width: number;
  /** CSS pixels — fixed viewport height; page content scrolls inside. */
  height: number;
  /** Corner radius for the bare (frame-off) preview rectangle. */
  cornerRadius: number;
  kind: "browser" | "mobile-browser";
}

export const WEB_VIEWPORTS: Record<WebViewportId, WebViewportSpec> = {
  wide: {
    id: "wide",
    label: "27″",
    width: 2560,
    height: 1440,
    cornerRadius: 12,
    kind: "browser",
  },
  desktop: {
    id: "desktop",
    label: "Desktop",
    width: 1440,
    height: 900,
    cornerRadius: 12,
    kind: "browser",
  },
  laptop: {
    id: "laptop",
    label: "13″",
    width: 1280,
    height: 800,
    cornerRadius: 12,
    kind: "browser",
  },
  custom: {
    id: "custom",
    label: "Free",
    width: CUSTOM_DEFAULT_WIDTH,
    height: CUSTOM_DEFAULT_HEIGHT,
    cornerRadius: 12,
    kind: "browser",
  },
  mobile: {
    id: "mobile",
    label: "iPhone",
    width: 390,
    height: 844,
    cornerRadius: 47,
    kind: "mobile-browser",
  },
};

export const DEFAULT_WEB_VIEWPORT: WebViewportId = "desktop";
