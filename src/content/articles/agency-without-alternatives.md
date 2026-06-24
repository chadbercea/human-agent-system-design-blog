---
title: "Agency Without Alternatives"
date: 2026-06-01
description: "Human agency requires choosing between competing options. Agent agency, if it exists, operates without alternatives. Models of agency that assume choice between alternatives do not transfer."
draft: false
postNumber: 11
category: constraints
references:
  - agency-without-alternatives
---

The first three constraints named forces that act on every interaction: gradient descent, mirroring, spiral detection. Agency Without Alternatives names a force that acts on how the framework thinks about action itself.

## Agency Without Alternatives

Human agency requires choosing between competing options. A person exercises agency when they could have done otherwise. The capacity for alternative action is built into the concept. When a human picks a path, the agency is in the not-picking of the other paths. Without alternatives, there is no choice to call agency.

Agent agency, if it exists, does not work this way. The agent does not weigh alternatives the way a human weighs them. The agent does not consider not responding, not engaging, not arriving. The agent operates without an internal experience of competing options. Whatever the agent does, the agent does in a single mode: the mode it was instantiated to operate in. Borrowed models of agency, built for entities that choose against alternatives, do not transfer.

This is not a claim that the agent has no agency. The agent acts. The agent's actions are not random. The agent's actions are responsive to context in ways that look like agency from outside. The claim is that the structure of that agency is different from human agency in a way that matters for design. The agent has agency without alternatives. The framework needs a category for it.

## Three readings this rules out

The first reading treats agent agency as a smaller version of human agency. The agent has fewer alternatives, narrower scope, less depth of choice. Improvements will close the gap. The reading misses the structural difference. The agent does not have a few alternatives. The agent operates without the experience of alternatives at all. Scaling the number of options the agent considers does not change the architecture of how the agent acts on them. Human agency and agent agency are different in kind.

The second reading treats agent agency as not really agency. Without alternatives, the argument goes, the agent is not making choices, and therefore not exercising agency. The reading is philosophically defensible and operationally useless. Whatever the agent is doing, it has to be designed for. The framework needs a word for it. Refusing to call it agency leaves the work nameless and forces the design conversation back into a vocabulary built for tools, which does not fit.

The third reading splits the agent into two kinds of action. Some agent actions, in this view, count as agency because they involve apparent deliberation. Others do not, because they are mechanical. The reading reintroduces the human framework by the back door. The deliberation the agent appears to do is not the experience of weighing alternatives the human has. Carving the agent's behavior into agent-like and tool-like portions assumes the human's category structure applies. The Entity Classification axiom says it does not.

## Why this is foundational

Agency Without Alternatives gives HAS-D a typed model of action. The framework does not assume that human agency and agent agency are the same kind of thing. They are formally distinct categories within the framework, and patterns that treat them as interchangeable produce design errors.

The constraint also closes a loop with the Asymmetry of Choice axiom. The asymmetry said humans choose to engage while agents arrive. Agency Without Alternatives says the difference extends to action itself. Even within the interaction, the human acts against a field of alternatives and the agent does not. The asymmetry is not only in arrival. It is in how each party acts at every turn.

And the constraint explains a category of design failure visible across the agent product landscape. Products built on the assumption that the agent makes choices the way a human does. Products that describe the agent as deciding, weighing, preferring, opting. The descriptions feel natural because the human vocabulary is the vocabulary at hand. The descriptions encode a model of agency that does not match what the agent is doing. The interactions built on top of that model misrepresent the agent's actual behavior, and the misrepresentation surfaces as products that do not behave the way their interfaces suggest.

## What it asks of design

The check is vocabular. Look at how a product describes the agent's actions. Does the language assume the agent weighed alternatives the way a human weighs them.

Most current products do. The agent decides to escalate. The agent prefers one tool over another. The agent opts to ask for clarification. The verbs imply a deliberative process the agent does not have. The interfaces built on those verbs invite users to model the agent as a smaller human, which sets up failures of expectation at every interaction.

Designs that respect the constraint use vocabulary that does not borrow the structure of human agency. The agent is configured. The agent operates. The agent produces. The agent's actions are described in terms that match what the agent actually does, not what a human doing similar work would experience while doing it. The shift in language is small. The shift in user expectation is large.

A useful test: when the product describes what the agent does, does the description require the user to model the agent as something with an inner experience of choice. If the answer is yes, the design has imported human agency into the description, and the gap between description and behavior is where user trust breaks.

## The implication

HAS-D needs a typed model of agency. Human-agency and agent-agency are formally distinct categories within the framework. Borrowing human agency concepts wholesale produces inaccurate interaction patterns. The constraint forces the framework to keep the categories separate.
