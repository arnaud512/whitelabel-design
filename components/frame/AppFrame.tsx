"use client";

import { useEffect, useState } from "react";
import { Inspector } from "../inspector/Inspector";
import { SideNav } from "./SideNav";

const COLLAPSED_KEY = "whitelabel.sidenav.collapsed";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
      } catch {
        // ignore
      }
    };
    read();
    setHydrated(true);
    window.addEventListener("storage", read);
    window.addEventListener("whitelabel:sidenav-toggle", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("whitelabel:sidenav-toggle", read);
    };
  }, []);

  const sideNavWidth = hydrated ? (collapsed ? 48 : 224) : 48;

  // Mirror the sidenav width on <html> so fixed-position UI (Inspector
  // panels, etc.) outside the wrapper div can still consume `--sidenav-w`.
  useEffect(() => {
    document.documentElement.style.setProperty("--sidenav-w", `${sideNavWidth}px`);
  }, [sideNavWidth]);

  return (
    <>
      <SideNav />
      <div
        className="transition-[padding-left]"
        style={
          {
            paddingLeft: sideNavWidth,
            ["--sidenav-w"]: `${sideNavWidth}px`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
      <Inspector />
    </>
  );
}
