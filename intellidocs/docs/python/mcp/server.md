---
sidebar_position: 2
---
# MCP Server

An MCP server exposes your custom Python functions as "tools" that can be called from Intelli flows.

## What You'll Create

You'll create a Python file that:
1. Defines some useful functions (like math operations)
2. Decorates them to make them available as tools
3. Runs a server that listens for requests

## Step 1: Create Your Server File

Create a new file named `mcp_math_server.py`:

```python
# mcp_math_server.py
from mcp.server.fastmcp import FastMCP

# Create a new server with a friendly name
mcp = FastMCP("MathTools")

# Decorate functions to turn them into callable tools
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool()
def subtract(a: int, b: int) -> int:
    """Subtract two numbers"""
    return a - b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Multiply two numbers"""
    return a * b

if __name__ == "__main__":
    # Start the server in stdio mode (for local use)
    print("Starting MathTools server...")
    mcp.run(transport="stdio")
```

Check the client section for details how to run the server.

## Serving over HTTP (Preferred)

If you want to run your server separately and access it over HTTP:

```python
# http_mcp_calculator_server.py
from intelli.flow.utils import MCPServerBuilder

# Create a server with HTTP support
server = MCPServerBuilder("Calculator", stateless_http=True)

@server.add_tool
def add(a: int, b: int) -> str:
    """Add two numbers"""
    print(f"Adding {a} + {b}")
    result = a + b
    return str(result)

# Add more tools as needed...

if __name__ == "__main__":
    print("Starting Calculator MCP Server on http://localhost:8000/mcp")
    server.run(
        transport="streamable-http",
        mount_path="/mcp",
        host="0.0.0.0",
        port=8000
    )
```

To run this HTTP server:
```bash
python http_mcp_calculator_server.py
```

You'll see a message confirming it's running, and it will keep running until you stop it (Ctrl+C).

Full working examples:  
🔗 [`sample/mcp/mcp_math_server.py`](https://github.com/intelligentnode/Intelli/blob/main/sample/mcp/mcp_math_server.py) (stdio version)  
🔗 [`sample/mcp/http_mcp_calculator_server.py`](https://github.com/intelligentnode/Intelli/blob/main/sample/mcp/http_mcp_calculator_server.py) (HTTP version)
