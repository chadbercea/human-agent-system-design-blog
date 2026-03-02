---
title: "Human-in-the-Loop Patterns"
description: When to ask for approval, when to notify, and when to let the agent run autonomously.
publishDate: 2025-02-12
tags:
  - human-agent
  - collaboration
  - workflows
draft: false
---

# Human-in-the-Loop Patterns

Not every step needs a click. This post compares approval gates, notifications, and autonomous runs.

## Approval gates

Use for irreversible or high-impact actions: payments, deletions, or publishing. One approval per gate keeps the flow clear and auditable.

## Notify and continue

For lower risk, send a notification (e.g. email or in-app) and let the human review asynchronously. Include a link to undo or correct if needed.

## Autonomous with guardrails

For routine, low-risk tasks, let the agent run without a gate. Rely on rate limits, content filters, and logging so anomalies can be caught and rolled back.
