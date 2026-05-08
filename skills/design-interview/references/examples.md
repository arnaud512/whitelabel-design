# Worked Examples

Three end-to-end interview runs showing prompt → gap analysis → `AskUserQuestion` call → brief → build handoff. Use these as templates when you're unsure how the flow should feel.

---

## Example 1 — Landing page (marketing)

**User prompt:** "Build me a landing page for my new API monitoring tool."

### Step 1 — Gap analysis

| Facet | Status |
|---|---|
| Task type | specified — landing page |
| Product domain | specified — API monitoring |
| Audience | **missing** |
| Primary CTA | **missing** |
| Style | **missing** |
| Layout | **missing** |
| Sections | partially implied (hero + features typical) |
| Stack | check project files first |

Critical gaps: audience, CTA, layout. Those are the top 3.

### Step 2 — `AskUserQuestion` call

Three questions in one batch, layout uses previews:

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
        { "label": "Book a demo", "description": "Higher-intent sales-assist." },
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
          "description": "Copy left, dashboard screenshot right.",
          "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│ HEADLINE     ┌────────┐  │\n│ subhead      │ dash   │  │\n│ [Start][Git] │ board  │  │\n│              └────────┘  │\n└──────────────────────────┘"
        },
        {
          "label": "Centered hero",
          "description": "Headline + CTA, product shot below.",
          "preview": "┌──────────────────────────┐\n│ [Logo]           [Nav]   │\n│     BIG HEADLINE         │\n│   [Start] [GitHub]       │\n│ ┌──────────────────┐     │\n│ │  dashboard shot  │     │\n│ └──────────────────┘     │\n└──────────────────────────┘"
        }
      ]
    }
  ]
}
```

### Step 3 — User answers

Answers come back: developers / start free / split hero.

### Step 4 — Brief

```
## Design brief

- **Task:** Landing page for an API monitoring tool
- **Audience:** Developers
- **Primary goal:** Sign-ups ("Start free" as primary CTA, GitHub link as secondary)
- **Style / tone:** Technical-utilitarian, confident and direct (inferred from dev audience — will confirm during build)
- **Layout:** Split hero — copy left, dashboard screenshot right
- **Sections:** Hero + CTA, logos/social proof, feature grid, how it works, final CTA
- **Stack:** Plain HTML + Tailwind (working directory is empty, so a single self-contained file)
- **Out of scope:** Pricing (not mentioned), FAQ

Does this match what you want? Anything to change before I start?
```

### Step 5 — User confirms with a tweak

User: "yes, also add a 'view on GitHub' link in the nav."

Note the addition to the brief and proceed to build.

---

## Example 2 — Dashboard (internal tool)

**User prompt:** "I need a dashboard for our support team to see ticket trends."

### Step 1 — Gap analysis

| Facet | Status |
|---|---|
| Task type | specified — dashboard |
| Audience | specified — support team (internal) |
| Data shown | **missing** |
| Primary user action | **missing** |
| Density | **missing** |
| Style | low priority for internal tool |
| Stack | check project files |

Critical gaps: data shown, primary user action, density.

### Step 2 — `AskUserQuestion` call

```json
{
  "questions": [
    {
      "question": "What data should lead the dashboard?",
      "header": "Data",
      "multiSelect": true,
      "options": [
        { "label": "Ticket volume over time", "description": "Line or bar chart." },
        { "label": "Resolution time / SLA", "description": "Gauge or histogram." },
        { "label": "Category breakdown", "description": "Pie or stacked bar." },
        { "label": "Agent performance", "description": "Table of agents with key metrics." }
      ]
    },
    {
      "question": "What's the main action someone takes here?",
      "header": "Action",
      "multiSelect": false,
      "options": [
        { "label": "Spot anomalies (Recommended)", "description": "Monitor-and-scan — prioritize big-picture charts." },
        { "label": "Drill into one ticket", "description": "Overview plus searchable list." },
        { "label": "Share a weekly report", "description": "Print-friendly, export-ready." }
      ]
    },
    {
      "question": "How dense should it be?",
      "header": "Density",
      "multiSelect": false,
      "options": [
        {
          "label": "3–5 primary cards (Recommended)",
          "description": "Balanced. The default.",
          "preview": "┌──────────────────────────┐\n│ [Logo] Home Data Logs    │\n│ ┌──────┐ ┌──────┐ ┌─────┐│\n│ │ kpi  │ │ kpi  │ │ kpi ││\n│ └──────┘ └──────┘ └─────┘│\n│ ┌──────────────────────┐ │\n│ │  big chart           │ │\n│ └──────────────────────┘ │\n└──────────────────────────┘"
        },
        {
          "label": "Single hero metric",
          "description": "One number front and center.",
          "preview": "┌──────────────────────────┐\n│        ┌─────────┐       │\n│        │  42,318 │       │\n│        │ +12% ▲  │       │\n│        └─────────┘       │\n│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ │\n│  │spk│ │spk│ │spk│ │spk│ │\n│  └───┘ └───┘ └───┘ └───┘ │\n└──────────────────────────┘"
        },
        {
          "label": "Dense grid",
          "description": "10+ metrics, tables and sparklines.",
          "preview": "┌──────────────────────────┐\n│ ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐│\n│ └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘│\n│ ┌───────┐ ┌────────────┐ │\n│ │ table │ │   chart    │ │\n│ └───────┘ └────────────┘ │\n│ ┌────┐┌────┐┌────┐       │\n│ │card││card││card│       │\n│ └────┘└────┘└────┘       │\n└──────────────────────────┘"
        }
      ]
    }
  ]
}
```

### Step 3 — Brief

```
## Design brief

