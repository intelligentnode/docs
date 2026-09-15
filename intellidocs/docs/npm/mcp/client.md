---
sidebar_position: 3
title: "MCP Client for Node.js Chatbots"
sidebar_label: "MCP Client"
description: "Use IntelliNode MCPClient to connect Node.js chatbots to MCP servers over stdio or Streamable HTTP, call tools, set timeouts, and load configs."
keywords: ["intellinode mcp client","node.js mcp client","mcp stdio transport","mcp streamable http","node.js chatbot tools","model context protocol tools"]
---

# MCP Client

`MCPClient` connects to any MCP server and gives its tools to your chatbot, or calls them directly. It talks to servers over stdio (a subprocess) or Streamable HTTP, and detects whether the server speaks the current protocol or the previous one.

### Connect

```javascript
const { MCPClient } = require('intellinode');

// a local server as a subprocess
const files = new MCPClient({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
});

// a remote server over Streamable HTTP, with auth headers and a per request timeout
const remote = new MCPClient({
  url: 'https://tools.example.com/mcp',
  headers: { Authorization: `Bearer ${API_TOKEN}` },
  timeout: 30000,
});

const info = await files.connect();   // { protocolVersion, serverInfo, capabilities, instructions }
console.log(files.listTools().map((tool) => tool.name));
```

Options: `command`, `args`, `env`, `cwd` for stdio; `url`, `headers` for HTTP; `timeout` (ms per request, default 60000), `debug` (protocol logs on stderr), `onNotification`.

### Call tools

```javascript
const result = await files.callTool('list_directory', { path: process.cwd() });
// { content: [...], structuredContent, isError, text }   (text joins the text blocks)

console.log(result.text);
await files.close();
```

- `listTools()` returns the cached tool list (filled by `connect()`), `fetchTools()` refreshes it from the server, `getTools()` fetches it as well.
- `getToolNames()`, `getTool(name)`, `hasTool(name)` read the cache.
- `callTool()` connects on its own when needed, and a request that exceeds its timeout rejects with an `MCPTimeoutError`.
- `close()` ends the subprocess or the HTTP session; the client can connect again afterwards.

### Tools inside the chatbot

Pass the client to `runTools` and the model uses the server's tools until it has the answer:

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const bot = new Chatbot(OPENAI_API_KEY, 'openai');
const input = new ChatGPTInput('You are a helpful assistant with file tools.');
input.addUserMessage('List the markdown files in this folder and summarise the README.');

const { text, steps } = await bot.runTools(input, files, { maxSteps: 6 });
console.log(text);
console.log(steps.map((step) => step.name));   // the tools that were called
```

`toChatTools()` returns the tools in the chat-completions format when you want to pass them in the input yourself and handle the calls, see [Tool calling](../chatbot/tool-calling).

### Several servers from one config

A Claude Desktop or Cursor style configuration creates one client per server:

```javascript
const clients = MCPClient.fromConfig({
  mcpServers: {
    files: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'] },
    intellinode: { url: 'http://127.0.0.1:3210/mcp' },
  },
});

await clients.files.connect();
```

### Browser

The browser bundle includes the client with the HTTP transport (`{ url }`); the stdio transport needs Node.js.
