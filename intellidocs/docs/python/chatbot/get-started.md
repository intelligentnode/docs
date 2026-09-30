---
sidebar_position: 1
title: "AI Chatbot for OpenAI, Anthropic, Gemini and Mistral in Python"
sidebar_label: "Get started"
description: "Set up the Python chatbot with ChatModelInput and Chatbot. Covers providers, default models, streaming, GPT-5 options, Azure OpenAI and request timeouts."
keywords: ["intelli python chatbot","python chatbot openai gemini","chatmodelinput intelli","intelli chatbot providers","gpt-5 python chatbot","python chatbot streaming"]
---

# Get started

The intelli chatbot function connects with the leading AI models such as GPT, Claude, Gemini and Mistral through one input. You can switch between providers, or upgrade to the latest models, without changing the code of your app.

### Core Components

**ChatModelInput:** This class provides a unified entry to all chatbot providers. It holds the system message, the model, the message history, and model parameters like temperature and max tokens.

**Chatbot:** The primary class that interfaces with the AI providers. It takes the API key, the provider name, and optional settings such as a timeout, a proxy or a server URL.

### Available Providers

Use the `ChatProvider` enum, or its string value, to select the provider:

| Provider | `ChatProvider` | Value |
| -------- | -------------- | ----- |
| OpenAI and Azure OpenAI | `ChatProvider.OPENAI` | `openai` |
| Anthropic | `ChatProvider.ANTHROPIC` | `anthropic` |
| Google Gemini | `ChatProvider.GEMINI` | `gemini` |
| Mistral | `ChatProvider.MISTRAL` | `mistral` |
| NVIDIA (DeepSeek, Llama and NIM) | `ChatProvider.NVIDIA` | `nvidia` |
| Self-hosted vLLM | `ChatProvider.VLLM` | `vllm` |
| Offline llama.cpp | `ChatProvider.LLAMACPP` | `llamacpp` |
| Offline Keras (Gemma, Llama, Mistral) | `ChatProvider.KERAS` | `keras` |

See [DeepSeek & Llama](/docs/python/chatbot/nvidia-chat), [vLLM](/docs/python/offline-chatbot/vllm), [llama.cpp](/docs/python/offline-chatbot/llamacpp) and [Gemma](/docs/python/offline-chatbot/gemma) for the provider specific setup.

### Example

##### Imports
```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot, ChatProvider
```

##### Prepare the input
```python
chat_input = ChatModelInput(system="You are a helpful assistant.", model="gpt-5.5")
chat_input.add_user_message("Explain the plot of the Inception movie in one line.")
```

##### Call the chatbot
```python
chatbot = Chatbot(api_key=YOUR_API_KEY, provider=ChatProvider.OPENAI)
response = chatbot.chat(chat_input)
print(response[0])
```

`chat` returns a list of replies. When the model calls a tool, the item is a dictionary instead of text, see [Tool calling](/docs/python/chatbot/tool-calling).

### Default Models

When you omit the model, intelli picks a current default for the provider:

| Provider | Default model |
| -------- | ------------- |
| Openai | `gpt-5.5` |
| Anthropic | `claude-sonnet-5` |
| Gemini | `gemini-2.5-flash` |
| Mistral | `mistral-large-latest` |

Use `claude-opus-5` for the larger Anthropic model. The Claude 5 family and Opus 4.7 and above dropped the sampling parameters, so intelli omits `temperature` for those models and they work without any change on your side.

### Streaming

`stream` yields the reply as it is generated. It is available for openai, anthropic, nvidia, vllm and llamacpp.

```python
chat_input = ChatModelInput("You are a helpful assistant.", model="claude-sonnet-5")
chat_input.add_user_message("Write a short poem about the sea.")

chatbot = Chatbot(YOUR_ANTHROPIC_KEY, ChatProvider.ANTHROPIC)
for chunk in chatbot.stream(chat_input):
    print(chunk, end="", flush=True)
```

The GPT-5 family runs on the responses API, which intelli calls through `chat` only. To stream a GPT-5 model, add the `:chat` suffix described below, for example `gpt-5.5:chat`, and intelli sends the call to chat completions instead. A chat completions model such as `gpt-4.1` streams as is.

### GPT-5 Parameters

The GPT-5 family runs on the responses API, and the input accepts its parameters:

```python
chat_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="gpt-5.5",
    reasoning_effort="low",   # low, medium, high, xhigh, none
    verbosity="medium",       # low, medium, high
    max_tokens=512,           # sent as max_output_tokens
)
```

`tool_choice` is available as well, on both the openai and the anthropic paths.

To use the classic chat completions endpoint with a GPT-5 model, add `:chat` to the model id, for example `gpt-5.5:chat`. intelli removes the suffix before it sends the model id, and both `chat` and `stream` work on this path. The parameters above belong to the responses API, so on chat completions intelli does not send `reasoning_effort` or `verbosity`, OpenAI accepts only the default `temperature` of 1, and it rejects `max_tokens`. Cap the output with `max_completion_tokens` instead:

```python
chat_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="gpt-5.5:chat",
    max_completion_tokens=512,
)
```

### Chatbot Options

Pass the optional settings in `options`:

| Option | Providers | Description |
| ------ | --------- | ----------- |
| `timeout` | all remote providers | Request timeout in seconds, default 180. |
| `proxy_helper` | openai | Route the calls to Azure OpenAI or another proxy. |
| `baseUrl` | nvidia, vllm | The URL of your NIM or vLLM server. |
| `model_path`, `model_params` | llamacpp | The local GGUF file and its parameters. |
| `model_name`, `model_params` | keras | The Keras model and the Kaggle credentials. |

```python
chatbot = Chatbot(YOUR_API_KEY, ChatProvider.OPENAI, options={"timeout": 60})
```

### Azure OpenAI

Set your Azure resource in `ProxyHelper`, then pass the deployment name as the model:

```python
from intelli.utils.proxy_helper import ProxyHelper

proxy_helper = ProxyHelper()
proxy_helper.set_azure_openai(YOUR_AZURE_RESOURCE)

azure_bot = Chatbot(YOUR_AZURE_API_KEY, ChatProvider.OPENAI, options={"proxy_helper": proxy_helper})

chat_input = ChatModelInput("You are a helpful assistant.", model=YOUR_DEPLOYMENT_NAME)
chat_input.add_user_message("What is the capital of France?")
response = azure_bot.chat(chat_input)
```
