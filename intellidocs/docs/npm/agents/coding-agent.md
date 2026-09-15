---
sidebar_position: 1
title: "AI Coding Agent for Node.js"
sidebar_label: "Coding Agent"
description: "Use the IntelliNode CodingAgent in Node.js to edit a workspace, run tests, and automate code fixes with OpenAI, Anthropic, Gemini, Mistral, Cohere, or Ollama."
keywords: ["intellinode coding agent","node.js coding agent","npm intellinode agent","automated code fixes node.js","workspace toolkit node.js","ai agent run tests"]
---

# Coding Agent

The coding agent works on a folder. It receives a task, reads and edits the files, runs your test command, then repeats until the tests pass or the iteration limit is reached. All file access is confined to the workspace you provide, and it runs on any chat provider.

### Tools

The agent calls a small toolset on your workspace:

| Tool | Purpose |
| --- | --- |
| `read_file` | Read a file from the workspace. |
| `write_file` | Create or replace a file. |
| `edit_file` | Replace an exact, unique block of text inside a file. |
| `list_files` | List the workspace files. |
| `search` | Search the workspace for a regular expression. |
| `bash` | Run a command, for example the test suite. |

### Settings

- **apiKey**: the provider key.
- **provider**: any chat provider, such as `openai` (default), `anthropic`, `gemini`, `mistral`, `cohere` or `ollama`.
- **model**: the model id, for example `claude-sonnet-5` or `gpt-5.5`.
- **workspace**: the folder the agent is allowed to work in.
- **maxIterations**: cap on model turns, default 20.
- **allowBash**: set to `false` to disable command execution, default `true`.
- **bashTimeout**: milliseconds allowed per command, default 120000.
- **options**: chatbot options such as `baseUrl`, `timeout` or `retries`.
- **log**: print each tool call when `true`.
- **onAction**: a callback `({ iteration, tool, args, thought })` called before each tool runs.

### Example

```javascript
const { CodingAgent } = require('intellinode');

const agent = new CodingAgent({
  apiKey: ANTHROPIC_API_KEY,
  provider: 'anthropic',
  model: 'claude-sonnet-5',
  workspace: './my_repo',
});

const result = await agent.run('Fix the failing tests in calc.js', { testCommand: 'npm test' });

console.log(result.success, result.summary);
```

`run()` resolves with `{ success, summary, iterations, testOutput }`. Without a `testCommand` the agent finishes when the model reports the task done; with one, `finish` is accepted only when the command exits with code 0, otherwise the test output goes back to the model and the loop continues.

### Watching the agent

```javascript
const agent = new CodingAgent({
  apiKey: OPENAI_API_KEY,
  provider: 'openai',
  workspace: './my_repo',
  maxIterations: 12,
  onAction: ({ iteration, tool, args }) => console.log(`#${iteration} ${tool}`, tool === 'write_file' ? args.path : args),
});
```

### The workspace toolkit

The same tools are available on their own through `WorkspaceToolkit`, for example to build your own agent loop:

```javascript
const { WorkspaceToolkit } = require('intellinode');

const tools = new WorkspaceToolkit('./my_repo', { allowBash: true, bashTimeout: 60000 });
console.log(tools.listFiles());
console.log(tools.search('TODO'));
console.log(tools.runBash('npm test'));   // '[exit code 0]\n...'
```

Every path is resolved inside the workspace; a path that escapes it (including through a symlink) is rejected.

### Notes

- The agent is Node only; it is not part of the browser bundle.
- Small local models may not follow the tool protocol reliably; use a capable model for real repositories.
