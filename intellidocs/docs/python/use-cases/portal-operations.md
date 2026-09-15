---
sidebar_position: 4
---

# Portal operations

Finance and operations teams spend hours inside supplier portals, insurance systems and carrier websites. Those systems rarely offer an API, so somebody signs in every morning, opens the same pages and copies the numbers into a sheet.

A computer use agent performs that routine, and a text agent turns the result into structured data your systems can load.

<svg viewBox="0 0 760 200" width="100%" role="img" aria-label="Portal to structured data pipeline">
  <defs>
    <marker id="poArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#64748b" />
    </marker>
  </defs>
  <rect x="15" y="55" width="160" height="80" rx="10" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
  <text x="95" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Vendor portal</text>
  <text x="95" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#b91c1c">no API</text>
  <text x="95" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#b91c1c">manual today</text>
  <line x1="175" y1="95" x2="235" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#poArrow)" />
  <rect x="240" y="55" width="165" height="80" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
  <text x="322" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Computer agent</text>
  <text x="322" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">signs in, navigates</text>
  <text x="322" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">reads the tables</text>
  <line x1="405" y1="95" x2="465" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#poArrow)" />
  <rect x="470" y="55" width="150" height="80" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
  <text x="545" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Text agent</text>
  <text x="545" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">normalizes to</text>
  <text x="545" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">JSON rows</text>
  <line x1="620" y1="95" x2="678" y2="95" stroke="#059669" strokeWidth="1.5" markerEnd="url(#poArrow)" />
  <rect x="640" y="55" width="105" height="80" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
  <text x="692" y="90" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#065f46">ERP</text>
  <text x="692" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#059669">or database</text>
  <text x="380" y="175" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">one flow, scheduled every morning</text>
</svg>

### Collect and structure in one flow

The computer agent reads the portal, then a text agent converts the free text into rows. Keep credentials in environment variables and let the agent use the values, never hard coded strings.

```python
import asyncio, os
from intelli.flow import Agent, Task, Flow, TextTaskInput

portal_agent = Agent(
    agent_type="computer",
    provider="anthropic",
    mission="read the supplier portal",
    model_params={
        "key": os.getenv("ANTHROPIC_API_KEY"),
        "model": "claude-sonnet-5",
        "start_url": "https://supplier.example.com/invoices",
        "max_iterations": 30,
    },
)

collect = Task(
    TextTaskInput(
        "Open the invoices page for this month and report every invoice with its "
        "number, date, amount and payment status."
    ),
    portal_agent,
    log=True,
)

structure = Task(
    TextTaskInput(
        "Convert the invoice list into JSON. Use the keys number, date, amount and status. "
        "Answer with JSON only."
    ),
    Agent(
        agent_type="text",
        provider="openai",
        mission="normalize extracted data",
        model_params={"key": os.getenv("OPENAI_API_KEY"), "model": "gpt-5.5"},
    ),
    log=True,
)

flow = Flow(
    tasks={"collect": collect, "structure": structure},
    map_paths={"collect": ["structure"], "structure": []},
    log=True,
)

results = asyncio.run(flow.start())
print(results["structure"]["output"])
```

### Guard the actions

Reading a portal is safe, but the same session can also submit forms. Block anything that writes, and review the rest before you widen the permissions.

```python
WRITE_ACTIONS = ["submit", "approve", "delete", "pay"]

def read_only(action):
    text = str(action.get("text", "")).lower()
    return not any(word in text for word in WRITE_ACTIONS)
```

Pass `read_only` as `on_action` when you build the agent directly, or through `model_params` inside the flow.

For OpenAI computer use, the provider can also return safety checks on sensitive pages. Intelli stops instead of approving them, and returns them in `result["pending_safety_checks"]` so a person can decide.

### Add a schedule

The flow is plain Python, so any scheduler runs it. A daily run gives the finance team the invoice list before the morning review, and the output lands in the same shape every day, which makes it easy to load into an ERP or a database.

### Why it helps

- The portals that have no API stop being manual work.
- The output is structured, so it can be reconciled automatically.
- The rules stay explicit, because every action passes through your guard.
