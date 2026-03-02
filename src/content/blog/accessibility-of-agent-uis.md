---
title: "Accessibility of Agent UIs"
description: Making agent-driven interfaces usable for keyboard, screen readers, and reduced motion.
publishDate: 2025-02-08
tags:
  - ux
  - human-agent
  - design
draft: false
---

# Accessibility of Agent UIs

Agent outputs can be long, dynamic, and time-sensitive. This post covers accessibility considerations for such interfaces.

## Focus and flow

When new content appears (e.g. streaming output), manage focus and live regions so assistive tech announces updates without overwhelming the user. Avoid focus traps.

## Keyboard and shortcuts

Ensure every action the human can take is keyboard-accessible. Provide shortcuts for common actions (approve, reject, edit) so power users are not forced to use the mouse.

## Timing and motion

Respect `prefers-reduced-motion`. Avoid auto-advancing or short timeouts for critical decisions; allow the user to control pace where possible.
