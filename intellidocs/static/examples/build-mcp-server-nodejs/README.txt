How to build an MCP server in Node.js for your own API
https://www.intellinode.ai/articles/build-mcp-server-nodejs

1. npm install
2. node inventory_api.js                 (leave it running)
3. node inventory_mcp_server.js --http   (optional: the shared HTTP version)
4. claude mcp add --transport stdio inventory -- node /full/path/to/inventory_mcp_server.js
5. OPENAI_API_KEY=... node reorder_report.js     or     node reorder_report.js --local

inventory_api.js          a stand-in for your inventory API, with an API key
inventory_mcp_server.js   the MCP server: check_stock, list_low_stock, draft_purchase_order
reorder_report.js         a Node script that uses the server's tools to draft orders and a report
