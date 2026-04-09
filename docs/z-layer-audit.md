# Z-Layer Classes & CSS Audit (ILI-613)

Parent: [ILI-612 — Depth Navigation Spec Gaps & Build Plan](https://linear.app/iliketobuild/issue/ILI-612)

---

## 1. Class → Visual Meaning

| Class | transform | filter | opacity | z-index | pointer-events | Role |
|---|---|---|---|---|---|---|
| `z-front` | `none` | `blur(0)` | `1` | `10` | `all` | **Active/focused** — the view the user is reading |
| `z-back` | `translateX(-12vw) scale(0.8)` | `blur(6px)` | `0.28` | `20` | `none` | **Recessed left** — list visible behind article as sidebar ghost |
| `z-gone` | `perspective(1200px) translateZ(-120px) scale(0.92)` | `blur(14px)` | `0` | `1` | `none` | **Hidden deep** — off-stage, invisible, behind everything |
| `z-ef` | `perspective(1200px) translateZ(72px) scale(1.04)` | `blur(12px)` | `0` | `10` | `none` | **Exit-forward** — zooms toward camera and fades out (forward nav exit) |
| `z-crisp` | `translateX(-12vw) scale(0.8)` | `blur(0)` | `1` | `20` | `none` | **Recessed but readable** — list during hit-zone hover (same position as `z-back`, but sharp) |
| `z-dim` | `none` | `blur(14px)` | `0.25` | `10` | `none` | **Defocused in-place** — article dims when user hovers a list item in hit-zone |

### Depth-spec nomenclature mapping

| Spec term (ILI-612) | CSS class | Notes |
|---|---|---|
| `p-c` (center/active) | `z-front` | Direct match |
| `p-b` (behind/deep) | `z-back` / `z-gone` | `z-back` = visible-behind; `z-gone` = fully hidden behind. Spec has one state, impl splits into two |
| `p-f` (front/past camera) | `z-ef` | Used only as exit animation, not a rest state |

---

## 2. Sequence Diagrams

### Open Article (list → reading)

```
Time    layer-list          layer-article         Action
─────   ──────────          ─────────────         ──────
  0ms   z-front             z-gone                User clicks article item
        │                   │
        │  loadArticle()    │                     Fetch article HTML, populate DOM
        │                   │
        ├─ navigate('reading') called ────────────┤
        │                   │
  +0    z-ef                z-gone                nav.js: old layer gets exit-forward class
        │                   │                     (list zooms toward camera + blurs + fades)
        │                   │
 +60    z-ef                z-front               nav.js stagger: article snaps to front
        │                   │                     list restClass → z-back (but deferred)
        │                   │
 +72    │                   │                     scheduleArticleEntrance(): header/prose/footer
        │                   │                     get staggered opacity fade-in
        │                   │
+460    z-back              z-front               nav.js cleanup: list snapped to rest (z-back)
        │                   │                     transition: none → reflow → transition: ''
```

### Back (reading → list)

```
Time    layer-list          layer-article         Action
─────   ──────────          ─────────────         ──────
  0ms   z-back              z-front               User clicks nav "Articles" or back link
        │                   │
        ├─ navigate('list') called ───────────────┤
        │                   │
  +0    z-back              z-gone                nav.js: backward nav → old layer gets z-gone
        │                   │                     (article shrinks deep + blurs + fades)
        │                   │
 +60    z-front             z-gone                nav.js stagger: list snaps to front
        │                   │
+460    z-front             z-gone                nav.js cleanup: article snapped to rest (z-gone)
        │                   │                     already correct, no visual change
```

### Article Swap (reading → different article)

```
Time    layer-list          layer-article         Action
─────   ──────────          ─────────────         ──────
  0ms   z-back              z-front               User clicks list item in hit-zone
        │                   │
  +0    z-back              z-gone                articles.js: article sent to z-gone
        │                   │                     (shrinks + blurs away)
        │                   │
+300    z-back              ── loadArticle() ──   Fetch new content, populate DOM
        │                   │
+300+   z-back              z-front               Article restored to front
        │                   │
+372    │                   │                     scheduleArticleEntrance(): staggered fade-in
        │                   │
+780    z-back              z-front               swapping = false
```

### Hit-Zone Hover Interaction (while reading)

```
Event              layer-list    layer-article    Visual effect
─────              ──────────    ─────────────    ─────────────
mouseenter hz      z-crisp       z-front          List becomes sharp (still recessed left)
mousemove (on li)  z-crisp       z-dim            Article blurs + dims; hovered li highlights
mousemove (gap)    z-crisp       z-front          Article returns to focus
mouseleave hz      z-back        z-front          List re-blurs to background state
```

---

## 3. Gaps: Current Behavior vs. Depth Spec

### Gap 1: No `p-f` rest state — only `z-ef` as transient exit

The POSMAP spec defines `p-f` ("front / past camera") as a **rest position** for views behind the current index. In the implementation, `z-ef` is only used as a **transient exit animation** during forward navigation (line `nav.js:69`). After 460ms it is snapped to `z-back` or `z-gone`. There is no persistent "past camera" state.

**Impact**: Views behind you in sequence always rest at `z-gone` (invisible) rather than lingering as a large/blurred/past-camera presence. This differs from the three-state POSMAP model.

### Gap 2: `z-back` vs `z-gone` split not in spec

The spec has a single `p-b` ("behind") state. The implementation splits this into:
- `z-back`: visible, blurred, shifted left (list only, during reading)
- `z-gone`: invisible, deep (all other non-active layers)

This split exists to support the **hit-zone sidebar** interaction where the list peeks from the left while reading. The spec doesn't account for this — it would place all behind-layers at the same `p-b` state.

### Gap 3: Backward navigation uses `z-gone`, not a reverse of `z-ef`

Forward exit: old layer → `z-ef` (zoom toward camera, blur, fade).  
Backward exit: old layer → `z-gone` (shrink deep, blur, fade).

This is **asymmetric by design** — forward feels like passing through, backward feels like receding. The spec's POSMAP doesn't distinguish directional exit animations; it only defines rest positions.

### Gap 4: `z-crisp` and `z-dim` have no spec equivalent

These two classes exist solely for the **hit-zone hover interaction** — a micro-interaction layer not described in the depth spec. They allow the list to become readable and the article to defocus during sidebar peek.

### Gap 5: `restClass()` doesn't follow POSMAP structure

The `restClass()` function (nav.js:47-51) uses a simple conditional:
- Active layer → `z-front`
- List during reading → `z-back`  
- Everything else → `z-gone`

This doesn't map to the full POSMAP table from the spec. For example, when viewing `about`, layers at lower indices (articles, article) should be at `p-f` per POSMAP, but they're placed at `z-gone`.

---

## Files Audited

| File | Role |
|---|---|
| `src/scripts/nav.js` | State machine, `navigate()`, `restClass()`, z-class application |
| `src/scripts/articles.js` | `openArticle()`, article swap, hit-zone hover interaction |
| `src/pages/index.astro` | Layer DOM structure, all z-class CSS definitions |
