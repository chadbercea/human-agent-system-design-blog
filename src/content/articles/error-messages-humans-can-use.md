---
title: "Error Messages Humans Can Use"
date: 2025-01-25
description: "Agent and system errors should point the user to a clear next step, not a stack trace."
---

# Error Messages Humans Can Use

When something goes wrong, the human needs to know what happened and what they can do. This post focuses on error copy and recovery.

## User-facing copy

Translate internal errors into short, plain-language messages. Avoid codes or jargon unless the user can search for them. Prefer "We couldn’t save because the connection dropped" over "ERR_NETWORK".

## Suggested actions

Pair each error with one or two actions: "Retry", "Edit and try again", "Contact support". Make the primary action a single click where possible.

## Logging vs. display

Log full details (stack trace, request ID) for debugging. Show the user only what they need to act or report. Include a way to copy an error ID for support.

