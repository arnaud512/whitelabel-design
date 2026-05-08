---
name: ui-libraries
description: Pick the right component library and install it correctly instead of hand-rolling primitives — shadcn/ui for accessible base components, Aceternity UI for animated marketing components, HeroUI for a richer batteries-included system, plus Magic UI / Origin UI / Tremor where they fit. Use this skill whenever the user asks to "add a button / dialog / nav / modal / form / card / table / chart", "build a component", "add a hero section", "add a pricing table", or any UI-component-shaped request, before writing the component from scratch. Also trigger when the user asks "what should I use for X" about a UI element. This skill checks what's already installed in the project, picks the best-fit library for the request (using `references/libraries.md`), uses the shadcn MCP when available to install, and tells the agent when *not* to add a library (when one is already in use, or the component is too small to justify a dependency). Stops Claude from writing 200 lines of div soup when a `npx shadcn add button` would do.
---

# UI Libraries

Reach for an established component library before hand-rolling. Most "build me a dialog / nav / pricing table" requests are solved by an `npx shadcn add` or pulling an Aceternity component — and the result is more accessible, more responsive, and more maintainable than anything written from scratch in the same time.

The point: agents waste enormous effort hand-coding `<div className="rounded border ...">` versions of components that already exist as installable, themeable, accessible primitives. This skill is the gatekeeper that says "stop, install the real one."

## When to trigger

Trigger on requests for any of:
- A specific component: button, dialog, modal, sheet, drawer, dropdown, command menu, tooltip, popover, hover-card, accordion, tabs, table, data-table, form, input, select, combobox, checkbox, radio, switch, slider, calendar, date picker, toast, alert, badge, avatar, breadcrumb, navigation menu, pagination, progress, scroll-area, separator, skeleton
- A composite section: hero, pricing table, feature grid, testimonial, footer, navbar, CTA strip, bento grid, marquee
- An animated marketing element: animated beam, sparkles text, meteor effect, globe, world-map, animated number, magic card, shimmer button
- A data/dashboard element: line chart, bar chart, area chart, sparkline, KPI card, stat tile

