"use client";

/**
 * WebShell — canvas + inspector wrapper for `app/web/<page>/`.
 *
 * Sibling of `PageShell` (iOS), but tuned for marketing/web pages:
 *   • Viewport switcher: Desktop (1440) · Laptop (1280) · iPhone (390)
 *   • Frame toggle: realistic browser/mobile chrome on, or bare rectangle off
 *   • No Screen / Scenario / Tweak panels — landing pages don't need fixtures
 *
 * Components used by these pages live colocated under `_components/` and
 * are intentionally NOT part of the design system in `components/`. The web
 * track is allowed to drift — different look, different primitives — while
 * still respecting design tokens (colors, typography). See CLAUDE.md
 * § "Web prototypes — `app/web/*`".
 */

import { useRef, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { InspectorPanel } from "@/components/frame/InspectorPanel";
import { setScaleAroundCenter, useCanvasZoom } from "@/components/frame/useCanvasZoom";
import { useInspectorPanel } from "@/components/frame/useInspectorPanel";
import { BrowserChrome } from "./BrowserChrome";
import { useWebViewport } from "./useWebViewport";
import { WebViewportSwitcher } from "./WebViewportSwitcher";

interface Props {
  children: React.ReactNode;
  /** Cosmetic URL shown in the chrome's address bar. */
  url?: string;
}

const CANVAS_SIZE = 8000;

const CANVAS_SCALE_KEY = "whitelabel.web.canvasScale";

export function WebShell({ children, url }: Props) {
  const {
    viewport,
    setViewport,
    frameOn,
    setFrameOn,
    customWidth,
    customHeight,
    setCustomSize,
    hydrated,
  } = useWebViewport();
  const panel = useInspectorPanel();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useCanvasZoom(transformRef, { minScale: 0.1, maxScale: 2 });
  const recenter = () => transformRef.current?.resetTransform();
  const [canvasScale, setCanvasScale] = useState(1);
  const setScale = (s: number) => setScaleAroundCenter(transformRef, s);

  if (!hydrated) {
    return <div className="h-screen bg-background" />;
  }

  const initialScale = readSavedScale(CANVAS_SCALE_KEY, 1);

  return (
    <>
      <div
        ref={canvasRef}
        className="fixed inset-0 left-[var(--sidenav-w,0px)] overflow-hidden bg-background"
        style={{ paddingRight: panel.visibleWidth }}
      >
        <TransformWrapper
          ref={transformRef}
          minScale={0.1}
          maxScale={2}
          initialScale={initialScale}
          initialPositionX={0}
          initialPositionY={0}
          limitToBounds={false}
          centerOnInit
          wheel={{ disabled: true }}
          doubleClick={{ mode: "reset" }}
          panning={{
            velocityDisabled: true,
            excluded: ["phone-scroll"],
          }}
          onTransform={(_, s) => {
            setCanvasScale(s.scale);
            saveScale(CANVAS_SCALE_KEY, s.scale);
          }}
          onInit={(ref) => setCanvasScale(ref.state.scale)}
        >
          {() => (
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
              }}
              wrapperClass="!cursor-grab active:!cursor-grabbing"
              contentClass="bg-dots flex items-center justify-center"
            >
              <BrowserChrome
                viewport={viewport}
                frameOn={frameOn}
                url={url}
                customWidth={customWidth}
                customHeight={customHeight}
                onCustomResize={setCustomSize}
                canvasScale={canvasScale}
              >
                {children}
              </BrowserChrome>
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      <InspectorPanel panel={panel}>
        <WebViewportSwitcher
          viewport={viewport}
          setViewport={setViewport}
          frameOn={frameOn}
          setFrameOn={setFrameOn}
          canvasScale={canvasScale}
          setCanvasScale={setScale}
          onRecenter={recenter}
        />
      </InspectorPanel>
    </>
  );
}

function readSavedScale(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

function saveScale(key: string, scale: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(scale));
  } catch {
    // ignore
  }
}
