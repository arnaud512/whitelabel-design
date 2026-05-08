# Whitelabel Design Workspace

A Next.js + Tailwind + shadcn workspace for ideating UI in HTML before
shipping it natively. The visual default is **iOS-style liquid-glass** — SF
Pro fonts, SF Symbols, glass surface recipes — but the workspace itself is
project-agnostic. Replace HSL values in `app/globals.css` and add domain
content under `app/reference/`, `app/prototypes/`, `app/web/`, and
`components/whitelabel/` to make it your own.

## What this workspace gives you

- **Two canvases.** A phone canvas (`PageShell`) for iOS-style screens and a
  web canvas (`WebShell`) for marketing/landing pages — sibling tracks that
  intentionally don't share components.
- **Page · Screen · Scenario · Tweak.** A small mental model that captures
  most of what you actually do when prototyping (see below).
- **Inspector panel.** Right-side panel for live editing, comments, and
  annotations on any rendered element.
- **SF Symbols + iOS liquid-glass.** Self-hosted SF Pro fonts, full SF
  Symbols set under `/sf-symbols`, and `.glass` / `.glass-tinted` /
  `.glass-prominent` / `.glass-pressable` recipes in `globals.css`.

## Design system

Tokens live in `tailwind.config.ts` and `app/globals.css`. They're neutral
on a fresh fork — replace the HSL values in `:root` and `.dark` to brand
the workspace.

**Spacing** (8pt grid): `xxs`(4) `xs`(8) `s`(12) `m`(16) `l`(24) `xl`(32) `xxl`(48). Use `p-m`, `gap-l`, etc. — **never** `p-4` or arbitrary `[20px]`.

**Corner radius**: `rounded-xxs`(2) `rounded-xs`(4) `rounded-sm`(8) `rounded-m`(12) `rounded-lg`(16) `rounded-xl`(24). Default card radius is `rounded-m`. (Note: keys `sm`/`lg` instead of iOS-style `s`/`l` — Tailwind reserves `rounded-s` / `rounded-l` for logical directional rounding, which silently overrides the size variant.)

**Icon sizes**: `w-icon-xs h-icon-xs` (16) / `-s` (24) / `-m` (32) / `-l` (40).

**Typography**: SF Pro Text for body, SF Pro Display for headings (`font-display`). Use semantic sizes — `text-h1` (32px), `text-h2` (24px), `text-h3` (20px), `text-title-large` (28px), `text-body-large` (17), `text-body-regular` (15), `text-body-stat` (20), `text-body-label` (12), `text-body-label-caps`.

