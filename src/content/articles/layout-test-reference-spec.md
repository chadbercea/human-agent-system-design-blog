---
title: "Agent Action Schema Specification"
date: 2025-03-03
description: "A reference specification for defining, validating, and routing agent actions in human-agent systems."
draft: true
---


This document defines a schema for agent actions — the discrete operations an agent can perform within a human-agent system. The schema provides a consistent structure for declaring actions, validating inputs, enforcing permissions, and routing actions to the correct handler.

## Overview

An action is the atomic unit of agent behavior. Every side effect an agent produces — sending a message, updating a record, triggering a workflow — should be modeled as an action that conforms to this schema.

### Design goals

- **Declarative** — actions are defined as data, not code
- **Validatable** — inputs can be checked before execution
- **Auditable** — every action execution produces a log entry
- **Composable** — actions can be chained into workflows

### Non-goals

- Runtime orchestration (see the workflow engine spec)
- Model-specific prompt formatting
- UI rendering of action forms

## Action definition

Each action is declared as a JSON object with the following structure:

```json
{
  "action": "send_notification",
  "version": "1.2.0",
  "description": "Send a notification to a user or channel",
  "permissions": ["notify:write"],
  "input_schema": {
    "type": "object",
    "properties": {
      "recipient": { "type": "string" },
      "channel": { "enum": ["email", "slack", "in_app"] },
      "message": { "type": "string", "maxLength": 2000 },
      "priority": { "enum": ["low", "normal", "high"], "default": "normal" }
    },
    "required": ["recipient", "channel", "message"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "delivery_id": { "type": "string" },
      "status": { "enum": ["queued", "sent", "failed"] }
    }
  }
}
```

### Required fields

- `action` — unique identifier, lowercase snake_case
- `version` — semver string, used for compatibility checks
- `description` — human-readable summary of what the action does
- `input_schema` — JSON Schema defining the expected input

### Optional fields

- `permissions` — array of permission strings required to execute
- `output_schema` — JSON Schema defining the expected output
- `timeout_ms` — maximum execution time in milliseconds (default: 30000)
- `idempotent` — boolean indicating whether the action is safe to retry

## Validation

All action inputs must be validated against the `input_schema` before execution. The validation step is synchronous and must complete before the action handler is invoked.

```typescript
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

function validateActionInput(
  action: ActionDefinition,
  input: unknown
): ValidationResult {
  const validate = ajv.compile(action.input_schema);
  const valid = validate(input);

  return {
    valid,
    errors: valid ? [] : validate.errors ?? [],
  };
}
```

If validation fails, the system must return the validation errors to the agent and must not execute the action. The agent may attempt to correct its input and resubmit.

### Strict mode

In strict mode, additional checks are applied:

- No extra properties beyond those defined in the schema
- All string inputs are trimmed and checked for empty values
- Numeric inputs are checked against reasonable bounds

```typescript
const ajvStrict = new Ajv({
  allErrors: true,
  removeAdditional: false,
  useDefaults: true,
});
```

## Permission model

Actions declare the permissions they require via the `permissions` field. The runtime checks these against the agent's granted permissions before execution.

### Permission format

Permissions follow the pattern `resource:operation`:

- `notify:write` — send notifications
- `record:read` — read database records
- `record:write` — create or update database records
- `workflow:execute` — trigger workflow steps
- `budget:spend` — actions that incur cost

### Permission resolution

When an agent attempts an action:

1. The runtime reads the action's `permissions` array
2. Each permission is checked against the agent's grant list
3. If any permission is missing, the action is blocked
4. Blocked actions are logged with the missing permission

```typescript
function checkPermissions(
  required: string[],
  granted: string[]
): PermissionResult {
  const missing = required.filter((p) => !granted.includes(p));
  return {
    allowed: missing.length === 0,
    missing,
  };
}
```

## Action lifecycle

Every action execution follows a fixed lifecycle:

### States

- **pending** — action has been submitted but not yet validated
- **validated** — input has passed schema validation
- **authorized** — permissions have been checked and approved
- **executing** — the action handler is running
- **completed** — the action finished successfully
- **failed** — the action encountered an error
- **timed_out** — the action exceeded its `timeout_ms`

### Lifecycle hooks

The runtime exposes hooks at each state transition:

```typescript
interface ActionHooks {
  onValidated?: (ctx: ActionContext) => void;
  onAuthorized?: (ctx: ActionContext) => void;
  onExecuting?: (ctx: ActionContext) => void;
  onCompleted?: (ctx: ActionContext, result: ActionResult) => void;
  onFailed?: (ctx: ActionContext, error: ActionError) => void;
}
```

These hooks are used for logging, metrics, and side-effect management. They must not modify the action input or output.

## Audit log format

Every action execution produces an audit log entry:

```json
{
  "action": "send_notification",
  "version": "1.2.0",
  "agent_id": "agent_abc123",
  "session_id": "sess_xyz789",
  "timestamp": "2025-03-03T14:22:00Z",
  "input": { "recipient": "user_456", "channel": "slack", "message": "..." },
  "output": { "delivery_id": "del_001", "status": "sent" },
  "duration_ms": 245,
  "permissions_checked": ["notify:write"],
  "lifecycle": "completed"
}
```

Log entries are immutable. They must be written to append-only storage and retained according to the organization's compliance policy.

## Composing actions

Actions can be composed into sequences using the workflow engine. A workflow step references an action by its identifier and version:

```yaml
steps:
  - action: "record:read"
    version: ">=1.0.0"
    input:
      id: "{{ trigger.record_id }}"
    output_as: "current_record"

  - action: "send_notification"
    version: ">=1.2.0"
    input:
      recipient: "{{ current_record.owner }}"
      channel: "slack"
      message: "Record {{ trigger.record_id }} was updated"
```

The workflow engine resolves action versions at runtime, validates each step's input against the declared schema, and manages the execution lifecycle across the full sequence.

## Summary

This schema provides a foundation for structured, auditable agent behavior. By treating actions as declared data with explicit schemas, permissions, and lifecycle states, systems can enforce safety guarantees without limiting the range of operations an agent can perform.
