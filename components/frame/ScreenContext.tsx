"use client";

/**
 * ScreenContext — namespacing for per-screen URL-backed state.
 *
 * The page model: a `Page` route renders multiple `Screen`s on one canvas;
 * each screen owns its own scenario, tweaks, and compare state. URL params
 * are namespaced by screen key (`?<key>:scenario=`, `?<key>:<tweak-id>=`)
 * so the four phones on `/prototypes/workout` can each be in a different
 * scenario without colliding.
 *
 * Read/write helpers (`Switcher`, `useTweakBool/Number/Enum`) call
 * `useScreenKey()` to discover which prefix they sit under. When the value
 * is `null` (no provider on the path), `scopedParam` falls back to the bare
 * param name — useful for axes that intentionally live at the page level
 * (e.g. `?selected=`, which has to be visible to every screen at once).
 */

import { createContext, useContext } from "react";

const ScreenContext = createContext<string | null>(null);

export function useScreenKey(): string | null {
  return useContext(ScreenContext);
}

/** Wrap each rendered screen in this. The inspector also wraps its panels in
 *  one keyed to the *selected* screen, so reads/writes target that namespace. */
export function ScreenProvider({
  screenKey,
  children,
}: {
  screenKey: string;
  children: React.ReactNode;
}) {
  return (
    <ScreenContext.Provider value={screenKey}>{children}</ScreenContext.Provider>
  );
}

/** `scopedParam("plan", "scenario") === "plan:scenario"`.
 *  `scopedParam(null, "scenario") === "scenario"` (legacy fallback). */
export function scopedParam(
  screenKey: string | null,
  name: string,
): string {
  return screenKey ? `${screenKey}:${name}` : name;
}
