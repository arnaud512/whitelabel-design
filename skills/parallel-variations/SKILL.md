---
name: parallel-variations
description: Explore N design directions in parallel by spawning sub-agents in isolated git worktrees, each implementing a different variation of the same brief, then present them side-by-side so the user can pick a winner. Use this skill whenever the user asks for "options", "variations", "a few different takes", "show me 2–4 directions", "explore", "A/B", "alternatives", "let's try a few", or wants to compare design approaches before committing. Also trigger when the user is undecided between two clear directions and wants both built so they can choose. This skill replaces the throwaway-prototype loop of design tools with a real, git-managed exploration where every variation is shippable code, the user merges the favorite, and the rest are discarded cleanly with `git worktree remove`. Do not use this for incremental edits to one existing variant — use it only when 2+ genuinely different directions are on the table.
---

# Parallel Variations

Run multiple design variations in parallel. Each variation is a real codebase in its own git worktree, built by its own sub-agent, branching from the user's current branch. The user reviews them all, picks one to merge, and the rest are torn down.

The point: most design exploration today is either (a) generated as throwaway prototypes the user has to rebuild later, or (b) serialized — try one, decide, try another, decide. This skill makes exploration parallel and the artifacts shippable.

## When to trigger

Trigger on phrases like:
- "give me a few options" / "show me 2–3 variations"
- "I'm torn between minimal and bold — let's try both"
- "explore some directions for the hero"
- "A/B this", "compare two approaches"
- "what would it look like with X vs Y"

Skip when:
- The user has already committed to one direction and just wants iteration on it
- The change is small (color, copy, single component) — variations of trivial changes are wasteful
- The repo has uncommitted changes the user hasn't dealt with — clean those first
- The repo isn't a git repo (worktrees require git) — fall back to building one variation in-place
- The user is in a hurry and asked for "something quick"

## Preconditions

Before spawning anything, check:

1. **Git repo with a clean working tree.** Run `git status --porcelain`. If output is non-empty, ask the user to commit or stash first. Worktrees inherit from `HEAD`, so uncommitted changes don't propagate.
2. **Branch you want to branch from is committed.** `git rev-parse HEAD` should succeed.
3. **A brief exists.** If the user hasn't gone through `design-interview`, run that first — variations of a vague brief produce 3 different misses.
4. **Number of variations is 2–4.** More than 4 is reviewer fatigue; less than 2 isn't a comparison. If the user asks for "a few", default to 3.

## Workflow

### Step 1 — Lock in the brief and the axes of variation

The brief is shared across all variations. What *differs* across them is one or two explicit axes — pick them deliberately:

- **Style axis** (minimal vs. bold vs. playful)
- **Layout axis** (centered hero vs. split hero vs. full-bleed video)
- **Library axis** (shadcn primitives vs. Aceternity animated vs. raw Tailwind)
- **Motion axis** (static vs. scroll-driven vs. video-led)

State the axes in plain text before spawning so the user can correct you:

> I'll build 3 variations of the landing page from your brief. Axis: visual style.
> - **A — Minimal editorial**: lots of whitespace, neutral palette, restrained motion
> - **B — Bold modern SaaS**: gradient hero, large type, accent color
> - **C — Cinematic**: video hero, scroll-driven reveals
>
> Each in its own worktree off `main`. Sound good?

Wait for confirmation before continuing.

### Step 2 — Create the worktrees

