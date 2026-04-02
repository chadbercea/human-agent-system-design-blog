---
name: linear-mcp-tool-availability
description: When Linear MCP tools are missing in-session, trust the user and use alternatives. Use when the user says they have Linear MCP, points to a Linear issue/URL, or when get_issue/list_issues are reported as not found.
---

# Linear MCP — Tool availability and fallbacks

## What this skill documents

The user's Cursor setup may have **Linear MCP** enabled. The agent's tool list is **session-dependent**: sometimes Linear tools exist, sometimes they return **"Tool not found"**. That is a **session limitation**, not proof the user misconfigured Linear.

## Order of operations (prefer doing the work)

1. **If Linear MCP tools are available:** use `get_document`, `get_issue`, `list_issues`, etc. Do not ask the user to paste what the tool can fetch.
2. **If tools are missing:** use this repo as ground truth first — **`.cursor/rules/project-briefing.mdc`**, `README.md`, and the implemented code (collections, routes, `src/styles/`). That covers stack and non-negotiables for most tasks.
3. **Only if issue-specific acceptance criteria are still unknown:** ask for the **minimum** paste (issue body or DoD bullets)—not as default workflow, and do not argue that the user "doesn't have" Linear.

## Rules (do not argue with the user)

1. Never claim the user doesn't have Linear MCP because a tool failed in this session.
2. Treat "Tool not found" as **your** limitation; continue with repo + briefing link + targeted questions only when blocked.

## Summary

- Prefer MCP when present; otherwise **implement from the repo + Linear URL** in `project-briefing.mdc`.
- Paste requests are a **last resort** for missing issue detail, not the first step.
