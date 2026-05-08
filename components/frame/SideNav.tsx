"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, type NavItem } from "@/lib/navigation";
import { SFSymbol } from "@/components/icons/SFSymbol";

const COLLAPSED_KEY = "whitelabel.sidenav.collapsed";

export function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("whitelabel:sidenav-toggle"));
      return next;
    });
  }

  if (!hydrated) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card shadow-sm transition-[width]",
        collapsed ? "w-12" : "w-56",
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-s">
        {!collapsed && (
          <span className="font-display text-h3 font-semibold text-foreground">whitelabel</span>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="rounded-sm p-xxs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <span className="grid h-icon-xs w-icon-xs place-items-center leading-none">
            {collapsed ? "›" : "‹"}
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-xs">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-s first:mt-0">
            {!collapsed && (
              <div className="px-xs pb-xxs text-body-label-caps uppercase tracking-wide text-muted-foreground">
                {group.label}
              </div>
            )}
            <ul className="space-y-xxs">
              {group.items.map((item) => (
                <NavItemRow
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export const SIDENAV_WIDTH = { open: 224, collapsed: 48 } as const;

function NavItemRow({
  item,
  pathname,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  depth?: number;
}) {
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");
  // Show children whenever the parent or any of its children is on the active path.
  const childActive =
    item.children?.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
    ) ?? false;
  const showChildren = !collapsed && item.children && (active || childActive);

  return (
    <li>
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-s rounded-sm text-body-regular transition-colors",
          collapsed ? "justify-center p-xxs" : "py-xxs",
          collapsed
            ? ""
            : depth === 0
              ? "px-s"
              : "pl-[28px] pr-s",
          active
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <SFSymbol name={item.icon} size="xs" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
      {showChildren && (
        <ul className="mt-xxs space-y-xxs">
          {item.children!.map((child) => (
            <NavItemRow
              key={child.href}
              item={child}
              pathname={pathname}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
