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

You run the support queue, the Friday customer update or the marketing calendar, and you know exactly what an AI helper should do for each. You don't write code, but Claude Code or Codex will write it for you from one plain request.

The catch comes right after. When you build AI agents with Claude Code or Codex, the agent hands back a few hundred lines of code, and you're asked to trust a tool you can't read.

IntelliNode closes that gap. You connect it to your coding agent once. From then on the agent builds each tool as a flow, a small graph of steps, and draws a picture of what it built. You review the picture, not the code. This guide shows how, with three use cases: support ticket triage, a weekly release brief and one blog post reused across four channels.

![Clusters of dots joined by thin curved lines, like a coding agent linking project rules, docs and agent apps](/img/articles/build-ai-agents-claude-code-codex.jpg)

<!-- truncate -->

## What IntelliNode adds to Claude Code and Codex

Three things change once the two are connected. The rest of this guide takes them one at a time.

1. **It connects to the coding tools you already use.** Two small files teach Claude Code and Codex how to build with Intelli, the Python library in IntelliNode. There's no new platform to buy or host.
2. **It gives the coding agent a graph to build with.** Instead of one long script, the agent assembles a flow of small steps that can run side by side, branch on a result and use a different model for each step.
3. **It draws what the agent built.** Every flow can be saved as a picture that shows the steps, their order, the routes and the model behind each step. That turns generated code from a black box into a white box.

Here's the whole loop:

