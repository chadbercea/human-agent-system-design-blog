---
title: "Why HCI Needs a Child: The Case for Human-Agent-System Design"
date: 2026-02-20
description: "A structured case for why HCI has reached the boundary of its explanatory power in the age of autonomous agents — and why that boundary demands a new sub-discipline."
---

## What This Document Is

This is a foundational argument. It is not a manifesto, a thought experiment, or a provocation for engagement. It is a structured case for why the field of Human-Computer Interaction — the most successful design discipline of the past four decades — has reached the boundary of its explanatory power in the age of autonomous agents. And why that boundary demands a new sub-discipline rather than another expansion of HCI's already-stretched tent.

This document is intended to be read, challenged, and cited. It is the seed of a body of work that defines Human-Agent-System (HAS) Design as a practice, a discipline, and a career path for designers working at the intersection of humans, autonomous agents, and the systems they share.

If you are a researcher, practitioner, or hiring manager trying to understand what it means to design for agentic systems, this is where that conversation begins.

---

## HCI: The Genesis

Human-Computer Interaction emerged in the early 1980s as a response to a real problem: computers were powerful but unusable. The discipline drew from cognitive psychology, ergonomics, computer science, and industrial design to answer a single question — how do we make computers work for people?

The answer, built over four decades, is one of the great achievements of applied science. HCI gave us interaction models, usability heuristics, user-centered design, information architecture, accessibility standards, and a shared vocabulary for describing how humans relate to machines. It professionalized a practice that had no name. It turned "making things easy to use" into a rigorous, teachable, measurable discipline.

HCI has also proven remarkably adaptive. When the mouse replaced the command line, HCI absorbed direct manipulation. When mobile replaced desktop, HCI absorbed responsive design, touch interaction, and small-screen cognition. When voice assistants arrived, HCI absorbed conversational UI. When AR and VR emerged, HCI absorbed spatial interaction, embodied cognition, and immersive design. Every time a new modality appeared, HCI expanded its methods to accommodate the paradigm without breaking its core framework.

That core framework rests on a foundational assumption so basic it is rarely stated explicitly:

**There is one intentional actor in the system, and that actor is human.**

The computer is a tool. It responds. It processes. It displays. It stores. But it does not decide. It does not act on its own judgment. It does not initiate work. The human is the origin of intent, and the system is the instrument of execution. Every HCI method — personas, journey maps, usability testing, task analysis, cognitive walkthroughs, heuristic evaluation — is built on this assumption. The human has a goal. The system helps or hinders. Design mediates.

This assumption held for forty years because it was true.

It is no longer true.

---

## Where HCI Breaks

The arrival of autonomous agents — software entities that make decisions, initiate actions, and coordinate with other agents and systems without continuous human direction — introduces a category of actor that HCI was never designed to account for.

This is not a gradual stretching of HCI's boundaries. It is a structural break in the foundational assumption on which the entire discipline rests.

Consider what an agent does that a traditional system does not:

**Agents initiate.** A database does not decide to reorganize itself. A spreadsheet does not decide that a formula is wrong and rewrite it. But an agent monitoring a codebase can decide that a dependency is outdated, create a branch, update the dependency, run the test suite, and open a pull request — all without being asked. The origin of intent has shifted from the human to the agent. HCI has no framework for designing around an actor that generates its own intent.

**Agents reason.** Traditional systems execute deterministic logic. Given input A, produce output B. Agents evaluate context, weigh tradeoffs, and produce different outputs for the same input depending on what they determine is appropriate. This is not a bug — it is the defining feature. But HCI's trust frameworks assume deterministic systems. Error states, feedback mechanisms, and recovery patterns are all designed for systems that behave predictably. When the system reasons, the design problem changes from "did the system do what the user asked?" to "can the user understand why the system did what it did?" These are fundamentally different questions requiring fundamentally different methods.

**Agents coordinate.** In traditional systems, integration is plumbing — APIs move data between services according to fixed contracts. In agentic systems, agents negotiate, delegate, and collaborate. One agent might decompose a task into subtasks, assign them to specialized agents, collect results, and synthesize an output. This coordination is dynamic, context-dependent, and emergent. HCI has no methodology for designing the governance of autonomous coordination between non-human actors.

