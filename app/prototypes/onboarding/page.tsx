"use client";

import { PageShell, type ScreenDef } from "@/components/frame/PageShell";
import { V1Centered } from "./_variants/V1Centered";
import { V2Hero } from "./_variants/V2Hero";
import { V3Conversational } from "./_variants/V3Conversational";

const screens: ScreenDef[] = [
  { key: "v1-centered", label: "V1 · Centered", element: <V1Centered /> },
  { key: "v2-hero", label: "V2 · Hero", element: <V2Hero /> },
  {
    key: "v3-conversational",
    label: "V3 · Conversational",
    element: <V3Conversational />,
  },
];

export default function OnboardingPrototypePage() {
  return <PageShell screens={screens} />;
}
