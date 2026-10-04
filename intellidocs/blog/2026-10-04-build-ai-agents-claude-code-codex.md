---
slug: build-ai-agents-claude-code-codex
title: "Give IntelliNode to Claude Code or Codex to Build AI Agents"
description: "Build AI agents with Claude Code or Codex on IntelliNode: ticket triage, a weekly release brief and blog post reuse, reviewed as flow pictures, not code."
keywords: ["build ai agents with claude code", "ai agents for business", "ai agent use cases", "build ai agents without coding", "review ai generated code", "ai workflow automation", "avoid ai vendor lock-in", "build ai agents with codex", "agents.md example", "claude code skills"]
tags: [{label: "Python", permalink: "/python"}, "AI Agents", "AI Automation", "Claude Code", "Codex", "Vibe Agents"]
authors: [intellinode]
image: /img/articles/build-ai-agents-claude-code-codex.jpg
image_alt: "Clusters of dots joined by thin curved lines, like a coding agent linking project rules, docs and agent apps"
date: 2026-10-04T09:00:00Z
---

You run the support queue or the Friday customer update, and you know what an AI helper should do there. You don't write code. Claude Code or Codex will write it for you from one plain request.

The trouble starts when the work comes back. If you build AI agents with Claude Code or Codex, you get a few hundred lines you can't read, and you're asked to trust them.

IntelliNode changes what comes back. The agent builds the tool as a flow, a small graph of steps. It runs the flow, then hands you a picture of the graph and a report in plain words. We tested that with three use cases, and this guide shows what happened, including what went wrong.

![Clusters of dots joined by thin curved lines, like a coding agent linking project rules, docs and agent apps](/img/articles/build-ai-agents-claude-code-codex.jpg)

<!-- truncate -->

## What changes when your coding agent has IntelliNode

Three things, each with its own section below.

1. **The agent knows the library.** Two small files teach it to build with Intelli, the Python library in IntelliNode.
2. **It builds a graph instead of a script.** Small steps, each on the model you choose.
3. **You get a picture of what it built.** One look tells you what the tool does and where your data goes.

