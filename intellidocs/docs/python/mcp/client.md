---
sidebar_position: 3
---
# MCP Client

Once you've created an MCP server with your custom tools, you need a way to call those tools from your Intelli flow. This is where the MCP client comes in.

## How It Works

The process follows these steps:
1. Your flow creates an MCP agent that knows how to talk to your server.
2. The agent calls a specific tool with parameters.
3. The server processes the request and returns a result.
4. Your flow continues with that result.

## Creating a Basic Client

Create a file named `simple_mcp_client.py`:

```python
# simple_mcp_client.py
import asyncio
import sys
from intelli.flow.agents.agent import Agent
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.flow import Flow
from intelli.flow.types import AgentTypes

# Create an MCP agent that will call our math server
mcp_agent = Agent(
    agent_type=AgentTypes.MCP.value,
    provider="mcp",
    mission="Do math operations",
    model_params={
        "command": sys.executable,
        "args": ["mcp_math_server.py"],  # Path to your server file
        "tool": "add",                   # Which tool to call
        "arg_a": 7,                      # First parameter
        "arg_b": 8,                      # Second parameter
    }
)

# Create a task that uses this agent
calc_task = Task(
    TextTaskInput("Calculate"),
    mcp_agent,
    log=True
)

# Create a flow
flow = Flow({"calc": calc_task}, {"calc": []}, log=True)

# Run the flow and print the result
if __name__ == "__main__":
    print("Running MCP math flow...")
    result = asyncio.run(flow.start())
    print(f"Result: 7 + 8 = {result['calc']['output']}")
```

Run it with:
```bash
python simple_mcp_client.py
```

## Connecting to a Remote HTTP Server

If your MCP server runs as an HTTP service (as shown in the Server page), connect to it like this:

```python
# http_client.py
import asyncio
import sys
from intelli.flow.agents.agent import Agent
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.flow import Flow
from intelli.flow.types import AgentTypes

# Create an MCP agent that connects to an HTTP server
http_mcp_agent = Agent(
    agent_type=AgentTypes.MCP.value,
    provider="mcp",
    mission="Do math remotely",
    model_params={
        "url": "http://localhost:8000/mcp",  # URL to your HTTP server
        "tool": "add",                       # Which tool to call
        "arg_a": 15,                         # First parameter
        "arg_b": 27,                         # Second parameter
    }
)

# ... (rest is the same - create task, flow, etc.) ...
```

## Generate flow visualization
```python
graph_path = flow.generate_graph_img(
    name="math_flow_graph",               # Base name for the output file
    save_path="./temp/graphs",            # Directory to save the image
)
```

## Building More Complex Flows

In real applications, you'll often:
1. Use an LLM to interpret user requests
2. Extract operation and parameters
3. Call the appropriate MCP tool
4. Present results back to the user

A complete example that does this:
🔗 [`sample/mcp/math_flow_client.py`](https://github.com/intelligentnode/Intelli/blob/main/sample/mcp/math_flow_client.py) (local version)  
🔗 [`sample/mcp/http_math_flow_client.py`](https://github.com/intelligentnode/Intelli/blob/main/sample/mcp/http_math_flow_client.py) (HTTP version)
