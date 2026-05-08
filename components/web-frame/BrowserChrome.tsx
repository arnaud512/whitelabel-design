"use client";

import {
  CUSTOM_MAX_HEIGHT,
  CUSTOM_MAX_WIDTH,
  CUSTOM_MIN_HEIGHT,
  CUSTOM_MIN_WIDTH,
  WEB_VIEWPORTS,
  type WebViewportId,
} from "./viewports";

interface BrowserChromeProps {
  viewport: WebViewportId;
  frameOn: boolean;
  /** Address shown inside the URL bar — purely cosmetic. */
  url?: string;
  children: React.ReactNode;
  /**
   * For the "custom" (Free) viewport — current size and a setter wired
   * to the persisted state in `useWebViewport`. Drag handles read the
   * current canvas scale to translate screen pixels to chrome pixels.
   */
  customWidth?: number;
  customHeight?: number;
  onCustomResize?: (width: number, height: number) => void;
  canvasScale?: number;
}

/**
 * Web prototype frame. Mirrors the role of `PhoneFrame` for the iOS shell:
 * fixed CSS dimensions per viewport, content scrolls inside, optional
 * realistic device chrome.
 *
 * In the "custom" viewport, the chrome's right/bottom/corner edges become
 * drag handles so the user can freely resize the fake browser window.
 */
