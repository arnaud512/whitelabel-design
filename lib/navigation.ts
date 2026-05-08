export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Optional sub-items rendered indented under this item. */
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Reference",
    items: [
      { label: "Home", href: "/reference/home", icon: "house.fill" },
      { label: "Feed", href: "/reference/feed", icon: "list.bullet" },
      { label: "Settings", href: "/reference/settings", icon: "gearshape" },
    ],
  },
  {
    label: "Prototype",
    items: [
      { label: "Card", href: "/prototypes/card", icon: "rectangle.fill" },
      { label: "Onboarding", href: "/prototypes/onboarding", icon: "sparkles" },
    ],
  },
  {
    label: "Web",
    items: [
      { label: "Landing", href: "/web/landing", icon: "globe" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Index", href: "/", icon: "rectangle.grid.1x2" },
      { label: "Components", href: "/components", icon: "square.grid.2x2" },
      { label: "Design system", href: "/design-system", icon: "paintpalette.fill" },
      { label: "SF Symbols", href: "/sf-symbols", icon: "magnifyingglass" },
    ],
  },
];
