## Workflow Rules

When you complete a task:
1. Commit all changes with a descriptive commit message
2. Push the branch
3. Open a PR against main with a summary of what changed
4. Update the linked Linear issue status to "In Review"

Do this automatically without being asked. Never leave work uncommitted.

## Design Language — Kojima Protocol

The blog speaks in two registers. Every element is either System or Human. Never both.

**System voice:** `--font-mono`, uppercase, `--tracking-wide`, `--color-text-muted` or `--color-text-secondary`. Infrastructure talking. Frequencies, timestamps, labels, operators, markers.

**Human voice:** `--font-prose`, lowercase prose, normal tracking, `--color-text-primary`. The thinking. The writing.

Visual primitives (no images, no icons — only these):
- `─` horizontal rules / separators
- `▶` active / current item
- `▌` intercepted signal / blockquote marker  
- `░░` noise / inactive filler
- `//` system comment / section annotation
- `◀` return / end state
- `·` metadata separator

The accent color (`--color-accent`) appears in exactly three places: active link hover, `▶` on active sidebar item, `◀ END TRANSMISSION` link on hover. Nowhere else.

Do not add graphics. Do not add icons. Do not add animation. The spec doc is the law: https://linear.app/iliketobuild/document/has-design-blog-kojima-design-language-spec-af1f470a0446

## Approved Prototype — Depth Navigation

The approved wireframe prototype is `has-design-prototype.html`. 
Read it before writing any navigation or layout code.
It is the exact behavior target for this milestone.

Key concepts:
- Two layers, same DOM position, differ only in CSS depth class
- Six depth classes: z-front, z-ef, z-gone, z-back, z-crisp, z-dim
- Sequence: list(0) → reading(1) → about(2) → contact(3)
- Hit zone div covers left margin (0 to --pl), handles all list hover/click in reading state
- No inline onclick anywhere — all events via addEventListener
- All JS in an IIFE or Astro script tag (not global scope)
