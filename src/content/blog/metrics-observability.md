---
title: "Metrics and Observability"
description: What to measure and expose when humans and agents work together.
publishDate: 2025-02-19
tags:
  - observability
  - system-design
  - workflows
draft: false
---

# Metrics and Observability

Placeholder content mixing lists, code, and blockquotes so the full prose UI is visible.

## What to log

- **Per task**: who (human or agent) did what, when, and what the outcome was (e.g. approved, rejected, edited).
- **Latency**: time from agent output to human action, and end-to-end task duration.
- **Errors**: guardrail triggers, timeouts, and explicit human overrides with reason.

## Example metrics

1. **Task completion rate** – share of tasks that reach a terminal state (e.g. approved or rejected) within a time window.
2. **Time to first human action** – how long until the human interacts after the agent produces output.
3. **Override rate** – how often the human changes or rejects the agent’s output; useful for tuning prompts or guardrails.

## Query shape (conceptual)

You might aggregate by day and by workflow:

```sql
-- Placeholder: daily task outcomes per workflow
SELECT workflow_id, date, outcome, COUNT(*)
FROM task_events
WHERE date >= ?
GROUP BY workflow_id, date, outcome;
```

Use this to spot bottlenecks (e.g. long “time to first action”) or over-rejection (e.g. high override rate on one workflow).

## A caution

> Avoid measuring only agent-side metrics (tokens, latency) and forgetting the human. The system’s value is in the combined loop; measure both sides so you can assess the full UX.

## Summary

- Log tasks, outcomes, and timestamps for both human and agent actions.
- Define a few key metrics (completion rate, time to action, override rate) and review them regularly.
- Keep the human in the picture when you design dashboards and alerts.
