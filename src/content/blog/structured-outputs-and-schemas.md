---
title: "Structured Outputs and Schemas"
description: Getting agents to return JSON or other structured data that your app can rely on.
publishDate: 2025-02-02
tags:
  - system-design
  - workflows
  - design
draft: false
author: "Morgan Tate"
---

# Structured Outputs and Schemas

Free-form text is hard to integrate. This post covers how to get and validate structured output from agents.

## Schema-first design

Define the output shape (e.g. JSON schema) before writing the prompt. The prompt should ask for that shape explicitly; use tools or parsing that enforce it.

## Validation and fallbacks

Validate every response against the schema. On failure, retry once with a simplified prompt or fall back to a safe default and log for review. Never trust unvalidated agent output in critical paths.

## Evolution

When the schema changes, version it. Support a transition period where both old and new shapes are accepted, and migrate consumers before retiring the old format.