- **Task:** Internal support-team dashboard
- **Audience:** Support team (internal, domain-fluent)
- **Primary action:** Spot anomalies at a glance
- **Data shown:** Ticket volume over time + resolution time/SLA + category breakdown
- **Density:** 3–5 primary cards with a large chart below
- **Style:** Utilitarian, information-dense over brand polish
- **Stack:** Matches existing project (e.g. Next.js + Recharts, if that's what's in package.json)

Does this match what you want? Anything to change before I start?
```

---

## Example 3 — Under-specified component (skip-ish)

**User prompt:** "Make me a pricing component, 3 tiers, for my SaaS."

### Step 1 — Gap analysis

| Facet | Status |
|---|---|
| Task | specified — pricing component |
| Tiers | specified — 3 |
| Style | missing but low priority for a single component |
| Tier details | **missing** — no prices, features, or names |
| Layout | one clear default (3-tier horizontal) |

Two choices here:

- Interview lightly on just tier details (one question)
- Ask about layout with previews

### Step 2 — Minimal `AskUserQuestion` call (one question)

```json
{
  "questions": [
    {
      "question": "What are your three tiers? (Pick what matches, or use Other to type them)",
      "header": "Tiers",
      "multiSelect": false,
      "options": [
        { "label": "Free / Pro / Team (Recommended)", "description": "Standard SaaS ladder. Free=$0, Pro=fixed price, Team=contact sales." },
        { "label": "Starter / Growth / Enterprise", "description": "Usage-based ladder, mid-market positioning." },
        { "label": "Hobby / Pro / Business", "description": "Developer-tool ladder, individuals to teams." }
      ]
    }
  ]
}
```

Short interview. One batch. Resist the urge to ask 4 questions for a single component.

### Step 3 — Brief

```
## Design brief

- **Task:** 3-tier pricing component
- **Tiers:** Free ($0) / Pro (single price) / Team (contact sales)
- **Layout:** 3-tier horizontal, middle tier highlighted as recommended
- **Style:** Match existing project styling (will read files first)
- **Includes:** Price, 3–5 feature bullets per tier, CTA per tier

Does this match? I'll also need the actual prices and features before I can fill in the copy — can you share those, or should I use placeholders?
```

---

## When to skip the interview entirely

**Rich prompts** — if the user already gave you audience, goal, style, and layout preferences, the interview is noise. Confirm once in plain text: "Got it — landing page for developers, sign-up CTA, minimal editorial style. Anything to add before I start?"

**Tiny tweaks** — "change the button color to blue" needs no interview.

**Explicit skips** — "just build it / surprise me / you pick". Skip interview, make defensible choices, state them in the brief header so the user can redirect.
