---
name: verify-build
description: Visually verify the built UI in a real browser using the Playwright MCP — navigate the running app, exercise every interactive element (clicks, hovers, form fills), check the console for errors, scan network requests for failed assets, and screenshot multiple viewport sizes to catch responsive regressions. Use this skill whenever frontend code has just been written or changed, even if the user didn't explicitly ask for verification — type-checking and unit tests verify the code, this skill verifies the actual rendered build. Trigger on phrases like "I'm done", "test the page", "check the build", "verify it works", "looks good?", or after any sequence of frontend edits. Make sure to invoke this even when the user says only "ok done" — silent skipping leaves real bugs (broken handlers, hydration errors, mobile layout breaks) undetected.
---

# Verify Build

Use the Playwright MCP browser tools to interact with the running app and collect evidence that the build actually works — not just that the code compiled.

The principle: type checks and unit tests can pass while the rendered UI is broken. A z-index bug hides a button. A CSS regression breaks the mobile layout. A click handler points at undefined. Only a real browser walkthrough catches these. This skill is that walkthrough.

The Playwright MCP tools you'll use are exposed under the `mcp__playwright__` namespace (e.g., `mcp__playwright__browser_navigate`). Throughout this skill they're referenced by their short names (`browser_navigate`, `browser_click`, etc.) for readability.

## When to use this

Trigger this skill after:
- Adding or editing frontend components, pages, or styles
- Wiring up new interactive behavior (forms, modals, navigation, animations)
- Any time the user signals they're done — "test it", "check the build", "make sure it works", "I'm done", "looks good?"

Skip when:
- The change was purely backend with no rendered output difference
- The user explicitly said "don't run the browser" or "just write the code"
- The user is mid-debugging server config and you'd interfere by starting things

## Workflow

### Step 1 — Find the dev server (don't blindly start a new one)

The Playwright tools need a URL. Check first whether the server is already running before starting one:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
```

If you get `200` (or any non-`000` code), use that URL.

If the check fails, start the dev server in the background — never foreground, it'll never return:

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
```

Then poll the log until the "Local:" line appears and **parse the actual URL from it**. Next.js falls through to `:3001`, `:3002`, etc. when ports are taken — hardcoding `:3000` is the #1 reason this kind of check wastes time on a blank page that turns out to be the wrong port.

```bash
until grep -q "Local:" /tmp/dev-server.log 2>/dev/null; do sleep 1; done
grep "Local:" /tmp/dev-server.log | sed -E 's/.*(http[s]?:\/\/[^ ]+).*/\1/'
```

Use that URL for everything downstream.

### Step 2 — Open the page and capture baseline state

Navigate, then immediately collect the three signals that catch most regressions before you click anything:

1. `browser_navigate` to the URL
2. `browser_snapshot` — accessibility tree of every interactive element with refs you can address
3. `browser_console_messages` — anything at level `error` is almost always a real bug. Hydration mismatches, missing keys, and 404'd images are real signals too.
4. `browser_network_requests` — scan for 4xx/5xx. A 404 on a font, image, or `_next/static/chunks/*` chunk means the build is silently broken even if the page rendered something.

If any of those turn up red flags, stop and report. There's no point clicking around a page with a hydration error — the interactions won't behave correctly anyway.

### Step 3 — Walk every interactive element

The snapshot from step 2 lists every button, link, input, select, and aria-interactive element with a ref. Go through them systematically, not selectively — the bug is usually the element you wouldn't have thought to test.

For each element type:

- **Buttons** — `browser_click` and observe what changes. Snapshot before/after, or watch for navigation/dialog. A button that does nothing visible is a bug.
- **Links** — for in-page anchors, click and verify the scroll target appears. For external links, **don't navigate away** — verify the `href` attribute from the snapshot instead, or you'll lose your test session.
- **Hover-revealed UI** (dropdowns, tooltips, popovers) — `browser_hover`, then `browser_snapshot` again to see what appeared. Pure CSS hover states won't show in the snapshot — for those, screenshot before and after the hover.
- **Forms** — `browser_fill_form` with realistic but obviously-fake values (`test@example.com`, `Test User`). Submit and verify the response state — success message, error, navigation. Try one invalid input to confirm validation actually fires.
- **Selects / dropdowns** — `browser_select_option` for at least one non-default value to confirm the change handler runs.

For pages with scroll-triggered animations or lazy-loaded sections, use `browser_press_key` with `"End"` or `"PageDown"` to scroll. Then snapshot again to verify those sections rendered. Prefer key presses over `browser_evaluate` for scrolling — they don't require permission and behave like a real user.