export function BrowserChrome({
  viewport,
  frameOn,
  url = "example.com",
  children,
  customWidth,
  customHeight,
  onCustomResize,
  canvasScale = 1,
}: BrowserChromeProps) {
  const spec = WEB_VIEWPORTS[viewport];
  const isMobile = spec.kind === "mobile-browser";
  const isCustom = viewport === "custom";
  const width = isCustom && customWidth ? customWidth : spec.width;
  const height = isCustom && customHeight ? customHeight : spec.height;
  const TITLE_BAR_H = 36;
  const STATUS_H = 54;
  const URL_BAR_H = 44;

  // Frame OFF — render at the page's natural full height (no fixed
  // viewport, no inner scroll). Mirrors `PhoneFrame`'s frame-off
  // behavior: the canvas pan/zoom is the only scrollable surface.
  if (!frameOn) {
    // In "Free" mode we still need a fixed height so the bottom-right
    // corner has a meaningful position to drag from. Other viewports
    // keep the natural-height behavior so the page is fully visible.
    const containerHeight = isCustom ? height : "auto";
    return (
      <div
        className="relative mx-auto !cursor-auto"
        style={{ width, height: containerHeight }}
      >
        <div
          className="@container overflow-hidden bg-background shadow-[0_40px_80px_-8px_rgba(0,0,0,0.22),0_16px_32px_-4px_rgba(0,0,0,0.16)]"
          style={{
            width,
            height: isCustom ? height : undefined,
            borderRadius: spec.cornerRadius,
          }}
        >
          {isCustom ? (
            <div className="phone-scroll @container h-full overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
        {isCustom && onCustomResize && (
          <ResizeHandles
            width={width}
            height={height}
            canvasScale={canvasScale}
            onResize={onCustomResize}
          />
        )}
        {isCustom && <SizeReadout width={width} height={height} />}
      </div>
    );
  }

  const chromeTop = isMobile ? STATUS_H + URL_BAR_H : TITLE_BAR_H;
  const outerHeight = isMobile ? height : height + TITLE_BAR_H;
  const ringClasses = isMobile ? "ring-2 ring-neutral-300" : "";

  return (
    <div
      className="relative mx-auto !cursor-auto"
      style={{ width, height: outerHeight }}
    >
      <div
        className={`relative overflow-hidden bg-background shadow-[0_56px_112px_-12px_rgba(0,0,0,0.32),0_20px_40px_-4px_rgba(0,0,0,0.22)] ${ringClasses}`}
        style={{
          width,
          height: outerHeight,
          borderRadius: spec.cornerRadius,
        }}
      >
        {!isMobile && <BrowserTitleBar height={TITLE_BAR_H} url={url} />}
        {isMobile && (
          <>
            <MobileStatusBar height={STATUS_H} />
            <MobileUrlBar top={STATUS_H} height={URL_BAR_H} url={url} />
          </>
        )}
        <div
          className="phone-scroll @container absolute inset-x-0 bottom-0 overflow-y-auto overflow-x-hidden bg-background"
          style={{ top: chromeTop }}
        >
          {children}
        </div>
        {isMobile && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
            <div className="h-[5px] w-[134px] rounded-full bg-neutral-900/80" />
          </div>
        )}
      </div>
      {isCustom && onCustomResize && (
        <ResizeHandles
          width={width}
          height={height}
          canvasScale={canvasScale}
          onResize={onCustomResize}
        />
      )}
      {isCustom && (
        <SizeReadout width={width} height={height} />
      )}
    </div>
  );
}

interface ResizeHandlesProps {
  width: number;
  height: number;
  canvasScale: number;
  onResize: (w: number, h: number) => void;
}

function ResizeHandles({ width, height, canvasScale, onResize }: ResizeHandlesProps) {
  function startDrag(
    e: React.PointerEvent<HTMLDivElement>,
    edge: "right" | "bottom" | "corner",
  ) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;
    const scale = canvasScale || 1;

    function move(ev: PointerEvent) {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      const nextW = edge === "bottom" ? startW : startW + dx;
      const nextH = edge === "right" ? startH : startH + dy;
      onResize(
        Math.max(CUSTOM_MIN_WIDTH, Math.min(CUSTOM_MAX_WIDTH, nextW)),
        Math.max(CUSTOM_MIN_HEIGHT, Math.min(CUSTOM_MAX_HEIGHT, nextH)),
      );
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
    }
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // Handles are sized in viewport-space (independent of canvas zoom)
  // by counter-scaling: 8px / canvasScale stays 8px on screen.
  const inv = 1 / (canvasScale || 1);
  const edge = `${8 * inv}px`;
  const corner = `${14 * inv}px`;

  return (
    <>
      {/* Right edge */}
      <div
        onPointerDown={(e) => startDrag(e, "right")}
        className="absolute top-0 right-0 z-50 h-full cursor-ew-resize hover:bg-primary/30"
        style={{ width: edge, transform: `translateX(${4 * inv}px)` }}
      />
      {/* Bottom edge */}
      <div
        onPointerDown={(e) => startDrag(e, "bottom")}
        className="absolute bottom-0 left-0 z-50 w-full cursor-ns-resize hover:bg-primary/30"
        style={{ height: edge, transform: `translateY(${4 * inv}px)` }}
      />
      {/* Corner */}
      <div
        onPointerDown={(e) => startDrag(e, "corner")}
        aria-label="Resize browser window"
        className="absolute bottom-0 right-0 z-50 cursor-nwse-resize bg-primary/70 hover:bg-primary"
        style={{
          width: corner,
          height: corner,
          transform: `translate(${4 * inv}px, ${4 * inv}px)`,
          borderRadius: `${3 * inv}px`,
        }}
      />
    </>
  );
}

function SizeReadout({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="pointer-events-none absolute -top-7 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-foreground px-xs py-[2px] text-body-label tabular-nums text-background opacity-90"
    >
      {Math.round(width)} × {Math.round(height)}
    </div>
  );
}

function BrowserTitleBar({ height, url }: { height: number; url: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-30 flex items-center gap-s border-b border-border bg-muted px-s"
      style={{ height }}
    >
      <div className="flex items-center gap-[6px]">
        <span className="block h-[12px] w-[12px] rounded-full bg-[#FF5F57]" />
        <span className="block h-[12px] w-[12px] rounded-full bg-[#FEBC2E]" />
        <span className="block h-[12px] w-[12px] rounded-full bg-[#28C840]" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex h-[22px] min-w-[200px] max-w-[420px] items-center gap-xxs rounded-sm bg-background px-s text-body-label text-muted-foreground">
          <LockIcon />
          <span className="truncate">{url}</span>
        </div>
      </div>
      <div className="w-[54px]" />
    </div>
  );
}

function MobileStatusBar({ height }: { height: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-background px-l text-foreground"
      style={{ height }}
    >
      <span className="text-body-regular font-semibold tabular-nums">9:41</span>
      <div className="absolute left-1/2 top-2.5 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="flex items-center gap-1 text-body-label">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function MobileUrlBar({ top, height, url }: { top: number; height: number; url: string }) {
  return (
    <div
      className="absolute inset-x-0 z-20 flex items-center justify-center border-b border-border bg-muted px-m"
      style={{ top, height }}
    >
      <div className="flex h-[28px] w-full items-center justify-center gap-xxs rounded-sm bg-background px-s text-body-label text-muted-foreground">
        <LockIcon />
        <span className="truncate">{url}</span>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M3 4V3a2 2 0 014 0v1h.5A.5.5 0 018 4.5v4a.5.5 0 01-.5.5h-5A.5.5 0 012 8.5v-4A.5.5 0 012.5 4H3zm1 0h2V3a1 1 0 10-2 0v1z" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
      <rect x="0" y="6" width="3" height="4" rx="0.5" />
      <rect x="4" y="4" width="3" height="6" rx="0.5" />
      <rect x="8" y="2" width="3" height="8" rx="0.5" />
      <rect x="12" y="0" width="3" height="10" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
      <path d="M7 9.5a1 1 0 100-2 1 1 0 000 2zM3 6.2a5.5 5.5 0 018 0l-1 1a4 4 0 00-6 0l-1-1zM0.5 3.7a9 9 0 0113 0l-1 1a7.5 7.5 0 00-11 0l-1-1z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
      <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
      <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
