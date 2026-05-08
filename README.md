# Claude Design resource pack

A drop-in resource pack for Claude Code that gives you everything Claude Design does — and more — while keeping you in real code, on your usual usage limits, and in your existing git workflow. Companion to the AI Labs video on Claude Design vs. Claude Code.

The pack is six skills, an MCP config, a `CLAUDE.md`, and a permission allowlist. Drop them in, and Claude Code auto-loads them. There's nothing else to wire up.

## What's inside

```
.mcp.json                                shadcn + Playwright MCP servers
CLAUDE.md                                design-tuned project memory Claude reads on every turn
.claude/settings.json                    permission allowlist tuned for the design workflow
skills/
├── design-interview/                    multiple-choice Q&A intake before any visual task
├── verify-build/                        Playwright walkthrough after any frontend change
├── scrollytelling/                      scroll-driven storytelling, parallax, pinned reveals
├── parallel-variations/                 explore N design directions in parallel via git worktrees
├── hero-video-background/               cinematic landing-page hero built around a video
└── ui-libraries/                        pick + install shadcn / Aceternity / HeroUI / Magic UI / Tremor
```

## Install

1. Copy the four top-level items into your project root:

   ```
   .mcp.json
   CLAUDE.md
   .claude/
   skills/
   ```

   If you already have any of these, merge them rather than overwriting — preserve your project-specific settings and memory.

2. Open the project in Claude Code. The first time it loads:
   - You'll be prompted to approve the MCP servers (`shadcn` and `playwright`). Approve both.
   - The `.claude/settings.json` permission rules apply automatically.
   - Skills are auto-discovered from `skills/` — no registration step needed.

3. Verify the MCPs are alive:

   ```
   /mcp
   ```

   You should see `shadcn` and `playwright` listed with status `connected`. If either is missing or shows an error, the most common cause is that `npx` couldn't reach the registry on first install — try once from your terminal:

   ```bash
   npx -y shadcn@latest --version
   npx -y @playwright/mcp@latest --help
   ```

   These prime the npm cache and fail loudly if there's a network or permission problem. Don't run the bare `mcp` command yourself — it launches the server in stdio mode and hangs waiting for Claude Code to talk to it.

## Workflow

The skills compose. A typical visual task flows like this:

```
1. You: "Build a landing page for my note-taking app."
2. Claude triggers design-interview → asks 3–4 multiple-choice questions, writes a brief
3. You confirm the brief
4. Claude triggers ui-libraries → checks what's installed, picks shadcn primitives
5. (Optional) you ask for "a few variations" → parallel-variations spawns sub-agents in worktrees
6. (Optional) you provide a video → hero-video-background runs the video-hero recipe
7. (Optional) you ask for scroll motion → scrollytelling kicks in
8. Claude triggers verify-build → Playwright walks the page at desktop / tablet / mobile
9. Claude reports back with what passed, what failed, and screenshots
```

You don't manually invoke skills. They trigger themselves on the right phrases. If you want to force one, type the phrase from its description (e.g. "show me a few variations" for `parallel-variations`).

## Skills at a glance

### design-interview
Runs a structured multiple-choice Q&A using the `AskUserQuestion` tool to capture audience, goal, layout, style, and content **before** any code is written. Synthesizes a one-screen brief, gets your sign-off, hands off to the build step. Includes a question library and a catalog of ASCII layout previews bundled in `references/`.

### verify-build
After any frontend change, drives Playwright to navigate the running app, exercise every interactive element, scan console + network for errors, and screenshot at three viewports. Catches the broken-on-mobile / broken-handler / hydration-error class of bugs that type checks miss.

