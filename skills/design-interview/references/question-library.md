# Question Library

Ready-to-use `AskUserQuestion` payloads, grouped by facet. Copy the relevant objects into your `questions` array. Mix and match — you're allowed 1–4 questions per call.

## Table of contents

- [Audience](#audience)
- [Primary goal / CTA](#primary-goal--cta)
- [Visual style](#visual-style)
- [Tone](#tone)
- [Layout (with preview)](#layout-with-preview)
- [Sections](#sections)
- [Palette](#palette)
- [Fidelity (prototypes)](#fidelity-prototypes)
- [Interactivity](#interactivity)
- [Responsiveness](#responsiveness)
- [Stack](#stack)
- [Data density (dashboards)](#data-density-dashboards)
- [Slide count / deck length](#slide-count--deck-length)

All examples use JSON-compatible shape so they drop straight into the tool call.

---

## Audience

```json
{
  "question": "Who is this primarily for?",
  "header": "Audience",
  "multiSelect": false,
  "options": [
    { "label": "Developers", "description": "Tech-literate. Wants specs, code samples, honest trade-offs." },
    { "label": "Business buyers / PMs", "description": "Wants outcomes, social proof, ROI framing." },
    { "label": "General consumers", "description": "Wants clarity, minimal jargon, emotional hook." },
    { "label": "Internal team", "description": "Knows the domain. Optimize for density over polish." }
  ]
}
```

---

## Primary goal / CTA

```json
{
  "question": "What's the single most important action a visitor should take?",
  "header": "Primary CTA",
  "multiSelect": false,
  "options": [
    { "label": "Sign up / start free", "description": "Frictionless top-of-funnel." },
    { "label": "Book a demo", "description": "Higher-intent lead capture." },
    { "label": "Read docs / learn more", "description": "Content-first, no sales push." },
    { "label": "Buy now", "description": "Direct conversion, pricing up front." }
  ]
}
```

For non-page work (decks, components), swap in:

```json
{
  "question": "What should this artifact accomplish?",
  "header": "Goal",
  "multiSelect": false,
  "options": [
    { "label": "Persuade a decision", "description": "Pitch-flavored, one clear ask." },
    { "label": "Explain a concept", "description": "Teaching-flavored, prioritize clarity." },
    { "label": "Showcase progress", "description": "Status-update flavored, numbers and outcomes." },
    { "label": "Kick off a project", "description": "Brief-flavored, scope and next steps." }
  ]
}
```

---

## Visual style

```json
{
  "question": "Which visual register fits best?",
  "header": "Style",
  "multiSelect": false,
  "options": [
    { "label": "Minimal / editorial", "description": "Whitespace-forward. Serif or neutral sans. Restrained color." },
    { "label": "Bold modern SaaS", "description": "Big type. Gradients or one accent color. Generous padding." },
    { "label": "Playful illustrated", "description": "Rounded shapes. Illustration accents. Warm palette." },
    { "label": "Technical utilitarian", "description": "Dense, grid-aligned. Monospace accents. Developer-flavored." }
  ]
}
```

---

## Tone

```json
{
  "question": "What tone should the copy hit?",
  "header": "Tone",
  "multiSelect": false,
  "options": [
    { "label": "Confident & direct", "description": "Short sentences. Claims over hedges. No filler." },
    { "label": "Friendly & warm", "description": "Conversational. Second person. Light humor OK." },
    { "label": "Authoritative & expert", "description": "Precise terminology. Citations or specifics. No hype." },
    { "label": "Playful & irreverent", "description": "Jokes welcome. Personality over polish." }
  ]
}
```

---

## Layout (with preview)

Previews only work on single-select. Keep mockups tight — 8–14 lines each. See [ascii-previews.md](ascii-previews.md) for the full catalog.

```json
{
  "question": "Which layout structure fits?",
  "header": "Layout",
  "multiSelect": false,
  "options": [
    {
      "label": "Centered hero (Recommended)",
      "description": "Single focal point. Works when the headline is the star.",
      "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│                          │\n│     BIG HEADLINE HERE    │\n│     subhead subhead      │\n│        [ CTA ]           │\n│                          │\n│ ── logos logos logos ──  │\n│ [Feat] [Feat] [Feat]     │\n└──────────────────────────┘"
    },
    {
      "label": "Split hero with visual",
      "description": "Copy left, product shot or demo right. Works when visual is strong.",
      "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│                          │\n│ HEADLINE     ┌────────┐  │\n│ subhead      │ screen │  │\n│ [CTA][sec]   │ shot   │  │\n│              └────────┘  │\n│                          │\n│ How it works: 1 → 2 → 3  │\n└──────────────────────────┘"
    },
    {
      "label": "Full-bleed visual",
      "description": "Image or video fills the fold, copy overlaid. Highest emotional punch.",
      "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│ ░░░░░░░░░░░░░░░░░░░░░░░  │\n│ ░░  HEADLINE OVERLAY  ░  │\n│ ░░  subhead           ░  │\n│ ░░  [ CTA ]           ░  │\n│ ░░░░░░░░░░░░░░░░░░░░░░░  │\n│                          │\n│ Features below fold...   │\n└──────────────────────────┘"
    }
  ]
}
```

---

## Sections

Multi-select, no previews.

```json
{
  "question": "Which sections do you want?",
  "header": "Sections",
  "multiSelect": true,
  "options": [
    { "label": "Hero + primary CTA", "description": "Above-the-fold pitch." },
    { "label": "Social proof / logos", "description": "Trust builders." },
    { "label": "Feature grid", "description": "3–6 feature cards." },
    { "label": "How it works", "description": "Numbered steps or timeline." },
    { "label": "Pricing", "description": "Inline pricing table." },
    { "label": "FAQ", "description": "Collapsible Q&A." },
    { "label": "Final CTA banner", "description": "Bottom-of-page push." }
  ]
}
```

(Pick the 3–4 most relevant for the task — the tool caps at 4 options, so split into two questions if more are needed.)

---

## Palette

```json
{
  "question": "Color direction?",
  "header": "Palette",
  "multiSelect": false,
  "options": [
    { "label": "Monochrome + one accent", "description": "Neutral greys/blacks with a single bold accent color." },
    { "label": "Warm (orange/red/amber)", "description": "Energetic, human, approachable." },
    { "label": "Cool (blue/teal/indigo)", "description": "Trustworthy, calm, tech-industry default." },
    { "label": "High-contrast dark mode", "description": "Dark background, saturated accents, developer-flavored." }
  ]
}
```

---

## Fidelity (prototypes)

```json
{
  "question": "What fidelity should the prototype hit?",
  "header": "Fidelity",
  "multiSelect": false,
  "options": [
    { "label": "Wireframe", "description": "Boxes and labels only. Fast to build, easy to redirect." },
    { "label": "Greybox", "description": "Realistic layout, placeholder content, no brand styling." },
    { "label": "Polished (Recommended)", "description": "Real copy, real styling, production-adjacent." }
  ]
}
```

---

## Interactivity

```json
{
  "question": "How interactive should it be?",
  "header": "Interactivity",
  "multiSelect": false,
  "options": [
    { "label": "Static", "description": "No JS. Links and anchors only." },
    { "label": "Light interactivity", "description": "Dropdowns, tabs, form validation. No state management." },
    { "label": "Fully interactive", "description": "Real state, transitions, maybe animations." }
  ]
}
```

---

## Responsiveness

```json
{
  "question": "Which breakpoints matter?",
  "header": "Devices",
  "multiSelect": true,
  "options": [
    { "label": "Desktop (Recommended)", "description": "1024px+. Primary target." },
    { "label": "Tablet", "description": "768–1024px. Adjust grid and font sizes." },
    { "label": "Mobile", "description": "<768px. Stack everything, hamburger nav." }
  ]
}
```

---

## Stack

Only ask if the stack isn't obvious from the project files. Check `package.json`, existing framework files first.

```json
{
  "question": "What stack should this use?",
  "header": "Stack",
  "multiSelect": false,
  "options": [
    { "label": "Plain HTML + CSS", "description": "Single file. Zero build step." },
    { "label": "HTML + Tailwind CDN", "description": "Single file. Utility classes via CDN." },
    { "label": "Next.js + Tailwind", "description": "Full app scaffold. React components." },
    { "label": "Vite + React", "description": "Lightweight dev server. No SSR." }
  ]
}
```

---

## Data density (dashboards)

```json
{
  "question": "How dense should the dashboard be?",
  "header": "Density",
  "multiSelect": false,
  "options": [
    { "label": "Single hero metric", "description": "One number front and center, supporting detail below." },
    { "label": "3–5 primary cards", "description": "Balanced. The default for most dashboards." },
    { "label": "Dense grid", "description": "10+ metrics. Tables, sparklines, small type." }
  ]
}
```

---

## Slide count / deck length

```json
{
  "question": "How many slides / pages?",
  "header": "Length",
  "multiSelect": false,
  "options": [
    { "label": "1 (one-pager)", "description": "Single scroll. Everything above the fold." },
    { "label": "3–5 (short deck)", "description": "Intro, core point, ask. Tight pitch." },
    { "label": "8–12 (standard)", "description": "Full arc with sections." },
    { "label": "15+ (long-form)", "description": "Quarterly-review-sized." }
  ]
}
```

---

## Full example — a complete call

Landing page for an API monitoring tool, three facets missing (audience, CTA, layout):

```json
{
  "questions": [
    {
      "question": "Who is this primarily for?",
      "header": "Audience",
      "multiSelect": false,
      "options": [
        { "label": "Developers (Recommended)", "description": "Tech-literate. Wants specs, code samples, trade-offs." },
        { "label": "Platform / SRE teams", "description": "Wants reliability, SLAs, incident workflows." },
        { "label": "Engineering leadership", "description": "Wants ROI, coverage, compliance framing." }
      ]
    },
    {
      "question": "What's the single most important action?",
      "header": "Primary CTA",
      "multiSelect": false,
      "options": [
        { "label": "Start free (Recommended)", "description": "Self-serve top-of-funnel." },
        { "label": "Book a demo", "description": "Higher-intent, sales-assist." },
        { "label": "View on GitHub", "description": "Community-first, trust through openness." }
      ]
    },
    {
      "question": "Which layout structure fits?",
      "header": "Layout",
      "multiSelect": false,
      "options": [
        {
          "label": "Split hero (Recommended)",
          "description": "Copy left, live dashboard screenshot right. Works because the product is visual.",
          "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│                          │\n│ HEADLINE     ┌────────┐  │\n│ subhead      │ dash   │  │\n│ [Start][Git] │ board  │  │\n│              └────────┘  │\n└──────────────────────────┘"
        },
        {
          "label": "Centered hero",
          "description": "Headline + CTA, product shot below. Works when the message is the star.",
          "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│                          │\n│     BIG HEADLINE         │\n│     subhead              │\n│   [Start] [GitHub]       │\n│ ┌──────────────────┐     │\n│ │  dashboard shot  │     │\n│ └──────────────────┘     │\n└──────────────────────────┘"
        }
      ]
    }
  ]
}
```

Three questions, each 3 options, one with previews. Roughly 30–45 seconds of user time.
