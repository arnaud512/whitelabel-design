"use client";

import type { TweakDef } from "@/components/frame/LiveTweaks";
import { PageShell, type ScreenDef } from "@/components/frame/PageShell";
import type { SwitcherOption } from "@/components/frame/Switcher";
import { Feed } from "./Feed";
import { FeedDetail } from "./FeedDetail";

const feedScenarios: SwitcherOption[] = [
  { key: "populated", label: "Populated" },
  { key: "empty", label: "Empty" },
  { key: "loading", label: "Loading" },
];

const feedTweaks: TweakDef[] = [
  { kind: "toggle", id: "compact", label: "Compact rows" },
];

const detailTweaks: TweakDef[] = [
  { kind: "toggle", id: "expanded", label: "Expanded section" },
];

const screens: ScreenDef[] = [
  {
    key: "feed",
    label: "Feed",
    element: <Feed />,
    scenarios: feedScenarios,
    tweaks: feedTweaks,
  },
  {
    key: "feed-detail",
    label: "Feed → Detail",
    element: <FeedDetail />,
    tweaks: detailTweaks,
  },
];

export default function FeedReferencePage() {
  return <PageShell screens={screens} />;
}
