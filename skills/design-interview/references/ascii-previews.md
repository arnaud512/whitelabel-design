# ASCII Preview Catalog

Drop-in ASCII mockups for the `preview` field of single-select `AskUserQuestion` options. Keep each one 8–16 lines — the UI renders in a fixed monospace box and longer mockups scroll awkwardly.

Pass these as literal strings with `\n` separators in JSON.

## Table of contents

- [Landing page layouts](#landing-page-layouts)
- [Dashboard layouts](#dashboard-layouts)
- [Pricing layouts](#pricing-layouts)
- [Nav patterns](#nav-patterns)
- [Deck / slide layouts](#deck--slide-layouts)
- [Component states](#component-states)

---

## Landing page layouts

### Centered hero

```
┌──────────────────────────┐
│ [Logo]           [Nav]   │
│                          │
│     BIG HEADLINE HERE    │
│     subhead subhead      │
│        [ CTA ]           │
│                          │
│ ── logos logos logos ──  │
│ [Feat] [Feat] [Feat]     │
└──────────────────────────┘
```

### Split hero with visual

```
┌──────────────────────────┐
│ [Logo]           [Nav]   │
│                          │
│ HEADLINE     ┌────────┐  │
│ subhead      │ screen │  │
│ [CTA][sec]   │ shot   │  │
│              └────────┘  │
│                          │
│ How it works: 1 → 2 → 3  │
└──────────────────────────┘
```

### Full-bleed visual

```
┌──────────────────────────┐
│ [Logo]           [Nav]   │
│ ░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░  HEADLINE OVERLAY  ░  │
│ ░░  subhead           ░  │
│ ░░  [ CTA ]           ░  │
│ ░░░░░░░░░░░░░░░░░░░░░░░  │
│                          │
│ Features below fold...   │
└──────────────────────────┘
```

### Editorial / long-scroll

```
┌──────────────────────────┐
│ [Logo]           [Nav]   │
│                          │
│   A very long headline   │
│   that reads like a mag  │
│                          │
│   Body copy body copy    │
│   body copy body copy    │
│   body copy.             │
│                          │
│   → Keep reading          │
└──────────────────────────┘
```

### Nav-light anchor-only

```
┌──────────────────────────┐
│ [Logo]                   │
│                          │
│     HEADLINE             │
│     subhead  [ CTA ]     │
│                          │
│ #features #pricing #faq  │
│                          │
│ (minimal chrome, fast)   │
└──────────────────────────┘
```

---

## Dashboard layouts

### Sidebar + main

```
┌────┬─────────────────────┐
│Nav │  Page title         │
│────│                     │
│Home│ ┌────┐ ┌────┐ ┌────┐│
│Data│ │ kpi│ │ kpi│ │ kpi││
│Logs│ └────┘ └────┘ └────┘│
│Sett│                     │
│    │ ┌───────────────┐   │
│    │ │   chart       │   │
│    │ └───────────────┘   │
└────┴─────────────────────┘
```

### Top nav + cards

```
┌──────────────────────────┐
│ [Logo] Home Data Logs    │
│──────────────────────────│
│ ┌──────┐ ┌──────┐ ┌─────┐│
│ │ card │ │ card │ │card ││
│ └──────┘ └──────┘ └─────┘│
│ ┌──────────────────────┐ │
│ │  big chart           │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Single-metric hero

```
┌──────────────────────────┐
│ [Logo]           [User]  │
│                          │
│        ┌─────────┐       │
│        │  42,318 │       │
│        │ +12% ▲  │       │
│        └─────────┘       │
│                          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│  │spk│ │spk│ │spk│ │spk│ │
│  └───┘ └───┘ └───┘ └───┘ │
└──────────────────────────┘
```

### Dense grid

```
┌──────────────────────────┐
│ [Logo] Nav  Nav  Nav     │
│──────────────────────────│
│ ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐│
│ └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘│
│ ┌───────┐ ┌────────────┐ │
│ │ table │ │   chart    │ │
│ │  rows │ │            │ │
│ │  ...  │ └────────────┘ │
│ └───────┘ ┌────┐┌────┐   │
│           │card││card│   │
│           └────┘└────┘   │
└──────────────────────────┘
```

---

## Pricing layouts

### 3-tier horizontal (Recommended default)

```
┌──────────────────────────┐
│         Pricing          │
│                          │
│ ┌─────┐ ┌─────┐ ┌─────┐  │
│ │Free │ │ Pro │ │Team │  │
│ │  $0 │ │ $20 │ │Call │  │
│ │──── │ │──── │ │──── │  │
│ │✓ ft │ │✓ ft │ │✓ ft │  │
│ │✓ ft │ │✓ ft │ │✓ ft │  │
│ │[CTA]│ │[CTA]│ │[CTA]│  │
│ └─────┘ └─────┘ └─────┘  │
└──────────────────────────┘
```

### Single-column stacked

```
┌──────────────────────────┐
│  One simple price        │
│                          │
│     ┌─────────────┐      │
│     │    $29/mo   │      │
│     │  everything │      │
│     │  included   │      │
│     │   [ CTA ]   │      │
│     └─────────────┘      │
│                          │
│  ✓ feature  ✓ feature    │
│  ✓ feature  ✓ feature    │
└──────────────────────────┘
```

### Toggle monthly/annual

```
┌──────────────────────────┐
│  Pricing                 │
│   [Monthly | Annual ▼]   │
│                          │
│ ┌─────┐ ┌─────┐ ┌─────┐  │
│ │ $0  │ │$20  │ │$50  │  │
│ │Free │ │Pro  │ │Team │  │
│ └─────┘ └─────┘ └─────┘  │
└──────────────────────────┘
```

---

## Nav patterns

### Top bar horizontal

```
┌──────────────────────────┐
│ [Logo] Features Pricing  │
│        Docs    [Sign in] │
└──────────────────────────┘
```

### Centered with CTA

```
┌──────────────────────────┐
│ Features  [Logo]  Docs   │
│           [ Sign up ]    │
└──────────────────────────┘
```

### Sticky minimal

```
┌──────────────────────────┐
│ [Logo]         [→ Start] │
└──────────────────────────┘
```

---

## Deck / slide layouts

### Title slide

```
┌──────────────────────────┐
│                          │
│                          │
│      BIG TITLE HERE      │
│      Subtitle line       │
│                          │
│      Author · Date       │
│                          │
└──────────────────────────┘
```

### Content + visual split

```
┌──────────────────────────┐
│ Slide heading            │
│──────────────────────────│
│ • Bullet one             │
│ • Bullet two   ┌───────┐ │
│ • Bullet three │ chart │ │
│ • Bullet four  │       │ │
│                └───────┘ │
└──────────────────────────┘
```

### Full-bleed quote

```
┌──────────────────────────┐
│                          │
│     "A short quote       │
│      that hits hard."    │
│                          │
│           — Name, Title  │
│                          │
└──────────────────────────┘
```

### Comparison

```
┌──────────────────────────┐
│ Before vs After          │
│──────────────────────────│
│ ┌──────────┬──────────┐  │
│ │  Before  │  After   │  │
│ │  ──────  │  ──────  │  │
│ │  metric  │  metric  │  │
│ │  metric  │  metric  │  │
│ └──────────┴──────────┘  │
└──────────────────────────┘
```

---

## Component states

### Button (states stacked)

```
┌──────────────────────────┐
│ Default:  [ Click me  ]  │
│ Hover:    [ Click me ▸]  │
│ Active:   [ Click me! ]  │
│ Disabled: [ --------- ]  │
└──────────────────────────┘
```

### Form field (states)

```
┌──────────────────────────┐
│ Empty:                   │
│  ┌─────────────────┐     │
│  │ placeholder     │     │
│  └─────────────────┘     │
│                          │
│ Focus:                   │
│  ┌═════════════════┐     │
│  │ typing…│        │     │
│  └═════════════════┘     │
│                          │
│ Error:                   │
│  ┌─────────────────┐     │
│  │ bad value       │     │
│  └─────────────────┘     │
│  ! must be a number      │
└──────────────────────────┘
```

### Card variants

```
┌──────────────────────────┐
│ Flat:         Elevated:  │
│ ┌──────┐      ┌──────┐   │
│ │ card │      │ card │▓  │
│ └──────┘      └──────┘▓  │
│                 ▓▓▓▓▓▓▓  │
│                          │
│ Outlined:     Interactive:│
│ ┌╌╌╌╌╌╌┐      ┌──────┐   │
│ ╎ card ╎      │ card │→  │
│ └╌╌╌╌╌╌┘      └──────┘   │
└──────────────────────────┘
```

---

## Tips for writing new previews

- **Fixed width: 26–30 columns.** Wider renders fine on desktop but cramped on narrow panes.
- **Keep it 8–16 rows.** Longer mockups scroll.
- **Use box-drawing chars** (`┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼`) not ASCII slashes — they render cleanly in the monospace box.
- **Mark the focal element** with `BIG CAPS` or `▓░░` shading so the eye lands there.
- **Label empty regions** (`[chart]`, `[logo]`, `subhead`) rather than leaving blank boxes — readers shouldn't have to guess.
- **One preview per option.** Don't stack two mockups in one preview string — split into two options.
