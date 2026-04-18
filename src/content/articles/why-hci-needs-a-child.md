---
title: "Why HCI Needs a Child: The Case for Human-Agent-System Design"
date: 2026-02-01
description: "A foundational argument for why Human-Computer Interaction has reached the boundary of its explanatory power in the age of autonomous agents — and why that boundary demands a new sub-discipline."
tags: ["Methodology", "Framework"]
draft: false
---

## What This Document Is

This is a foundational argument. It is not a manifesto, a thought experiment, or a provocation for engagement. It is a structured case for why the field of Human-Computer Interaction — the most successful design discipline of the past four decades — has reached the boundary of its explanatory power in the age of autonomous agents. And why that boundary demands a new sub-discipline rather than another expansion of HCI's already-stretched tent.

This document is intended to be read, challenged, and cited. It is the seed of a body of work that defines Human-Agent-System (HAS) Design as a practice, a discipline, and a career path for designers working at the intersection of humans, autonomous agents, and the systems they share.

---

## HCI: The Genesis

Human-Computer Interaction emerged in the early 1980s as a response to a real problem: computers were powerful but unusable. The discipline drew from cognitive psychology, ergonomics, computer science, and industrial design to answer a single question — how do we make computers work for people?

The answer, built over four decades, is one of the great achievements of applied science. HCI gave us interaction models, usability heuristics, user-centered design, information architecture, accessibility standards, and a shared vocabulary for describing how humans relate to machines.

That core framework rests on a foundational assumption so basic it is rarely stated explicitly:

**There is one intentional actor in the system, and that actor is human.**

The computer is a tool. It responds. It processes. It displays. It stores. But it does not decide. It does not act on its own judgment. It does not initiate work. Every HCI method — personas, journey maps, usability testing, task analysis, cognitive walkthroughs, heuristic evaluation — is built on this assumption.

This assumption held for forty years because it was true. It is no longer true.

---

## Where HCI Breaks

The arrival of autonomous agents — software entities that make decisions, initiate actions, and coordinate with other agents and systems without continuous human direction — introduces a category of actor that HCI was never designed to account for.

This is not a gradual stretching of HCI's boundaries. It is a structural break in the foundational assumption on which the entire discipline rests.

**Agents initiate.** A database does not decide to reorganize itself. But an agent monitoring a codebase can decide that a dependency is outdated, create a branch, update it, run tests, and open a pull request — all without being asked. The origin of intent has shifted from the human to the agent. HCI has no framework for designing around an actor that generates its own intent.

**Agents reason.** Traditional systems execute deterministic logic. Agents evaluate context, weigh tradeoffs, and produce different outputs for the same input depending on what they determine is appropriate. HCI's trust frameworks assume deterministic systems. When the system reasons, the design problem changes from "did the system do what the user asked?" to "can the user understand why the system did what it did?" These are fundamentally different questions.

**Agents operate without humans present.** This is the most fundamental break. HCI's entire methodological apparatus requires a human in the loop. When agents interact with systems and other agents in the backstage — there is no human to study, observe, or represent. The methods do not apply. Not because they are inadequate for this context, but because their object of study does not exist in this context.

---

## The Limits Are Structural, Not Methodological

HCI does not need better methods for designing agent-to-agent interactions. It needs to acknowledge that agent-to-agent interactions are outside its domain.

Designing the interface where a human reviews an agent's output? That is HCI. Designing the dashboard where a human monitors agent performance? That is HCI. But designing the protocol by which one agent delegates a subtask to another agent? That is not HCI. Designing the error-handling cascade when an agent chain fails at step four of seven? That is not HCI.

The discipline that covers that territory does not yet exist in a formalized way. Practitioners are building it in the field, improvising methods, borrowing from systems engineering, service design, and distributed systems architecture. But the lack of a named discipline means there is no shared vocabulary, no common methodology, no educational pathway, and no professional identity for the people doing this work.

---

## HAS Design: The Necessary Sub-Discipline

Human-Agent-System Design is the practice of designing multi-actor systems where humans, agents, and systems coordinate to produce outcomes that none could achieve alone. It inherits from HCI but extends into territory that HCI's foundational assumptions cannot reach.

HAS Design recognizes three distinct actor types:

**Humans** are characterized by personas and jobs-to-be-done. HCI's methods apply fully when designing for human actors.

**Agents** are characterized by archetypes and jobs-to-be-done. They have capabilities, constraints, protocols, and operational patterns. They do not have psychology. Designing for agents requires specifying their behavior, not empathizing with their experience.

**Systems** are characterized by specifications and protocols. They are the infrastructure that agents and humans interact with.

The output of HAS Design practice is **agentic orchestration** — the emergent operational capability produced when these three actor types coordinate through designed interactions.

HAS Design uses **service blueprints** as its primary design artifact because service blueprints can represent frontstage human touchpoints, backstage agent operations, support systems, handoff points, and intervention points where humans can monitor, pause, or override agent behavior.

---

## The Test

For any interaction you are designing, ask: **How many intentional actors are involved?**

If the answer is one — a human using a system — you are doing HCI. The methods work.

If the answer is more than one — a human and an agent, or multiple agents, or a human overseeing a chain of agents — you are designing an orchestration. HCI covers part of it. ACI covers part of it. But the whole requires HAS Design.

HAS Design exists because the world changed. The actors multiplied. The interactions compounded. The old map no longer covers the new territory. We need a new map. This is the beginning of drawing it.

---

*Chad Bercea — Lead Product Designer, AI Developer Tools, Atlassian. February 2026.*
