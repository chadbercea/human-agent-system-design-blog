---
title: "Testing Agent Behaviors"
date: 2025-01-12
description: "How to test non-deterministic systems: golden runs, regression sets, and human review."
---


Agents are non-deterministic, but that doesn't mean untestable. This post outlines practical testing strategies.

## Golden and regression sets

Maintain a set of inputs and acceptable output criteria (e.g. must contain key facts, must not contain PII). Run on each prompt or model change and flag regressions.

## Sampling and human review

For subjective quality, sample a percentage of runs for human review. Track agreement and use feedback to tune prompts or add guardrails.

## Contract and integration tests

Test the integration point: given this prompt and this input, the response parses, validates, and triggers the right downstream action. Mock the LLM call so tests are fast and stable.

