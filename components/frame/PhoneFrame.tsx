"use client";

import { cn } from "@/lib/utils";
import { DEVICES, type DeviceId } from "./devices";

interface PhoneFrameProps {
  device: DeviceId;
  frameOn: boolean;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  /** When true, tint the bezel from neutral gray to brand-mediumBlue so the
   *  phone reads as the focused screen on a multi-screen canvas. */
  selected?: boolean;
  /** Optional reference screenshot overlay — for visual diffing. */
  compareImage?: string | null;
  compareMode?: "overlay" | "split";
  /** 0..1 — opacity of the screenshot in `overlay` mode. */
  compareOpacity?: number;
  /** 0..1 — x position of the divider in `split` mode. */
  compareSplit?: number;
  onCompareSplitChange?: (n: number) => void;
  /** When true, the screenshot is shown on the right of the divider in split mode. */
  compareInverted?: boolean;
}

export function PhoneFrame({
  device,
  frameOn,
  children,
  bottomBar,
  selected = false,
  compareImage,
  compareMode = "overlay",
  compareOpacity = 0.5,
  compareSplit = 0.5,
  onCompareSplitChange,
  compareInverted = false,
}: PhoneFrameProps) {
  const spec = DEVICES[device];
  // Figma's selection blue (#0D99FF) — matches the canvas's "this frame is
  // focused" cue. Inspector chrome, not part of the design token system.
  const ringClass = selected
    ? "ring-2 ring-[#0D99FF]"
    : "ring-2 ring-neutral-300";

  if (!frameOn) {
    return (
      <div
        className="relative mx-auto !cursor-auto"
        style={{ width: spec.width, height: "auto" }}
      >
        <div
          className={cn(
            "bg-background shadow-[0_32px_80px_-16px_rgba(0,0,0,0.20),0_12px_24px_-4px_rgba(0,0,0,0.14)]",
            selected && "ring-2 ring-[#0D99FF]",
          )}
          style={{ width: spec.width, borderRadius: 16 }}
        >
          {children}
          {bottomBar && <div className="pb-l pt-s">{bottomBar}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto !cursor-auto"
      style={{ width: spec.width, height: spec.height }}
    >
    <div
      className={cn(
        "relative overflow-hidden bg-background shadow-[0_36px_80px_-16px_rgba(0,0,0,0.26),0_14px_28px_-4px_rgba(0,0,0,0.18)]",
        ringClass,
      )}
      style={{
        width: spec.width,
        height: spec.height,
        borderRadius: spec.cornerRadius,
      }}
    >
      <StatusBar device={device} />
      <div
        className="phone-scroll absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{
          paddingTop: spec.hasDynamicIsland ? 54 : 24,
          paddingBottom: bottomBar ? 88 : 0,
        }}
      >
        {children}
      </div>
      {bottomBar && (
        <div
          className="absolute inset-x-0 z-30"
          style={{ bottom: spec.hasDynamicIsland ? 18 : 8 }}
        >
          {bottomBar}
        </div>
      )}
      <HomeIndicator device={device} />
      {compareImage && (
        <CompareLayer
          src={compareImage}
          mode={compareMode}
          opacity={compareOpacity}
          split={compareSplit}
          onSplitChange={onCompareSplitChange}
          inverted={compareInverted}
        />
      )}
    </div>
    </div>
  );
}

function CompareLayer({
  src,
  mode,
  opacity,
  split,
  onSplitChange,
  inverted,
}: {
  src: string;
  mode: "overlay" | "split";
  opacity: number;
  split: number;
  onSplitChange?: (n: number) => void;
  inverted: boolean;
}) {
  // Drag handler for the split divider
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (mode !== "split" || !onSplitChange) return;
    const target = e.currentTarget.parentElement as HTMLElement | null;
    if (!target) return;
    target.setPointerCapture?.(e.pointerId);
    const rect = target.getBoundingClientRect();

    function update(clientX: number) {
      const x = (clientX - rect.left) / rect.width;
      onSplitChange?.(Math.max(0, Math.min(1, x)));
    }
    update(e.clientX);

    function move(ev: PointerEvent) {
      update(ev.clientX);
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // Image fills the phone screen so a properly cropped iOS screenshot
  // lines up. `object-contain` keeps aspect — bars on the side if the
  // screenshot is taller than the device viewport.
  const imgClass = "absolute inset-0 h-full w-full object-cover pointer-events-none";

  if (mode === "overlay") {
    return (
      <img
        src={src}
        alt="Reference screenshot"
        className={imgClass}
        style={{ opacity, zIndex: 40 }}
      />
    );
  }

  // split mode — by default the image fills LEFT of the divider; when
  // `inverted`, it fills the RIGHT side instead (prototype on the left).
  const clipPath = inverted
    ? `inset(0 0 0 ${split * 100}%)`
    : `inset(0 ${(1 - split) * 100}% 0 0)`;
  return (
    <>
      <img
        src={src}
        alt="Reference screenshot"
        className={imgClass}
        style={{
          clipPath,
          zIndex: 40,
        }}
      />
      {/* Divider */}
      <div
        className="compare-slider absolute top-0 z-50 h-full w-[2px] bg-brand-mediumBlue"
        style={{ left: `calc(${split * 100}% - 1px)` }}
      />
      {/* Drag handle */}
      <div
        role="slider"
        aria-label="Compare split"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split * 100)}
        onPointerDown={onPointerDown}
        className="compare-slider absolute top-1/2 z-50 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-brand-mediumBlue bg-card text-brand-mediumBlue shadow-md"
        style={{ left: `${split * 100}%` }}
      >
        <span className="text-body-label">⇆</span>
      </div>
    </>
  );
}

function StatusBar({ device }: { device: DeviceId }) {
  const spec = DEVICES[device];
  return (
    <div
      data-phone-status-bar
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-background px-l text-foreground"
      style={{ height: spec.hasDynamicIsland ? 54 : 24 }}
    >
      <span className="text-body-regular font-semibold tabular-nums">9:41</span>
      {spec.hasDynamicIsland && (
        <div className="absolute left-1/2 top-2.5 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-neutral-900" />
      )}
      <div className="flex items-center gap-1 text-body-label">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function HomeIndicator({ device }: { device: DeviceId }) {
  const spec = DEVICES[device];
  if (!spec.hasDynamicIsland) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
      <div className="h-[5px] w-[134px] rounded-full bg-neutral-900/80" />
    </div>
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

export { cn };
