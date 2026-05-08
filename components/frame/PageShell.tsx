"use client";

/**
 * PageShell — Figma-style canvas for a route that contains one or more screens.
 *
 * A *Page* is what you visit (a route). A *Screen* is one phone-frame tile on
 * the canvas. Every screen is always rendered; one is *selected* at a time
 * (via `?selected=<key>`). The inspector binds to the selected screen — its
 * Scenario / Tweak / Compare panels read and write that screen's state. Each
 * screen owns its own scenarios + tweaks list (different screens can have
 * different fixtures, so the controls aren't shared).
 *
 * State per screen lives under URL-param namespaces:
 *
 *     ?selected=plan-settings
 *     &plan-settings:scenario=phase3
 *     &plan-settings:paused=1
 *     &plan:scenario=race-day
 *
 * Reads/writes route through `<ScreenProvider>` + `scopedParam`, so the
 * existing `Switcher` / `useTweakBool` etc. work unchanged inside this shell.
 *
 * Pages declare a flat `screens` array. Single-screen pages just pass a
 * 1-element array. There is no `Step` / `Prototype` axis anymore — both
 * concepts collapse into "screens of the page".
 */

import { Suspense, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { ComparePanel } from "./ComparePanel";
import { DeviceSwitcher } from "./DeviceSwitcher";
import { InspectorPanel } from "./InspectorPanel";
import { LiveTweaks, type TweakDef } from "./LiveTweaks";
import { PhoneFrame } from "./PhoneFrame";
import { ScreenProvider } from "./ScreenContext";
import { Switcher, useUrlAxis, type SwitcherOption } from "./Switcher";
import { setScaleAroundCenter, useCanvasZoom } from "./useCanvasZoom";
import { useCompareMap, type CompareState } from "./useCompare";
import { useDevicePreference } from "./useDevicePreference";
import { useInspectorPanel } from "./useInspectorPanel";

export interface ScreenDef {
  /** URL-safe identifier. Used as a prefix for that screen's URL params. */
  key: string;
  /** Display label rendered beneath the phone frame. */
  label: string;
  /** The screen content. Wrapped in `<ScreenProvider screenKey={key}>` automatically. */
  element: React.ReactNode;
  /** Scenario options exposed in the inspector when this screen is selected. */
  scenarios?: SwitcherOption[];
  /** Tweak knobs exposed in the inspector when this screen is selected. */
  tweaks?: TweakDef[];
  /**
   * Optional row grouping. Screens sharing a `row` value are laid out on the
   * same horizontal row; rows stack vertically in the order they first appear.
   * Undefined screens fall into a default row. Order within a row follows
   * declaration order.
   */
  row?: string | number;
  /** Optional display heading rendered above this screen's row. Only the
   *  first occurrence per row is rendered. */
  rowLabel?: string;
}

interface Props {
  screens: ScreenDef[];
  /** Page-level bottom bar (e.g. TabBar) rendered inside every phone frame. */
  bottomBar?: React.ReactNode;
}

const CANVAS_SIZE = 8000;

export function PageShell({ screens, bottomBar }: Props) {
  const { device, setDevice, frameOn, setFrameOn, hydrated } =
    useDevicePreference();
  const panel = useInspectorPanel();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useCanvasZoom(transformRef, { minScale: 0.15, maxScale: 4 });
  const recenter = () => {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("selected");
    const targetKey =
      selected && screens.find((s) => s.key === selected)?.key
        ? selected
        : null;
    if (targetKey) {
      transformRef.current?.zoomToElement(`screen-tile-${targetKey}`, 1, 300);
    } else {
      // Nothing selected — fit-to-view all screens.
      transformRef.current?.zoomToElement("screens-bbox", undefined, 300);
    }
  };
  const [canvasScale, setCanvasScale] = useState(0.85);
  const setScale = (s: number) => setScaleAroundCenter(transformRef, s);
  const compares = useCompareMap(screens.map((s) => s.key));

  if (!hydrated) {
    return <div className="h-screen bg-background" />;
  }

  const initialScale = readSavedScale("whitelabel.ios.canvasScale", 0.85);

  return (
    <>
      <div
        ref={canvasRef}
        className="fixed inset-0 left-[var(--sidenav-w,0px)] overflow-hidden bg-background"
        style={{ paddingRight: panel.visibleWidth }}
      >
        <TransformWrapper
          ref={transformRef}
          minScale={0.15}
          maxScale={4}
          initialScale={initialScale}
          initialPositionX={0}
          initialPositionY={0}
          limitToBounds={false}
          centerOnInit
          wheel={{ disabled: true }}
          doubleClick={{ mode: "reset" }}
          panning={{
            velocityDisabled: true,
            // Only the compare slider owns its own pointer drag. Phone scroll
            // uses wheel events (not pointer drag), so panning the canvas from
            // inside a phone doesn't conflict with scrolling it. Click-to-select
            // still works because the library only starts a pan past a movement
            // threshold, so a stationary click still fires onClick.
            excluded: ["compare-slider"],
          }}
          onTransform={(_, s) => {
            setCanvasScale(s.scale);
            saveScale("whitelabel.ios.canvasScale", s.scale);
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
              contentClass="bg-dots"
            >
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <ScreenRow
                      screens={screens}
                      selectedKey={null}
                      onSelect={() => undefined}
                      device={device}
                      frameOn={frameOn}
                      bottomBar={bottomBar}
                      compares={compares}
                    />
                  </div>
                }
              >
                <SelectionAwareScreenRow
                  screens={screens}
                  device={device}
                  frameOn={frameOn}
                  bottomBar={bottomBar}
                  compares={compares}
                />
              </Suspense>
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      <InspectorPanel panel={panel}>
        <DeviceSwitcher
          device={device}
          setDevice={setDevice}
          frameOn={frameOn}
          setFrameOn={setFrameOn}
          canvasScale={canvasScale}
          setCanvasScale={setScale}
          onRecenter={recenter}
        />
        <Suspense fallback={null}>
          <SelectedScreenInspector screens={screens} compares={compares} />
        </Suspense>
      </InspectorPanel>
    </>
  );
}

function SelectionAwareScreenRow(
  props: Omit<RowProps, "selectedKey" | "onSelect">,
) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = params.get("selected");
  const selectedKey =
    (fromUrl && props.screens.find((s) => s.key === fromUrl)?.key) ?? null;

  function onSelect(key: string) {
    const next = new URLSearchParams(params.toString());
    next.set("selected", key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onDeselect() {
    const next = new URLSearchParams(params.toString());
    next.delete("selected");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Wrapping div fills the 8000×8000 canvas tile so clicks anywhere outside
  // a phone (`screen-tile` blocks bubbling) land here and deselect.
  return (
    <div
      onClick={onDeselect}
      className="flex h-full w-full items-center justify-center"
    >
      <ScreenRow {...props} selectedKey={selectedKey} onSelect={onSelect} />
    </div>
  );
}

interface RowProps {
  screens: ScreenDef[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  device: ReturnType<typeof useDevicePreference>["device"];
  frameOn: boolean;
  bottomBar?: React.ReactNode;
  compares: Record<string, CompareState>;
}

function ScreenRow({
  screens,
  selectedKey,
  onSelect,
  device,
  frameOn,
  bottomBar,
  compares,
}: RowProps) {
  const rows = groupByRow(screens);
  return (
    <div id="screens-bbox" className="flex flex-col items-start gap-[160px]">
      {rows.map(({ key, label, items }) => (
        <div key={key} className="flex flex-col items-start gap-l">
          {label && (
            <span className="font-display text-h2 text-foreground">
              {label}
            </span>
          )}
          <div className="flex items-start gap-[80px]">
            {items.map((s) => {
              const isSelected = s.key === selectedKey;
              const compare = compares[s.key];
              return (
                <div
                  key={s.key}
                  id={`screen-tile-${s.key}`}
                  // `screen-tile` is in the canvas's `excluded` list so clicks
                  // here register as clicks (selection) rather than starting a
                  // pan. stopPropagation prevents the parent canvas onClick
                  // (which deselects) from firing when clicking inside a phone.
                  className={cn(
                    "screen-tile flex flex-col items-center gap-m",
                    isSelected ? "cursor-default" : "cursor-pointer",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) onSelect(s.key);
                  }}
                >
                  <PhoneFrame
                    device={device}
                    frameOn={frameOn}
                    bottomBar={bottomBar}
                    selected={isSelected}
                    compareImage={compare?.imageUrl}
                    compareMode={compare?.mode}
                    compareOpacity={compare?.opacity}
                    compareSplit={compare?.split}
                    onCompareSplitChange={compare?.setSplit}
                    compareInverted={compare?.inverted}
                  >
                    <ScreenProvider screenKey={s.key}>{s.element}</ScreenProvider>
                  </PhoneFrame>
                  <span className="font-display text-h3 text-foreground">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GroupedRow {
  key: string;
  label?: string;
  items: ScreenDef[];
}

/** Groups screens by their `row` field, preserving the order rows first appear
 *  in the screens array. Screens without a `row` fall into a default group. */
function groupByRow(screens: ScreenDef[]): GroupedRow[] {
  const map = new Map<string, GroupedRow>();
  for (const s of screens) {
    const k = s.row != null ? String(s.row) : "__default__";
    let row = map.get(k);
    if (!row) {
      row = { key: k, label: s.rowLabel, items: [] };
      map.set(k, row);
    } else if (!row.label && s.rowLabel) {
      row.label = s.rowLabel;
    }
    row.items.push(s);
  }
  return Array.from(map.values());
}

function SelectedScreenInspector({
  screens,
  compares,
}: {
  screens: ScreenDef[];
  compares: Record<string, CompareState>;
}) {
  const fromUrl = useUrlAxis("selected", { unscoped: true });
  const selected = screens.find((s) => s.key === fromUrl) ?? null;
  const compare = selected ? compares[selected.key] : undefined;

  return (
    <>
      <ScreenList screens={screens} selectedKey={selected?.key ?? null} />
      {selected ? (
        <ScreenProvider screenKey={selected.key}>
          {selected.scenarios && selected.scenarios.length > 0 && (
            <Switcher
              title="Scenario"
              paramName="scenario"
              options={selected.scenarios}
            />
          )}
          {selected.tweaks && selected.tweaks.length > 0 && (
            <LiveTweaks tweaks={selected.tweaks} />
          )}
          {compare && <ComparePanel compare={compare} />}
        </ScreenProvider>
      ) : (
        <div className="px-s py-l text-body-label text-muted-foreground">
          Click a screen on the canvas (or in the list above) to edit it.
        </div>
      )}
    </>
  );
}

/** Inspector list of every screen on the page. The currently selected screen
 *  is highlighted; clicking another row writes `?selected=<key>` and focuses
 *  the matching phone on the canvas. Mirrors the `Switcher` panel styling. */
function ScreenList({
  screens,
  selectedKey,
}: {
  screens: ScreenDef[];
  selectedKey: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setSelected(key: string) {
    const next = new URLSearchParams(params.toString());
    next.set("selected", key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center bg-muted/40 px-s py-xs">
        <span className="text-body-label-caps uppercase tracking-wide text-muted-foreground">
          Screens
        </span>
      </div>
      <div className="flex flex-col gap-xxs p-s">
        {screens.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelected(s.key)}
            className={cn(
              "flex items-center gap-xs rounded-sm px-s py-xxs text-left text-body-label font-medium transition-colors",
              s.key === selectedKey
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="flex-1 truncate">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
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
