---
sidebar_position: 12
title: "Loop Tasks in Python AI Flows"
sidebar_label: "Loop"
description: "Use LoopTask in Intelli Python flows to repeat task steps until a stop condition or max loops, with optional iteration history in memory."
keywords: ["intelli python looptask","python flow loops","intelli loop task","loop task stop condition","max loops python flow","intelli flow memory"]
---

# Loop

`LoopTask` is a **single Flow unit** that repeats a small sequence of steps until:
- the **stop condition** returns `True`, or
- it hits **max_loops** (default: **5**).

This is the easiest way to do looping **without creating cycles** in the main Flow graph.

### Key parameters

- **max_loops**: maximum iterations (default `5`)
- **stop_condition(iteration, last_output, last_type, memory)**: stop rule after each loop
- **store_history_memory_key**: save per-iteration outputs into memory (optional)

### Example

```python
import asyncio
from intelli.flow.flow import Flow
from intelli.flow.tasks.task import Task
from intelli.flow.agents.agent import Agent
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.tasks.loop_task import LoopTask

# 1. Define a regular Agent and Task
agent = Agent(
    agent_type="text",
    provider="openai",
    mission="Summarize and expand the input",
    model_params={"key": "YOUR_API_KEY", "model": "gpt-5.5"}
)
task = Task(TextTaskInput("Generate an expanded summary"), agent)

# 2. Define a simple stop condition function
def stop_if_long_enough(iteration, last_output, last_type, memory):
    return len(last_output) > 1000

# 3. Create the Loop unit
loop = LoopTask(
    desc="iterative refinement",
    steps=[task],
    max_loops=3,
    stop_condition=stop_if_long_enough
)

# 4. Execute in a Flow
flow = Flow(tasks={"loop_step": loop}, map_paths={})
result = asyncio.run(flow.start(initial_input="AI is the future of..."))

print(result["loop_step"]["output"])
```
