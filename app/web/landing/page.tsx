"use client";

import { WebShell } from "@/components/web-frame/WebShell";
import { Landing } from "./Landing";

export default function LandingPage() {
  return (
    <WebShell url="example.com">
      <Landing />
    </WebShell>
  );
}