Skip when:
- The user explicitly said "no dependencies" / "vanilla only" / "no shadcn"
- The component is trivially small and one-off (a 5-line styled badge that won't be reused)
- The project is a tiny prototype where the dep cost outweighs the benefit

## Workflow

### Step 1 — Check what's already installed

Don't add a second component system on top of an existing one. Read these first:

```bash
cat package.json | grep -E '"(shadcn|@radix-ui|aceternity|@heroui|magic-ui|tremor|@tremor|origin-ui|motion|framer-motion|lucide-react)"' || echo "No UI libs detected"
ls components/ui 2>/dev/null && echo "shadcn-style components/ui exists"
ls components.json 2>/dev/null && cat components.json
```

The decision tree from what you find:

- **`components.json` + `components/ui/` exist** → shadcn is set up. Use it. Add new components via the shadcn MCP (`mcp__shadcn__*` tools — see `/mcp` for the exact names) or `npx shadcn add <name>`.
- **`@heroui/react` is in deps** → HeroUI is the system. Don't introduce shadcn alongside.
- **Aceternity components live in `components/`** → it's a copy-paste library; reuse the same pattern (paste the new component into `components/`, install any peer deps it needs).
- **No UI library, but `@radix-ui/*` or `framer-motion` is present** → likely a manual setup. Check if shadcn fits before introducing it.
- **Nothing UI-related yet** → install the best fit (decision matrix below).

### Step 2 — Pick the library

For the full per-library cheatsheet — what's in each, what each is best at, what to avoid — see `references/libraries.md`. The 80% decision:

| User wants | First choice | Why |
|---|---|---|
| Accessible app primitives (button, dialog, form, table) | **shadcn/ui** | Owns the code, themeable, Radix under the hood |
| Animated marketing components (beam, sparkles, globe, magic card) | **Aceternity UI** | Built for landing pages, motion is the point |
| Batteries-included design system | **HeroUI** | NextUI's successor, opinionated, fast to ship |
| Charts / dashboard data viz | **Tremor** (or shadcn charts via Recharts) | Tremor is purpose-built; shadcn charts is fine if shadcn is already in |
| Bento grids, marquees, gradient effects | **Magic UI** | Specializes in marketing flair |
| Tailwind-native, headless, clean defaults | **Origin UI** | Newer, lightweight alternative |

**Compatibility rule:** shadcn + Aceternity + Magic UI all coexist (they're all copy-paste / install-into-your-tree). HeroUI is its own system — don't mix it with shadcn unless you have a strong reason.

### Step 3 — Install

Always prefer the **shadcn MCP** when the user wants shadcn or shadcn-compatible components. The MCP lets the agent search and install without leaving the session.

The MCP exposes tools under the `mcp__shadcn__*` namespace — exact names depend on your shadcn version. Run `/mcp` (or check the deferred-tools list) to see what's available; typical tools cover *list components in a registry*, *get a component's source / install instructions*, and *install or add* a component. If you can't see the MCP at all, it's not configured — fall back to CLI:

```bash
# shadcn (project must be initialized — components.json present)
npx shadcn@latest init   # only if not yet initialized
npx shadcn@latest add button dialog form input

# HeroUI
npm install @heroui/react framer-motion

# Aceternity / Magic UI components are copy-paste — see references/libraries.md
# for the typical pattern (install peer deps, paste component file into components/)

# Tremor
npm install @tremor/react
```

After install, **read the new component file once** before using it — different libraries have different prop conventions, and guessing leads to bugs the type-checker won't catch (e.g. shadcn `Dialog` uses `<DialogTrigger>` slot, HeroUI `Modal` takes an `isOpen` prop).

### Step 4 — Theme to the project's tokens

If the project has CSS custom properties (`--background`, `--foreground`, `--primary`, etc.), the installed components should *use them*, not hardcoded colors. shadcn does this by default; for HeroUI / Aceternity, check the install — if the demo uses raw hex codes, replace those with the project's token classes (`bg-background`, `text-foreground`, `border-border`).

If the project has no design tokens yet, set them up before painting walls of `bg-[#1a1a1a]` everywhere. shadcn's default `globals.css` is a reasonable starting point.

### Step 5 — Hand off to verify-build

After installing and using a component, run `verify-build` to confirm:
- No console errors (some libraries need a peer dep that's silently missing)
- The component is keyboard-accessible (try Tab, Esc, Enter on dialogs/menus)
- The component renders correctly at all viewports (some marketing components break on mobile)

## When *not* to install a library

There are real cases where hand-rolling is right. The signals:

- **One-off styled element.** A 5-line badge that exists in one place isn't worth a dep.
- **The user is on a strict bundle budget** (landing page perf budget, etc.) and the library is heavy.
- **The project has its own internal component library** (lots of companies do — `components/internal/Button.tsx`). Use the internal one even if it's worse. Consistency wins.
- **Non-React projects.** Most modern UI libraries are React-only. For Vue / Svelte / vanilla, see `references/libraries.md` for framework-specific options or skip the library and use the project's existing patterns.

## Anti-patterns

- **Don't hand-roll a component when an installable one exists.** This is the entire reason for the skill. If the user asks for a "command palette," reach for shadcn `command` (or `cmdk` directly), don't write it.
- **Don't introduce a second component system in an existing project.** If shadcn is already in, don't add HeroUI for one component — port the pattern in shadcn instead.
- **Don't install a library and use it once.** If after install you realize the component you needed wasn't worth the dep, undo (`npm uninstall`, delete the component file). Don't ship a 30 KB add for one badge.
- **Don't skip reading the installed component.** Each library has its own prop conventions; guessing leads to broken-but-type-checked code.
- **Don't hardcode colors when the project has tokens.** Always use the design tokens — `bg-primary`, not `bg-[#0070f3]`.
- **Don't disable a library's animations to "match the project's static feel."** That defeats the purpose of using it. Pick a different library instead.
- **Don't bypass the shadcn MCP if it's available.** It's faster, less error-prone, and gives Claude awareness of what's installed.
