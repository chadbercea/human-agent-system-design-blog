---
title: "Audit Logs and Compliance"
description: What to log when humans and agents collaborate, and how to retain and query it.
publishDate: 2025-01-28
tags:
  - system-design
  - observability
  - guardrails
draft: false
---

# Audit Logs and Compliance

For regulated or high-stakes domains, audit trails are non-negotiable. This post covers what to capture and how.

## Immutable logs

Write audit events to an append-only store. Include: who (human or agent), what action, when, and relevant IDs (session, request, document). Do not allow edits or deletes of audit records.

## PII and retention

Decide what PII is logged and for how long. Redact or hash where possible; document retention policy and enforce it with lifecycle rules or background jobs.

## Query and export

Support filtered search and export (e.g. by user, date range, action type) so compliance and support can answer questions without ad hoc DB access.
