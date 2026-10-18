Build an MCP server in Python for your own API
https://www.intellinode.ai/articles/build-mcp-server-python

1. Install Intelli 2.1.0 or above with the MCP extra (Python 3.10 or above):
   pip install -U "intelli[mcp]"

2. Start the sample orders API, a stand-in for your own API:
   python orders_api.py

3. Run the flow that writes a morning brief and customer emails.
   It starts the MCP server for you:
   export OPENAI_API_KEY="your-key"
   python morning_brief.py

4. Optional: share the tools over HTTP instead:
   python orders_mcp_server.py --http
   The tools are then at http://localhost:8000/mcp

To use your own API, set ORDERS_API_URL and ORDERS_API_KEY, then change the two
tools in orders_mcp_server.py to call your endpoints.
