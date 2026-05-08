"use client";

import { PageShell, type ScreenDef } from "@/components/frame/PageShell";
import { Settings } from "./Settings";

const screens: ScreenDef[] = [
  { key: "settings", label: "Settings", element: <Settings /> },
];

export default function SettingsReferencePage() {
  return <PageShell screens={screens} />;
}
