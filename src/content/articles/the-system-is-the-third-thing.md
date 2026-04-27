---
title: "The System Is the Third Thing"
date: 2026-04-26
description: "Every agent product has three design objects, not two. The system is the persistent, structured environment both human and agent act on. It's the one your team isn't designing."
tags: ["HAS-D"]
draft: false
postNumber: 2
---

There are three objects in every agent product. Most designers see two.

The two you see are the human and the agent. The human asks for something. The agent does something. You design the conversation between them.

The third object is the system. People hear "system" and think backend, or infrastructure. The system is the persistent, structured environment both the human and the agent act on. The tickets, the files, the state machines, the shared documents, the event logs. The stuff that still exists after both parties walk away from the session.

I've spent fifteen years building that layer. CI/CD. Observability. Containers. Design systems. All of it system work. All of it the third object. Making it durable. Making it legible. Making it behave. The current agent-design conversation treats that layer as substrate. Backend's job. "Just has to be there."

It's killing your product.

## Why the system hides

The system is everything durable. Every record the agent writes. Every state change it commits. Every artifact that will still exist at the end of the month. It holds the history. It holds the rules.

It hides because it doesn't have a surface. You can't screenshot it. You can't hand a PM a Figma file of it. It shows up in your product the way gravity shows up in a room. You don't see it. Everything falls the way it says.

The moment you try to draw it, you realize it has all the properties of a design object. It has boundaries. It has rules. It has interfaces. It has versions. Someone decided those things. Almost always an engineer working a local problem. You get architecture by accident.

## Why unnamed design objects break

Here's what's actually broken: when you design an interface without naming what the interface is for, you get bad interfaces. Same thing happens with systems. Unnamed systems get designed by accident.

The unreliability people attribute to AI is almost entirely system-layer failure. The agent wrote half a record. The agent changed a field and the audit log lost track of who did it. The agent chained five actions and the third one failed and nobody knows what to roll back. The model is fine. The system is underspecified.

You can polish the interface until it gleams. The product will still feel broken. Because the thing that's broken is below the interface, in the layer nobody on the team thinks is their job.

## The triad

HAS-D, Human-Agent-System Design, treats all three as co-equal design objects.

**Human.** The person who initiates, reviews, governs. Designed the way humans have always been designed for: personas, jobs-to-be-done, cognitive load, trust calibration. Nothing new here. [HCI](https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction) works.

**Agent.** The autonomous or semi-autonomous actor. Designed through specifications. You don't empathy-map an agent. You define its capabilities, its constraints, its action grammar. What it can do. What it's forbidden to do. What it has to prove before it's allowed to try.

**System.** The persistent, structured, shared environment the other two act on. Designed through state machines, event logs, action authority models, identity and persistence primitives, rollback semantics. Every one of those is a design deliverable. You own them.

Treating human and non-human entities as co-equal actors isn't new. [Actor-network theory](https://en.wikipedia.org/wiki/Actor%E2%80%93network_theory) has been making that move since [Latour](https://global.oup.com/academic/product/reassembling-the-social-9780199256051), in the eighties. HAS-D adds a third term. The System as a design object. A thing you specify, version, and ship. Designing it is a discipline of its own.

These three sit beside each other. Equal terrain. The human acts on the system directly. The agent acts on the system directly. The human acts on the agent. Every edge is a design surface. Miss one and the product falls apart at that seam.

## You already did this with design systems

If you've worked on a design system, you've already built a HAS-D triad. You just didn't call it that.

The humans are the designers and engineers who consume the system. Personas, workflows, adoption problems.

The agents are the build tools. [Style Dictionary](https://styledictionary.com/) transforming tokens into code. Linters enforcing component usage. CI pipelines catching drift. They execute work without a person watching each step.

The system is the token definitions, the component library, the canonical repository. Persistent. Structured. Shared.

When it's underspecified, the whole thing breaks. Tokens with no naming rules. Components with no versioning. No canonical source. The tools misfire. The designers fight the build. The consuming team gives up and builds their own local copy.

Every hard problem in agentic products right now is a problem design systems already solved, in miniature form. Canonical identity. Referential stability. Versioning. Authority. Drift detection.

The tools for designing that layer already exist. They were just never called system design.

## What HAS-D is for

So what does this mean? HAS-D gives you the vocabulary to design all three objects at once. [HCI](https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction) still runs the human edge. The interface work happening across the agent-UX conversation runs the human-agent edge. HAS-D runs the system edge, and the seams between all three.

You reach for it when your agent product feels broken at the foundation. The ground everything else is standing on.

## Where to start

Draw your triad. Write down the human touchpoints. Write down the agent's action grammar. Then write down the system they both act on. All of it. The state machines. The event logs. The records. The rules. The audit surface. The rollback semantics. Everything that outlasts a session.

Most teams discover two things when they do this.

First: the system is underspecified.

Second: the person who should be designing it is nobody.

HAS-D says that person is you.

## References

Latour, Bruno. *Reassembling the Social: An Introduction to Actor-Network Theory.* Oxford University Press, 2005. [https://global.oup.com/academic/product/reassembling-the-social-9780199256051](https://global.oup.com/academic/product/reassembling-the-social-9780199256051)

**Further reading:** [Style Dictionary](https://styledictionary.com/) · [Human–computer interaction](https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction) · [Actor-network theory](https://en.wikipedia.org/wiki/Actor%E2%80%93network_theory)
