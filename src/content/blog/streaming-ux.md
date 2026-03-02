---
title: "Streaming UX"
description: Designing interfaces for streaming agent output so users feel progress and can act early.
publishDate: 2025-01-30
tags:
  - ux
  - human-agent
  - design
draft: false
---

# Streaming UX

When agent output streams in, the UI must feel responsive and predictable. This post outlines patterns that work.

## Progressive disclosure

Show output as it arrives: scrolling region, typing indicator, or section-by-section reveal. Avoid a long blank wait followed by a wall of text.

## Interrupt and edit

Where possible, let the user interrupt the stream and edit the prompt or the partial output. Persist the edited state so the next run continues from there.

## Skeleton and placeholders

Use skeletons or placeholders for known sections (e.g. "Summary", "Recommendations") so layout is stable and the user sees structure before content fills in.
