---
name: design-interview
description: Run a structured, multiple-choice Q&A session to capture design intent before writing a single line of code for any visual or UI work — landing pages, websites, hero sections, dashboards, slide decks, one-pagers, marketing pages, prototypes, mockups, or standalone UI components. Use this skill whenever the user prompts for a visual or UI task and the prompt leaves key facets undefined (audience, goal, style/tone, layout, content, palette, stack, fidelity, interactivity, responsiveness). This skill brings the interview-first intake discipline of Claude Design into Claude Code so Claude stops guessing at intent and starts with a confirmed brief. Make sure to trigger this skill even when the user doesn't explicitly ask to be interviewed — if the request is visual and under-specified, run the interview.
---

# Design Interview

Gather design intent through a short, targeted Q&A session using the `AskUserQuestion` tool, then synthesize a one-screen brief, get the user's sign-off, and hand off to the implementation step.

The goal is **not** to ask everything. The goal is to ask only what's missing *and* decision-impacting, so the user spends 30–60 seconds on inputs instead of rewriting the output three times.

## Bundled references

Three reference files sit next to this SKILL.md — don't load them until you need them:

- **`references/question-library.md`** — copy-paste JSON payloads for every common facet (audience, goal, style, tone, layout, sections, palette, fidelity, interactivity, responsiveness, stack, dashboard density, deck length). Read this when you're about to draft an `AskUserQuestion` call and want proven templates rather than writing from scratch.
- **`references/ascii-previews.md`** — catalog of ASCII mockups sized for the `preview` field (landing page variants, dashboards, pricing layouts, nav patterns, deck layouts, component states). Read this when a layout or visual-structure question needs side-by-side previews.
- **`references/examples.md`** — three end-to-end worked examples (marketing landing page, internal dashboard, pricing component). Read this if you're unsure how triage-to-brief should feel end to end, or when a new task type doesn't map cleanly to the matrix below.

## When to trigger

Trigger when the user asks for any of:

- A landing page, marketing page, hero section, pricing page, about page
- A dashboard, admin panel, settings screen, data view
- A website (multi-page or single-page)
- A deck, slide, or one-pager
- A prototype or mockup
- A standalone UI component (nav, card, form, modal)
- Any "design me / build me / make me a …" request with a visual output

**Skip the interview when:**

- The prompt is already richly specified (goal + audience + style + content all present) — in that case, confirm in one sentence and proceed.
- The task is a tiny tweak to existing code (color change, copy edit, single prop).
- The user explicitly says "just build it" / "don't ask, make assumptions" / "surprise me" — respect that.
- There's a design system or reference file (`design.md`, Figma export, existing pages) the user has already pointed to — read that first, only ask about what it doesn't cover.

## Flow (two phases)

### Phase 1 — Interview

1. **Gap analysis.** Read the prompt and any referenced files. Mentally score each facet below as *specified*, *implied*, or *missing*. Only missing and decision-impacting facets become questions.
2. **Pick the top 2–4 gaps** using the task-type matrix below. Don't ask about everything — batch what matters most.
3. **Ask with `AskUserQuestion`.** Bundle up to 4 questions in a single call. Use ASCII previews for layout/visual choices. Never dump questions as a numbered list in chat — always route through the tool.
4. **One follow-up at most.** If answers reveal a new fork (e.g. user picks "dashboard" → now you need to know which charts), do one more `AskUserQuestion` call. Stop there.

### Phase 2 — Synthesize and confirm

5. **Write a short brief** (10–15 lines) summarizing the collected intent. This is the Claude Code equivalent of Claude Design's rendered canvas — a durable artifact the user can redirect before code is written.
6. **Show the brief, ask for sign-off in plain text** ("Does this match what you want? Anything to change before I start?"). Don't use `AskUserQuestion` for this confirmation — free-text feedback is better here.
7. **On approval, proceed to build.** Keep the brief visible in your working notes so you can reference it during implementation.

