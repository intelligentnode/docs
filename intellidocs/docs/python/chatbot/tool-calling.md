---
sidebar_position: 5
title: "Tool Calling With the Python Chatbot"
sidebar_label: "Tool calling"
description: "Pass tools to the Intelli Python chatbot for OpenAI and Anthropic models, read the tool calls from the reply, and control them with tool_choice."
keywords: ["intelli python tool calling","python chatbot function calling","openai tools python","anthropic tool use python","chatmodelinput tools","tool_choice python"]
---

# Tool calling

`ChatModelInput` accepts a list of `tools`. When the model decides to call one, the chatbot returns a `tool_response` item instead of text, with the name and the arguments of each call. Your code runs the tool and sends the result back as a new message.

### OpenAI

Use the OpenAI tool format:

```python
import json
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

chat_input = ChatModelInput("You are a weather assistant.", model="gpt-4.1", tools=tools)
chat_input.add_user_message("What is the weather in Paris?")

openai_bot = Chatbot(YOUR_OPENAI_KEY, ChatProvider.OPENAI)
result = openai_bot.chat(chat_input)[0]

if isinstance(result, dict) and result.get("type") == "tool_response":
    for call in result["tool_calls"]:
        name = call["function"]["name"]
        args = json.loads(call["function"]["arguments"])
        print(name, args)  # get_weather {'city': 'Paris'}
else:
    print(result)  # the model answered without a tool
```

GPT-5 models run on the responses API, which takes the flat tool format: `{"type": "function", "name": ..., "description": ..., "parameters": ...}`. The reply uses the same `tool_response` shape.

### Anthropic

Use the Anthropic tool format with `input_schema`:

```python
tools = [{
    "name": "get_weather",
    "description": "Get the current weather in a city",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}]

chat_input = ChatModelInput("You are a weather assistant.", model="claude-sonnet-5", tools=tools)
chat_input.add_user_message("What is the weather in Paris?")

claude_bot = Chatbot(YOUR_ANTHROPIC_KEY, ChatProvider.ANTHROPIC)
result = claude_bot.chat(chat_input)[0]
```

When Claude calls several tools in one turn, all of them are in `result["tool_calls"]`, in the same shape as the OpenAI reply.

### Tool Choice

Set `tool_choice` to force or disable tool use:

```python
# openai
chat_input = ChatModelInput("You are a weather assistant.", model="gpt-4.1", tools=tools, tool_choice="required")

# anthropic
chat_input = ChatModelInput("You are a weather assistant.", model="claude-sonnet-5", tools=tools, tool_choice={"type": "any"})
```

### Tools in Flows

To let a model pick between tools and other tasks inside a workflow, see [Dynamic tool](/docs/python/flows/dynamic-tool). To use the tools of an MCP server, see [MCP](/docs/python/mcp/get-started).
