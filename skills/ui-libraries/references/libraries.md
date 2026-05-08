# UI library cheatsheet

Per-library reference for the agent. Read the section for the library you're considering — don't read the whole file.

The libraries are grouped by **what they're for**, not alphabetically.

---

## App primitives

### shadcn/ui

**What it is:** A copy-paste component library built on Radix UI primitives + Tailwind. You don't `npm install shadcn` — you run a CLI that drops the component source into your repo. You own the code from then on.

**Install (project-level, once):**

```bash
npx shadcn@latest init
```

Creates `components.json`, `lib/utils.ts`, sets up Tailwind tokens in `globals.css`. Pick the defaults unless the project has a strong reason to deviate.

**Add components:**

Prefer the MCP if configured (`.mcp.json` includes the shadcn server). The MCP exposes tools under `mcp__shadcn__*` — exact names depend on the installed version (typical capabilities: list registry components, view component source, add/install a component). Run `/mcp` to see what's available, then call the listing tool to discover components and the add tool to install.

CLI fallback (always works):

```bash
npx shadcn@latest add button dialog form input select dropdown-menu sheet command tooltip
```

**Available primitives (high-frequency):**

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`, `data-table`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`

**Best for:**
- Building app UI (settings, forms, dashboards, tables, dialogs)
- Anything that needs to be accessible by default
- Projects that want full code ownership and Tailwind-native styling

**Avoid for:**
- Heavy marketing animation (use Aceternity / Magic UI instead)
- Charts beyond basic line/bar (Recharts directly is fine; for richer dashboards see Tremor)

**Prop conventions:**
- Compound components — `DialogTrigger` and `DialogContent` are *siblings* inside `<Dialog>`, not nested:
  ```tsx
  <Dialog>
    <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
    <DialogContent>...</DialogContent>
  </Dialog>
  ```
- Controlled state via `open` + `onOpenChange` props
- Forms use `react-hook-form` + `zod` — install both when `add form` is run

**Theming:**
- CSS variables in `globals.css` (`--background`, `--foreground`, `--primary`, etc.)
- Use Tailwind class versions (`bg-background`, `text-foreground`) — *not* `bg-[hsl(var(--background))]` directly
- Light/dark via `class="dark"` on `<html>`; the `next-themes` package is the usual integration

---

### Radix UI (lower-level, headless)

**What it is:** The unstyled accessibility primitives shadcn is built on. Use directly only when shadcn doesn't cover what you need (e.g., a custom-styled component that still needs Radix's keyboard/focus handling).

**Install:**

```bash
npm install @radix-ui/react-dialog @radix-ui/react-popover  # one package per primitive
```

**Best for:** custom design systems where you want Radix's a11y but not shadcn's styling.

---

## Animated marketing components

### Aceternity UI

**What it is:** Copy-paste animated React components for landing pages, marketing sites, and hero sections. Heavy use of Framer Motion / Motion. Source code is yours after you copy it.

**Install (no CLI, copy-paste model):**

