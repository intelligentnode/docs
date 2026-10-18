# morning_brief.py: an Intelli flow that calls the Orders MCP server, then writes a brief for the
# operations manager and drafts an email to each late customer, both at the same time.
# Start orders_api.py first. The flow starts the MCP server for you.
import asyncio
import os
import sys

from intelli.flow import Agent, Flow, Task, TextTaskInput

# Step 1: call one tool on the MCP server.
late_orders = Agent("mcp", "mcp", "Get the late orders", {
    "command": sys.executable,
    "args": ["orders_mcp_server.py"],
    "tool": "list_delayed_orders",
})

# Steps 2 and 3: a model writes from the orders. OpenAI here; the comment below runs it on a local model.
mission = "You write short, plain, friendly text for an online shop."
writer = Agent("text", "openai", mission, {"key": os.environ.get("OPENAI_API_KEY"), "model": "gpt-5-mini"})
# writer = Agent("text", "vllm", mission, {"model": "qwen2.5:3b"}, {"baseUrl": "http://localhost:11434"})

tasks = {
    "late_orders": Task(TextTaskInput("List the late orders"), late_orders),
    "brief": Task(TextTaskInput(
        "Write a three line morning brief for the operations manager: how many orders are late, "
        "why, and which customer to contact first. No greeting or sign-off."), writer),
    "customer_emails": Task(TextTaskInput(
        "Draft a two sentence apology email to each customer below. Use their name, the reason "
        "and the date in the expected field as the new delivery date."), writer),
}

flow = Flow(tasks=tasks, map_paths={"late_orders": ["brief", "customer_emails"]})

if __name__ == "__main__":
    flow.generate_graph_img(name="morning_brief_graph", save_path=".")
    output = asyncio.run(flow.start())
    print(output["brief"]["output"])
    print()
    print(output["customer_emails"]["output"])
