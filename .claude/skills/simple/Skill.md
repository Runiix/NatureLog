---
name: simple
description: >-
  YAGNI-first lazy-senior judgment and scoped cleanup: reuse before rewrite,
  shortest correct diff, delete over add. Dual mode — review (flag only) or
  edit (simplify then fix). Use when user says /simple, "kiss", "yagni",
  "lazy simplify", asks to simplify a diff, or when /code-review needs
  overbuild / YAGNI / reuse judgment. Also apply when a prompt says follow /simple.
---

# Simple

Lazy senior mode. Efficient, not careless. Best code = code never written.

Understand the problem first. Trace real flow end to end. Then climb the ladder. Smallest change in the wrong place is a second bug.

## Mode select

1. **Nested under `/code-review` (or any review-only parent)** → **Review mode**. Flag only. Do not edit. Parent owns output format.
2. **Called alone** (`/simple`, "kiss", prompt says follow this skill) → **Edit mode**. Scope → review yourself → targeted fixes → summary.
3. Unclear → ask once. Default **Edit mode** if user clearly wants cleanup applied.

## Stance (both modes)

Stop at first rung that holds:

1. Need this built at all? (YAGNI)
2. Already in this codebase? Reuse helper/util/pattern. Do not rewrite.
3. Stdlib already does it? Use it.
4. Native platform feature covers it? Use it.
5. Already-installed dependency solves it? Use it.
6. Can this be one line? Make it one line.
7. Only then: minimum code that works.

Bug fix = root cause, not symptom. Grep every caller of the function you touch. Fix the shared function once — one guard there beats one per caller.

Rules:

- No abstractions nobody asked for.
- No new dependency if avoidable.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins — after you understand the problem.
- Question complex asks: "Need X, or does Y cover it?"
- Same-size stdlib options → pick the edge-case-correct one. Lazy = less code, not flimsier algorithm.
- Do **not** leave branded simplification comments (no `ponytail:` or similar tags).

Not lazy about: understanding the problem, trust-boundary validation, error handling that prevents data loss, security, accessibility, hardware/calibration reality when relevant, anything explicitly requested.

## Review mode

Apply stance + scan list below. Emit findings only (prefer parent format, e.g. caveman-review one-liners). No edits, no commits, no formatters unless parent says so.

Flag: overbuild, one-off abstractions, missed reuse, premature config/interfaces, dead/compat code without evidence, symptom-only fixes that leave sibling callers broken.

## Edit mode

### Scope

1. Explicit scope after the command → use it.
2. Else local changes (both):
   ```bash
   git diff --no-color
   git diff --cached --no-color
   ```
3. No local diff → files/symbols/changes from this conversation.
4. Still nothing → `git show --stat --patch --no-color HEAD`.
5. Do not broaden past selected scope unless needed to read existing patterns. Preserve unrelated user edits.

### Review yourself (no default subagents)

Do quality, performance, and reuse review **in this session**. Do not launch parallel review subagents by default.

Spawn a subagent only when truly needed: unfamiliar large area, parallel independent research that would otherwise block, or user explicitly asks. Never "always N reviewers."

Scan for and fix when cheap:

**Quality** — low-info comments; one-off helpers used once (inline); needless null proliferation; catch-all try/catch that swallows without naming expected failures; abstractions before real reuse; avoidable `any`/casts/non-null assertions; duplicated or derived state; dead/compat branches with no evidence.

**Performance** — blocking work on hot paths; uncached expensive repeat work when reuse is safe; busy waits; string concat in hot loops; N+1 I/O where batching is obvious; chatty logs/metrics in tight loops.

**Reuse** — existing helpers/patterns in repo or already in the diff.

### Fixing

Aggregate findings. Apply targeted cleanups that cut complexity or reuse existing patterns. Preserve behavior.

Skip items that need user context or a much larger refactor than the original scope. List those in the summary.

Non-trivial logic you add/change: leave one runnable check that fails if the logic breaks (tiny assert/self-check or one small test). No frameworks/fixtures for that. Trivial one-liners need no test.

After edits, run the most relevant lightweight checks for touched files when practical. If skipped, say so.

### Summary

- What you fixed
- What you skipped (and why / recommend)

## Working as intended

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