### scrollytelling
The upstream skill from [`doodledood/claude-code-plugins`](https://github.com/doodledood/claude-code-plugins) (frontend-design plugin), pulled in unmodified. Picks the right technique for each scroll-driven beat — IntersectionObserver fade-ins, GSAP ScrollTrigger pins, scroll-snap, native CSS `scroll-timeline`, Lenis for smooth scroll — instead of reaching for the heaviest tool by default.

### parallel-variations
Spawns 2–4 sub-agents in isolated git worktrees, each implementing a different variation of the same brief on its own branch. You compare them side-by-side, merge the winner, and tear down the losers with `git worktree remove`. Includes copy-paste prompt templates for the four most common variation axes (style, layout, library, motion).

### hero-video-background
Builds a landing page hero around a user-supplied video. Inspects the file with `ffprobe`, generates a poster image and mobile re-encode if needed, sets up the `<video>` tag with the five attributes that all matter (`muted`, `loop`, `playsinline`, `poster`, `preload`), layers an accessible overlay, and matches the rest of the page register to the video's mood. Handles `prefers-reduced-motion` and slow-network fallback.

### ui-libraries
Stops Claude from hand-rolling a 200-line `<div>` button when `npx shadcn add button` would do. Checks what's already in `package.json`, picks the best library for the request (shadcn for primitives, Aceternity for animated marketing, HeroUI for batteries-included, Tremor for dashboards, Magic UI for polish), uses the shadcn MCP to install when available, and tells Claude when *not* to add a library.

## Why this pack instead of Claude Design

The video covers this in detail. Quick version:

- **Real code, not throwaway prototypes.** Everything ships into your project's actual stack.
- **Your normal usage limits.** Claude Design is billed and rate-limited separately, and runs out fast. Claude Code uses your usual limits, which means you can iterate freely.
- **Git-managed exploration.** `parallel-variations` puts each design direction on its own branch in its own worktree. Pick the winner, merge it, throw the rest away cleanly.
- **Composable.** Skills compose with each other and with anything else you add (your own skills, other MCP servers, your existing CLAUDE.md).

## Customizing

Treat every file in this pack as a starting point, not gospel:

- **`CLAUDE.md`** — add your project's stack assumptions, design tokens, and conventions. Keep the skills section so Claude knows what's available.
- **`.claude/settings.json`** — add allow rules for your project's specific scripts (`Bash(npm run my-script:*)`). Loosen or tighten as you like.
- **`.mcp.json`** — add other MCPs you use (Linear, Figma, Notion, etc.) alongside shadcn and Playwright.
- **Skills** — every `SKILL.md` is a markdown file. Edit anti-patterns, swap libraries, change the trigger phrases. Skills are just instructions to the model.

## Credits

- **scrollytelling** — by [doodledood/claude-code-plugins](https://github.com/doodledood/claude-code-plugins). Pulled in unmodified.
- **design-interview**, **verify-build**, **parallel-variations**, **hero-video-background**, **ui-libraries** — written for the AI Labs Claude Design video.

## SF Pro & SF Symbols setup

`public/fonts/` and `public/sf-symbols/` are **gitignored** because they're regenerable from the local macOS install. Run these once after a fresh clone (or when SF Symbols ships a new version).

### SF Pro

Apple's font license permits use for UI mockups. Install the official package once, then copy the static `.otf` weights the project uses into `public/fonts/`.

1. Download SF Pro from https://developer.apple.com/fonts/ and run the installer (drops files in `/Library/Fonts/`).
2. Copy the weights wired into `app/globals.css` `@font-face` rules:

   ```bash
   mkdir -p public/fonts
   cd /Library/Fonts && cp \
     SF-Pro-Text-Regular.otf SF-Pro-Text-RegularItalic.otf \
     SF-Pro-Text-Medium.otf SF-Pro-Text-Semibold.otf SF-Pro-Text-Bold.otf \
     SF-Pro-Display-Regular.otf SF-Pro-Display-Medium.otf \
     SF-Pro-Display-Semibold.otf SF-Pro-Display-Bold.otf \
     "$OLDPWD/public/fonts/" && cd -
   ```

   `font-sans` (Tailwind) → SF Pro Text. `font-display` → SF Pro Display.

### SF Symbols

Bulk-exported as SVG from the local macOS Assets.car using [yapstudios/sfsym](https://github.com/yapstudios/sfsym), then consumed by `<SFSymbol name="…" />` (`components/icons/SFSymbol.tsx`).

1. Install the CLI:

   ```bash
   brew install yapstudios/tap/sfsym
   ```

2. Dump every symbol (~8,300 SVGs, ~34MB) into `public/sf-symbols/`:

   ```bash
   mkdir -p public/sf-symbols && cd public/sf-symbols && \
     sfsym list | awk '{print $1 " -f svg -o " $1 ".svg"}' | sfsym batch && \
     cd -
   ```

3. Use it:

   ```tsx
   import { SFSymbol } from "@/components/icons/SFSymbol";

   <SFSymbol name="heart.fill" size="s" className="text-foreground" />
   ```

   The component inlines the SVG and rewrites the fill to `currentColor`, so any text-color utility recolors it. Sizes: `xs`(16) `s`(24) `m`(32) `l`(40) — matching `IconSize.swift` — or pass a numeric pixel size.

> **License note.** SF Symbols are restricted by Apple to UI for Apple-platform apps. Use them when prototyping SwiftUI views for an iOS app you're shipping. Don't ship these SVGs to a public marketing site.

## Issues

If a skill triggers when it shouldn't, the description in its YAML frontmatter is too eager — narrow it. If a skill *doesn't* trigger when it should, the description is too narrow — add the missing trigger phrases. The descriptions are the only thing Claude reads at trigger time, so they're where to make changes.
