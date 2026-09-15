---
sidebar_position: 1
title: "Get Started with MCP in Node.js"
sidebar_label: "Get Started with MCP"
description: "Set up IntelliNode MCP servers and clients in Node.js. Connect Claude Code, Cursor, VS Code, chatbots, and cross-provider AI tools."
keywords: ["intellinode mcp","node.js mcp client","node.js mcp server","model context protocol node.js","claude code mcp setup","cursor vscode mcp"]
---

# Get Started with MCP

MCP (Model Context Protocol) is the standard way for AI assistants to call tools. Intellinode supports both sides of it:

| Piece | What it does |
| --- | --- |
| **MCP Server** | `npx intellinode mcp` serves intellinode's cross-provider tools (ask a model, consensus, code review, fixes, tests, components, SQL, images...) to Claude Code, Cursor, VS Code or any MCP client. You can also build your own server with `MCPServer`. |
| **MCP Client** | `MCPClient` connects to any MCP server (stdio or Streamable HTTP) and turns its tools into chatbot tools. |

Both the current protocol (2026-07-28) and the previous one (2025-11-25) are supported, so intellinode works with new and older servers and clients.

### Use intellinode from your coding assistant

Add the server with your provider keys. Claude Code:

```bash
claude mcp add intellinode -e OPENAI_API_KEY=sk-... -e ANTHROPIC_API_KEY=sk-ant-... -- npx -y intellinode mcp
```

Then ask the assistant to, for example, "review this file with Claude through intellinode" or "generate a React pricing component with GPT-5.5". The tools run on whichever provider you configured, so the assistant gets a second opinion from another model family. The [MCP server](./server) page lists the tools, the Cursor and VS Code setup and the environment variables.

### Use any MCP server from your chatbot

```javascript
const { Chatbot, ChatGPTInput, MCPClient } = require('intellinode');

const files = new MCPClient({ command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()] });
await files.connect();

const input = new ChatGPTInput('You are a helpful assistant with file tools.');
input.addUserMessage('List the markdown files in this folder and summarise the README.');

const { text } = await new Chatbot(OPENAI_API_KEY, 'openai').runTools(input, files);
await files.close();
```

The [MCP client](./client) page covers HTTP servers, authentication headers, timeouts and calling tools directly.
