---
title: "Implementing Approval Workflows"
date: 2025-02-20
description: "A practical pattern for approval steps in human-agent pipelines."
---

# Implementing Approval Workflows

Placeholder content to expose code blocks and inline `code` in the UI.

## When to require approval

Require an explicit approval step when the agent will:

- Change shared state (e.g. create or update records).
- Send messages or notifications to real users.
- Spend budget or trigger external APIs with side effects.

For read-only or draft-generation steps, approval can be optional or batched.

## A minimal state machine

You can model the flow with a small state machine so the UI and the agent stay in sync:

```text
draft → submitted → approved | rejected
         ↑              ↓
         └──────────────┘
```

- **draft**: Agent has produced output; human has not yet acted.
- **submitted**: Human has clicked “Submit for approval” (or equivalent).
- **approved** or **rejected**: Final state; optionally notify the agent or trigger the next step.

## Implementation sketch

In code, you might represent status as an enum and allow transitions only when the current state permits them. For example:

```ts
type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

function canTransition(from: ApprovalStatus, to: ApprovalStatus): boolean {
  const allowed: Record<ApprovalStatus, ApprovalStatus[]> = {
    draft: ['submitted'],
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: ['draft'],
  };
  return allowed[from]?.includes(to) ?? false;
}
```

Keep the same rules in the backend and in the agent’s context so the agent never assumes an approval that has not been recorded.

## Summary

Use a single source of truth for approval state (e.g. your database or task store) and drive both the UI and the agent from it. That keeps the full UI and workflow consistent for UX assessment.