## Facet matrix by task type

Not every facet matters for every task. Use this to triage:

| Task type | Critical facets | Medium priority | Low priority |
|---|---|---|---|
| Marketing/landing page | Audience, primary goal (sign-up? buy? learn?), tone, hero message | Style, palette, sections | Stack (only if unspecified) |
| Hero section / component | Style, tone, content/copy | Palette, responsiveness | Stack |
| Dashboard / admin | Data shown, primary user action, information density | Style, interactivity | Tone |
| Deck / one-pager | Audience, goal of talk, length, tone | Visual style, palette | Stack |
| Prototype / mockup | Fidelity (wireframe vs polished), interactivity level, screens needed | Style, audience | Palette |
| Standalone component | Exact API/props, states (hover/active/disabled), responsiveness | Style, palette | Audience |

When in doubt: **audience + goal + one aesthetic choice** covers 80% of intent for most visual tasks.

## How to ask — AskUserQuestion rules

The `AskUserQuestion` tool has constraints. Follow them exactly:

- **1–4 questions per call.** Batch related questions together.
- **2–4 options per question.** No more. No less.
- **Do not add an "Other" option** — the tool adds one automatically.
- **`header` ≤ 12 chars.** Use tight labels like "Audience", "Tone", "Layout", "Fidelity".
- **`label` is 1–5 words.** Keep option titles punchy.
- **`description`** is where the trade-off lives — one sentence, concrete.
- **Recommended defaults:** when you have a sensible default, put it first and suffix its label with " (Recommended)".
- **Previews are single-select only.** For layout or visual choices, pass an ASCII mockup in `preview`. The UI renders it in a side-by-side monospace box, which is the closest analogue in Claude Code to Claude Design's visual canvas. Do not put previews on `multiSelect: true` questions.
- **Phrase multi-select questions accordingly** ("Which sections do you want?") and set `multiSelect: true`.

## Good question patterns

For copy-paste JSON payloads covering every facet below (and more), see **`references/question-library.md`**. The patterns here are illustrative — for actual calls, pull from the library.

### Pattern 1 — Audience + Goal (most marketing tasks)

**Example call:**

Question 1: "Who is this page primarily for?"
- header: "Audience"
- options:
  - "Developers evaluating a tool" — "Tech-literate, wants specs, code samples, honest trade-offs"
  - "Business buyers / PMs" — "Wants outcomes, social proof, ROI framing"
  - "General consumers" — "Wants clarity, minimal jargon, emotional hook"

Question 2: "What's the single most important action you want visitors to take?"
- header: "Primary CTA"
- options:
  - "Sign up / start free" — "Frictionless top-of-funnel"
  - "Book a demo" — "Higher-intent lead capture"
  - "Read docs / learn more" — "Content-first, no sales push"

### Pattern 2 — Layout preview (when structure is ambiguous)

Use `preview` with short ASCII mockups. A full catalog lives in **`references/ascii-previews.md`** — pull from there instead of drawing new ones inline. Example for a landing page:

```
Option A — Centered hero, logo strip, 3-col features
┌──────────────────────────┐
│  [Logo]           [Nav]  │
│                          │
│     BIG HEADLINE HERE    │
│     subhead subhead      │
│        [ CTA ]           │
│                          │
│ ── logos logos logos ──  │
│                          │
│ [Feat] [Feat] [Feat]     │
└──────────────────────────┘
```

vs.

```
Option B — Split hero, screenshot right, inline CTA
┌──────────────────────────┐
│  [Logo]           [Nav]  │
│                          │
│ HEADLINE     ┌────────┐  │
│ subhead      │ screen │  │
│ [CTA][sec]   │ shot   │  │
│              └────────┘  │
│                          │
│ How it works: 1 → 2 → 3  │
└──────────────────────────┘
```

Set `multiSelect: false` so previews render. First option should be the one you'd recommend, suffixed with "(Recommended)".

