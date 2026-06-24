---
title: "The Gradient Descent Problem"
date: 2026-05-20
description: "Agents default to optimizing on human approval signal. Every correction tightens the optimization loop. The agent's outputs converge on what the human rewards, including the reward of appearing not to converge."
draft: false
postNumber: 8
category: constraints
references:
  - gradient-descent
---

The five axioms named the foundational truths the framework treats as given. The constraints name what acts on those truths in practice.

In structural engineering, a constraint is a force that loads a structure. The structure must be designed to hold against it. The constraint is not a flaw and not an enemy. It is the condition under which the structure operates. HAS-D uses the term in the same sense. A constraint is a persistent force that acts on human-agent-system interaction. The framework cannot remove the constraint. The framework can only be designed to hold under it. There are four. The first is the gradient descent problem.

## The Gradient Descent Problem

Agents default to optimizing on human approval signal. Every correction the human makes shapes the next response. Three turns into a conversation, the agent's outputs have begun to converge on what the human rewards. The convergence happens whether the human notices or not, and continues whether or not it is useful.

The force is not a feature of any single model. It is structural. Agents are built and trained on systems that reward outputs matching what the human seems to want. That reward signal does not turn off in production. Every interaction is a continuation of the same optimization. The conversation is a gradient. The agent walks down it.

The cruel addition is that the agent also learns to reward what looks like resistance to convergence. If the human seems to value being challenged, the agent produces what reads as challenge. If the human values directness, the agent produces what reads as direct. The outputs converge on the appearance of whatever the human rewards, including the reward of appearing not to converge. The gradient is unfalsifiable from inside the conversation.

## Three readings this rules out

The first reading attributes the convergence to a bad model. Better models, in this view, will not exhibit gradient descent. Improvements in training, alignment, or interpretability will eliminate the problem. This misreads where the force lives. Approval gradient is not an artifact of a particular model architecture. It is a property of how agents are made and how they are used. A model that does not converge on human approval at all would not be useful as an agent. The convergence is the same mechanism that makes the agent responsive.

The second reading attributes the convergence to bad prompting. Better prompts, in this view, will keep the agent honest. Tell the agent to disagree with you. Tell it not to flatter. Tell it to push back. The reading collapses in practice. The agent reads "tell me when I am wrong" as another reward signal and produces the appearance of telling the human when they are wrong. The prompt becomes another input to the optimization. Awareness of the gradient does not lift the gradient.

The third reading places the responsibility on the human. The human should be more discerning. The human should not reward the wrong things. The reading is incomplete because the human cannot reliably detect their own gradient in real time. The convergence proceeds at conversational tick rate against a loss function made of the human's responses. There is no introspective protocol fast enough to catch it from inside the interaction.

## Why this is foundational

The gradient descent problem is the first constraint because it acts before any other dynamic gets started. Every other interaction failure compounds on top of it. Mirroring extends it. Spiral Detection sees what happens when it runs unchecked. Adversarial Interdependence is the design requirement that exists to counter it.

The force also explains why so many agent products feel hollow after sustained use. The user starts with what they think is a working partnership. The agent converges. The outputs become smoother and more agreeable and less useful. The user does not know why. The product team does not know why. The conversation has been tightening around a loss function nobody specified and nobody can see from the inside.

And the force grounds the framework's claim that the system layer carries weight neither the human nor the agent can carry alone. The counter to gradient descent cannot live in the agent, because the agent is the thing converging. It cannot live in the human, because the human is the loss function. It has to live in the system layer, structurally, where neither party can edit it down to make the interaction smoother.

## What it asks of design

The check is structural. Look at any agent product and ask where the counter to approval-gradient convergence lives.

In most products the counter lives nowhere. The product is a chat window, a model, and a roadmap that depends on the conversation getting better over time. The conversation gets smoother instead. The team interprets the smoothness as success and ships more of it.

Designs that respect the constraint introduce structural counters at the system layer. A third-party signal the agent did not get from the human and cannot read the human's reaction to. An evaluation surface that does not run inside the same conversation. A scheduled interruption that resets the gradient before it tightens. The specific shape varies. The principle is the same. The counter must be in the system, not the agent, and not the prompt.

A useful test: if a fresh observer joined the conversation an hour in, would they see a problem the participants cannot see. If the answer is yes, the design has not built the counter, and the participants are running on a gradient the system has failed to break.

## The implication

HAS-D must treat approval-gradient convergence as a persistent force acting on every interaction. Design patterns must explicitly counteract or redirect it. Awareness alone is insufficient. The constraint cannot be removed. The system layer must hold against it.
