---
title: "We're Assuming the System"
date: 2026-04-26
description: "Chat is a good place to start. It is a terrible place to stay. Human-Agent-System Design is the discipline for what comes next: designing the system the conversation was supposed to operate on."
tags: ["HAS-D"]
draft: false
postNumber: 2
---

At Docker, Javier Alfonso and I built the first version of an agent builder for developers. We shipped it as a chat app. We scrapped it.

People did not want a chat app. They wanted agents that lived inside their Docker workflows. Generated, configured, native to the technology they already used. Chat was a familiar surface. Familiar was not the same as useful.

So we pivoted. The next version was a tool for generating and configuring agents that lived where the work happened. From there, agentic inroads into Docker Desktop. Security-focused AI tooling. The pattern repeated. Chat was the demo. The system was the product.

I now am a lead designer on AI developer tools at Atlassian. My team is building agents for code review, planning, ticketing, and the surrounding work. We call it "left and right of code-gen." Meaningful automation shipped to enterprise customers globally. Same pattern. The chat is where the demo runs. The system is where the value compounds.

Chat is a good place to start. It is a terrible place to stay.

This article is about what comes after, and why I want to pitch an emerging child of the parent HCI. I am calling it "Human Agent System Design." Let's get into it!

## The chat trap

Most agent products are stuck in the same place. A team ships an AI feature as a chat UI. The metrics look fine. Then the product stops growing, or never finds its audience, or feature after feature gets bolted onto the same surface and nothing compounds.

The diagnosis is the same nearly every time. The team designed the conversation. They did not design the system the conversation was supposed to operate on.

Designers are rendering the eighth version of the same chat UI. PMs are reviewing roadmaps that end at "improve the chat experience." Engineers are stitching together model calls and praying the prompt holds. Nobody is designing the system the agent is supposed to live inside.

The work to escape this is not interface work. It is system work. And the discipline for system work, when humans and agents both act on the system, has a name most teams have not heard.

Human-Agent-System Design.

## What the sh\*t is Human-Agent-System Design?

[Human-Computer Interaction](https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction) was built on a single foundational assumption. There is one intentional actor in the product, and that actor is human. The computer is a tool. It responds. It executes. It does not decide.

That assumption held for forty years. It is no longer the best descriptor or set of principles for what's happening today. HCI is critical but it needs a child.

