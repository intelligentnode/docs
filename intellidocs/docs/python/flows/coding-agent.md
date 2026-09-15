---
sidebar_position: 14
---
# Coding Agent

The coding agent works on a folder. It receives a task, reads and edits the files, runs your test command, then repeats until the tests pass or the iteration limit is reached. All file access is confined to the workspace you provide.

### Tools

The agent calls a small toolset on your workspace:

| Tool | Purpose |
| ---- | ------- |
| `read_file` | Read a file from the workspace. |
| `write_file` | Create or replace a file. |
| `edit_file` | Replace an exact block of text inside a file. |
| `list_files` | List the workspace files. |
| `search` | Search the workspace for a pattern. |
| `run_bash` | Run a command, for example the test suite. |

### Parameters

- **api_key**: The provider key.
- **provider**: Any chat provider, such as `openai`, `anthropic` or `gemini`.
- **model**: The model id, for example `claude-sonnet-5` or `gpt-5.5`.
- **workspace**: The folder the agent is allowed to work in. Required.
- **max_iterations**: Cap on model turns, default 20.
- **allow_bash**: Set to `False` to disable command execution, default `True`.
- **bash_timeout**: Seconds allowed per command, default 120.
- **log** (optional): Print each tool call when `True`.

### Example

```python
from intelli.function.coding_agent import CodingAgent

agent = CodingAgent(
    api_key=YOUR_ANTHROPIC_KEY,
    provider="anthropic",
    model="claude-sonnet-5",
    workspace="./my_repo",
)

result = agent.run(
    "Fix the failing tests in calc.py",
    test_command="python -m pytest -q",
)

print(result["success"], result["summary"])
```

`run()` returns a dictionary with `success`, `summary`, `iterations` and `test_output`.

### Inside a Flow

Use `agent_type="coder"`. The task text is the coding task, and the output is a short summary that the next task can consume.

```python
from intelli.flow import Agent, Task, Flow, TextTaskInput

coder = Agent(
    agent_type="coder",
    provider="anthropic",
    mission="fix the failing tests",
    model_params={
        "key": YOUR_ANTHROPIC_KEY,
        "model": "claude-sonnet-5",
        "workspace": "./my_repo",
        "test_command": "python -m pytest -q",
        "max_iterations": 20,
    },
)

fix_task = Task(TextTaskInput("The add function returns the wrong result."), coder, log=True)

flow = Flow(tasks={"fix": fix_task}, map_paths={"fix": []}, log=True)
result = asyncio.run(flow.start())
```