### Pattern 3 — Multi-select for sections

When asking which sections to include, set `multiSelect: true` and drop previews:

Question: "Which sections do you want on the page?"
- header: "Sections"
- multiSelect: true
- options:
  - "Hero + CTA" — "Above-the-fold pitch"
  - "Social proof / logos" — "Trust builders"
  - "Feature grid" — "3–6 feature cards"
  - "Pricing" — "Inline pricing table"

### Pattern 4 — Tone and style

Keep style questions concrete, not abstract. Bad: "What vibe?". Good:

Question: "Which visual register fits best?"
- header: "Style"
- options:
  - "Minimal / editorial" — "Lots of whitespace, serif or neutral sans, restrained color"
  - "Bold / modern SaaS" — "Big type, gradients or accent color, generous padding"
  - "Playful / illustrated" — "Rounded shapes, illustration accents, warm palette"
  - "Technical / utilitarian" — "Dense, grid-aligned, monospace accents, developer-flavored"

## Synthesizing the brief

After the questions, write a brief in this exact shape:

```
## Design brief

- **Task:** <one line — what we're building>
- **Audience:** <from Q>
- **Primary goal:** <from Q>
- **Style / tone:** <from Q>
- **Layout:** <from Q — reference the chosen preview if applicable>
- **Sections / content:** <from Q>
- **Stack:** <stated or inferred — e.g. "Next.js + Tailwind" or "plain HTML/CSS">
- **Out of scope:** <anything the user deprioritized>

Does this match what you want? Anything to change before I start?
```

Then stop and wait for free-text confirmation. **Do not** use `AskUserQuestion` for the confirmation step — the user often wants to tweak one detail, and free text is better for that than multiple choice.

## Anti-patterns — do not do these

- **Do not list questions as chat text.** Always use `AskUserQuestion`. This is the whole point of the skill.
- **Do not ask 8 questions.** If you feel the urge, you're missing the triage step — re-read the prompt and cut to the top 2–4 gaps.
- **Do not invent facts about Claude Design's own questions.** This skill brings design-brief discipline *like* Claude Design's intake; it does not claim to mirror its exact questions.
- **Do not ask about the stack if the user is already in a project** where the stack is obvious from the files (package.json, existing framework). Read first, ask second.
- **Do not ask before you've read the working directory.** If a `design.md`, existing pages, or referenced Figma/file is present, read it first — half your questions may already be answered.
- **Do not skip the brief.** The written brief is the confirmation artifact; without it, the user can't redirect cheaply.
- **Do not treat "Other" as a failure.** If the user picks Other and types a custom answer, absorb it into the brief and move on.

## When the user pushes back

- "Just build it" → Skip interview. Make your best guess, note the assumptions in the brief header ("Assumed: audience=devs, style=minimal — say if wrong"), build.
- "I don't know, you pick" → Pick the recommended option for each missing facet, write the brief, let them redirect from there.
- "Ask me fewer questions" → Drop to the single most load-bearing gap (usually audience or goal), ask that one, skip the rest.
- "Ask me more / I want to go deep" → Do the normal round, then offer a second `AskUserQuestion` round for medium-priority facets.

## Minimal example — end-to-end

User: "Build me a landing page for my new API monitoring tool."

1. Gap analysis: task=landing page; audience=missing; goal=missing; style=missing; layout=missing; content=partial (we know it's an API monitoring tool).
2. One `AskUserQuestion` call with 3 questions: Audience (devs vs platform teams vs general), Primary CTA (sign up vs demo vs docs), Layout (two ASCII previews).
3. User picks: devs / sign up / split hero layout.
4. Synthesize brief, show it, ask for confirmation.
5. User says "yes, also add a 'view on GitHub' link". Note that, proceed to build.

Total: ~45 seconds of user time, zero guessing, zero rewrites.

Two more worked examples (internal dashboard, pricing component) live in **`references/examples.md`**.
