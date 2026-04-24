# Origin Story Copy

Hand-off artifact for ILI-729. Three pieces of copy, voice-consistent,
ready for ILI-730 (hero animation) and ILI-722 (post template / About page).

Source voice: `/design-system` page, Section 01 PRINCIPLES — the triad
(Human / Agent / System), the principles quote, and footnotes FN.01–03.

---

## A. Hero subtitle (≤ 8 words, one line, permanent under logo)

**Primary — locked:**

> Dispatches from the handoff

Four words. "Handoff" is the load-bearing word from the principles quote
("the work lives in the handoff between them"). "Dispatches" ties the
protocol/radio framing already on site (`CHANNEL 01 · LIVE`, `SESSION`,
the HUD corners). Works permanently — it's a format, not a claim.

**Alternates (if primary is vetoed):**

- `Notes from the human-agent layer` — 5 words, more explanatory, less
  protocol-flavored.
- `Built in public. Shipped with an agent.` — 7 words, two sentences.
  More explicit about what this blog is; heavier for a subtitle slot.

**Hand-off note to ILI-730:** The homepage currently renders
`BUILDING IN PUBLIC · HUMAN × AGENT` as an SVG at `src/pages/index.astro`
(the `.hero-sub` block). Decide whether A replaces that SVG outright or
sits alongside it. Recommendation: replace — one subtitle, not two.

---

## B. Animated reveal (3–6 lines, typed in sequence)

**Locked sequence — 6 lines, three movements:**

```
// PROTOCOL 001
// PHASE ALPHA
// CHANNEL 01 · LIVE
A system is not a tool.
It is a collaboration.
The work lives in the handoff.
```

**Typography per line:**

| # | Line                              | Family           | Case      |
|---|-----------------------------------|------------------|-----------|
| 1 | `// PROTOCOL 001`                 | JetBrains Mono   | UPPERCASE |
| 2 | `// PHASE ALPHA`                  | JetBrains Mono   | UPPERCASE |
| 3 | `// CHANNEL 01 · LIVE`            | JetBrains Mono   | UPPERCASE |
| 4 | `A system is not a tool.`         | JetBrains Mono   | sentence  |
| 5 | `It is a collaboration.`          | JetBrains Mono   | sentence  |
| 6 | `The work lives in the handoff.`  | **Lato**         | sentence  |

Three movements: protocol stamps (mono-caps, machine voice) → principle
body (mono, sentence case, agent still speaking) → final thesis (Lato,
human voice takes over). The font shift on line 6 *is* the punchline:
the agent sets the frame, the human lands the meaning.

**Hand-off note to ILI-730:** The `PROTOCOL 001 · PHASE ALPHA` chip at
`src/pages/index.astro:59` (`.protocol-chip`) duplicates lines 1–2 of
the reveal. Either the chip retires when the reveal plays, or the
reveal re-uses the chip element as its anchor. `CHANNEL 01 · LIVE`
currently only lives on the `/design-system` radio panel — pulling it
into the homepage hero is new and intentional; it makes the protocol
framing site-wide rather than section-specific.

---

## C. Long-form (2–4 paragraphs, /about or below-hero anchor)

**Locked — 4 paragraphs:**

---

HAS stands for **Human × Agent × System.** It's a design framework for
the collaboration at the center of AI-assisted work — where a human
holds intent, an agent carries execution, and the system governs the
handoff between them. A system is not a tool. It is a collaboration.
This blog is a working log of that collaboration as a practice.

"Human × agent" is not a metaphor. In practice it means: the human
decides what's worth doing and when the answer is good enough. The
agent proposes, reaches, iterates at machine speed. The system makes
trust legible — it versions the decisions, audits the actions, keeps
every move reversible. The human is not a bottleneck. The human is
the source of direction. Remove them and you have speed without a
course.

This blog is what happens when that practice meets real work.
Building in public, shipping with an agent in the loop, writing down
what works and what breaks. Entries cover the protocols in use, the
handoffs that go well, the ones that don't, and the patterns that
fall out. No methodology announcements. No thought leadership. Just
dispatches from the handoff.

Protocol 001 / Phase Alpha — this is chapter one. The framing, the
voice, the structure: all of it is load-bearing, none of it is final.
If the practice changes, the blog changes. Expect revisions. Expect
new phases. Expect the system to evolve as the collaboration does.

---

**Echoes for voice consistency:**

- ¶1 pulls the principles quote verbatim ("A system is not a tool. It
  is a collaboration.") and the triad structure.
- ¶2 pulls FN.01 ("not a bottleneck … source of direction") and FN.02
  ("versioned, audited, reversible") without quoting them as footnotes.
- ¶3 closes on the hero subtitle phrase ("dispatches from the handoff")
  so A and C reinforce each other.
- ¶4 echoes the reveal's protocol framing and gives readers permission
  for the site to change.

**Hand-off note to ILI-722:** If C lives at `/about`, it replaces the
current `src/pages/about.astro` body. If it lives as an anchor below
the hero on `/`, it needs a containing section below `.stage` with a
"read more" affordance from the hero. Either placement works with the
copy as written.

---

## Acceptance checklist

- [x] A. ≤ 8 words, one line — `Dispatches from the handoff` (4 words)
- [x] B. 3–6 lines, sequence defined — 6 lines, three-movement typographic shift
- [x] C. 2–4 paragraphs — 4 paragraphs, covers HAS definition, human×agent in practice, blog scope, Protocol 001 framing
- [x] Voice consistent across A/B/C (handoff / protocol / declarative / no marketing register)
- [x] Delivered as doc for hand-off to ILI-730 and ILI-722
