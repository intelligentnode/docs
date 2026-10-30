// Monday reorder report: a model uses the MCP server's tools to find what is running low
// and drafts one purchase order per supplier. Run the inventory API first, then:
//   OPENAI_API_KEY=... node reorder_report.js
//   node reorder_report.js --local      (a free local model through Ollama, no key)
const { Chatbot, ChatGPTInput, OpenAICompatibleInput, MCPClient } = require('intellinode');

const local = process.argv.includes('--local');

const SYSTEM = 'You plan restocking for a small online shop. First call list_low_stock. ' +
  'Then call draft_purchase_order once for each supplier in the result, ordering the suggested_quantity of each product. ' +
  'Finally write a short report for the owner: what to reorder, why, and the draft order ids the tool returned. ' +
  'Use only numbers the tools returned.';

async function main() {
  // the client starts the MCP server itself, the same way Claude Code does
  const inventory = new MCPClient({ command: process.execPath, args: [`${__dirname}/inventory_mcp_server.js`] });
  await inventory.connect();

  const bot = local
    ? new Chatbot(null, 'ollama', null, { model: process.env.OLLAMA_MODEL || 'qwen2.5:3b' })
    : new Chatbot(process.env.OPENAI_API_KEY, 'openai');
  const input = local
    ? new OpenAICompatibleInput(SYSTEM, { model: process.env.OLLAMA_MODEL || 'qwen2.5:3b' })
    : new ChatGPTInput(SYSTEM, { model: 'gpt-5-mini' });
  input.addUserMessage('What will run out in the next 14 days? Draft the purchase orders and write the report.');

  const { text, steps } = await bot.runTools(input, inventory, {
    maxSteps: 8,
    onToolCall: (name, args) => console.error(`> ${name} ${JSON.stringify(args)}`),
  });
  await inventory.close();

  console.log(`\n${text}\n`);
  console.error(`${steps.length} tool calls, ${steps.filter((s) => s.name === 'draft_purchase_order').length} draft orders`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