1. Pick a component on https://ui.aceternity.com
2. Install peer deps (every component lists them — usually `framer-motion` / `motion`, sometimes `tailwindcss-animate`, `clsx`, `tailwind-merge`)
3. Paste the component source into `components/ui/` (or wherever the project's components live)

Typical peer-dep install:

```bash
npm install motion clsx tailwind-merge
```

**High-frequency components:**

- **Hero / page-level:** `BackgroundBeams`, `BackgroundGradient`, `BackgroundLines`, `WavyBackground`, `Vortex`, `Aurora`, `Spotlight`, `WorldMap`, `Globe`, `MacbookScroll`, `ContainerScroll`, `HeroParallax`, `LampContainer`, `Meteors`
- **Cards / sections:** `BentoGrid`, `CardHoverEffect`, `MagicCard`, `EvervaultCard`, `3dCard`, `FocusCards`, `Compare`, `LayoutGrid`
- **Text effects:** `TypewriterEffect`, `TextGenerateEffect`, `FlipWords`, `SparklesText`, `TextReveal`, `Cover`
- **Interactive:** `AnimatedTooltip`, `MovingBorder`, `ShimmerButton`, `Floating Dock`, `InfiniteMovingCards`, `Marquee`, `Tracing Beam`

**Best for:**
- Landing pages that need to *feel* premium without a designer + animator
- Marketing sites where the animation IS the differentiation
- Demos and showcase pages

**Avoid for:**
- App UI (forms, dashboards) — too animated, distracting in productivity contexts
- Bundle-sensitive pages — Framer Motion isn't tiny
- Static content sites where the motion adds nothing

**Theming:**
- Most components use Tailwind classes you can override via `className`
- Background components have configurable colors as props (`colors={["#...", "#..."]}`)

---

### Magic UI

**What it is:** Another copy-paste / install React component library focused on landing-page polish. Overlaps with Aceternity but has different specialties (better marquees, better gradient effects, animated lists).

**Install:**

```bash
# CLI install for individual components
npx shadcn@latest add "https://magicui.design/r/<component-name>"
```

(Magic UI uses the shadcn registry format, so the shadcn CLI installs it.)

**High-frequency components:**

`Marquee`, `BentoGrid`, `AnimatedBeam`, `OrbitingCircles`, `Particles`, `Meteors`, `RetroGrid`, `Ripple`, `BorderBeam`, `ShimmerButton`, `RainbowButton`, `ShinyButton`, `AnimatedGradientText`, `Globe`, `Confetti`, `NumberTicker`, `WordRotate`, `TypingAnimation`

**Best for:**
- Bento grids, marquees, animated counters, polish details
- Use alongside shadcn (compatible — both use the shadcn registry pattern)

**Avoid for:** complete UI systems (it's a polish layer, not foundation)

---

## Batteries-included design system

### HeroUI (formerly NextUI)

**What it is:** A full React component library (npm-installed, not copy-paste). Opinionated, themed, fast to ship. The successor to NextUI.

**Install:**

```bash
npm install @heroui/react framer-motion
```

Wrap the app in `<HeroUIProvider>`. Configure Tailwind plugin per the docs.

**High-frequency components:**

`Button`, `Input`, `Select`, `Autocomplete`, `Modal`, `Drawer`, `Popover`, `Tooltip`, `Tabs`, `Accordion`, `Card`, `Avatar`, `Badge`, `Chip`, `Switch`, `Checkbox`, `Radio`, `Slider`, `Progress`, `Spinner`, `Pagination`, `Table`, `Listbox`, `Navbar`, `Breadcrumbs`, `Calendar`, `DatePicker`, `Dropdown`, `Snippet`, `Code`, `Skeleton`

**Best for:**
- Projects that want a complete system off the shelf
- Speed-to-ship: less code to write than shadcn for standard layouts
- Designers who like NextUI's aesthetic

**Avoid for:**
- Projects already on shadcn (don't mix systems)
- Cases where you want full control over component source — HeroUI is a black-box dep
- Very minimal / brutalist / editorial designs — the default aesthetic is its own thing

**Prop conventions:**
- `isOpen` / `onOpenChange` for overlays (not shadcn's compound-component model)
- Color props: `color="primary" | "secondary" | "success" | ...`
- Size props: `size="sm" | "md" | "lg"`

---

## Charts and dashboard data viz

### Tremor

**What it is:** React dashboard / data-viz components built on Recharts + Tailwind. Cards, charts, KPI tiles, lists.

**Install:**

```bash
npm install @tremor/react
```

Set up the Tailwind plugin per their docs.

**High-frequency components:**

`Card`, `Metric`, `Text`, `Title`, `BarChart`, `LineChart`, `AreaChart`, `DonutChart`, `BarList`, `Tracker`, `Callout`, `ProgressBar`, `Badge`, `Flex`, `Grid`, `List`, `Table`, `Tab`, `DateRangePicker`

**Best for:**
- Internal dashboards, admin UIs, analytics pages
- KPI-style layouts (metric tile + sparkline + delta)

**Avoid for:**
- Marketing pages
- Custom chart styling beyond what Tremor exposes (drop to Recharts directly)

---

### shadcn charts

**What it is:** shadcn ships a chart wrapper around Recharts (`npx shadcn add chart`). Use this if shadcn is already in the project and the data-viz needs are moderate.

**Best for:** projects already on shadcn that don't want a second system.

**Avoid for:** dashboards that would benefit from Tremor's higher-level KPI/list/tracker components.

---

### Recharts (direct)

**What it is:** The underlying chart library Tremor and shadcn charts both wrap. Use directly when neither wrapper gives you what you need.

```bash
npm install recharts
```

---

## Tailwind-native, lighter alternatives

### Origin UI

**What it is:** Newer copy-paste Tailwind component library, lighter than shadcn (no Radix dep on most components). Good defaults.

**Install:** copy-paste model, similar to shadcn / Aceternity.

**Best for:** projects that want shadcn-like ergonomics without pulling in Radix.

---

### Tailwind UI (paid)

**What it is:** Official Tailwind Labs component library. Paid, but well-designed and includes marketing/application/e-commerce sections.

**Best for:** teams that already have a license and want polished, conventional designs.

**Avoid for:** anyone who hasn't paid — don't recommend pirating it.

---

## Icons

The convention across all the above libraries is:

```bash
npm install lucide-react   # shadcn default
```

shadcn examples assume `lucide-react`. HeroUI ships its own icon set but accepts any. Aceternity / Magic UI examples mix — usually `lucide-react` works.

For brand icons (GitHub, X, Discord, etc.) install `simple-icons` or use the SVGs directly.

---

## Quick decision flowchart

```
Is this an APP (forms, tables, dashboards, settings)?
├─ YES → shadcn/ui (or HeroUI if the project is already on it)
└─ NO → Is it a MARKETING / LANDING page?
        ├─ YES → shadcn for primitives + Aceternity / Magic UI for animated bits
        └─ NO → Is it a DASHBOARD / ANALYTICS?
                ├─ YES → Tremor (or shadcn + chart for moderate needs)
                └─ NO → Default to shadcn — it's the safest baseline
```

---

## Compatibility matrix

|  | shadcn | Aceternity | Magic UI | HeroUI | Tremor |
|---|---|---|---|---|---|
| **shadcn** | — | ✅ compose freely | ✅ same registry | ⚠ avoid mixing | ✅ compose freely |
| **Aceternity** | ✅ | — | ✅ | ⚠ HeroUI conflicts on Framer Motion versions sometimes | ✅ |
| **Magic UI** | ✅ | ✅ | — | ⚠ same as above | ✅ |
| **HeroUI** | ⚠ | ⚠ | ⚠ | — | ⚠ duplicate styling systems |
| **Tremor** | ✅ | ✅ | ✅ | ⚠ | — |

The general rule: shadcn + any number of copy-paste libraries = fine. HeroUI = pick one or the other.
