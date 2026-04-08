## Workflow Rules

When you complete a task:
1. Commit all changes with a descriptive commit message
2. Push the branch
3. Open a PR against main with a summary of what changed
4. Update the linked Linear issue status to "In Review"

Do this automatically without being asked. Never leave work uncommitted.

## Design Direction — Depth Sequence Navigation

### Reference
Spec doc: https://linear.app/iliketobuild/document/navigation-system-spec-depth-sequence-model-a599615c10bf
Approved wireframe: has-design-wireframe-v5.html

### The model
All navigation is a single directed linear sequence:

  articles(0) → article(1) → about(2) → contact(3)

Moving toward a higher index = FORWARD
Moving toward a lower index = BACKWARD

There are NO left/right slides. Only depth transitions.

### The transition
Three CSS position states on each view:
- `p-c` center: active, visible
- `p-b` behind: small, blurred, deep (views ahead of you in sequence)
- `p-f` front: large, blurred, past camera (views behind you in sequence)

CSS transitions on `transform` and `filter` do all the work.
No JS animation libraries. No keyframe timing hacks. No view stacking.

### POSMAP (the state machine)
```js
const POSMAP = {
  articles: { articles:'p-c', article:'p-b', about:'p-b', contact:'p-b' },
  article:  { articles:'p-f', article:'p-c', about:'p-b', contact:'p-b' },
  about:    { articles:'p-f', article:'p-f', about:'p-c', contact:'p-b' },
  contact:  { articles:'p-f', article:'p-f', about:'p-f', contact:'p-c' },
};
```
In Astro: applied via View Transitions API custom keyframes using the same directional logic.

### Site structure
- Home (/) = articles list. No separate /articles route.
- Nav: Articles, About, Contact — 3 links only.
- No sidebar background, no border, no surface separation.
- Type is the design. No decorative elements.

### Typography
- All sizes: `clamp()` — fully viewport-responsive
- Nav: small. Article titles in list: medium. Article h1: large. Body: reading size.

### Rules
- No left/right slides. Ever.
- No decorative elements. No ASCII chrome. No icons.
- Accent color on active/hover states only.
- The depth transition IS the personality of the site.
