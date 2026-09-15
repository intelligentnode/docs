---
sidebar_position: 3
---

# Release checks

Teams ship a web app several times a week, and the critical journeys such as sign in, search and checkout have to keep working. Classic browser tests break whenever a button moves or a class name changes, so somebody spends the sprint repairing selectors instead of writing tests.

A computer use agent looks at the rendered page the way a tester does. You describe the journey in words, and the agent finds the elements on screen.

<svg viewBox="0 0 760 210" width="100%" role="img" aria-label="Screenshot to action loop">
  <defs>
    <marker id="rcArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#64748b" />
    </marker>
  </defs>
  <rect x="20" y="60" width="150" height="70" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
  <text x="95" y="90" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Staging app</text>
  <text x="95" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">after deploy</text>
  <line x1="170" y1="95" x2="235" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#rcArrow)" />
  <text x="202" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">screenshot</text>
  <rect x="240" y="60" width="160" height="70" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
  <text x="320" y="90" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Computer agent</text>
  <text x="320" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">claude-sonnet-5</text>
  <line x1="400" y1="95" x2="465" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#rcArrow)" />
  <text x="432" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">action</text>
  <rect x="470" y="60" width="150" height="70" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
  <text x="545" y="90" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">click, type</text>
  <text x="545" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">scroll, keys</text>
  <line x1="620" y1="95" x2="680" y2="95" stroke="#059669" strokeWidth="1.5" markerEnd="url(#rcArrow)" />
  <rect x="640" y="60" width="100" height="70" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
  <text x="690" y="90" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#065f46">Report</text>
  <text x="690" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#059669">pass or fail</text>
  <path d="M320 130 L320 170 L95 170 L95 130" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#rcArrow)" />
  <text x="207" y="187" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">repeat until the journey is finished</text>
</svg>

### The check

Point the agent at the staging URL and describe the journey.

```python
from intelli.function.computer_agent import ComputerAgent
from intelli.function.browser_env import PlaywrightBrowserEnvironment

env = PlaywrightBrowserEnvironment(start_url="https://staging.example.com", headless=True)

agent = ComputerAgent(
    api_key=ANTHROPIC_KEY,
    provider="anthropic",
    model="claude-sonnet-5",
    environment=env,
    max_iterations=20,
    log=True,
)

try:
    result = agent.run(
        "Search for a laptop stand, open the first result, add it to the cart, "
        "then report the cart total and whether the checkout button is enabled."
    )
    print(result["output"])
finally:
    env.close()
```

### Keep the agent read only

A smoke check should never place a real order. The `on_action` hook blocks any action you did not intend, and it blocks the action as well if the hook itself raises.

```python
BLOCKED_WORDS = ["place order", "pay now", "confirm purchase"]

def guard(action):
    text = str(action.get("text", "")).lower()
    return not any(word in text for word in BLOCKED_WORDS)

agent = ComputerAgent(
    api_key=ANTHROPIC_KEY,
    provider="anthropic",
    environment=env,
    on_action=guard,
)
```

### Run the checks in one flow

Each journey is a task, so the whole suite runs in a single flow and a final text agent turns the outputs into a release note.

```python
import asyncio
from intelli.flow import Agent, Task, Flow, TextTaskInput

def journey_agent(mission):
    return Agent(
        agent_type="computer",
        provider="anthropic",
        mission=mission,
        model_params={
            "key": ANTHROPIC_KEY,
            "model": "claude-sonnet-5",
            "start_url": "https://staging.example.com",
            "max_iterations": 20,
        },
    )

sign_in = Task(
    TextTaskInput("Open the sign in page and report whether the form accepts a demo account."),
    journey_agent("check the sign in journey"),
    log=True,
)

search = Task(
    TextTaskInput("Search for a laptop stand and report how many results appear."),
    journey_agent("check the search journey"),
    log=True,
)

summary = Task(
    TextTaskInput("Write a short release check summary. Mark every failing journey clearly."),
    Agent(
        agent_type="text",
        provider="openai",
        mission="summarize release checks",
        model_params={"key": OPENAI_KEY, "model": "gpt-5.5"},
    ),
    log=True,
)

flow = Flow(
    tasks={"sign_in": sign_in, "search": search, "summary": summary},
    map_paths={"sign_in": ["summary"], "search": ["summary"], "summary": []},
    log=True,
)

results = asyncio.run(flow.start())
print(results["summary"]["output"])
```

### Why it helps

- The checks survive a redesign, because the agent reads the screen instead of a selector.
- A new journey costs one sentence, so product people can add checks too.
- The same flow runs against staging and production by changing `start_url`.
