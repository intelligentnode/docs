---
sidebar_position: 5
title: "Web Search Agent in Python"
sidebar_label: "Search Agent"
description: "Use the Intelli Python Search Agent to add live Google web search to flows, then pass the results to a model task for analysis."
keywords: ["intelli python search agent","python ai search flow","google custom search python agent","intelli flow agents","python web search agent"]
---

# Search Agent

The Search Agent enables flows to retrieve live information from the web, using the Google Custom Search JSON API.

### Parameters

The agent reads its settings from `model_params`:

- **google_api_key**: your Google API key.
- **google_cse_id**: your Custom Search Engine ID (CX).
- **k**: number of search results to return (default: 5).
- **as_text**: if `True`, returns a formatted string. If `False`, returns a structured list of results.
- **safe**: the Google safe search level (default: `active`).
- **timeout**: request timeout in seconds (default: 20).

---

### Example: Google Web Search

To use Google search, you need a **Google API Key** and a **Custom Search Engine ID (CX)**.

```python
import asyncio
from intelli.flow.agents.agent import Agent
from intelli.flow.types import AgentTypes
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.tasks.task import Task
from intelli.flow.sequence_flow import SequenceFlow

# 1. Define the Google Search Agent
search_agent = Agent(
    agent_type=AgentTypes.SEARCH.value,
    provider="google",
    mission="find latest news about AI",
    model_params={
        "google_api_key": "YOUR_GOOGLE_API_KEY",
        "google_cse_id": "YOUR_CSE_ID",
        "k": 3,
        "as_text": True
    }
)

# 2. Create and run the flow
task = Task(TextTaskInput("What is the latest update on GPT-5.2?"), search_agent)
flow = SequenceFlow([task])
result = flow.start()

print(result["task1"])
```

### Notes

- **Input**: The Search Agent always expects a text-based query as input.
- **Output**: By default, it returns a text summary of the results, making it easy to feed into a subsequent LLM task for analysis.
