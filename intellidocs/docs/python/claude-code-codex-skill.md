---
title: "Add Intelli as a Skill to Claude Code and Codex"
sidebar_label: "Coding agent skill"
description: "Add the Intelli skill to Claude Code or Codex so your coding agent writes, runs and draws AI agent flows in Python from a plain request."
keywords: ["claude code skill","codex skill","intelli skill","agents.md intelli","claude code plugin python","ai agent flows claude code","codex agents.md python"]
---

# Coding agent skill

<p className="doc-subtitle">Claude Code & Codex skill</p>

The Intelli skill teaches a coding agent to build with Intelli. You ask for a tool in plain words. The agent writes it as a flow, runs it, saves a picture of the flow and explains the result.

One skill file works in both Claude Code and Codex.

## Install the skill

### Claude Code

Add the plugin from inside a Claude Code session:

<div className="terminal terminal--chat">

```text
/plugin marketplace add intelligentnode/Intelli
/plugin install intelli-flows@intellinode
```

</div>

The plugin bundles the skill and its rules. After the install, the skill is listed as `/intelli-flows:intelli-flows`.

### Codex, or any project

Run the install script in the project folder:

<div className="terminal">

```bash
curl -fsSL https://www.intellinode.ai/agent-kit/install.sh | sh
```

</div>

It does three things, and it is safe to run again:

- adds an Intelli section to `AGENTS.md`, keeping what is already there
- saves the skill as `.agents/skills/intelli-flows/SKILL.md`, where Codex looks for it
- links that folder to `.claude/skills/intelli-flows`, where Claude Code looks for it

To do it by hand, download [SKILL.md](https://www.intellinode.ai/agent-kit/SKILL.md) and the [AGENTS.md section](https://www.intellinode.ai/agent-kit/AGENTS.md) and put them in those places.

## Install the library

The skill writes code for Intelli 2.1.0 or above. The `visual` extra adds the drawing library for flow pictures.

<div className="terminal">

```bash
pip install -U "intelli[visual]"
```

</div>

## Give it a model

Set one key before you start the coding agent. Don't paste keys into the chat.

<div className="terminal">

```bash
export OPENAI_API_KEY="your-key"
```

</div>

For Claude the name is `ANTHROPIC_API_KEY`. With no key set, the agent uses a local server such as Ollama or vLLM, which needs none.

## Ask for a tool

Describe what you want and how to run it:

```text
Build a support ticket triage tool with Intelli. For each ticket, pick a category, rate urgency and
write a one line summary, all in parallel. High urgency tickets get an escalation note; the rest get
a drafted reply. Run it on six sample tickets, then show me the flow picture and explain it.
```

The skill makes the agent follow the same routine every time:

1. Write the tool as a flow of small steps.
2. Run it, and fix any step that fails.
3. Read the output and check it against the input.
4. Save a picture of the flow.
5. Report in plain language: what each step does, which model it uses and where the files are.

The picture shows each step, the model behind it and the routes between steps, so you can review the tool without reading its code.

## Check that it loaded

| | Claude Code | Codex |
| --- | --- | --- |
| List skills | `/skills` | `/skills` |
| Call the skill by name | `/intelli-flows:intelli-flows` from the plugin, `/intelli-flows` from the install script | `$intelli-flows` |
| Check the instruction file | `/memory` | Ask "Summarize the current instructions." |

Claude Code reads `AGENTS.md` on its own when the project has no `CLAUDE.md`. If the project has one, add the line `@AGENTS.md` at the top of it.

## Keep it up to date

- **Claude Code plugin**: run `/plugin marketplace update intellinode`, then choose **Update now** for the plugin in the `/plugin` panel.
- **Install script**: run it again. It replaces the skill file and leaves your `AGENTS.md` section in place.

## Learn more

- [Give IntelliNode to Claude Code or Codex to Build AI Agents](/articles/build-ai-agents-claude-code-codex) walks through three tools built this way, with the flow pictures and what our tests found.
- The docs index for coding agents is at [www.intellinode.ai/llms.txt](https://www.intellinode.ai/llms.txt).
- [Flows](/docs/python/flows/get-started) and [Vibe Agents](/docs/python/vibe-agents) cover what the agent builds with.