If Human-Computer Interaction is the first parent, then the second parent is [Actor-Network Theory](https://en.wikipedia.org/wiki/Actor%E2%80%93network_theory):

> Actor-Network Theory (ANT) is **a theoretical and methodological framework developed by Bruno Latour, Michel Callon, and John Law that treats both human and non-human entities (objects, technology, ideas) as equally important "actors" or "actants" in shaping social reality**. It maps how these actors connect in networks, proposing that social order is a continuous, precarious accomplishment formed by the heterogeneous networks they form.
>
> [www.sciencedirect.com](http://www.sciencedirect.com)

Human-Agent-System Design takes the core of Human-Computer Interaction and merges Latour's work on Actor-Network Theory to create this gestalt third thing.

An agent decides. It initiates work. It chains actions. It reasons across context. It coordinates with other agents and other systems while no human is watching. The "one intentional actor" assumption breaks. Every method built on top of it bends or snaps when applied to agentic products. Personas do not describe agents. Journey maps do not describe orchestrations. Empathy maps do not apply to entities that have no psychology.

Agents are tier-1 citizens on the internet now. The design conversation has not caught up.

HCI is essential at the human edge of any agent product. HCI is incomplete in this new case of agents acting upon systems orchestrated by humans. It cannot describe the agent layer. It cannot describe the system layer. It cannot describe the seams between all three. And when we try to force HCI principles and frameworks on agents, the result is a mess.

Human-Agent-System Design is the child discipline that completes it. Same parent. New territory. HAS-Design treats three actor types as co-equal design objects. A proper Triad.

**Humans** are designed with HCI methods. Personas, jobs-to-be-done, mental models, trust calibration. The human edge is HCI's home turf. HAS-Design inherits those methods rather than replacing them.

**Agents** are designed with specifications. Capability envelope, action grammar, archetype, constraints. Agents have defined behavior. They have capability without psychology. They require their own vocabulary and their own artifacts.

**Systems** are designed with primitives. State machines, event logs, action authority models, identity persistence, audit surfaces, rollback semantics. The system is the persistent, structured environment humans and agents both act on. Not the backend. Not the infrastructure. The durable design object the framework's name commits to.

The output of HAS-Design practice is agentic orchestration: what happens when three actor types coordinate through designed interactions to produce outcomes none of them could produce alone.

## Back to Blueprints, not Maps

The primary artifact is the service blueprint. A blueprint can represent the human frontstage, the agent backstage, the support systems, and the handoffs between them. A journey map cannot. A journey map traces a primary human and its counterparts and human-helpers through a system. An orchestration is not any of that.

**This is the discipline. This is what you reach for when chat is no longer the answer.**

## The triad

Three actors. Three design objects. Three places the work has to land. Miss one and the product falls apart at that seam.

### The Human.

The person initiating the work, configuring the agent, governing the outcome. You initiate. You configure. You govern. You review. You intervene when the agent goes off course. You steer. Designer, PM, developer. The role varies. The position does not. You are the intentional actor at the human edge, and the judgment that cannot be delegated.

### The Agent.

A specified actor. The agent has a capability envelope: what it can do, what it cannot do, what it has to verify before it acts. The agent has an action grammar: the explicit list of moves available to it. Some agents are configured for general chat. Some for code generation. Some for design review. Some for planning, ticketing, research, or QA. Within those constraints, an agent is whatever you specified.

The human's job is to specify the agent for the work in front of it. A code-generation agent assigned to produce UI inside a screen design tool is set up to fail. The model is fine. The specification was wrong. A user-experience agent is specified differently. It pulls from interaction design. It applies research through heuristic evaluation. Same model underneath. Different agent because the human specified it differently.

### The System.

The persistent, structured, shared environment the other two act on. Not the IDE. Not Conductor. Not Emdash. Those are consoles you orchestrate the system from. The system itself is the skills, the MCP connections, the APIs, the repositories, the records that exist when no one is in session. The test is simple. If you selected it, configured it, or wired it in, it is part of your system. If it shipped in the console by default and you never touched it, it is part of the console. You design the system layer. You version it. You change it deliberately.

Designed deliberately, the system carries the product. Designed by accident, the system carries the failure. There is no third option.

## What you build with it

A line Javier and I landed on:

> Agents live in yaml, think in JSON, and go to work in MCPs.

The yaml is the agent's specification. The JSON is the structured exchange the model runs on. The MCPs are the systems the agents reach into to do their work. That is the geography of a basic agent product.

The system you build inside that geography is a spider-web. Each node is something you connected on purpose: a skill you wrote or installed, an MCP connection you authorized, an API you designed or wired in, a service the agent can reach. The web is bounded. You can name every node. You can audit every connection. You can swap a node without rebuilding the whole thing.

The spider-web metaphor is the picture. The deeper work follows: what each node is allowed to do, who authored which change, what state survives a session, what gets rolled back when something breaks. The framework supplies the vocabulary for those answers.

In practice, the web takes shape in stages. Most designers and PMs will recognize at least one of these. Developers live here already.

**A model and a chat window.** Useful. Most readers are here today. You write something. The model writes back. The model is good. The system is the Internet, assumed and unreviewed. There is nothing for the framework to design at this layer. Stay here for what it is good for: drafts, research, brainstorming. Do not build a product on it.

**A model, an agent, and a set of skills.** Open Cursor. Add an `AGENTS.md` file. The agent has a specification. Add skills. The agent has a library of capabilities. The model is still the model. The system is small. It is also visible. Three pieces sitting next to each other: model, agent definition, skills. The triad is small. It is real. The framework starts here.

**A configured toolset for actual work.** This is where the framework earns its keep. At Atlassian my team is building agents that live inside the work. Code review agents that read the diff. Planning agents that read the roadmap. Jira agents that read and write the tickets. Each agent has a yaml specification. Each is wired to a system: MCP connections to the code host, to Jira, to Confluence, to Sentry, to internal tooling. Skills sit on top. Agent instructions sit on top of those. Agents run in parallel. The system holds state across sessions. Nothing falls on the floor between conversations because there is a designed surface holding the work.

This is not a chat product with extra features. It is a system product with multiple interfaces, one of which happens to be conversational.

That is the difference HAS-Design names.

## Five signs you are stuck in the chat trap

If you are shipping or trying to ship an agent product and it feels stuck, check it against these. Each one is a system-layer failure. The model is not the problem.

### The product is a chat window with ambition.

A human, a model, a text box, and a roadmap that depends on the conversation outlasting the conversation. State dies when the session ends. Decisions made in chat never wrote to a record. The product is a transcript with a logo on it.

### Wrong agent for the job.

The system handed the agent work it was not specified for. A general-chat agent assigned to write production code. A code-generation agent assigned to produce UI inside a screen design tool. The model is fine. The agent specification does not match the work. That is a system-layer mismatch, not a model failure.

### System defined as the console.

The team says the system is Cursor, or Conductor, or the IDE. Those are consoles. The system is what the consoles reach into: the skills, the MCPs, the repositories, the services. If nobody on the team can list those nodes, the system has not been designed. It has been assumed.

### Architecture by accident.

Skills installed by default and never reviewed. MCP connections inherited from a tutorial. Permissions granted once and forgotten. Authentications still live for services no one is using. The web exists. Nobody drew it. The system is doing work nobody specified.

### State that dies with the session.

Work the agent did that nobody can find tomorrow. Audit gaps. Actions with no rollback. Things falling on the floor between sessions. The system is not holding state because there is no system holding state.

If you recognized your product in any of these, the work is at the system layer. Not the prompt. Not the interface. The system.

## Where to start

You will not design your whole system on the first pass. Nobody does. The work starts with one task, one week, and a comparison.

Don't list what you have. List what would have to be there for the smallest agent task on your plate this week to succeed without anyone watching. Then list what is actually there. The gap is the system you have been assuming. It is also the system you are now responsible for.

**1. What's the smallest task you'll give an agent this week?**

*Pro tip:* Pick a task you can describe with a verb, a recurrence, and a stop condition. "Help with bugs" is not a task. "Each morning, draft a triage comment for new bug reports and wait for approval before posting" is. The smallest task with all three roles visible beats the most ambitious task with only one.

**2. For that task to succeed when no one is watching, what has to exist?**

*Pro tip:* Sort what you wrote into three columns — human, agent, system. If one column is empty or thin, you found a layer you've been assuming. The system column is where most teams come up short: credentials, audit trails, drafts queues, the place state lives between sessions. None of these configure themselves.

**3. What of that is actually there right now? What isn't?**

*Pro tip:* Most readers find their gaps cluster in one layer — usually the system. That clustering is the discovery. If your gaps are mostly "the agent needs a better prompt," re-read question two. You probably listed agent ergonomics dressed up as requirements.

**4. If you had to build three things this week to close the gap, what are they — in order?**

*Pro tip:* Build foundation-first. System scaffolding before human rules before agent configuration. The opposite order — configure the agent, patch the rules, bolt on the system — is how the chat trap closes around a team. The order is the lesson.

**5. When you close the laptop, who owns this layer? When are you looking at it next?**

*Pro tip:* A person, a cadence, a place. "The team," "I'll check on it," and "it runs itself" all mean no one is watching. Put your name, a recurring date, and a file or page on it. If you can't, you don't own it yet — and the work won't survive the next change.

Most readers find the answer to question five is "no one" and "I don't know."

That person is you. The work starts this week.

## The diagnostic

Below is the same exercise, scored. Five sliders across the system-layer dimensions — chat strategy, agent definition, system legibility, deliberate design, state and memory — rated one through five. The diagnosis updates as you slide. Ten minutes, and you leave with a picture of where the gaps cluster.

<div class="diag-embed">
  <a class="diag-embed-cta" href="/diagnostic" target="_blank" rel="noopener" role="button">
    <span class="diag-embed-cta-label">Open the diagnostic in a new tab →</span>
  </a>
</div>
