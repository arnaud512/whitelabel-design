"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { scopedParam, useScreenKey } from "./ScreenContext";

// ============================================================================
// Tweak definitions — what each reference screen declares to expose live knobs
// ============================================================================

/**
 * One live knob on a screen's Tweaks panel. Each tweak controls one dimension
 * (a day, a flag, a tri-state) and composes freely with the screen's Scenario.
 * Each rendered screen owns its own tweaks list — declared on its `ScreenDef`.
 *
 * Wiring:
 *   1. The page declares per-screen `tweaks` arrays on each `ScreenDef`.
 *   2. The screen component reads values via `useTweakNumber` / `useTweakBool`
 *      / `useTweakEnum`. Reads/writes go through the enclosing `ScreenContext`,
 *      so each rendered phone resolves to its own URL namespace.
 *   3. The screen translates those values into a state mutation through a
 *      *local* `applyTweaks(state, …)` — kept per-screen because the same
 *      knob name can mean different things on different screens.
 *
 * See `CLAUDE.md` § "Page / Screen model".
 */
export type TweakDef = SliderTweakDef | ToggleTweakDef | TriToggleTweakDef;

interface TweakDefBase {
  id: string;
  label: string;
}

export interface SliderTweakDef extends TweakDefBase {
  kind: "slider";
  min: number;
  max: number;
  defaultValue?: number;
  format?: (v: number) => string;
}

export interface ToggleTweakDef extends TweakDefBase {
  kind: "toggle";
}

export interface TriToggleTweakDef extends TweakDefBase {
  kind: "tri";
  options: { value: string | null; label: string }[];
  /** "horizontal" (default) lays options in a row; "vertical" stacks them. */
  layout?: "horizontal" | "vertical";
}

// ============================================================================
// Hooks — screens read live values through these. They subscribe to URL params,
// so any change to the panel re-renders the screen.
//
// One hook per primitive type. The `id` argument MUST match the `id` field of
// the corresponding `TweakDef`. Default values are returned when the param is
// absent; the panel deletes the param when the user resets to default, so the
// URL stays clean.
// ============================================================================