**Semantic colors** (preferred for layout chrome): `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `bg-secondary`, `bg-accent`, `bg-destructive`. HSL values in `globals.css`.

**Glass surfaces**: `.glass` (translucent white), `.glass-tinted` (accent wash), `.glass-prominent` (inverted/primary), `.glass-pressable` (press bounce — compose with the others).

**SF Symbols**: `<SFSymbol name="sparkles" size="s" />`. All Apple symbols live under `public/sf-symbols/` — browse them at `/sf-symbols`.

## Page · Screen · Scenario · Tweak

Reference and prototype pages live at `app/reference/<page>/` and
`app/prototypes/<page>/`. Every page is a Figma-style canvas: it declares
one or more **Screens**; *all* screens are always rendered side by side.
One is **selected** at a time and the inspector binds to it.

There are exactly two terms: **Page** (a route) contains one or more
**Screens** (phone tiles on the canvas). Single-screen pages just declare a
1-element `screens` array.

### Page — what you visit at a route

- **What it is:** the URL route + canvas + inspector + screens array.
- **API:** `<PageShell screens={[{ key, label, element, scenarios?, tweaks? }, …]} bottomBar={…} />`.
- **Page-level state:** device, frame on/off, canvas zoom, inspector panel width, *which screen is selected*. Scenario / Tweak / Compare are NOT page-level — they belong to individual screens.

### Screen — one phone tile on the canvas

- **What it is:** one rendered phone. Owns its own scenario list, tweaks list, and compare overlay. Always rendered.
- **Selected screen:** clicking a phone selects it. URL contract: `?selected=<screen-key>`. The inspector edits the selected screen's state.
- **Per-screen state — URL namespacing:** every URL-backed param a screen reads/writes is prefixed by its screen key. `?feed-detail:itemId=2&feed:scenario=loading` means Feed is loading and Feed Detail is on item 2.
- **Add a screen when:** it's a meaningfully different surface (Feed vs Feed Detail), a step in a flow (Onboarding question 1, 2, 3), or a parallel design variation (Card v1 vs v2 vs v3).
- **Don't add a screen when:** the variant is just a different fixture — that's a Scenario on a single screen.

### Scenario — named, pre-baked world for one screen

- **What it is:** a complete fixture for one screen. Picking one swaps the *whole world* for that screen.
- **URL contract:** `?<screen-key>:scenario=<value>`.
- **API:** `scenarios: SwitcherOption[]` on a `ScreenDef`. The screen component reads `useScenario()` from `@/components/frame/Switcher`.

### Tweak — orthogonal modifier on a screen's current state

- **What it is:** a single live knob that mutates *part* of the screen's state. Composes with the Scenario.
- **URL contract:** `?<screen-key>:<tweak-id>=<value>`.
- **API:** `tweaks: TweakDef[]` on a `ScreenDef`. Three control kinds: `slider`, `toggle`, `tri`. Each rendered screen wraps content in `<ScreenProvider screenKey={key}>`, so `useTweakNumber/Bool/Enum` reads its own namespace.

### The mental test

> Same surface in a different state? → **Scenario** ("Empty", "Loading")
> A single dimension to wiggle? → **Tweak** ("compact rows", "item count")
> A genuinely different surface, a flow step, or a design variation? → **Screen** ("Feed Detail", "Onboarding step 2", "Card · Glass")

URLs compose freely:
`?selected=feed-detail&feed:scenario=loading&feed-detail:expanded=1` means "looking at Feed Detail (focused), Feed is on the loading scenario, and Feed Detail has `expanded=1` applied".

### Files to know

- `components/frame/PageShell.tsx` — page shell. Renders the screens array, manages selection, holds per-screen compare state, mounts the inspector.
- `components/frame/ScreenContext.tsx` — provider + `useScreenKey()` + `scopedParam(screenKey, name)`. The plumbing that namespaces every URL read/write.
- `components/frame/Switcher.tsx` — `Switcher` panel, `SwitcherOption`, `useScenario()`, `useUrlAxis(name, { unscoped? })`.
- `components/frame/LiveTweaks.tsx` — Tweaks panel, `TweakDef`, `useTweakNumber/Bool/Enum`.
- Each `app/reference/<page>/page.tsx` declares its `screens` array.
- Each screen component reads scenario/tweak values via the hooks (no awareness of which screen it's rendered as — the context handles that).

## Web prototypes — `app/web/*`

The iOS shell (`PageShell`) is purposely phone-only. Marketing pages live
on a **separate, sibling track** — `app/web/<page>/` — wrapped in
`<WebShell>` from `components/web-frame/`. Use this track for landing
pages, marketing screens, and anything else that's *web*, not iOS.

The two tracks are intentionally segregated. Don't mix them: web pages
must not import from `components/whitelabel/*` (the iOS-style primitives),
and iOS reference screens must not import from `app/web/*/_components/`.

### What `<WebShell>` gives you

- A pan/zoom canvas with the same Inspector panel as `PageShell` (the
  inspector width/collapse state is shared across both shells).
- A **Viewport switcher** with three sizes: **Desktop** (1440×900),
  **13″** (1280×800), **iPhone** (390×844).
- A **Browser frame** toggle: ON renders realistic chrome (laptop browser
  title bar with traffic lights + URL bar; iPhone Safari with status bar,
  Dynamic Island, URL bar, home indicator). OFF renders a bare rounded
  rectangle.

### Components: colocated, NOT design system

Components used by a web page live under `app/web/<page>/_components/`.
The leading underscore is a Next.js convention that excludes the folder
from routing — and signals to humans that **these components must not be
lifted into `/components`**. The web track is allowed to drift visually so
we can explore freely without polluting the iOS-mirrored design system.

### Container queries

Because `<WebShell>` renders the page inside a fixed-width chrome
(390 / 1280 / 1440 px), the user's actual browser viewport doesn't tell
the page how wide it is. Tailwind's `md:` / `lg:` (viewport-based)
prefixes will fire incorrectly. Use **container query prefixes** instead:
`@md:`, `@lg:`, `@xl:`, etc. (provided by `@tailwindcss/container-queries`).

## Anti-slop rules

- **Use tokens, never raw hex or arbitrary px.** `bg-primary`, `p-m`, `rounded-m` — not `bg-[#1a1a1a]`, `p-[16px]`, `rounded-[12px]`. If a token is missing, add it to `tailwind.config.ts` rather than going arbitrary.
- **iOS liquid-glass is the default visual style.** Reach for `.glass` / `.glass-tinted` / `.glass-prominent` for cards and buttons. Pair with `rounded-lg` for cards and `rounded-full` for capsules.
- **Headings use `font-display` (SF Pro Display).** Body text inherits SF Pro Text; you don't need a class for it.
- **Tabular data uses the system font, never a serif.** Stats, dates, numbers — sans only.
- **Responsive by default.** Phone canvases render at 390/844; web canvases at 390 / 1280 / 1440. Test all three.
- **Animations use `transform` and `opacity`** — animating `width`/`height`/`top`/`left` is a perf trap.

## Skills available

The `skills/` directory ships specialized skills you should use when their triggers fire:

- **design-interview** — short multiple-choice Q&A before any visual task with under-specified intent.
- **scrollytelling** — scroll-driven storytelling, parallax, pin sections.
- **hero-video-background** — cinematic landing-page hero around a user-supplied video.
- **ui-libraries** — pick the right component library (shadcn / Aceternity / HeroUI) instead of hand-rolling.
- **parallel-variations** — explore N design directions in parallel via sub-agents in git worktrees.
- **verify-build** — Playwright-based browser walkthrough after frontend changes.
- **swiftui-handoff** — translate a chosen HTML prototype into a SwiftUI implementation plan for a sibling iOS repo. Configure `additionalDirectories` in `.claude/settings.json` to point at your iOS project before using.

## Workflow

1. **Visual or UI request** → run `design-interview` first unless the prompt is already richly specified.
2. **Building components** → consult `ui-libraries` and prefer the shadcn MCP over hand-installation.
3. **Animation / scroll behavior asked for** → use `scrollytelling`.
4. **Video provided for a hero** → use `hero-video-background`.
5. **User wants options / variations** → use `parallel-variations`.
6. **Frontend edits done** → run `verify-build` before reporting back.

## Tooling expectations

- **shadcn MCP** is configured in `.mcp.json`. Use `mcp__shadcn__*` tools to discover and install components instead of `npx shadcn add` unless the MCP is unavailable.
- **Playwright MCP** is configured in `.mcp.json`. The `verify-build` skill uses it.
- The dev server is started by `pnpm dev` (port 3002 by default — see `package.json`). `verify-build` finds or starts it.

## Anti-patterns

- Don't reach for raw GSAP or Framer Motion before checking whether a shadcn / Aceternity primitive already exists.
- Don't generate a "design" without writing real code — there's no Figma export step; the code is the design.
- Don't skip `verify-build` after frontend edits.
- Don't ask 8 clarifying questions in chat. Use `AskUserQuestion` via the `design-interview` skill.