**Agents operate without humans present.** This is the most fundamental break. HCI's entire methodological apparatus requires a human in the loop. User research studies humans. Usability testing observes humans. Personas represent humans. Journey maps trace human experience. When agents interact with systems and other agents in the backstage — extracting data from APIs, transforming it, writing to databases, triggering workflows — there is no human to study, observe, or represent. The "H" in HCI is absent. The methods do not apply. Not because they are inadequate for this context, but because their object of study does not exist in this context.

---

## The Limits Are Structural, Not Methodological

It is important to distinguish between a discipline that needs better methods and a discipline that has reached the boundary of its domain. HCI does not need better methods for designing agent-to-agent interactions. It needs to acknowledge that agent-to-agent interactions are outside its domain.

This is not a criticism of HCI. It is a recognition of scope. Mechanical engineering is not inadequate because it does not cover circuit design. It simply has a defined domain, and electrical phenomena fall outside that domain. The response was not to expand mechanical engineering to include electronics. It was to establish electrical engineering as a distinct discipline with its own methods, while acknowledging the shared ancestry in physics.

The same structural logic applies here.

HCI's domain is the interaction between humans and computers. Within that domain, it remains essential. Designing the interface where a human reviews an agent's output? That is HCI. Designing the dashboard where a human monitors agent performance? That is HCI. Designing the configuration screen where a human sets agent parameters? That is HCI. These are human-computer interactions, and HCI's methods apply with full force.

But designing the protocol by which one agent delegates a subtask to another agent? That is not HCI. Designing the error-handling cascade when an agent chain fails at step four of seven? That is not HCI. Designing the trust calibration system by which a human decides how much autonomy to grant an agent based on its track record? That requires methods from HCI and from something else — something that understands agents as actors, not as tools.

The discipline that covers "something else" does not yet exist in a formalized way. Practitioners are building it in the field, improvising methods, borrowing from systems engineering, service design, and distributed systems architecture. But the lack of a named discipline means there is no shared vocabulary, no common methodology, no educational pathway, and no professional identity for the people doing this work.

---

## The Gap

Here is what falls through when you try to stretch HCI to cover agentic systems:

**Agent-to-agent interactions.** When a research agent hands findings to a synthesis agent, which passes a summary to a writing agent, which delivers a draft to a review agent — this is a workflow with multiple actors, handoffs, failure modes, and quality gates. None of these actors are human. HCI has no method for designing this. You cannot create a persona for an agent. You cannot build an empathy map for software. You cannot conduct a usability test when there is no user.

What you can do is define agent archetypes — operational patterns with consistent characteristics. A research agent has high latency tolerance, prioritizes thoroughness, and requires citations. A code generation agent prioritizes syntax accuracy, integrates with testing frameworks, and maintains version control awareness. These are not personas. They are specifications with behavioral characteristics. They require a different vocabulary and different design artifacts.

**Trust across actor types.** A human trusting another human is psychology — reputation, consistency, social proof. A human trusting a traditional system is classic HCI — reliable feedback, predictable behavior, clear error states. A human trusting an autonomous agent is neither. The agent is not deterministic (unlike a system), and it is not psychologically legible (unlike a human). It reasons, but its reasoning may be opaque. It acts, but its actions may surprise. It learns, but its learning may drift.

Designing for this trust relationship requires understanding the agent's decision-making legibility, its failure mode transparency, its track record visibility, and the human's ability to calibrate autonomy based on demonstrated competence. HCI's trust frameworks do not account for actors that reason independently. A new framework is needed — one that treats trust as a dynamic, multi-directional property across different actor types.

**Orchestration as the unit of design.** HCI's unit of analysis is the interaction — a human performs a task using a system. The design problem is the quality of that interaction. In agentic systems, the unit of analysis is the orchestration — multiple actors coordinating toward an outcome through a series of interactions, handoffs, and autonomous operations.

An orchestration cannot be reduced to the sum of its interactions. The emergent behavior of a five-agent pipeline coordinating with two systems and one human is qualitatively different from the individual agent-system or human-system interactions that compose it. Service blueprints — not journey maps — are the appropriate artifact because they can represent frontstage (human touchpoints), backstage (agent operations), support systems, and the handoffs between all three actor types.

**Governance and intervention design.** In traditional systems, the human is always in control. The system does what the human directs. In agentic systems, the human must decide where to maintain control and where to cede it. This is a design problem with no HCI equivalent. It requires defining intervention points (where humans can pause or override), escalation patterns (what triggers human attention), and autonomy gradients (how much freedom agents have at each stage).

These are not interface design problems. They are system governance problems that happen to have interface components. The design practice that addresses them must understand systems architecture, agent capabilities, risk assessment, and human decision-making under uncertainty — simultaneously.

