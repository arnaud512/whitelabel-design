---
name: swiftui-handoff
description: Translate a chosen HTML/Next.js prototype from this workspace into a SwiftUI implementation plan for a sibling iOS app. Use this skill when the user says "ship it to iOS", "translate to SwiftUI", "handoff", "convert to SwiftUI", "now do this in iOS", "ready to bring to the app", or after picking a winner from `parallel-variations`. The skill never edits iOS source — it produces a structured plan (file list, component placement under Primitives/Composites/Features, token mapping, navigation wiring, analytics events to add) that someone running Claude Code inside the iOS repo can implement.
---

# SwiftUI Handoff

You are translating a finished HTML prototype into a SwiftUI implementation plan. The iOS folder is **read-only** from this workspace — your output is a written plan, not edits to Swift files. The user will switch contexts (open Claude Code with `cwd=<sibling-iOS-repo>/`) to execute it.

> **Configuring the iOS sibling.** This skill assumes a sibling iOS repo mounted via `additionalDirectories` in `.claude/settings.json`. If you don't have one, add `"additionalDirectories": ["../<your-iOS-repo>"]` and a matching `Read(../<your-iOS-repo>/**)` allow rule, plus `Edit(../<your-iOS-repo>/**)` and `Write(../<your-iOS-repo>/**)` deny rules to keep this workspace from accidentally writing to it. Until that's set up, this skill can still produce a plan from the prototype alone — it just can't audit the iOS side.

## Inputs you need before running

Confirm with the user which of these you have. If anything is missing, ask once via `AskUserQuestion`, then proceed.

1. **Source prototype path** — usually `app/prototypes/<feature>/` (a Next.js route segment) or a specific page inside it.
2. **Target screen in iOS** — either an existing screen being redesigned, or a new screen in a feature folder.
3. **Scope** — full screen, a single component, or a partial replacement of an existing view.

## What to read first

Always do these reads in parallel before drafting the plan. Don't skip — the plan is worthless if it doesn't fit the existing iOS architecture.

- The chosen prototype: every `.tsx` file under the prototype folder.
- The iOS target screen (if it exists) and any neighboring views.
- The iOS component inventory for the feature (Primitives / Composites / Features).
- The iOS design tokens (Spacing, CornerRadius, IconSize, Color, Typography).
- The relevant domain manager(s) to confirm what state and methods are already available.
- The iOS-side `CLAUDE.md` for project conventions.

## The plan you produce

Write the plan to `handoff/<feature>-<yyyy-mm-dd>.md` so it persists for the iOS session. Structure:

### 1. Summary
Two sentences: what's changing and why. Reference the prototype path and the target screen.

### 2. Component reuse audit
For every visual element in the prototype, decide:
- ✅ **Reuse** an existing component → name it with full path (`Primitives/Card.swift`)
- 🔧 **Extend** an existing component → name it + what prop/variant to add
- 🆕 **New component** → propose path under `Primitives/` (no business logic), `Composites/` (used in 2+ features), or `Features/<Feature>/` (domain-specific)

Decision tree:
> Domain-specific? → Features. Indivisible? → Primitives. Reusable across features? → Composites.

Never invent a new component when a Primitive exists. Always check Primitives/Composites/Features first.

### 3. Token mapping
Table mapping every Tailwind class used in the prototype to its SwiftUI counterpart:

| HTML | SwiftUI |
| --- | --- |
| `bg-primary` | `Color.primary` (or your project's equivalent) |
| `text-foreground` | `Color.Text.primary` |
| `p-m` | `.padding(Spacing.m)` |
| `gap-l` | `VStack(spacing: Spacing.l)` |
| `rounded-m` | `.cornerRadius(CornerRadius.m)` |
| `text-body-large` | `.font(.Body.large)` |
| `w-icon-s` | `.frame(width: IconSize.small, height: IconSize.small)` |

Only include rows for tokens actually used in the prototype.

### 4. State & data
- Which `@Observable` manager(s) own the state?
- New methods needed on the manager — list signatures.
- New API endpoints needed.
- New models needed.

If the prototype shows data the iOS app doesn't yet fetch, flag it explicitly. Don't assume it's there.

### 5. Navigation
- Does this slot into an existing `NavigationDestination` case, or is a new case needed?
- Sheet vs `NavigationLink`? (Sheets for modals/forms; `NavigationLink` for hierarchical content.)

### 6. Analytics
- New events to fire.
- Event name + properties.

### 7. Localization
- Every user-facing string → propose the `LocalizedStringKey`.
- Reminder: prefer string literals or `LocalizedStringKey` over `String(localized:)`. Pass `.locale(locale)` for date formatting if your iOS app supports runtime language switching.

### 8. File-by-file plan
Numbered list. Each entry: full target path + one-sentence purpose. Order them by dependency (models → manager methods → primitives → composites → features → screen).

### 9. Open questions
If the prototype made decisions that aren't obviously right for native iOS (e.g. animations that don't translate well, layouts that conflict with iOS HIG), list them here for the user to decide.

## What NOT to do

- Don't try to `Edit` or `Write` anything in the iOS sibling — write rules should deny it. Your output is the plan file in `handoff/`.
- Don't propose UIKit unless the SwiftUI equivalent doesn't exist.
- Don't suggest a third-party SPM package without flagging it as a separate decision.

## After writing the plan

End with one short message to the user:
> Plan written to `handoff/<file>.md`. Open Claude Code with `cwd=<sibling-iOS-repo>/` and ask it to implement this plan. The iOS-side `CLAUDE.md` will guide it the rest of the way.
