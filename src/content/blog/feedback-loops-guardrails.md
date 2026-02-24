---
title: "Feedback Loops and Guardrails"
description: How to design feedback mechanisms and guardrails so human-agent systems stay safe and aligned.
publishDate: 2025-02-22
tags:
  - system-design
  - human-agent
  - guardrails
draft: false
---

# Feedback Loops and Guardrails

Placeholder content to expose list and heading styles in the UI.

## What to implement first

1. **Explicit confirmation steps** for high-impact actions before the agent commits.
2. **Rate limits and quotas** so a single run cannot overwhelm the human or the system.
3. **Structured output** (e.g. JSON with required fields) so the human can parse and validate quickly.
4. **Rollback or undo** for the last N actions when the agent goes off track.

## Guardrail categories

- **Input guardrails**: Reject or flag off-topic or unsafe user requests.
- **Output guardrails**: Block or sanitize agent responses that violate policy.
- **Process guardrails**: Timeouts, step limits, and mandatory human checkpoints.

## Summary

- Prefer simple, auditable rules over complex ML-based guardrails when possible.
- Log guardrail triggers so you can tune thresholds and improve over time.
