---
sidebar_position: 13
---
# Computer Use

The computer use agent gives the model a screen and lets it act on it. Intelli takes a screenshot, sends it using the native computer use tools of Anthropic or OpenAI, receives an action such as click, type or scroll, executes that action against the environment, then sends the next screenshot. The loop repeats until the task is done.

This is useful when there is no API to call, for example an internal portal, a legacy admin panel, or a supplier website.

### Installation

The browser environment needs the optional `computer` extra:

```bash
pip install intelli[computer]
python -m playwright install chromium
```

### Parameters

- **api_key**: The provider key.
- **provider**: `anthropic` or `openai`.
- **model**: Defaults to the configured Anthropic chat model, or `gpt-5.5` for openai.
- **environment**: A `ComputerEnvironment` instance. Required.
- **max_iterations**: Cap on model turns, default 25.
- **on_action** (optional): Callable that receives the action and returns `False` to block it.
- **on_safety_check** (optional): Callable to approve the safety checks returned by OpenAI computer use.
- **log** (optional): Print each action when `True`.

### Example

```python
from intelli.function.computer_agent import ComputerAgent
from intelli.function.browser_env import PlaywrightBrowserEnvironment

env = PlaywrightBrowserEnvironment(start_url="https://example.com", headless=True)

agent = ComputerAgent(
    api_key=YOUR_ANTHROPIC_KEY,
    provider="anthropic",
    model="claude-sonnet-5",
    environment=env,
)

try:
    result = agent.run("Open the pricing page and report the cheapest plan.")
    print(result["output"])
finally:
    env.close()
```

`run()` returns a dictionary with `success`, `output`, `iterations` and `actions`.

### Supported Models

| Provider | Tool | Models |
| -------- | ---- | ------ |
| `anthropic` | `computer_20251124`, with the 4.5 era tool selected automatically for older models | `claude-sonnet-5`, `claude-opus-5`, `claude-sonnet-4-6` |
| `openai` | The computer tool on the responses API | `gpt-5.5`, `gpt-5.4` |

The beta header and the request shape are handled by the library.

### Human In The Loop

Computer use acts on a live screen, so two hooks are available:

```python
agent = ComputerAgent(
    api_key=YOUR_KEY,
    provider="openai",
    environment=env,
    on_action=lambda action: action["type"] != "type",
    on_safety_check=lambda call, checks: approve_in_your_ui(checks),
)
```

- `on_action` returns `False` to block an action. If the hook raises, the action is blocked.
- `on_safety_check` handles the safety checks that OpenAI computer use can return. Intelli does not approve them automatically. Without this hook the loop stops and returns the pending checks inside `result["pending_safety_checks"]`.

### Inside a Flow

Use `agent_type="computer"` to run the agent as a task. When you pass `start_url` and no environment, a browser is created for the task and closed at the end.

```python
from intelli.flow import Agent, Task, Flow, TextTaskInput

browser_agent = Agent(
    agent_type="computer",
    provider="anthropic",
    mission="operate the browser",
    model_params={
        "key": YOUR_ANTHROPIC_KEY,
        "model": "claude-sonnet-5",
        "start_url": "https://example.com",
        "max_iterations": 25,
    },
)

check_task = Task(TextTaskInput("Report the main heading of the page."), browser_agent, log=True)

flow = Flow(tasks={"check": check_task}, map_paths={"check": []}, log=True)
result = asyncio.run(flow.start())
```

The task output is the text the agent produced, so any following task can consume it.

### Custom Environment

To drive something other than a browser, such as a desktop or an emulator, implement `ComputerEnvironment`:

```python
from intelli.function.computer_agent import ComputerEnvironment

class MyDesktop(ComputerEnvironment):
    display_width = 1280
    display_height = 800

    def screenshot(self): ...          # return PNG bytes
    def click(self, x, y, button="left", modifiers=None): ...
    def type_text(self, text): ...
    def key(self, combo): ...
    def scroll(self, x, y, scroll_x=0, scroll_y=0, modifiers=None): ...
```

The move, drag, mouse_down, mouse_up, hold_key, go_back and go_forward methods are optional.
