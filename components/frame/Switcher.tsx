"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CollapseHeader } from "./LiveTweaks";
import { scopedParam, useScreenKey } from "./ScreenContext";

/**
 * One entry in any keyed switcher panel (Step or Scenario). The two switchers
 * share this shape — they differ only in their URL param name and panel title.
 *
 * See `CLAUDE.md` § "Reference screens — Step / Scenario / Tweak" for when to
 * model something as a Step (sub-screen in a flow), a Scenario (named pre-baked
 * world), or a Tweak (orthogonal modifier).
 */
export interface SwitcherOption {
  /** URL param value. Must match a key understood by the screen's lookup. */
  key: string;
  /** Human label rendered in the panel button. */
  label: string;
  /** Optional small badge after the label (e.g. "TODO" for design-only states). */
  badge?: string;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Read the current value of a URL-param-backed axis, scoped to the enclosing
 * `ScreenContext` if one is active. Returns null when unset.
 *
 * Pass `{ unscoped: true }` for axes that intentionally live at the page
 * level (e.g. `selected` — which screen has focus — must be page-wide so
 * one phone selecting another is visible to every screen at once).
 */
export function useUrlAxis(
  paramName: string,
  options: { unscoped?: boolean } = {},
): string | null {
  const params = useSearchParams();
  const screenKey = useScreenKey();
  const name = options.unscoped ? paramName : scopedParam(screenKey, paramName);
  return params.get(name);
}

/** Current scenario key from `?<screen-key>:scenario=`. Returns null on the
 *  default scenario. Reads through `ScreenContext`, so each rendered screen
 *  resolves to its own value. */
export function useScenario(): string | null {
  return useUrlAxis("scenario");
}

// ---------------------------------------------------------------------------
// Generic switcher panel
// ---------------------------------------------------------------------------

interface SwitcherProps {
  title: string;
  paramName: string;
  options: SwitcherOption[];
}

/**
 * Generic single-select panel writing one URL param. The first option is the
 * default — selecting it deletes the param (so URLs stay clean).
 *
 * Wired by `PageShell` for `Scenario` (paramName="scenario") under each
 * screen's `<ScreenProvider>`. Pages just declare a `scenarios` array on
 * each `ScreenDef`.
 */
export function Switcher({ title, paramName, options }: SwitcherProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const screenKey = useScreenKey();
  const scoped = scopedParam(screenKey, paramName);
  const [collapsed, setCollapsed] = useState(false);
  const current = params.get(scoped) ?? options[0]?.key;
  const currentLabel = options.find((o) => o.key === current)?.label;

  function setValue(key: string) {
    const next = new URLSearchParams(params.toString());
    if (key === options[0]?.key) next.delete(scoped);
    else next.set(scoped, key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex w-full flex-col">
      <CollapseHeader
        title={title}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        trailingWhenCollapsed={
          currentLabel && (
            <span className="truncate text-body-label text-foreground">
              {currentLabel}
            </span>
          )
        }
      />
      {!collapsed && (
        <div className="flex flex-col gap-xxs p-s">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => setValue(o.key)}
              className={cn(
                "flex items-center gap-xs rounded-sm px-s py-xxs text-left text-body-label font-medium transition-colors",
                current === o.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="flex-1 truncate">{o.label}</span>
              {o.badge && (
                <span
                  className={cn(
                    "shrink-0 rounded-xxs px-[6px] py-[1px] text-[10px] font-semibold uppercase tracking-wide",
                    current === o.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  {o.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