function useSetParam() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const screenKey = useScreenKey();
  return (id: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    const scoped = scopedParam(screenKey, id);
    if (value === null) next.delete(scoped);
    else next.set(scoped, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

/** Read the value of a `slider` tweak. Returns `defaultValue` when unset. */
export function useTweakNumber(id: string, defaultValue = 0): number {
  const params = useSearchParams();
  const screenKey = useScreenKey();
  const raw = params.get(scopedParam(screenKey, id));
  return raw === null ? defaultValue : Number(raw);
}

/** Read the value of a `toggle` tweak. `true` only when the param is `"1"`. */
export function useTweakBool(id: string): boolean {
  const params = useSearchParams();
  const screenKey = useScreenKey();
  return params.get(scopedParam(screenKey, id)) === "1";
}

/**
 * Read the value of a `tri` tweak. Returns `null` when no override is active
 * (the "From state" position), otherwise the raw param value cast to T.
 */
export function useTweakEnum<T extends string>(id: string): T | null {
  const params = useSearchParams();
  const screenKey = useScreenKey();
  return (params.get(scopedParam(screenKey, id)) as T | null) ?? null;
}

// ============================================================================
// Panel — generic over TweakDef[]
// ============================================================================

interface Props {
  tweaks: TweakDef[];
}

export function LiveTweaks({ tweaks }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const screenKey = useScreenKey();
  const [collapsed, setCollapsed] = useState(false);

  const hasOverrides = tweaks.some(
    (t) => params.get(scopedParam(screenKey, t.id)) !== null,
  );

  function reset() {
    const next = new URLSearchParams(params.toString());
    tweaks.forEach((t) => next.delete(scopedParam(screenKey, t.id)));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  if (tweaks.length === 0) return null;

  return (
    <div className="flex w-full flex-col">
      <CollapseHeader
        title="Tweaks"
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      >
        {!collapsed && hasOverrides && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="rounded-sm px-xs py-xxs text-body-label font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Reset
          </button>
        )}
      </CollapseHeader>

      {!collapsed && (
        <div className="flex flex-col gap-xs p-s">
          {tweaks.map((t) => {
            switch (t.kind) {
              case "slider":
                return <SliderControl key={t.id} def={t} />;
              case "toggle":
                return <ToggleControl key={t.id} def={t} />;
              case "tri":
                return <TriControl key={t.id} def={t} />;
            }
          })}
        </div>
      )}
    </div>
  );
}

export function CollapseHeader({
  title,
  collapsed,
  onToggle,
  children,
  trailingWhenCollapsed,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  trailingWhenCollapsed?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={!collapsed}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="flex cursor-pointer select-none items-center justify-between gap-xs bg-muted/40 px-s py-xs transition-colors hover:bg-muted/70"
    >
      <span className="text-body-label-caps uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      <div className="flex items-center gap-xs">
        {collapsed && trailingWhenCollapsed}
        {children}
        <span
          aria-hidden="true"
          className="flex h-icon-xs w-icon-xs items-center justify-center text-muted-foreground"
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
            <polyline points="3 6 8 11 13 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Per-kind controls
// ============================================================================

function SliderControl({ def }: { def: SliderTweakDef }) {
  const setParam = useSetParam();
  const value = useTweakNumber(def.id, def.defaultValue ?? 0);
  const display = def.format ? def.format(value) : String(value);

  function set(v: number) {
    const clamped = Math.max(def.min, Math.min(def.max, v));
    const isDefault = clamped === (def.defaultValue ?? 0);
    setParam(def.id, isDefault ? null : String(clamped));
  }

  return (
    <div className="flex flex-col gap-xxs px-xxs">
      <span className="text-body-label-caps uppercase text-muted-foreground">{def.label}</span>
      <div className="flex items-center gap-xs">
        <Stepper
          value={value}
          min={def.min}
          max={def.max}
          onChange={set}
          display={display}
          ariaLabel={def.label}
        />
        <input
          type="range"
          min={def.min}
          max={def.max}
          value={value}
          onChange={(e) => set(Number(e.target.value))}
          className="min-w-0 flex-1 accent-brand-mediumBlue"
          aria-label={def.label}
        />
      </div>
    </div>
  );
}

function ToggleControl({ def }: { def: ToggleTweakDef }) {
  const setParam = useSetParam();
  const active = useTweakBool(def.id);
  return (
    <button
      onClick={() => setParam(def.id, active ? null : "1")}
      aria-pressed={active}
      className={cn(
        "rounded-sm px-s py-xxs text-left text-body-label font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {def.label}
    </button>
  );
}

function TriControl({ def }: { def: TriToggleTweakDef }) {
  const setParam = useSetParam();
  const params = useSearchParams();
  const screenKey = useScreenKey();
  const value = params.get(scopedParam(screenKey, def.id));
  const vertical = def.layout === "vertical";
  return (
    <div className="flex flex-col gap-xxs">
      <span className="px-xxs text-body-label-caps uppercase text-muted-foreground">{def.label}</span>
      <div className={cn(vertical ? "flex flex-col gap-xxs" : "flex items-center gap-xxs")}>
        {def.options.map((opt) => (
          <button
            key={opt.value ?? "default"}
            onClick={() => setParam(def.id, opt.value)}
            className={cn(
              "rounded-sm px-xs py-xxs text-body-label font-medium transition-colors",
              vertical ? "w-full text-left" : "flex-1",
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  display,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  display: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-sm border border-border">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="px-xs py-xxs text-body-label font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label={`Decrement ${ariaLabel}`}
      >
        −
      </button>
      <span className="min-w-[28px] border-x border-border px-xxs text-center text-body-label tabular-nums text-foreground">
        {display}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="px-xs py-xxs text-body-label font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label={`Increment ${ariaLabel}`}
      >
        +
      </button>
    </div>
  );
}
