# Sub-agent prompt templates

Copy-paste prompts for spawning variation sub-agents. Each template is filled in by the parent agent before being sent. Replace `{{...}}` placeholders.

The templates share a common structure:

1. **Header** — what variation, which worktree
2. **Brief** — verbatim from `design-interview`
3. **What's specific to this variation** — the differentiating instructions
4. **Constraints** — worktree boundary, branch, stack
5. **Report back with** — structured response format

Always end with the verify-build hand-off and the no-cross-worktree rule.

---

## Template — Style axis (minimal vs. bold vs. playful)

Use when variations differ in *visual register* — same layout, different feel.

```
Build variation **{{LETTER}} — {{STYLE_NAME}}** of {{WHAT_WE_ARE_BUILDING}} in worktree `{{ABS_WORKTREE_PATH}}`.

**Brief (shared across all variations):**
{{PASTE_BRIEF_VERBATIM}}

**What's specific to this variation — style: {{STYLE_NAME}}**
- Visual register: {{e.g. "Lots of whitespace, neutral palette, serif display, restrained motion"}}
- Palette anchor: {{e.g. "Off-white background, near-black text, single warm accent"}}
- Typography: {{e.g. "Serif for display (Playfair / EB Garamond), neutral sans for body"}}
- Motion: {{e.g. "Fade-ins on enter only — no scroll pinning, no parallax"}}
- Components: {{e.g. "shadcn primitives unchanged, no Aceternity"}}

The other variations cover {{LIST_OTHER_AXES}} — don't replicate their direction. Stay in lane.

**Constraints:**
- Work only inside `{{ABS_WORKTREE_PATH}}`. Do not edit files in any sibling worktree.
- Commit to the branch `{{BRANCH_NAME}}`.
- Use the project's existing stack — read `package.json` first.
- Use shadcn primitives where they exist; consult the `ui-libraries` skill.
- Run `verify-build` once you're done. Don't report back until it passes.

**Report back with:**
- One paragraph: what you built and the load-bearing style choices
- Stable screenshot path — copy `verify-build`'s `/tmp/verify-build/<id>/` directory into `<worktree>/.variation-screenshots/` *before* `verify-build` runs its cleanup step, then report that path
- Anything you couldn't decide and made a judgment call on
- Final commit SHA on `{{BRANCH_NAME}}`
```

---

## Template — Layout axis (centered vs. split vs. full-bleed)

Use when variations differ in *structural arrangement* of the same content.

```
Build variation **{{LETTER}} — {{LAYOUT_NAME}}** of {{WHAT_WE_ARE_BUILDING}} in worktree `{{ABS_WORKTREE_PATH}}`.

**Brief (shared across all variations):**
{{PASTE_BRIEF_VERBATIM}}

**What's specific to this variation — layout: {{LAYOUT_NAME}}**
- Hero structure: {{e.g. "Split — headline + CTA on the left, screenshot/animation on the right, 60/40 split, stacks on mobile"}}
- Section flow below the hero: {{e.g. "Logo strip → 3-col features → testimonial → CTA"}}
- Navigation: {{e.g. "Top bar, sticky on scroll, hamburger below md:"}}
- Footer: {{e.g. "Three columns: product / company / legal"}}

ASCII reference (the user picked this layout from a preview):
```
{{PASTE_ASCII_PREVIEW_FROM_DESIGN_INTERVIEW}}
```

The visual style (palette, type, motion) is shared with the other variations — don't innovate there. Vary only the layout.

**Constraints:**
- Work only inside `{{ABS_WORKTREE_PATH}}`. Do not edit files in any sibling worktree.
- Commit to the branch `{{BRANCH_NAME}}`.
- Use the project's existing stack — read `package.json` first.
- Run `verify-build` once you're done — pay extra attention to the responsive breakpoints since layout is what's being tested.

**Report back with:**
- One paragraph on how the layout reads at desktop, tablet, mobile
- Stable screenshot path at all three viewports — copy from `/tmp/verify-build/<id>/` to `<worktree>/.variation-screenshots/` before verify-build cleans up
- Anything that didn't fit cleanly into the chosen layout and how you handled it
- Final commit SHA on `{{BRANCH_NAME}}`
```

