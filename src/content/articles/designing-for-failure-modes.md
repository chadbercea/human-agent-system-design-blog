---
title: "Designing for Failure Modes"
date: 2025-02-20
description: "When human-agent systems break, clear failure modes keep users in control and reduce confusion."
---


Systems that assume success tend to fail badly. This post outlines how to design for graceful degradation and clear recovery paths.

## Timeouts and fallbacks

Define what happens when the agent does not respond in time. Fallback to a cached result, a human handoff, or a clear error state—never a silent hang.

## Partial results

Agents may return incomplete output. Design UIs that show progress, partial state, and a clear "retry" or "continue" path so the human can decide next steps.

## Audit and rollback

Log decisions and outputs so failures can be traced. Where possible, support rollback or manual override so one bad run does not corrupt downstream state.

