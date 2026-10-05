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

IntelliNode changes what comes back. The agent builds the tool as a flow, a small graph of steps. It draws a picture of the graph before anything runs, then runs it and reports back in plain words. This guide starts with one example on an OpenAI or Claude key, then moves the same tool to an offline model and shows what our tests found.

![Clusters of dots joined by thin curved lines, like a coding agent linking project rules, docs and agent apps](/img/articles/build-ai-agents-claude-code-codex.jpg)

<!-- truncate -->

## What changes when your coding agent has IntelliNode

Three things, each with its own section below.

1. **The agent knows the library.** One skill teaches it to build with Intelli, the Python library in IntelliNode.
2. **It builds a graph instead of a script.** Small steps, each on the model you choose.
3. **You get a picture of what it built.** One look tells you what the tool does and where your data goes.

![Diagram: you make a plain request, the coding agent builds an Intelli flow, and the flow picture comes back for you to review](pathname:///img/articles/diagrams/build-ai-agents-claude-code-codex-review.svg)

*You ask in plain words, and a picture of what the agent built comes back.*

:::tip[Get the skill first]

One skill works in both Claude Code and Codex, and every example below needs it. There are three ways to get it. Pick one.

**In Claude Code.** Type these two commands in the Claude Code chat:

<div className="terminal terminal--chat">

```text
/plugin marketplace add intelligentnode/Intelli
/plugin install intelli-flows@intellinode
```

</div>

**In Codex, or without commands.** Download the skill. In the next section, your coding agent unzips it and puts it in place.

<div className="kit-downloads">
<a className="button button--primary button--sm" href="https://www.intellinode.ai/agent-kit/intelli-flows.zip" download="intelli-flows.zip">Download the skill (.zip)</a>
</div>

**Or in a terminal.** Open a terminal in your project folder, the folder where you start Claude Code or Codex, and run:

<div className="terminal">

```bash
curl -fsSL https://www.intellinode.ai/agent-kit/install.sh | sh
pip install -U "intelli[visual]"
```

</div>

The first line installs the skill for both coding agents. The second installs Intelli, the library the skill writes code for, and you need version 2.1.1 or above. If you chose the plugin or the zip, your coding agent installs the library for you in the next section.

:::

## Value 1: Connect IntelliNode to Claude Code or Codex

A coding agent writes code from what it reads first. The skill is a small folder the agent opens when a task calls for it: `SKILL.md` says when to use it, `AGENTS.md` next to it holds the rules, and a reference file lists the step types and providers.

You don't edit any of it. Paste this into your coding agent:

```text
Set this project up to build with Intelli. Use the intelli-flows.zip I downloaded, or get it from
https://www.intellinode.ai/agent-kit/intelli-flows.zip.
1. Unzip it into .agents/skills/ so the skill is at .agents/skills/intelli-flows/SKILL.md, and link
   that folder to .claude/skills/intelli-flows so Claude Code finds it too.
2. Run pip install -U "intelli[visual]" and tell me the installed version. It should be 2.1.1 or above.
Tell me when it is done and what you added.
```

It may ask before it downloads or installs anything. Say yes. If you installed the Claude Code plugin, the skill is already in place, so ask only for step 2. If you ran the terminal commands, both steps are done and you can skip this prompt.

Then give it one key. The easiest start is a hosted model from OpenAI or Claude, because there's nothing to run on your own machine. Ask whoever manages your accounts for an API key, and set it in the terminal before you start the coding agent:

<div className="terminal">

```bash
export OPENAI_API_KEY="your-key"
```

</div>

For Claude the name is `ANTHROPIC_API_KEY`. Don't paste a key into the chat. Offline models need no key at all, and we get to them after the first example.

With that done, every request you make goes through the same routine. The skill's rules open with it:

```markdown
When the user asks for an AI tool, follow this sequence. The user may not read code.
1. Write the tool as an Intelli flow of small steps.
2. Save the flow picture before the first run: `flow.generate_graph_img(name="<tool>_graph", save_path=".")`. Drawing calls no model and needs no key.
3. Run it. If `flow.errors` is not empty, fix the cause and run again.
4. Read the output. An empty `flow.errors` only means nothing crashed. Check that `sorted(out)` lists exactly the steps you expect and that the text is right for the input: a small model may return the input unchanged or give every item the same label. Open saved images and check audio sizes too. Fix and run again.
5. Report in plain language: what each step does, which model each step uses (say "a local model on your computer" for vllm), what you checked and what is still weak, and where the picture and the output files are.
```

Step 2 means you see the plan before any model is called. Step 4 is there because of our tests, more on that below.

Short rules like these are enough. In our tests, agents that had only the skill's files built all three tools in this guide.

## Value 2: The Intelli graph gives the coding agent structure

Ask a coding agent for a tool with no framework and you get a one-off script, shaped differently every time. With Intelli it builds a flow: small steps with one job each, wired into a graph.

That shape does real work. Steps that don't depend on each other run at the same time, and one step's answer can decide which step runs next. Every step also names its own model: OpenAI, Claude, Gemini, Amazon Bedrock or one on your own servers. A free local model can sort tickets while a cloud model writes the reply a customer reads, and you aren't tied to one vendor.

In code, the wiring is short. This line, from a release brief tool you'll meet below, says which step feeds which:

```python
flow = Flow(tasks=tasks, map_paths={"features": ["brief"], "fixes": ["brief"], "risks": ["brief"]})
```

You don't have to read it. Intelli draws it.

Steps aren't limited to text. One flow can have Claude write a product pitch, OpenAI illustrate it and read it aloud, and Gemini check that the picture matches. The picture colors each step by type:

<img src="/img/articles/flows/mixed_types_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: a pitch step on Claude feeds an illustration step on OpenAI and a voice over step on OpenAI, and the illustration feeds an image check step on Gemini, each colored by step type" />

*Four step types from three providers in one flow, drawn before any model was called.*

## Value 3: Review the flow picture, not the code

Every flow can save a picture of itself, and the skill makes the agent save it before the first run. Drawing calls no model and needs no key, so you can check the plan before anything is spent. When you didn't spell out the steps, the agent also shows a short table of them and waits for your go-ahead. That's what turns generated code from a black box into a transparent box. The first example shows how to read a picture.

### First example: support triage with one OpenAI or Claude key

An outage report shouldn't wait in the same queue as a dark mode request. With your key set, the request is:

```text
Build a support ticket triage tool with Intelli. For each ticket, run three steps in parallel: pick a
category (billing, bug, account, feature), rate urgency (high, medium, low) and write a one line summary.
High urgency tickets get an escalation note for the on-call engineer; the rest get a drafted customer
reply. Run it on OpenAI with six sample tickets and write a triage.md report. My key is in
OPENAI_API_KEY. Then show me the flow picture and explain it in plain language.
```

To use Claude, name it in the request and set its key instead. The picture that comes back:

<img src="/img/articles/flows/triage_openai_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: category, urgency and summary feed a triage card step, with red dashed arrows labeled high and other leading to an escalation note or a customer reply. Every step is tagged text openai" />

*Three steps read the ticket together and feed a triage card. The red dashed arrows are routes: only one is followed for each ticket.*

Each circle is a step, named by the agent. The tag under the name is the model behind it, here `[text:openai]` on every step. A solid arrow means one step always feeds the next. Steps on one row with no arrow between them run together.

So before anyone opens a file, you can check two things: the steps match what you asked for, and no step sends data somewhere you didn't approve. If the picture looks wrong, say so and ask for a new one.

The routing in the picture is this part of the generated code:

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

Along with the picture you get a report file with each ticket's labels and drafted text, and a summary from the agent in plain words.

One note on how we checked this version. We drew the picture from the real flow and ran the tool on its OpenAI and Claude settings with stand-ins for the paid calls. The runs we measured are in the next section, on a free offline model.

## Then move to vLLM and offline models

A hosted model is the quick start. A local one costs nothing per call and keeps every ticket inside your network. Intelli reaches local servers such as Ollama or vLLM through a provider it calls `vllm`, and the tool you just built moves over with one request:

```text
Move every step of the triage tool to the local model on this machine and run it again.
Then redraw the flow picture.
```

<img src="/img/articles/flows/triage_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: the same triage flow with every step tagged text vllm" />

*The same flow on a local model. Every tag now says `[text:vllm]`.*

Nothing else in the picture moved. The structure you reviewed is the same, and only the place it runs has changed.

### How we tested the offline path

For each use case we started a fresh Claude agent in an empty folder. It got the setup request, then one request in plain words. It could read only the two kit files and the public docs. Everything ran on the published package and a tiny free model on our own machine, which is the hardest case for output quality. These were Claude agents following the kit, not Claude Code sessions, and we made no Codex run.

All three built a working tool and ran it. None got it right the first time, and that turned out to be the useful part.

### Support triage on a tiny local model

Part of the agent's own report, word for word:

> Your ticket triage tool is built and ran on all six sample tickets in about 11 seconds, with no errors. Everything ran on the small model on your own machine; nothing was sent to a cloud service.

Getting there took six runs. Version one looked fine and reported no errors, yet it wrote both an escalation note and a reply for the same ticket. The agent caught that by checking which steps had run, then added the triage card step so only one route fires. Version two rated every ticket high, so it reworded the question and tested again.

On the final run the labels matched a person's on all six categories and five of six urgency ratings. Then the agent added a warning of its own: "That score is flattering. I adjusted the wording of the urgency question on these same six tickets." That is the kind of sentence you want from a tool builder.

### A weekly release brief for customers and sales

Every Friday someone turns the developers' change notes into an update that customers can read. The request:

```text
Every Friday I paste the week's commit messages. Use Intelli to turn them into a short release brief
for customers and the sales team: a features section, a fixes section and a risks section, written in
parallel, then one brief with a headline. Run it on a local model with about ten sample commit messages
and save brief.md. Then show me the flow picture and explain it in plain language.
```

<img src="/img/articles/flows/brief_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: features, fixes and risks steps each have an arrow to a brief step below them" />

*Three writers at the top, one editor step below.*

Its first run finished with no errors and a wrong brief: fixes were listed as features, with details the model made up. So the agent moved the sorting into ordinary code, which does it perfectly, and left the model one small job, rewriting each item in plain words. It also added a check that falls back to the original wording when a sentence drifts.

Producing the final brief took about a second. It still said "log in directly from Google Workspace" where the change note said "sign in with". A person reads it before it goes out.

### One blog post, four channels

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

A planner mistake spreads to every step after it, so the planner is the first step to move to a stronger model.

## Mix both: one step on a stronger model

You don't have to pick a side. The tests show where a tiny model is enough and where it isn't: sorting in code and running steps together worked, and writing for customers needs something stronger. Change that one step:

```text
In the triage tool, keep every step on the local model except the customer reply. Move that step to
Claude. Then redraw the flow picture.
```

One step's agent changes:

```python
Agent("text", "anthropic", "You write short, polite replies to customers.",
      {"key": os.environ["ANTHROPIC_API_KEY"], "model": "claude-sonnet-5", "max_tokens": 320})
```

<img src="/img/articles/flows/triage_mixed_graph.png" width="560" loading="lazy" alt="Flow picture drawn by Intelli: the same triage flow, with the customer reply step tagged text anthropic and all other steps tagged text vllm" />

*Only the customer reply step is tagged `[text:anthropic]`. The rest stays local.*

Now the picture answers the question a CIO asks first: where does our data go? Only that step calls an outside vendor. We drew this picture from the real flow without calling Claude, since that call is paid.

It also settles most of the cost. Building a tool uses the coding agent you already pay for. Running it costs whatever the model behind each step costs, and local steps are free. To compare two vendors, change one step and run the same inputs through both.

## What the tests changed

"No errors" is not the same as "right". In all three tests the first run reported no errors and produced something wrong. The agents noticed because they read their own output, so that is now a written step in the skill's rules.

Two of the failures were the library's doing, and Intelli 2.1.0 fixed both. A routed step now runs only when its route is chosen, and the default prompt no longer carries the stray placeholder that made a small model copy its input.

For you, the lesson is short. Review the picture for structure and the agent's report for weak spots. Then have a person read real output before a customer sees any of it.

## For developers

The skill is one folder in the Intelli repository, [plugins/intelli-flows/skills/intelli-flows](https://github.com/intelligentnode/Intelli/tree/main/plugins/intelli-flows/skills/intelli-flows): [SKILL.md](https://github.com/intelligentnode/Intelli/blob/main/plugins/intelli-flows/skills/intelli-flows/SKILL.md), its rules in [AGENTS.md](https://github.com/intelligentnode/Intelli/blob/main/plugins/intelli-flows/skills/intelli-flows/AGENTS.md) and a [reference of step types and providers](https://github.com/intelligentnode/Intelli/blob/main/plugins/intelli-flows/skills/intelli-flows/references/agents.md). The Claude Code plugin ships that folder. The [install script](https://www.intellinode.ai/agent-kit/install.sh) downloads it from the same path into `.agents/skills/intelli-flows` and links it for Claude Code, and the zip in the box holds the same three files. The [skill page in the docs](/docs/python/claude-code-codex-skill) has the install steps on one page. When the skill needs an API it doesn't cover, it reads the docs index at [www.intellinode.ai/llms.txt](https://www.intellinode.ai/llms.txt), written in the [llms.txt format](https://llmstxt.org/). The `visual` extra installs the drawing library. Without it the flow runs and the picture step fails.

Codex finds project skills in `.agents/skills` and Claude Code in `.claude/skills`, which is why the script links one to the other. We checked these paths against both tools' docs, not in live sessions.

| | Claude Code | Codex |
| --- | --- | --- |
| Project skills folder | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` |
| Invoke the skill | `/intelli-flows`, or `/intelli-flows:intelli-flows` from the plugin | `$intelli-flows` |

The code behind the examples is published: [triage](https://www.intellinode.ai/agent-kit/examples/triage/triage.py), [release brief](https://www.intellinode.ai/agent-kit/examples/release_brief/release_brief.py) and [content reuse](https://www.intellinode.ai/agent-kit/examples/repurpose/repurpose.py) with its [plan](https://www.intellinode.ai/agent-kit/examples/repurpose/repurpose_spec.json). It is what the test agents wrote, with two additions from us: the planner step, and a switch in the triage tool that picks OpenAI or Claude when a key is set and a local server when `TRIAGE_PROVIDER=vllm`. We ran each one again from a clean folder before publishing. The [async flow docs](/docs/python/flows/async-flow) and the [Vibe Agents docs](/docs/python/vibe-agents) cover the library itself.

## FAQ

### Can a project manager build an AI agent without coding?

You can get to a working first version. You describe the tool, and the coding agent builds and runs it. Your part is reviewing the picture and the report. Before the tool handles real customers, have a developer look at it.

### How do you review code written by Claude Code or Codex?

Structure first, then results. With Intelli the structure is a picture of the steps and the model behind each one. After that, read the output on real examples. A clean run doesn't prove the output is right.

### How do you avoid AI vendor lock-in with AI agents?

Keep the model choice on each step. In an Intelli flow every step names its own provider and model, so moving one step to another vendor is a small change. [Agentic Workflows in Python](/articles/agentic-workflow-python) mixes three providers in one flow.

### Does Claude Code read AGENTS.md?

Yes, from v2.1.277, when there's no `CLAUDE.md` in the project. Otherwise put `@AGENTS.md` at the top of CLAUDE.md and run `/memory` to check that it loaded. The Intelli skill doesn't depend on it: its rules sit in the skill folder and load with the skill.

### Can these AI tools run without an API key?

Yes. Start a local model server such as Ollama and ask for a local model. All three tools ran that way in our tests, through Intelli's `vllm` provider. For a self-hosted server, see the [vLLM integration page](/docs/python/offline-chatbot/vllm).

## Next step

Get the skill and set one key. Then paste the first request into your coding agent. When the picture comes back, look at it with the person who owns the process. Move to an offline model once the structure is right.

If you want to see what the agent loop looks like when a developer writes it by hand, read [How to Build an AI Agent in Python](/articles/how-to-build-ai-agent-python).