---

## Template — Library axis (shadcn vs. Aceternity vs. raw)

Use when variations test *which component system* feels right for the project.

```
Build variation **{{LETTER}} — {{LIBRARY_NAME}}** of {{WHAT_WE_ARE_BUILDING}} in worktree `{{ABS_WORKTREE_PATH}}`.

**Brief (shared across all variations):**
{{PASTE_BRIEF_VERBATIM}}

**What's specific to this variation — library: {{LIBRARY_NAME}}**
- Component source: {{e.g. "Aceternity for hero + feature cards (animated), shadcn for nav and forms"}}
- Install commands you'll need to run:
{{LIST_INSTALL_COMMANDS}}
- Style customization scope: {{e.g. "Use Aceternity defaults; only retheme to match the brief's palette"}}
- Motion budget: {{e.g. "Aceternity ships with motion — keep it; don't disable"}}

The other variations test other libraries — don't borrow their components.

**Constraints:**
- Work only inside `{{ABS_WORKTREE_PATH}}`. Do not edit files in any sibling worktree.
- Commit to the branch `{{BRANCH_NAME}}`.
- Use the shadcn MCP (`mcp__shadcn__*`) for shadcn installs when available.
- Read `package.json` and check for existing component dirs before adding duplicates.
- Run `verify-build` once you're done.

**Report back with:**
- One paragraph: what the chosen library bought you and what it cost (bundle, opinionation, lock-in)
- List of components installed and where they live in the source tree
- Stable screenshot path — copy from `/tmp/verify-build/<id>/` to `<worktree>/.variation-screenshots/` before verify-build cleans up
- Final commit SHA on `{{BRANCH_NAME}}`
```

---

## Template — Motion axis (static vs. scroll-driven vs. video-led)

Use when variations test *how interactive* the page should feel.

```
Build variation **{{LETTER}} — {{MOTION_NAME}}** of {{WHAT_WE_ARE_BUILDING}} in worktree `{{ABS_WORKTREE_PATH}}`.

**Brief (shared across all variations):**
{{PASTE_BRIEF_VERBATIM}}

**What's specific to this variation — motion: {{MOTION_NAME}}**
- Motion budget: {{e.g. "Heavy — scroll-pinned section in the middle, parallax background in hero, animated number counters"}}
- Skill to invoke: {{e.g. "scrollytelling for the pinned section; hero-video-background if a video is provided"}}
- Smooth scroll: {{e.g. "Yes — Lenis at the app root"}}
- `prefers-reduced-motion` fallback: {{e.g. "All scroll-bound effects degrade to plain reveals"}}

The visual style and layout are shared with other variations — vary only the motion intensity and technique.

**Constraints:**
- Work only inside `{{ABS_WORKTREE_PATH}}`. Do not edit files in any sibling worktree.
- Commit to the branch `{{BRANCH_NAME}}`.
- Animate `transform` and `opacity` only. No layout-property animation.
- Test with `prefers-reduced-motion` set — `verify-build` should run both passes.

**Report back with:**
- One paragraph on the motion choices and which beats got which technique
- Confirmation the reduced-motion fallback works
- Stable screenshot path — copy from `/tmp/verify-build/<id>/` to `<worktree>/.variation-screenshots/` before verify-build cleans up (and a note if you also captured a short video clip)
- Final commit SHA on `{{BRANCH_NAME}}`
```

---

## Notes for the parent agent

- **Always paste the brief verbatim.** Sub-agents see no parent conversation.
- **Always include the absolute worktree path.** Relative paths break inside sub-agents.
- **Always include the branch name.** Otherwise sub-agents commit to whatever branch they happen to land on.
- **Always include the no-cross-worktree rule.** This is the most common failure mode.
- **Spawn all sub-agents in one assistant message.** That's what gives you parallelism.
