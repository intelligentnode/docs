// An MCP server in front of the inventory API. It gives Claude, Cursor, VS Code and your own Node apps
// three tools: look up a product, list what is running low, and draft a purchase order for a person to approve.
//   node inventory_mcp_server.js          stdio, started by Claude Code, Cursor or VS Code
//   node inventory_mcp_server.js --http   Streamable HTTP at http://127.0.0.1:3210/mcp, to share with a team
const { MCPServer } = require('intellinode');

const API_URL = process.env.INVENTORY_API_URL || 'http://localhost:8001';
const API_KEY = process.env.INVENTORY_API_KEY || 'demo-key';

// Every tool goes through here, so the key stays on the server and never reaches the model.
async function callApi(path, options = {}) {
  const response = await fetch(API_URL + path, {
    ...options,
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`The inventory API answered ${response.status}. Try again in a minute.`);
  return response.json();
}

const server = new MCPServer({
  name: 'inventory',
  version: '1.0.0',
  instructions: 'Stock levels for the online shop. Look products up before you answer. ' +
    'draft_purchase_order only creates a draft; a person approves it in the inventory system.',
  tools: [
    {
      name: 'check_stock',
      description: 'Find a product by SKU, such as TEE-BLK-M, or by words in its name, such as "grey hoodie". ' +
        'Returns units in stock, average daily sales, days of stock left and the supplier.',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'A SKU like TEE-BLK-M, or words from the product name' } },
        required: ['query'],
      },
      handler: async ({ query }) => {
        const bySku = await callApi(`/products/${encodeURIComponent(query.trim())}`);
        if (bySku) return bySku;
        const matches = await callApi(`/products?search=${encodeURIComponent(query)}`);
        if (!matches.length) throw new Error(`No product matches "${query}". Try a SKU such as TEE-BLK-M.`);
        return { matches };
      },
    },
    {
      name: 'list_low_stock',
      description: 'List the products that will sell out within the given number of days at the current sales rate, ' +
        'with their supplier, delivery time and suggested_quantity: how many to order to cover 30 days after delivery.',
      inputSchema: {
        type: 'object',
        properties: { days: { type: 'integer', description: 'How far ahead to look, 14 if not given', minimum: 1, maximum: 90 } },
      },
      handler: async ({ days = 14 }) => {
        const products = await callApi(`/low-stock?days=${days}`);
        // the math happens here, in code, so every model gets the same numbers
        for (const p of products) p.suggested_quantity = Math.max(0, Math.ceil(p.daily_sales * (30 + p.lead_days) - p.stock));
        return { days, products };
      },
    },
    {
      name: 'draft_purchase_order',
      description: 'Create a DRAFT purchase order for one supplier. Nothing is sent to the supplier: ' +
        'a person reviews and approves the draft in the inventory system.',
      inputSchema: {
        type: 'object',
        properties: {
          supplier: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { sku: { type: 'string' }, quantity: { type: 'integer', minimum: 1, maximum: 1000 } },
              required: ['sku', 'quantity'],
            },
          },
          reason: { type: 'string', description: 'One line on why, for the person who approves it' },
        },
        required: ['supplier', 'items'],
      },
      handler: async ({ supplier, items, reason = '' }) => {
        const order = await callApi('/purchase-orders', { method: 'POST', body: JSON.stringify({ supplier, items, reason }) });
        return { ...order, note: 'Draft only. Approve it in the inventory system to send it.' };
      },
    },
  ],
});

if (process.argv.includes('--http')) {
  server.startHttp({ port: Number(process.env.MCP_PORT || 3210) })
    .then(({ url }) => console.error(`Inventory MCP server on ${url}`));
} else {
  // stdio: Claude Code, Cursor or VS Code start this process and talk to it through stdin and stdout,
  // so nothing else may be printed to stdout
  server.startStdio();
}
