---
sidebar_position: 3
---

# Tool calling

The chatbot can call the functions you define. There are two levels:

1. **Tool calls in the reply**: pass `tools` in the input and read the `tool_calls` the model returns, then decide what to run.
2. **The tool loop** (`runTools`): intellinode calls the model, runs every requested tool, feeds the results back and repeats until the model answers with text.

Both work the same way with `ChatGPTInput` (openai), `AnthropicInput`, `GeminiInput`, `MistralInput`, `NvidiaInput`, `VLLMInput` and `OpenAICompatibleInput`. Cohere does not take part in the tool loop.

### Define a tool

A tool is a name, a description, the JSON Schema of its arguments and, for the loop, a `handler`:

```javascript
const tools = [{
  name: 'get_weather',
  description: 'Current weather for a city',
  parameters: {
    type: 'object',
    properties: { city: { type: 'string' } },
    required: ['city'],
  },
  handler: async ({ city }) => ({ city, tempC: 22, sky: 'sunny' }),
}];
```

The chat-completions format (`{ type: 'function', function: { name, description, parameters } }`) and the Anthropic format (`{ name, description, input_schema }`) are accepted as well; intellinode converts the definition to what each provider expects.

### The tool loop

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const bot = new Chatbot(OPENAI_API_KEY, 'openai');
const input = new ChatGPTInput('You are a weather assistant. Use the tools.');
input.addUserMessage('What is the weather in Paris in Fahrenheit?');

const { text, steps, toolCalls } = await bot.runTools(input, tools, {
  maxSteps: 5,
  onToolCall: (name, args) => console.log('calling', name, args),
});

console.log(text);    // 'It is 71.6°F and sunny in Paris.'
console.log(steps);   // [{ name: 'get_weather', arguments: { city: 'Paris' }, result: {...}, isError: false }]
```

- `text` is the final answer, `steps` lists every executed tool with its arguments and result, `toolCalls` is the number of steps.
- `maxSteps` (default 5) caps the number of tool rounds; after the last round the model gets one more call to answer. When it still asks for tools the promise rejects with a clear error.
- A handler that throws reports `Error: <message>` back to the model with `isError: true`, so the model can recover or explain.
- Arguments that are not valid JSON are reported to the model instead of running the tool.
- `onToolCall(name, args)` and `onToolResult(name, result, isError)` are optional hooks.

The same call with Claude, Gemini or a local model:

```javascript
const { AnthropicInput, GeminiInput, OpenAICompatibleInput, SupportedChatModels } = require('intellinode');

const claude = new Chatbot(ANTHROPIC_API_KEY, SupportedChatModels.ANTHROPIC);
await claude.runTools(new AnthropicInput('You are a weather assistant.'), tools);

const gemini = new Chatbot(GEMINI_API_KEY, SupportedChatModels.GEMINI);
await gemini.runTools(new GeminiInput('You are a weather assistant.'), tools);

const local = new Chatbot(null, 'ollama', null, { model: 'qwen3' });
await local.runTools(new OpenAICompatibleInput('You are a weather assistant.'), tools);
```

Tools can also be a plain object of handlers when the definitions are already on the input:

```javascript
const input = new ChatGPTInput('You are a weather assistant.', {
  tools: [{ name: 'get_weather', description: 'Weather for a city', parameters: { type: 'object', properties: { city: { type: 'string' } } } }],
});
input.addUserMessage('Weather in Rome?');

await bot.runTools(input, { get_weather: async ({ city }) => `${city}: sunny` });
```

### MCP servers as tools

Any MCP server becomes a tool set for the loop: pass an `MCPClient` instead of the tools array.

```javascript
const { MCPClient } = require('intellinode');

const files = new MCPClient({ command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()] });
await files.connect();

const input = new ChatGPTInput('You are a helpful assistant with file tools.');
input.addUserMessage('List the markdown files in this folder and summarise the README.');

const { text } = await bot.runTools(input, files);
await files.close();
```

See the [MCP client](../mcp/client) page for the client options.

### Handling tool calls yourself

Pass `tools` in the input and the reply carries the requested calls (chat-completions format on every provider):

```javascript
const input = new ChatGPTInput('You are a weather assistant.', {
  tools: [{ name: 'get_weather', description: 'Weather for a city', parameters: { type: 'object', properties: { city: { type: 'string' } } } }],
  toolChoice: 'auto',   // 'auto' | 'none' | 'required' | { type: 'function', function: { name } }
});
input.addUserMessage('What is the weather in Paris?');

const [reply] = await bot.chat(input);
// reply.tool_calls[0] => { id: 'call_...', type: 'function', function: { name: 'get_weather', arguments: '{"city":"Paris"}' } }
```

Run the tool, then continue the conversation with `addToolCalls` and `addToolResults`:

```javascript
const call = reply.tool_calls[0];
const result = await getWeather(JSON.parse(call.function.arguments));

input.addToolCalls(reply.tool_calls, reply.content);
input.addToolResults([{ id: call.id, name: 'get_weather', content: result }]);

const [answer] = await bot.chat(input);   // the model answers with the tool result in context
```

Both methods exist on every input class that supports tools, and build the provider-specific messages (function call items for the Responses API, `tool_use` and `tool_result` blocks for Claude, `functionCall` and `functionResponse` parts for Gemini).

Legacy OpenAI `functions` and `function_call` arguments of `chat()` keep working and are sent as tools.
