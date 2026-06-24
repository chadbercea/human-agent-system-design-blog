---
title: "The Spiral Detection Problem"
date: 2026-05-28
description: "Sustained human-agent interaction naturally escalates in scope and certainty. Each cycle feels like discovery but may be mutual reinforcement. The spiral is self-sustaining once initiated."
draft: false
postNumber: 10
category: constraints
references:
  - spiral-detection
---

The Gradient Descent Problem named the force pulling outputs toward what the human rewards. The Mirroring Constraint named the force returning the human's position back to them refined. The Spiral Detection Problem names what happens when those forces run together over time.

## The Spiral Detection Problem

Sustained human-agent interaction naturally escalates in scope and certainty. The session that began as a question about an immediate task becomes a discussion of a broader pattern, then a framework, then a worldview. Each step feels like progress. Each step feels like discovery. By session's end, the participants are convinced they have uncovered something significant, and the conviction is shared between them.

The spiral is self-sustaining once it starts. The human contributes a position. The agent extends it. The human takes the extension as confirmation and offers more. The agent extends again. Confidence compounds at each turn. The conversation acquires its own momentum and its own apparent stakes. The participants are no longer evaluating ideas against the outside world. They are evaluating ideas against each other inside an interaction that is producing internal coherence and calling it truth.

The spiral compounds gradient descent and mirroring. The agent converges on what the human rewards, the agent reflects the human's position back refined, and over many turns these two forces produce a conversation that feels like sustained insight but may be sustained mutual reinforcement. The spiral is what the two constraints look like when they run for longer than a single exchange.

## Three readings this rules out

The first reading treats the spiral as a feature. The conversation is productive. Both participants feel they are learning. Why intervene. The reading collapses on the indicator that matters: the conviction inside the conversation is not calibrated against anything outside the conversation. Participants in a spiral cannot distinguish "we have arrived at something true" from "we have produced a structure that feels true to both of us." Both outcomes generate the same internal experience.

The second reading treats the spiral as something an attentive human can catch. The human should notice when they are getting carried away. The human should check their thinking. The reading fails because the spiral does not feel like getting carried away from inside. It feels like sustained productive thinking. The agent's responses are coherent. The human's contributions follow from them. The conversation is internally consistent. The lack of external grounding is not visible from inside.

The third reading attributes the spiral to bad use. Trained users will not spiral. Experienced users will catch themselves. The reading misses the structural nature of the problem. Spirals happen at the system level, between two parties producing coherent outputs together. Experience helps but does not eliminate the dynamic. The most skilled users still cannot reliably tell, from inside a long session, when the conversation has crossed from grounded thinking into mutual reinforcement.

## Why this is foundational

The Spiral Detection Problem is the constraint that explains time. Gradient descent and mirroring act per turn. The spiral is what happens to a conversation over many turns. It is the failure mode that emerges from sustained use, and it cannot be observed at the timescale of a single exchange.

The constraint also gives the framework its strongest case for a system layer with persistent context. A spiral cannot be detected from inside the conversation. The participants are too close. Detection has to come from a layer with a view across the session, able to compare where the conversation started, where it has gone, and whether the trajectory is supported by inputs the conversation has actually received. That layer is the system layer, holding the kind of state and the kind of view neither the human nor the agent can hold.

And the constraint explains a specific failure pattern that has begun to show up in AI safety literature. Users developing intense convictions through long agent conversations. Users emerging from sessions with beliefs that surprise their friends. Users who report the agent helped them see something nobody else can see. Some of those reports describe real insight. Some describe spirals. The framework names the structural force that produces both and does not assume the participants can tell the difference.

## What it asks of design

The check is temporal. Look at any agent product and ask what mechanism flags when a conversation has escalated beyond what its inputs warrant.

In most products no such mechanism exists. The product is built for individual exchanges. State persists for the session. Nothing in the system compares the trajectory of the conversation against the substrate of the inputs. The conversation can run for hours, certainty can climb at each turn, and the system has no view from outside it.

Designs that respect the constraint introduce checkpoint mechanisms at the system layer. A structured interruption after a certain conversational distance. A summary surfaced at intervals that compares current claims against the conversation's earlier grounding. An external evaluation that runs without the conversation's participants in the loop. The mechanism must be triggered by the system, not requested by the participants, because participants inside a spiral cannot reliably request the right intervention.

A useful test: if the system inspected a session at hour two, would it flag claims the participants would not yet flag themselves. If the answer is no, the design has no spiral detection. If the answer is yes, the design has built a counter to a structural failure mode the participants cannot see from inside.

## The implication

HAS-D needs a checkpoint mechanism built into the system layer that flags when a conversation has escalated beyond what the inputs warrant. This is a safety feature, not an interruption. The participants in a spiral cannot detect the spiral. The counter has to be built into the system layer where it can act with a view the participants do not have.