![Diagram: you make a plain request, the coding agent builds an Intelli flow, and the flow picture comes back for you to review](pathname:///img/articles/diagrams/build-ai-agents-claude-code-codex-review.svg)

*You ask in plain words, and a picture of what the agent built comes back.*

:::tip[Download the skill first]

One skill file works in both Claude Code and Codex. Add it to your project before you start:

<div className="terminal">

```bash
curl -fsSL https://www.intellinode.ai/agent-kit/install.sh | sh
pip install -U "intelli[visual]"
```

</div>

Use Intelli 2.1.0 or above. To look before you run it, open the [skill](https://www.intellinode.ai/agent-kit/SKILL.md), the [instruction file](https://www.intellinode.ai/agent-kit/AGENTS.md) or the [install script](https://www.intellinode.ai/agent-kit/install.sh).

:::

## Value 1: Connect IntelliNode to Claude Code or Codex

A coding agent writes code from what it reads first, which is the instruction file in your project. Claude Code and Codex both load a file called AGENTS.md at the start of a session. IntelliNode publishes a ready-made section for it, plus a skill, a longer how-to the agent opens when a task calls for it.

You don't write either file. Paste this into your coding agent:

```text
Set this project up to build with Intelli:
1. Download https://www.intellinode.ai/agent-kit/AGENTS.md and add its content to AGENTS.md in this repo.
2. Download https://www.intellinode.ai/agent-kit/SKILL.md and save it as .agents/skills/intelli-flows/SKILL.md.
   Link that folder to .claude/skills/intelli-flows so Claude Code finds it too.
3. Run pip install -U "intelli[visual]" and tell me the installed version. It should be 2.1.0 or above.
Tell me when it is done and what you added.
```

It may ask before it downloads or installs anything. Say yes.

The instruction file opens with the routine the agent follows for every tool you ask for:

```markdown
When the user asks for an AI tool, follow this sequence. The user may not read code.
1. Write the tool as an Intelli flow of small steps.
2. Run it. If `flow.errors` is not empty, fix the cause and run again.
3. Read the output. An empty `flow.errors` only means nothing crashed. Check that `sorted(out)` lists exactly the steps you expect and that the text is right for the input: a small model may return the input unchanged or give every item the same label. Fix and run again.
4. Save the flow picture: `flow.generate_graph_img(name="<tool>_graph", save_path=".", show_legend=False)`.
5. Report in plain language: what each step does, which model each step uses (say "a local model on your computer" for vllm), what you checked and what is still weak, and where the picture and the output files are.
```

Step 3 is there because of our tests. More on that below.

The rest is about forty lines of rules, most of them mistakes that fail without an error message. Short files like this work. When [LangChain tested Claude Code](https://www.langchain.com/blog/how-to-turn-claude-code-into-a-domain-specific-coding-agent) on its own library, a condensed guide beat docs access through an MCP server on its own, and on one task it cost about 2.5 times less.

## Value 2: The Intelli graph gives the coding agent structure

Ask a coding agent for a tool with no framework and you get a one-off script, shaped differently every time. With Intelli it builds a flow: small steps with one job each, wired into a graph.

That shape does real work. Steps that don't depend on each other run at the same time, and one step's answer can decide which step runs next. Every step also names its own model, so a free local model can sort tickets while a cloud model writes the reply a customer reads. That keeps you from being tied to one vendor.

In code, the wiring is short. This line from the release brief tool says which step feeds which:

```python
flow = Flow(tasks=tasks, map_paths={"features": ["brief"], "fixes": ["brief"], "risks": ["brief"]})
```

You don't have to read it. Intelli draws it.

## Value 3: Review the flow picture, not the code

Every flow can save a picture of itself, and the instruction file makes the agent do that each time. It's what turns generated code from a black box into a white box. This one is the release brief tool:

<img src="/img/articles/flows/brief_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: features, fixes and risks steps each have an arrow to a brief step below them" />

*The release brief flow as Intelli drew it: three writers at the top, one editor step below.*

Each circle is a step, named by the agent. The tag under the name is the model behind it. `[text:vllm]` is a text model on a server you run yourself, and a cloud step would say `[text:openai]` or `[text:anthropic]`. A solid arrow means one step always feeds the next. Steps on one row with no arrow between them run together.

So before anyone opens a file, you can check two things: the steps match what you asked for, and no step sends data somewhere you didn't approve. If the picture looks wrong, say so and ask for a new one.

The picture shows structure. It can't tell you whether the output is any good, and our tests showed how much that matters.

## We tested it the way you would use it

For each use case we started a fresh Claude agent in an empty folder. It got the setup request above, then one request in plain words. It could read only the two kit files and the public docs. Everything ran on the published package and a tiny free model on our own machine. These were Claude agents following the kit, not Claude Code sessions, and we made no Codex run.

All three built a working tool and ran it. None got it right the first time, and that turned out to be the useful part.

### Use case 1: Support triage that gets urgent tickets to an engineer

An outage report shouldn't wait in the same queue as a dark mode request. The request:

```text
Build a support ticket triage tool with Intelli. For each ticket, run three steps in parallel: pick a
category (billing, bug, account, feature), rate urgency (high, medium, low) and write a one line summary.
High urgency tickets get an escalation note for the on-call engineer; the rest get a drafted customer
reply. Run it on a local model with six sample tickets and write a triage.md report. Then show me the
flow picture and explain it in plain language.
```

The picture that came back:

<img src="/img/articles/flows/triage_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: category, urgency and summary feed a triage card step, and red dashed arrows labeled high and other lead to an escalation note or a customer reply" />

*Three steps read the ticket together and feed a triage card. The red dashed arrows are routes: only one is followed for each ticket.*

Part of the agent's own report, word for word:

> Your ticket triage tool is built and ran on all six sample tickets in about 11 seconds, with no errors. Everything ran on the small model on your own machine; nothing was sent to a cloud service.
>
> The picture is `triage_graph.png`. Read it top to bottom: three circles at the top are the parallel steps, their solid arrows meet at the triage card, and two dashed red arrows leave it. "high" goes to the escalation note and "other" goes to the customer reply.

Getting there took six runs. Version one looked fine and reported no errors, yet it wrote both an escalation note and a reply for the same ticket. The agent caught that by checking which steps had run, then added the triage card step so only one route fires. Version two rated every ticket high, so it reworded the question and tested again.

On the final run the labels matched a person's on all six categories and five of six urgency ratings. Then the agent added a warning of its own: "That score is flattering. I adjusted the wording of the urgency question on these same six tickets." That is the kind of sentence you want from a tool builder.

The routing you see in the picture is this part of the generated code:

```python
flow = Flow(
    tasks=tasks,
    # the three parallel steps all feed the triage card
    map_paths={"category": ["triage_card"],
               "urgency": ["triage_card"],
               "summary": ["triage_card"]},
    # the triage card decides which final step runs
    dynamic_connectors={"triage_card": DynamicConnector(
        decision_fn=route_by_urgency,
        destinations={"high": "escalation_note", "other": "customer_reply"})},
    # keep each answer so the card can be built from them
    output_memory_map={"category": "category", "urgency": "urgency", "summary": "summary"},
    memory=memory,
)
```

### Use case 2: A weekly release brief for customers and sales

Every Friday someone turns the developers' change notes into an update that customers can read. The request:

```text
Every Friday I paste the week's commit messages. Use Intelli to turn them into a short release brief
for customers and the sales team: a features section, a fixes section and a risks section, written in
parallel, then one brief with a headline. Run it on a local model with about ten sample commit messages
and save brief.md. Then show me the flow picture and explain it in plain language.
```

You saw its picture earlier. Its first run finished with no errors and a wrong brief: fixes were listed as features, with details the model made up. So the agent moved the sorting into ordinary code, which does it perfectly, and left the model one small job, rewriting each item in plain words. It also added a check that falls back to the original wording when a sentence drifts.

Producing the final brief took about a second. It still said "log in directly from Google Workspace" where the change note said "sign in with". A person reads it before it goes out.

### Use case 3: One blog post, four channels

Marketing wants each post turned into a tweet thread, a LinkedIn post, a newsletter blurb and a search snippet. The request:

```text
Turn any blog post into a tweet thread, a LinkedIn post, a newsletter blurb and a search snippet, all
written at the same time. Build it with Intelli as a Vibe Agent and save the plan so it runs again
without planning. Run it on a local model with a short sample blog post. Then show me the flow picture
and explain it in plain language.
```

The first picture was four circles in a row with no lines between them. It was accurate, because each writer got the post directly, but it told a reviewer almost nothing. So we asked for a change:

```text
Add a first step that reads the post and picks its key points. Have the four writers work from those
points. Then redraw the flow picture.
```

<img src="/img/articles/flows/repurpose_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: a content plan step at the top with arrows to four steps named tweet thread, linkedin post, newsletter blurb and search snippet" />

*A content planner reads the post first and feeds the same key points to four writers.*

Now the picture shows how the work moves. A Vibe Agent builds the flow from a description instead of from code, so the plan is data. This is the wiring you see above:

```json
{
  "map_paths": {
    "content_plan": [
      "tweet_thread",
      "linkedin_post",
      "newsletter_blurb",
      "search_snippet"
    ]
  }
}
```

Intelli saves that plan. On the second run the tool loaded it and went straight to work in about four seconds, with no planning step.

Two things went wrong on the way. In the first test, two of the four pieces were the blog post copied back word for word, and no error was reported. The agent traced that to the default prompt format and replaced it. Then the new planner step misstated the post's numbers, and all four writers repeated the mistake. The tool now keeps only key points that are real sentences from the post.

A planner mistake spreads to every step after it, so the planner is the first step to move to a stronger model. The drafts are still rough on a tiny one: a thread claimed "90%" of tickets, a figure the post never mentions, and the tool's own check flagged it.

## Move one step to a stronger model

Those results say where a tiny model is enough and where it isn't. Sorting in code and running steps together worked. Writing for customers needs something stronger, and you can fix that one step at a time:

```text
In the triage tool, move the customer reply step to Claude and keep every other step on the local model.
Then redraw the flow picture.
```

One step's agent changes:

```python
Agent("text", "anthropic", "You write short, polite replies to customers.",
      {"key": os.environ["ANTHROPIC_API_KEY"], "model": "claude-sonnet-5", "max_tokens": 320})
```

<img src="/img/articles/flows/triage_mixed_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: the same triage flow, with the customer reply step tagged text anthropic and all other steps tagged text vllm" />

*The same flow after the change. Only the customer reply step is tagged `[text:anthropic]`.*

Now the picture answers the question a CIO asks first: where does our data go? Only that step calls an outside vendor. We drew this picture from the real flow without calling Claude, since that call is paid.

It also settles most of the cost. Building a tool uses the coding agent you already pay for. Running it costs whatever the model behind each step costs, and local steps are free. To compare two vendors, change one step and run the same inputs through both.

## What the tests changed

"No errors" is not the same as "right". In all three tests the first run reported no errors and produced something wrong. The agents noticed because they read their own output, so that is now a written step in the instruction file, along with the routing rule the triage test uncovered.

For you, the lesson is short. Review the picture for structure and the agent's report for weak spots. Then have a person read real output before a customer sees any of it.

## For developers

The kit is two files: an [AGENTS.md section](https://www.intellinode.ai/agent-kit/AGENTS.md) and a [skill](https://www.intellinode.ai/agent-kit/SKILL.md). Both point to the docs index at [www.intellinode.ai/llms.txt](https://www.intellinode.ai/llms.txt), written in the [llms.txt format](https://llmstxt.org/). The install script in the box near the top adds the AGENTS.md section, saves the skill and links it for Claude Code. The `visual` extra installs the drawing library. Without it the flow runs and the picture step fails.

Codex reads AGENTS.md by default; its [AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md) covers nested files. Claude Code reads it since v2.1.277 when the project has no CLAUDE.md. If it has one, put `@AGENTS.md` at the top, as the [memory docs](https://code.claude.com/docs/en/memory) describe. We checked these paths against both tools' docs, not in live sessions.

| | Claude Code | Codex |
| --- | --- | --- |
| Instructions file | `CLAUDE.md`, or `AGENTS.md` when no CLAUDE.md exists | `AGENTS.md` |
| Project skills folder | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` |
| Invoke the skill | `/intelli-flows` | `$intelli-flows` |

The code the test agents wrote is published, with the planner step added to the third: [triage](https://www.intellinode.ai/agent-kit/examples/triage/triage.py), [release brief](https://www.intellinode.ai/agent-kit/examples/release_brief/release_brief.py) and [content reuse](https://www.intellinode.ai/agent-kit/examples/repurpose/repurpose.py) with its [plan](https://www.intellinode.ai/agent-kit/examples/repurpose/repurpose_spec.json). We ran each one again from a clean folder before publishing. The [async flow docs](/docs/python/flows/async-flow) and the [Vibe Agents docs](/docs/python/vibe-agents) cover the library itself.

## FAQ

### Can a project manager build an AI agent without coding?

You can get to a working first version. You describe the tool, and the coding agent builds and runs it. Your part is reviewing the picture and the report. Before the tool handles real customers, have a developer look at it.

### How do you review code written by Claude Code or Codex?

Structure first, then results. With Intelli the structure is a picture of the steps and the model behind each one. After that, read the output on real examples. A clean run doesn't prove the output is right.

### How do you avoid AI vendor lock-in with AI agents?

Keep the model choice on each step. In an Intelli flow every step names its own provider and model, so moving one step to another vendor is a small change. [Agentic Workflows in Python](/articles/agentic-workflow-python) mixes three providers in one flow.

### Does Claude Code read AGENTS.md?

Yes, from v2.1.277, when there's no `CLAUDE.md` in the project. Otherwise put `@AGENTS.md` at the top of CLAUDE.md and run `/memory` to check that it loaded.

### Can these AI tools run without an API key?

Yes. All three ran on Ollama, a free local model server, through Intelli's `vllm` provider. For a self-hosted server, see the [vLLM integration page](/docs/python/offline-chatbot/vllm).

## Next step

Pick the request your team makes most often. Paste the setup request into your coding agent, then the request from that use case. When the picture comes back, look at it with the person who owns the process.

If you want to see what the agent loop looks like when a developer writes it by hand, read [How to Build an AI Agent in Python](/articles/how-to-build-ai-agent-python).