### Step 4 — Verify responsive behavior

Layouts break at breakpoints. Resize and screenshot at each. Save screenshots to a per-run directory so they don't collide:

```bash
SHOT_DIR="/tmp/verify-build/$(date +%s)"
mkdir -p "$SHOT_DIR"
```

Then for each viewport:

- `browser_resize(1440, 900)` → screenshot to `$SHOT_DIR/desktop.png`
- `browser_resize(768, 1024)` → screenshot to `$SHOT_DIR/tablet.png`
- `browser_resize(375, 812)` → screenshot to `$SHOT_DIR/mobile.png`

Take full-page screenshots (the MCP tool has a fullPage option). Look for: text overflow, broken grids, navigation that should have collapsed to a hamburger but didn't, images that lost their aspect ratio, primary CTAs pushed below the fold on mobile.

If a mobile nav exists, click it open and screenshot that state too — the collapsed-nav state is the most common mobile bug, and the closed-nav screenshot won't reveal it.

### Step 5 — Re-check console and network after interactions

Errors often surface only during interaction — a click handler throws, a form submit hits a 500, a route transition fails to fetch its chunk. After steps 3 and 4, run `browser_console_messages` and `browser_network_requests` again. Anything new since step 2 was caused by your interactions and is the most diagnosable kind of bug — you know exactly what you did to trigger it.

### Step 6 — Report

Summarize what you found in this structure:

```
## Build verification report

Pages tested: /, /about, …
Viewports: desktop (1440), tablet (768), mobile (375)

### Passing
- (concise list — only one line per item)

### Warnings
- (non-blocking: console warnings, slow requests, minor visual oddness)

### Failures
- (broken interactions, console errors, failed network requests, layout breaks)
  For each: what you did, what happened, what should have happened, and where in the code to look.
```

If everything passed, say so directly — don't pad the report with hedging. If something failed, lead with the failure and let the user decide whether to fix now or defer.

### Step 7 — Clean up screenshots

Once you've extracted everything you need from the screenshots into the report, delete the per-run directory:

```bash
rm -rf "$SHOT_DIR"
```

The screenshots are scratch evidence used to write the report, not artifacts the user needs to keep. Leaving them around bloats `/tmp` across runs and creates ambiguity about which run a screenshot belongs to.

Three carve-outs where you should pause before deleting:
- **A failure description references "see screenshot"** — if the report points the user at a specific image, keep that one (or describe the issue in enough detail that the screenshot isn't needed) and delete the rest.
- **The user is actively reviewing alongside you** — if they've asked to see a screenshot, keep the directory until they say they're done.
- **You're a sub-agent inside `parallel-variations`** — the parent agent needs the screenshots for cross-variation comparison. Copy `$SHOT_DIR/*` into `<worktree>/.variation-screenshots/` first, then proceed with the normal cleanup. Report the new stable path, not `/tmp`.

In all carve-out cases, mention the path explicitly in the report and offer to clean it up after.

## Patterns that go wrong

- **"Page is blank but no errors in the report"** — usually a hydration mismatch the dev overlay swallowed. Search `browser_console_messages` output for "Hydration failed" specifically.
- **"Looks fine in the screenshot but interactions don't work"** — JavaScript bundle failed to load. Check `browser_network_requests` for 404s on `_next/static/chunks/*`.
- **"Works at desktop but mobile is broken"** — almost always a missing responsive Tailwind variant or a fixed `width:` that should be `max-width:`. The mobile screenshot will show the symptom.
- **"Form submits but nothing happens"** — handler fired but the response was a 5xx. The form's POST in the network requests will show it.
- **"Hover state isn't showing"** — pure CSS `:hover` doesn't appear in the accessibility snapshot. Confirm with a before/after screenshot, not just a snapshot diff.

## Don't do these

- Don't assume the page works because `browser_snapshot` succeeded. The tool only fails if the page completely failed to load — it returns a happy snapshot of a broken page.
- Don't rely solely on screenshots. They hide JavaScript errors and broken interactivity. Always pair screenshots with console + network checks.
- Don't skip the mobile viewport because "the user only mentioned desktop." Most users see the page on mobile, and mobile bugs are the most embarrassing ones to ship.
- Don't navigate to external URLs from the test page — you'll lose your session. Verify external links from their `href` in the snapshot instead.
- Don't start a new dev server without checking first. If one is already running on `:3000`, your `npm run dev` will silently fall through to `:3001` and you'll test the wrong app.
