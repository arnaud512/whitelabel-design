"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CollapseHeader } from "./LiveTweaks";
import { DEVICES, type DeviceId } from "./devices";

interface DeviceSwitcherProps {
  device: DeviceId;
  setDevice: (d: DeviceId) => void;
  frameOn: boolean;
  setFrameOn: (v: boolean) => void;
  /** Live canvas scale (1 = 100%). */
  canvasScale: number;
  /** Set canvas scale to an absolute value, anchored on viewport center. */
  setCanvasScale: (s: number) => void;
  /** Recenter / fit (resetTransform). */
  onRecenter?: () => void;
}

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

function TargetIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="7" cy="7" r="5.5" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
      <line x1="7" y1="0.5" x2="7" y2="2.5" />
      <line x1="7" y1="11.5" x2="7" y2="13.5" />
      <line x1="0.5" y1="7" x2="2.5" y2="7" />
      <line x1="11.5" y1="7" x2="13.5" y2="7" />
    </svg>
  );
}

export function DeviceSwitcher({
  device,
  setDevice,
  frameOn,
  setFrameOn,
  canvasScale,
  setCanvasScale,
  onRecenter,
}: DeviceSwitcherProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pct = Math.round(canvasScale * 100);

  return (
    <div className="flex w-full flex-col">
      <CollapseHeader
        title="Device"
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        trailingWhenCollapsed={
          <span className="truncate text-body-label tabular-nums text-foreground">
            {DEVICES[device].label} · {pct}%
          </span>
        }
      />
      {!collapsed && (
        <div className="flex flex-col gap-xs p-s">
          <div className="flex items-center gap-xxs">
            {(Object.keys(DEVICES) as DeviceId[]).map((id) => (
              <button
                key={id}
                onClick={() => setDevice(id)}
                className={cn(
                  "rounded-sm px-s py-xxs text-body-label font-medium transition-colors",
                  device === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {DEVICES[id].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-xxs">
            <button
              onClick={() => setFrameOn(!frameOn)}
              aria-pressed={frameOn}
              className={cn(
                "rounded-sm px-s py-xxs text-body-label font-medium transition-colors",
                frameOn
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Phone frame
            </button>
          </div>
          <ZoomRow
            scale={canvasScale}
            setScale={setCanvasScale}
            onRecenter={onRecenter}
          />
        </div>
      )}
    </div>
  );
}

function ZoomRow({
  scale,
  setScale,
  onRecenter,
}: {
  scale: number;
  setScale: (s: number) => void;
  onRecenter?: () => void;
}) {
  const pct = Math.round(scale * 100);
  return (
    <div className="flex flex-col gap-xxs border-t border-border pt-xs">
      <div className="flex items-center justify-end gap-xxs">
        <span className="mr-auto text-body-regular font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
        <button
          onClick={() => setScale(1)}
          className="rounded-sm px-xs py-xxs text-body-label font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          100%
        </button>
        {onRecenter && (
          <button
            onClick={onRecenter}
            aria-label="Focus selected screen"
            title="Focus selected screen"
            className="rounded-sm p-xxs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <TargetIcon />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-xxs">
        {ZOOM_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setScale(p)}
            className={cn(
              "rounded-sm px-xs py-xxs text-body-label font-medium tabular-nums transition-colors",
              Math.abs(scale - p) < 0.005
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {Math.round(p * 100)}%
          </button>
        ))}
      </div>
    </div>
  );
}