![Diagram: you make a plain request, the coding agent builds an Intelli flow, and the flow picture comes back for you to review](pathname:///img/articles/diagrams/build-ai-agents-claude-code-codex-review.svg)

*You ask in plain language, the coding agent builds an Intelli flow, and the flow picture comes back to you for review.*

## Value 1: Connect IntelliNode to Claude Code or Codex

Start with the connection, because nothing else works without it. A coding agent decides how to write code from what it reads first: the instruction files in the project and the docs it looks up. So connecting IntelliNode means giving the agent three things to read.

![Diagram: AGENTS.md loads into the coding agent, the agent reads llms.txt, and it writes an Intelli app](pathname:///img/articles/diagrams/build-ai-agents-claude-code-codex-handoff.svg)

*AGENTS.md is always loaded with the short rules, llms.txt is where the agent looks up anything else, and with both it writes a working Intelli app.*

- **AGENTS.md** is a file of project rules that both tools load at the start of every session. The Intelli section is about 35 lines.
- **A skill** is a longer how-to that the agent loads only when a task needs it. This one ends with a rule written for you: run the flow, save its picture and explain it in plain language.
- **llms.txt** is an index of every docs page, for anything the first two don't cover.

You don't write any of this. The files are ready to download, and you can ask the coding agent to install them:

```text
Set this project up to build with Intelli:
1. Download https://www.intellinode.ai/agent-kit/AGENTS.md and add its content to AGENTS.md in this repo.
2. Download https://www.intellinode.ai/agent-kit/SKILL.md and save it as .agents/skills/intelli-flows/SKILL.md.
   Link that folder to .claude/skills/intelli-flows so Claude Code finds it too.
3. Run pip install intelli.
Tell me when it is done and what you added.
```

Your agent may ask for permission to download the files or install the package. Approve it, or have a developer run the commands in the last section of this guide.

The instruction file is short on purpose. Here are its first lines, so you can see what the agent is being told:

```markdown
## Using Intelli (Python) to build agent flows

Install with `pip install intelli` (2.0.3) and import from `intelli.flow`:
`from intelli.flow import Agent, Task, TextTaskInput, Flow, SequenceFlow, DynamicConnector, Memory, VibeAgent`

Agents and tasks
- Cloud: `Agent("text", "openai", "mission", {"key": os.environ["OPENAI_API_KEY"], "model": "<model>"})`. Never hardcode keys.
- Local, no key (Ollama or vLLM): `Agent("text", "vllm", "mission", {"model": "<ollama tag>", "temperature": 0.2, "max_tokens": 300}, options={"baseUrl": "http://localhost:11434"})`
- `Task(TextTaskInput("instruction"), agent, post_process=fn, memory_key="name", exclude=False, template=obj)`
- The default temperature is 1. Set `temperature` in model_params for labels and extraction.
```

The rest lists the flow rules and the mistakes that fail without an error message, so the agent avoids them without you having to know they exist.

Short and curated beats a pile of docs. In [LangChain's test of Claude Code on LangGraph tasks](https://www.langchain.com/blog/how-to-turn-claude-code-into-a-domain-specific-coding-agent), a condensed guide file beat docs access through an MCP server (a tool server the agent can call) alone, and on one task cost about 2.5 times less. The guide plus docs access did best, the same split as AGENTS.md plus llms.txt.

## Value 2: The Intelli graph gives the coding agent structure

Connected is good, but what the agent builds matters more. Ask a coding agent for a tool with no framework and you get a one-off script, shaped differently every time. With Intelli the agent builds a flow, and a flow has the same parts every time.

- **Small steps with one job each.** One step labels a ticket, another writes the reply. Small steps are easier to test and to replace than one long prompt.
- **Steps that run side by side.** Independent steps start together, so a ticket is labeled, rated and summarized at the same time.
- **Routes.** A step's result decides what runs next, such as an escalation note for urgent tickets and a drafted reply for the rest.
- **A model for each step.** Every step names its provider and model: OpenAI, Claude, Gemini, Mistral or a model on your own servers. That's what keeps you out of vendor lock-in.
- **Shared memory.** Steps can read what earlier steps stored, such as the original ticket.

In code, the graph is short. This is the part of the release brief tool that says which step feeds which, as the coding agent wrote it:

```python
return Flow(
    tasks=tasks,
    map_paths={"features": ["brief"], "fixes": ["brief"], "risks": ["brief"], "brief": ["headline"]},
    memory=memory,
    output_memory_map={"brief": "brief_md"},
)
```

You don't need to read that. Intelli can draw it.

## Value 3: Review the flow picture, not the code

This is the part that makes generated code safe to manage. Every Intelli flow can save a picture of itself, and the skill tells the coding agent to do that every time. Here's the picture of the release brief tool, drawn by the library from the code above:

<img src="/img/articles/flows/brief_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: features, fixes and risks steps feed a brief step, which feeds a headline step" />

*The release brief flow as Intelli draws it: three writers at the top feed the brief, and the brief feeds the headline.*

How to read it:

- **Each circle is a step.** The name under it is what the agent called the step.
- **The tag under the name is the model behind the step.** `[text:vllm]` means a text model on a server you host yourself, here a free model on your own machine. A cloud step would say `[text:openai]` or `[text:anthropic]`.
- **A solid arrow** means the step above always feeds the step below.
- **A red dashed arrow** is a route. The flow picks one at run time.
- **Steps on the same row with no arrow between them** run side by side.

That's enough to review a tool without reading its code. As the person who owns the process, check four things:

- Is every step you asked for there, and nothing you didn't ask for?
- Does the order match how your team does the work?
- Which steps send data to an outside vendor?
- Where are the decisions, and are they the right ones?

If something is off, say so in plain language and ask for a new picture. The picture shows structure, not quality. To judge quality you read the results, and a developer runs the short checklist near the end.

## Three AI agent use cases, from request to picture

Now the three values together. Each use case below has the business problem, the request someone types into Claude Code or Codex, the picture that comes back and what happened when the tool ran.

Where the code came from: a Claude coding agent produced it from each request plus the AGENTS.md section, and we trimmed it. It isn't a transcript of a Claude Code session, and we made no Codex run, though the same files work there. Every tool ran end to end on qwen2.5:0.5b, a tiny model, in Ollama, a free local model server, with no API keys. The full generated code is linked in the last section.

### Use case 1: Customer support automation that gets urgent tickets to an engineer

The support team's problem is speed. An outage report shouldn't wait in the same queue as a dark mode request. The request:

```text
Build a support ticket triage tool with Intelli. For each ticket, run three steps in parallel:
pick a category (billing, bug, account, feature), rate urgency (high, medium, low) and write a
one line summary. High urgency tickets get an escalation note for the on-call engineer; the rest
get a drafted customer reply. Run it on a local model and write a triage.md report.
```

The picture the agent hands back:

<img src="/img/articles/flows/triage_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: category, urgency and summary steps on one row, with red dashed routes from urgency to escalation and reply" />

*The triage flow: category, urgency and summary run side by side, and urgency routes each ticket to an escalation note or a reply.*

Without reading code you can see that every ticket gets three labels at once, that urgency is the only step that makes a decision, and that a ticket gets either an escalation note or a reply. Every tag says `vllm`, so no ticket text leaves your machine.

The two red dashed lines are these few lines of the generated code:

```python
router = DynamicConnector(
    decision_fn=lambda output, output_type: "escalate" if output == "high" else "reply",
    destinations={"escalate": "escalation", "reply": "reply"},
    name="urgency_router",
    mode=ConnectorMode.CUSTOM,
)
```

The run on six sample tickets:

```text
[billing |high  ] -> escalation I was charged twice for my March invoice. Ple
[feature |high  ] -> escalation Your API has returned 500 errors for every re
[account |high  ] -> escalation How do I change the email address on my accou
[account |high  ] -> escalation It would be great to have a dark mode in the
[account |high  ] -> escalation Someone logged into my account from another c
[account |low   ] -> reply      The CSV export button does nothing in Safari.
```

The structure held: six tickets in about five seconds, no errors, and exactly one of escalation or reply per ticket. The labels didn't. The tiny model rated 5 of 6 tickets high, so a dark mode request got an escalation note, and it filed the API outage as a feature. That's fine for a demo and not for a real inbox. The fix is a stronger model on the steps that need it, and a later section shows how to change a step's model with one request. The [dynamic routing docs](/docs/python/flows/dynamic-path) cover other kinds of routes.

### Use case 2: A weekly release brief for customers and sales

Every Friday someone spends an hour turning the developers' change notes into an update that customers and the sales team can read. The request:

```text
Every Friday I paste the week's commit messages. Use Intelli to turn them into a short release
brief for the team: a features section, a fixes section and a risks section, written in parallel,
then one brief with a headline. Run it locally and save brief.md.
```

You saw this tool's picture above: three writers at the top, one brief, one headline. What the picture can't show is a good decision the agent made. Plain code sorts the change notes into features, fixes and risks before any model sees them, because code does that perfectly and a tiny model doesn't.

Over five runs it took 2.8 to 4.5 seconds with no errors. The three section writers stayed faithful to their inputs. The merge step drifted: it kept 7 to 10 of the 10 sorted items and explained one fix as a performance improvement. That's why a person still reads the brief before it goes out. The [async flow docs](/docs/python/flows/async-flow) cover more graph shapes.

### Use case 3: One blog post, four channels, with a Vibe Agent

Marketing wants every blog post turned into a tweet thread, a LinkedIn post, a newsletter blurb and a search snippet. This use case goes one step further than the first two, with a Vibe Agent: Intelli builds the flow from a description instead of from Python code. The request:

```text
Use Intelli VibeAgent to build a content repurposing flow from a plain language intent: a blog
post goes in, and a tweet thread, a LinkedIn post, a newsletter blurb and an SEO meta description
come out, written in parallel. Save the generated spec so the same flow can be reloaded and run
again without planning. Run every task on local Ollama.
```

The picture:

<img src="/img/articles/flows/repurpose_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: four steps on one row named thread, linkedin, newsletter and meta, with no arrows between them" />

*The content flow: four writers on one row with no arrows, so all four work on the same post at the same time.*

With a Vibe Agent the flow is data, not code. This is one of the four steps as the coding agent wrote it:

```json
{"name": "thread", "post_process": "flag_new_numbers",
 "desc": "Write a thread of 4 short tweets about the blog post. Number them 1. to 4., one tweet per line. Use only facts from the post.",
 "agent": {"agent_type": "text", "provider": "vllm", "mission": "You turn blog posts into tweet threads.",
           "model_params": {"model": "qwen2.5:0.5b", "temperature": 0.3, "max_tokens": 300},
           "options": {"baseUrl": "${ENV:OLLAMA_BASE_URL}"}}}
```

Intelli checks that description, builds the flow and saves it as a bundle. Every later run loads the bundle and goes straight to work, with no planning step.

Who writes the plan matters. We first let the tiny local model plan, and it produced a usable plan 0 times in 42 attempts. So the coding agent writes the plan once, and small models do the repeated work. Each run on a sample post took 2.4 to 3.5 seconds. A check the agent added caught invented figures such as a "95%" cache hit rate, but not real numbers attached to the wrong fact. The drafts save the marketing team the blank page, and someone still edits them. The [Vibe Agents docs](/docs/python/vibe-agents) cover changing a saved flow with a new instruction.

## Change one step's model and see it in the picture

The three tools ran on one tiny local model, and the results show where that's enough and where it isn't. Running steps side by side worked. Labels, merged summaries and marketing copy need a stronger model. With Intelli you fix that one step at a time, and the picture shows the change.

The request:

```text
In the triage tool, move the customer reply step to Claude and keep every other step on the local model.
Then redraw the flow picture.
```

The agent adds one small helper and uses it for that step:

```python
# helpers.py (addition): a cloud agent for the steps customers read
import os


def claude_agent(mission, max_tokens=300):
    return Agent("text", "anthropic", mission,
                 {"key": os.environ["ANTHROPIC_API_KEY"], "model": "claude-sonnet-5", "max_tokens": max_tokens})
```

The new picture:

<img src="/img/articles/flows/triage_mixed_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: the same triage flow, with the reply step now tagged text anthropic and the other steps tagged text vllm" />

*The same triage flow after the change: the reply step is tagged `[text:anthropic]`, and every other step still runs locally.*

Now the picture answers a question a CIO asks: where does our data go? Only the reply step calls an outside vendor. We drew this picture from the real flow and ran the mix with a stand-in for the Claude call, since a real one is paid.

This is where the cost and risk decisions sit:

- **Cost.** Building a tool uses the coding agent you already pay for. Running it is a separate bill that depends on the model behind each step, and local steps cost nothing per call.
- **Data.** Decide for each step what may leave your network, and check it in the picture.
- **Vendor lock-in.** To avoid AI vendor lock-in, keep the model choice on the step, not in the tool's structure. To compare two vendors, change one step and run the same inputs through both.
- **Planning.** For Vibe Agents, planning happens once and the saved bundle runs with no planner call, so a strong planner adds almost nothing to the monthly cost.

## For developers: the kit, the checks and the full code

Everything above works from plain requests. This section is for the developer who installs the kit or reviews a tool before the team relies on it.

**The kit.** [AGENTS.md section](https://www.intellinode.ai/agent-kit/AGENTS.md), [SKILL.md](https://www.intellinode.ai/agent-kit/SKILL.md) and the docs index at [www.intellinode.ai/llms.txt](https://www.intellinode.ai/llms.txt), which follows the [llms.txt format](https://llmstxt.org/). To install by hand:

```bash
curl -s https://www.intellinode.ai/agent-kit/AGENTS.md >> AGENTS.md
mkdir -p .agents/skills/intelli-flows .claude/skills
curl -s https://www.intellinode.ai/agent-kit/SKILL.md -o .agents/skills/intelli-flows/SKILL.md
ln -s ../../.agents/skills/intelli-flows .claude/skills/intelli-flows
pip install intelli
```

**How each tool reads it.** Codex walks from the repository root down to your working directory and joins the AGENTS.md files it finds, up to 32 KiB by default; the [Codex AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md) has the details. Claude Code reads AGENTS.md on its own since v2.1.277, but only when the project has no CLAUDE.md. If it has one, put `@AGENTS.md` at the top of it, as the [Claude Code memory docs](https://code.claude.com/docs/en/memory) describe. Codex's web search is cached by default, so keep a local copy of llms.txt or run `codex --search`.

| | Claude Code | Codex |
| --- | --- | --- |
| Instructions file | `CLAUDE.md`, or `AGENTS.md` when no CLAUDE.md exists | `AGENTS.md` (`AGENTS.override.md` wins in the same folder) |
| Project skills folder | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` |
| Invoke a skill | `/intelli-flows` | `$intelli-flows`, or pick it from `/skills` |
| Check what loaded | `/memory` for AGENTS.md, `/skills` for skills | "Summarize the current instructions.", `/skills` |

We checked these paths against both tools' docs, not in live sessions.

**The generated code.** The complete files behind the three use cases: [helpers.py](https://www.intellinode.ai/agent-kit/examples/helpers.py), [triage.py](https://www.intellinode.ai/agent-kit/examples/triage.py), [release_brief.py](https://www.intellinode.ai/agent-kit/examples/release_brief.py), [repurpose.py](https://www.intellinode.ai/agent-kit/examples/repurpose.py), [repurpose_flowspec.json](https://www.intellinode.ai/agent-kit/examples/repurpose_flowspec.json) and the sample [post.md](https://www.intellinode.ai/agent-kit/examples/post.md).

**The checks.** Each tool had a way to fail without telling you. Before the team relies on generated code, confirm these, each verified by running code:

- **Read `flow.errors` after every run.** A failed task becomes an "Error: ..." string in the output, and `start()` doesn't raise.
- **Check every task's provider before `start()`.** A spec task without `agent_type` skips validation and defaults to openai.
- **Register processors on every load.** They aren't saved with the spec, and unknown names are skipped silently.
- **Use an absolute `save_dir`.** The bundle stores the spec path as given, so a relative one breaks from another folder.
- **Set the environment first.** An unset `${ENV:X}` stays as literal text instead of raising.
- **Never make one task depend on two branches of the same DynamicConnector.** Only one branch runs, so that task never runs, and nothing errors.

**MCP.** You don't need an MCP server for this. IntelliNode's own MCP server does a different job: it gives your coding agent 15 cross-provider tools, such as `review_code`, `generate_unit_tests` and `consensus`:

```bash
claude mcp add intellinode -- npx -y intellinode mcp
```

We started it from the IntelliNode repo rather than through npx, with no keys, and listed its tools; tool calls need provider keys, as the [MCP server docs](/docs/npm/mcp/server) describe.

## FAQ

### Can a project manager build an AI agent without coding?

You can get to a working first version. You describe the tool, the coding agent builds and runs it, and you review the flow picture and the results. Before it handles real customers, have a developer run the checks in this guide.

### How do you review code written by Claude Code or Codex?

Start with the structure, then the results. With Intelli the structure is a picture: the steps, their order, the routes and the model behind each step. Then read the outputs on real examples, and have a developer confirm the short checklist.

### What are good AI agent use cases for a business?

Start with work that is repetitive, heavy on text and easy for a person to check. This guide builds three: customer support automation that sorts tickets and escalates urgent ones, a weekly release brief written from change notes, and one blog post turned into posts for four channels.

### How do you avoid AI vendor lock-in with AI agents?

Keep the model choice out of the tool's structure. In an Intelli flow every step names its own provider and model, so one workflow can sort tickets on a local model and write replies with Claude or GPT. Moving a step to another vendor is a small change. [Agentic Workflows in Python](/articles/agentic-workflow-python) mixes three providers in one flow.

### How much does it cost to run AI agents like these?

There are two bills. Building a tool uses the coding agent subscription you already have. Running it depends on the model behind each step: steps on a local model cost nothing per call, and cloud steps are billed by the vendor per token. Start local, then move only the steps customers read.

### Does Claude Code read AGENTS.md?

Yes, from v2.1.277, and only when there's no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it. Otherwise put `@AGENTS.md` at the top of CLAUDE.md. Run `/memory` to check.

### Can these AI tools run without an API key?

Yes. Every tool here uses Intelli's `vllm` provider pointed at Ollama on `localhost:11434`, which needs no key. For a self-hosted vLLM server, see the [vLLM integration page](/docs/python/offline-chatbot/vllm).

## Next step

Pick the request your team asks for most. Connect IntelliNode with the setup request above, give your coding agent the request from that use case, and ask for the flow picture. Review the picture with the person who owns the process, then run the tool on real examples.

[How to Build an AI Agent in Python](/articles/how-to-build-ai-agent-python) shows what the agent loop looks like when a developer writes it by hand, and [Agentic Workflows in Python](/articles/agentic-workflow-python) covers the patterns behind these flows.