One worktree per variation, each on its own branch off the current `HEAD`. Keep the worktree directory next to the repo, not inside it (Claude Code's permission scope can vary by directory).

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
PARENT_DIR=$(dirname "$REPO_ROOT")
REPO_NAME=$(basename "$REPO_ROOT")
BASE_BRANCH=$(git rev-parse --abbrev-ref HEAD)

for variant in a-minimal b-bold c-cinematic; do
  git worktree add "$PARENT_DIR/$REPO_NAME-$variant" -b "variation/$variant" "$BASE_BRANCH"
done

git worktree list
```

Verify with `git worktree list` — every variation should show up with its own branch.

### Step 3 — Spawn one sub-agent per variation

Use your environment's sub-agent spawn tool (commonly named `Agent` or `Task` depending on Claude Code version) with `subagent_type: "general-purpose"` — or a more specialized agent if one fits. If you're unsure of the tool name, check the available tools list first; the right one accepts a `prompt` and a `subagent_type`. Send all sub-agent calls **in a single assistant message** so they run concurrently — that's the whole point.

Each sub-agent prompt must be self-contained (sub-agents see no parent conversation). Include:

1. The full brief from `design-interview`
2. **What's different about this specific variation** (one paragraph)
3. The worktree path (`cwd` for the agent's work)
4. The branch name to commit to
5. Stack hints (read package.json, etc.)
6. An explicit "do not touch other worktrees" line
7. An instruction to run `verify-build` before reporting back
8. A request for a short report: what was built, screenshots saved, any issues

Example prompt skeleton (pull from `references/prompt-templates.md` for the full template):

> Build variation **A — Minimal editorial** of the landing page in worktree `/abs/path/to/repo-a-minimal`.
>
> **Brief (shared across all variations):**
> [paste brief verbatim]
>
> **What's specific to this variation:**
> Minimal editorial style — lots of whitespace, single neutral accent color, serif display font, restrained motion (fade-ins only, no scroll pinning), no video. Hero is a centered headline + one CTA. Below: a logo strip and three feature cards.
>
> **Constraints:**
> - Work only inside `/abs/path/to/repo-a-minimal`. Do not edit files in any sibling worktree.
> - Commit to the branch `variation/a-minimal`.
> - Use the project's existing stack (read package.json first).
> - Use shadcn primitives where they exist; the `ui-libraries` skill can guide you.
> - Run `verify-build` once you're done. Don't report back until it passes.
>
> **Report back with:**
> - One-paragraph summary of what you built and the key style choices
> - Path to the screenshots — copy them out of `/tmp/verify-build/<id>/` into `<worktree>/.variation-screenshots/` *before* `verify-build` cleans up, then report that stable path
> - Anything you couldn't decide and made a judgment call on

Spawn 2–4 of these in one message.

**Why the screenshot copy step matters:** `verify-build` deletes its `/tmp` screenshot directory at the end of its run. The parent agent (you) needs to compare screenshots across variations *after* all sub-agents finish, so they have to live somewhere stable. `<worktree>/.variation-screenshots/` is per-variation and survives cleanup.

### Step 4 — Collect results and present them side-by-side

When all sub-agents return, summarize for the user in a comparison table — not three long paragraphs:

```
| Variation | Style hook | Hero pattern | Motion | Screenshots |
|---|---|---|---|---|
| A — Minimal editorial | Serif headline, one accent | Centered, single CTA | Fade-in only | `<repo>-a-minimal/.variation-screenshots/` |
| B — Bold modern SaaS  | Gradient hero, large type | Split, demo screenshot right | Hover + scroll fade | `<repo>-b-bold/.variation-screenshots/` |
| C — Cinematic         | Video hero | Full-bleed, overlay copy | Video + scroll reveals | `<repo>-c-cinematic/.variation-screenshots/` |
```

If `verify-build` flagged issues in any variation, surface them in the same line — the user wants to know *before* picking.

Then ask plainly which to merge — free text, not `AskUserQuestion`. The user often wants to combine ("take A's typography but B's hero layout"), and free text handles that better.

### Step 5 — Merge the winner, tear down the losers

Once the user picks variation X:

```bash
# Merge winner back into base
cd "$REPO_ROOT"
git merge --no-ff "variation/x-name" -m "Pick variation X — <one-line reason>"

# Remove all worktrees (winner is merged, others are abandoned)
for variant in a-minimal b-bold c-cinematic; do
  git worktree remove "$PARENT_DIR/$REPO_NAME-$variant" --force
done

# Delete the unused branches (keep the merged one in case the user wants to revert)
git branch -D variation/a-minimal variation/c-cinematic   # whichever lost
```

If the user wants to keep a losing variation alive ("don't delete C, I might come back to it"), skip that branch's removal and tell them where it lives.

If the user wants to **combine** variations, don't auto-merge. Instead, make a new branch off the winner and tell them you'll cherry-pick or hand-port the bits they wanted from the others.

## Sub-agent prompt templates

Full copy-paste templates for the most common variation axes (style, layout, library, motion) live in `references/prompt-templates.md`. Pull from there instead of hand-writing each prompt — the templates already include the constraints, the report-back format, and the verify-build hand-off.

## Anti-patterns

- **Don't run variations sequentially.** Spawn them in one message. Serialized "let me build A, ok now B" wastes the parallelism this skill exists for.
- **Don't share the same worktree across variations.** They'll trample each other's commits and dev-server ports. One worktree per variation, full stop.
- **Don't make the variations too similar.** "Same layout, slightly different shade of blue" is not exploration — it's a color swap. If you can't explain the axis in one sentence, the variations aren't differentiated enough.
- **Don't skip `verify-build` per variation.** A broken variation looks like a "bad design" to the reviewer when it's actually a JS error. Verify each before presenting.
- **Don't auto-merge.** The user picks the winner. Even if one variation is obviously better, ask first.
- **Don't forget to remove worktrees after merge.** Leftover worktrees confuse later sessions and break IDE indexers. `git worktree remove` is part of the workflow, not optional cleanup.
- **Don't spawn 6+ variations.** Reviewer fatigue is real. Cap at 4.
- **Don't run this in a non-git project.** Worktrees require git. If the project is plain files, build one variation in-place and tell the user why.
