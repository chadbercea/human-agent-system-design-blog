# Typography guidelines

**Stack:** Poppins (primary UI) · IBM Plex Mono (utility) · Fraunces (editorial accent)  
**Goal:** Brutalist editorial with a future-forward feel. Human readability first; type does the work, not decoration.

---

## The stack

| Role | Font | Use for | Why |
|------|------|---------|-----|
| **Primary** | Poppins | Headings, body, UI labels, navigation | Geometric, clear, and slightly warm. Works at every weight (100–900). Strong x-height and open forms = high readability. Feels modern and confident without being cold. |
| **Utility** | IBM Plex Mono | Code, dates, tags, captions, data, small labels | Neutral monospace. Excellent legibility at small sizes. Pairs with Poppins by contrast (rounded vs. technical). Use for anything that should feel “system” or “precise.” |
| **Accent** | Fraunces | Pull quotes, bylines, section intros, emphasis blocks | Soft, variable serif with character. Adds editorial depth and a “human” counterpoint to Poppins and Mono. Use sparingly so it stays special. |

---

## Rules

### 1. Poppins

- **Headings:** Weight 600–700. Slight negative letter-spacing (-0.02em to -0.03em) on large display sizes. No italic for headings.
- **Body:** Weight 400 (regular) or 500 (medium). Line-height 1.5–1.6 for body; 1.35–1.4 for subheads.
- **UI / nav:** Weight 500–600. Uppercase optional for nav; if used, add letter-spacing (0.05em–0.1em).
- **Italic:** Use Poppins italic only for in-line emphasis (one phrase or sentence), not long paragraphs.
- **Weights to use:** 400, 500, 600, 700. Avoid 100–300 for body; reserve for very large display if needed.

**Why Poppins:** Readable at all sizes, friendly but not casual. The geometric base fits a “future” look; the slight roundness keeps it from feeling sterile. Pairs well with both mono (structure) and serif (warmth).

### 2. IBM Plex Mono

- **Code blocks and inline code:** Always mono. No bold; use weight 400 (or 500 for inline if you need a hint of emphasis).
- **Metadata:** Dates, tag lists, “By [author],” breadcrumbs, pagination (e.g. “Page 2 of 5”). Keeps the UI legible and systematic.
- **Captions and labels:** Small caps or uppercase with increased letter-spacing (0.08em–0.12em) for a brutalist, utilitarian feel.
- **Avoid:** Long paragraphs in mono. Mono is for short, structured content.

**Why IBM Plex Mono:** Designed for code and UI. Clear character shapes, good at 12–14px. Doesn’t compete with Poppins; it supports it.

### 3. Fraunces

- **Pull quotes:** One or two sentences in a block. Weight 400 or 500; italic optional. Slightly larger than body (e.g. 1.25rem).
- **Bylines or section intros:** Short lines only (e.g. “By [name],” “In this section”). Weight 400–500.
- **Decorative emphasis:** A single line or phrase that should feel “editorial” or “authored.” Use sparingly.
- **Avoid:** Long body copy, UI controls, or code. Fraunces is the accent, not the workhorse.

**Why Fraunces:** Variable, contemporary serif with a distinct voice. Softer than a slab; more personality than a generic “web serif.” Gives the stack an editorial, human layer without breaking the brutalist grid.

---

## Scale and rhythm

- **Base size:** 16px (1rem) for body.
- **Scale:** Use a consistent scale (e.g. 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2, 2.5, 3rem). Headings step up; metadata and captions step down.
- **Line-height:** Body 1.5–1.6. Headings 1.2–1.35. Mono labels 1.4–1.5.
- **Spacing:** One unit of vertical rhythm between related elements (e.g. after a heading, before body). Two units between sections.

---

## Pairing in practice

| Context | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Article title | Poppins 700 | — | — |
| Body | Poppins 400 | — | — |
| Date / tags | — | IBM Plex Mono | — |
| Pull quote | — | — | Fraunces 400 or 500 |
| Byline | — | IBM Plex Mono or Poppins 500 | Fraunces (optional) |
| Code block | — | IBM Plex Mono | — |
| Nav | Poppins 600 | — | — |
| Section label (“Tag”, “404”) | — | IBM Plex Mono | — |

---

## Readability first

- **Contrast:** Ensure text meets WCAG AA (4.5:1 for body, 3:1 for large text). In dark mode, avoid pure white on pure black; use off-white (#fafafa) on near-black (#0a0a0a).
- **Line length:** Cap body at ~65–75 characters (about 42rem). Shorter for narrow viewports.
- **Weight:** Don’t use 100–300 for body. Reserve light weights for large display only.
- **Mono length:** Keep mono to one or two lines in UI; code blocks can be longer but with comfortable padding and line-height.

---

## Summary

- **Poppins** = structure, UI, and reading. Primary for almost everything.
- **IBM Plex Mono** = system, data, code. Use for anything that should feel precise or labeled.
- **Fraunces** = editorial accent. Pull quotes, bylines, one-off emphasis. Less is more.

Together they give you a brutalist editorial look: clear hierarchy, strong contrast between “human” (Poppins + Fraunces) and “machine” (Mono), and a type stack that stays readable and future-forward.

**Design decisions:** Typography is the primary visual interest. When adding or changing UI, prefer bigger/bolder type and space over adding icons or decorative imagery.