---

## HAS Design: The Necessary Sub-Discipline

Human-Agent-System Design is the practice of designing multi-actor systems where humans, agents, and systems coordinate to produce outcomes that none could achieve alone. It inherits from HCI but extends into territory that HCI's foundational assumptions cannot reach.

HAS Design recognizes three distinct actor types:

**Humans** are characterized by personas and jobs-to-be-done. They have goals, frustrations, mental models, and cognitive limitations. HCI's methods apply fully when designing for human actors. HAS Design does not replace these methods — it incorporates them as one layer of a multi-layer practice.

**Agents** are characterized by archetypes and jobs-to-be-done. They have capabilities, constraints, protocols, and operational patterns. They do not have psychology. Designing for agents requires specifying their behavior, not empathizing with their experience. This is a distinct design activity that requires its own vocabulary and artifacts.

**Systems** are characterized by specifications and protocols. They have APIs, rate limits, authentication requirements, and data schemas. They are the infrastructure that agents and humans interact with. Designing for systems requires understanding their technical capabilities and limitations as constraints on the orchestration.

The output of HAS Design practice is **agentic orchestration** — the emergent operational capability produced when these three actor types coordinate through designed interactions. Agentic orchestration is not automation (a single agent executing a task), not traditional HCI (a human using a system), and not system integration (APIs moving data). It is the coordinated behavior of multiple actors with different types of agency working toward shared outcomes.

HAS Design uses **service blueprints** as its primary design artifact because service blueprints can represent:

- **Frontstage:** Where humans interact — input prompts, review outputs, configure settings, make decisions
- **Backstage:** Where agents operate — API calls, data processing, agent-to-agent coordination, autonomous decision-making
- **Support systems:** Infrastructure enabling the orchestration — MCP servers, databases, APIs, deployment pipelines
- **Handoff points:** Where control or data transfers between actor types
- **Intervention points:** Where humans can monitor, pause, or override agent behavior

This is not a theoretical construct. It is a description of work that is already being done — in AI developer tools, in financial services, in legal technology, in healthcare informatics — by practitioners who currently have no name for what they do and no shared framework for doing it well.

---

## The Relationship Between HCI and HAS Design

HAS Design is not a replacement for HCI. It is a child discipline in the same way that HRI (Human-Robot Interaction) is a child discipline — it inherits core principles from the parent while introducing new methods for phenomena the parent does not cover.

Within a HAS Design practice:

- **HCI methods apply** to every human-facing touchpoint. The interface where a developer reviews an agent's pull request is an HCI problem. The dashboard where an analyst monitors agent performance is an HCI problem. These are designed using personas, usability heuristics, interaction patterns, and all the tools HCI provides.
- **ACI (Agent-Computer Interaction) methods apply** to the backstage layer where agents interact with systems and other agents. Protocol design, error handling cascades, resource management, and coordination patterns are ACI problems. They are designed using specifications, architecture diagrams, state machines, and systems engineering methods.
- **HAS Design methods apply** to the orchestration as a whole — the coordination across all three actor types, the governance model, the trust calibration, the intervention design, and the emergent behavior of the complete system.

The practitioner who works across all three layers is a **HAS Designer** — someone who understands human cognition well enough to design effective touchpoints, understands agent capabilities well enough to specify effective behaviors, and understands systems architecture well enough to design effective orchestrations.

---

## The Test

For any interaction you are designing, ask: **How many intentional actors are involved?**

If the answer is one — a human using a system — you are doing HCI. The methods work. The frameworks apply. No expansion is needed.

If the answer is more than one — a human and an agent, or multiple agents, or a human overseeing a chain of agents interacting with multiple systems — you are designing an orchestration. HCI covers part of it. ACI covers part of it. But the whole requires HAS Design.

The question is not whether HCI is valuable. It is essential and will remain so for as long as humans use computers. The question is whether HCI alone is sufficient for a world where humans are no longer the only intentional actors in the system.

It is not. And pretending otherwise — stretching HCI's methods past their breaking point, applying personas to software entities, forcing journey maps onto autonomous workflows — does not serve the discipline, the practitioners, or the humans whose lives depend on these systems being designed well.

HAS Design exists because the world changed. The actors multiplied. The interactions compounded. The old map no longer covers the new territory.

We need a new map. This is the beginning of drawing it.

---

*Chad Bercea — Lead Product Designer, AI Developer Tools*
*February 2026*
