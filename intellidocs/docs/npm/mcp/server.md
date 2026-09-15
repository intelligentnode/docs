---
sidebar_position: 2
---

# MCP Server

The `intellinode` command starts an MCP server that exposes the `Gen` functions and multi-provider chat as tools. A coding assistant connected to it can route work to OpenAI, Anthropic, Gemini, Mistral, Cohere, NVIDIA, OpenRouter, DeepSeek, Groq, xAI, Together or a local Ollama model.

### Start the server

```bash
npx -y intellinode mcp                       # stdio, for Claude Code, Cursor, VS Code
npx -y intellinode mcp --http --port 3210    # Streamable HTTP at http://127.0.0.1:3210/mcp
npx -y intellinode help
```

HTTP options: `--port` (default 3210), `--host` (default 127.0.0.1), `--path` (default /mcp), `--origin <url>` (extra allowed browser origin, repeatable), `--debug`.

### Keys

Keys come from the environment or a `.env` file in the directory where the server starts:

| Variable | Provider |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI (chat tools and image generation) |
| `ANTHROPIC_API_KEY` | Anthropic |
| `GEMINI_API_KEY` | Google Gemini |
| `MISTRAL_API_KEY` | Mistral |
| `COHERE_API_KEY` | Cohere |
| `NVIDIA_API_KEY` | NVIDIA |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | OpenRouter (default model `openai/gpt-5.5`) |
| `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | DeepSeek (default model `deepseek-chat`) |
| `GROQ_API_KEY` and `GROQ_MODEL` | Groq |
| `XAI_API_KEY` and `XAI_MODEL` | xAI |
| `TOGETHER_API_KEY` and `TOGETHER_MODEL` | Together |
| `OLLAMA_MODEL` | A local Ollama model, no key needed |
| `STABILITY_API_KEY` | Stability AI images |

The default provider is the first configured one in that order; every tool accepts a `provider` argument to pick another. A missing key returns a tool error naming the variable to set, so the assistant can tell you what to configure.

### Install in your assistant

Claude Code:

```bash
claude mcp add intellinode -e OPENAI_API_KEY=sk-... -e ANTHROPIC_API_KEY=sk-ant-... -- npx -y intellinode mcp
```

Or a project `.mcp.json` (Claude Code) / `.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "intellinode": {
      "command": "npx",
      "args": ["-y", "intellinode", "mcp"],
      "env": { "OPENAI_API_KEY": "sk-...", "ANTHROPIC_API_KEY": "sk-ant-..." }
    }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "intellinode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "intellinode", "mcp"],
      "env": { "OPENAI_API_KEY": "sk-..." }
    }
  }
}
```

For the HTTP transport start `npx -y intellinode mcp --http` and register `{ "type": "http", "url": "http://127.0.0.1:3210/mcp" }`.

### Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `ask_model` | `prompt`, `provider?`, `model?`, `system?` | text |
| `consensus` | `prompt`, `providers?` | the answer of every configured provider side by side |
| `review_code` | `code`, `language?`, `provider?` | `{ summary, score, issues }` |
| `fix_code` | `code`, `problem?`, `language?`, `provider?` | `{ code, explanation, changes }` |
| `generate_unit_tests` | `code`, `framework?`, `modulePath?`, `provider?` | test file |
| `generate_component` | `description`, `framework?`, `language?`, `styling?`, `provider?` | code |
| `generate_form` | `description`, `framework?`, `action?`, `provider?` | code |
| `generate_sql` | `description`, `dialect?`, `schema?`, `provider?` | SQL |
| `generate_openapi_spec` | `input`, `title?`, `basePath?`, `provider?` | OpenAPI document |
| `generate_design_tokens` | `brand`, `brandColor?`, `provider?` | tokens, CSS variables, Tailwind theme |
| `generate_regex` | `description`, `language?`, `provider?` | `{ pattern, flags, explanation, matches, nonMatches, verified }` |
| `generate_mock_data` | `schema`, `count?`, `provider?` | `{ records, count }` |
| `generate_seo_meta` | `page`, `url?`, `siteName?`, `provider?` | meta fields and rendered HTML |
| `generate_image` | `prompt`, `provider?` (`openai` or `stability`), `size?` | PNG image block |
| `list_providers` | none | configured providers, defaults and the variables still unset |

### Build your own server

`MCPServer` serves your own tools over stdio or Streamable HTTP, with no extra dependency:

```javascript
const { MCPServer } = require('intellinode');

const server = new MCPServer({
  name: 'my-tools',
  version: '1.0.0',
  instructions: 'Optional guidance for the model.',
  tools: [{
    name: 'add',
    description: 'Add two numbers',
    inputSchema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } }, required: ['a', 'b'] },
    handler: async ({ a, b }) => ({ sum: a + b }),
  }],
});

server.startStdio();                                       // stdio transport
const { url } = await server.startHttp({ port: 3210 });    // or Streamable HTTP, url: http://127.0.0.1:3210/mcp
await server.stop();
```

A handler may return a string, an object (sent as `structuredContent` plus a JSON text block), a content block or a full `{ content, structuredContent, isError }` result; a thrown error becomes `isError: true` with the message. `startHttp` accepts `host`, `port`, `path`, `allowedOrigins` and `maxBodyBytes`.

### Registry

The server is listed in the MCP registry as `io.github.intelligentnode/intellinode`, so clients that browse the registry can install it directly.
