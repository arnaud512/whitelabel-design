"use client";

import { PageShell, type ScreenDef } from "@/components/frame/PageShell";
import { V1Flat } from "./_variants/V1Flat";
import { V2Glass } from "./_variants/V2Glass";
import { V3Bold } from "./_variants/V3Bold";

const screens: ScreenDef[] = [
  { key: "v1-flat", label: "V1 · Flat", element: <V1Flat /> },
  { key: "v2-glass", label: "V2 · Glass", element: <V2Glass /> },
  { key: "v3-bold", label: "V3 · Bold", element: <V3Bold /> },
];

export default function CardPrototypePage() {
  return <PageShell screens={screens} />;
}
