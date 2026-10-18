# orders_mcp_server.py: turns the orders API into MCP tools that Claude, Cursor or an Intelli flow can call.
# Run it with no arguments for local apps (stdio), or with --http to share it at http://localhost:8000/mcp.
import os
import sys

import httpx
from intelli.mcp import MCPServerBuilder

API_URL = os.environ.get("ORDERS_API_URL", "http://localhost:8001")
API_KEY = os.environ.get("ORDERS_API_KEY", "demo-key")

server = MCPServerBuilder("Orders", stateless_http=True)


def call_api(path, params=None):
    response = httpx.get(f"{API_URL}{path}", params=params, headers={"X-API-Key": API_KEY}, timeout=10)
    if response.status_code == 404:
        return {"error": "Not found. Check the order ID, which looks like A1042."}
    response.raise_for_status()
    return response.json()


@server.add_tool
def get_order_status(order_id: str) -> dict:
    """Look up one order by its ID, such as A1042. Returns the customer, status, carrier and expected delivery date."""
    return call_api(f"/orders/{order_id}")


@server.add_tool
def list_delayed_orders() -> list:
    """List every order that is late, with the customer, the new expected date and the reason for the delay."""
    return call_api("/orders", {"status": "delayed"})


if __name__ == "__main__":
    if "--http" in sys.argv:
        server.run(transport="streamable-http", mount_path="/mcp")
    else:
        server.run(transport="stdio", print_info=False)
