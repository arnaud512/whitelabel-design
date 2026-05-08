"use client";

import type { TweakDef } from "@/components/frame/LiveTweaks";
import { PageShell, type ScreenDef } from "@/components/frame/PageShell";
import type { SwitcherOption } from "@/components/frame/Switcher";
import { Home } from "./Home";

const scenarios: SwitcherOption[] = [
  { key: "populated", label: "Populated" },
  { key: "empty", label: "Empty" },
  { key: "loading", label: "Loading" },
];

const tweaks: TweakDef[] = [
  {
    kind: "slider",
    id: "itemCount",
    label: "Items",
    min: 0,
    max: 6,
    defaultValue: 6,
    format: (v) => `${v}`,
  },
  { kind: "toggle", id: "darkChrome", label: "Dark status bar" },
];

const screens: ScreenDef[] = [
  { key: "home", label: "Home", element: <Home />, scenarios, tweaks },
];

export default function HomeReferencePage() {
  return <PageShell screens={screens} />;
}
