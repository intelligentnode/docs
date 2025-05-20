---
sidebar_position: 1
---
# Get Started with MCP

Ever wished your Intelli flows could call **your own code**?  
MCP (Model Context Protocol) makes that a one-liner.

## Installation

```bash
pip install intelli[mcp]
```

That single extra `[mcp]` flag pulls in the small MCP SDK and its helpers.

## Components at a Glance

| Piece          | What it does                                         |
| -------------- | ---------------------------------------------------- |
| **MCP Server** | Hosts the tools/functions you want to expose.        |
| **MCP Agent**  | A special Intelli agent that talks to that server.   |
| **Preprocessor** (optional) | Picks data out of a previous task and updates the MCP agent's parameters before the call. |

## The Simplest Possible Flow

First, create a simple MCP server file named `mcp_math_server.py`:

```python
# mcp_math_server.py
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("MathTools")

# Add a simple addition tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

Now, create a client file that calls it:

```python
# simple_mcp_client.py
import asyncio, sys
from intelli.flow.agents.agent import Agent
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.flow import Flow
from intelli.flow.types import AgentTypes

# 1. MCP agent (local subprocess, stdio transport)
mcp_agent = Agent(
    agent_type=AgentTypes.MCP.value,
    provider="mcp",
    mission="Do simple math",
    model_params={
        "command": sys.executable,
        "args": ["mcp_math_server.py"],  # Points to the server we just created
        "tool": "add",
        "arg_a": 7,
        "arg_b": 8,
    }
)

# 2. Single task that just calls the tool
calc_task = Task(
    TextTaskInput("Calculate"),
    mcp_agent,
    log=True
)

# 3. One-task flow
flow = Flow({"calc": calc_task}, {"calc": []}, log=True)

# Run it
result = asyncio.run(flow.start())
print("Answer:", result["calc"]["output"])
```

Run this with:
```bash
python simple_mcp_client.py
```

That's all it takes! Your flow now calls your custom math function.


Check the richer example at: 
🔗 [`Http(s) Server/Client`](https://github.com/intelligentnode/Intelli/tree/main/sample/http_mcp)
🔗 [`Dataframe MCP Server`](https://github.com/intelligentnode/Intelli/tree/main/sample/http_dataframe_mcp)
