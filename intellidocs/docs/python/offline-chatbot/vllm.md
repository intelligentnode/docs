---
sidebar_position: 7
title: "Self-Hosted vLLM Models in Python"
sidebar_label: "vLLM Integration"
description: "Use Intelli Python with self-hosted vLLM models for chat completions, streaming responses and DeepSeek examples."
keywords: ["python vllm integration","intelli python vllm","self hosted vllm chatbot","vllm streaming responses","deepseek vllm python"]
---

# vLLM Integration

Intelli Python provides integration with **self-hosted vLLM models**. Point the chatbot to your server URL and keep the same `ChatModelInput` you use with the hosted providers.

## Supported Models

Examples of commonly used vLLM models include:

| Model Name | Description |
|------------|-------------|
| `meta-llama/Llama-3.1-8B-Instruct` | Llama3 instruct model |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` | DeepSeek distilled model |
| `google/gemma-2-2b-it` | Gemma instruction-tuned model |
| `mistralai/Mistral-7B-Instruct-v0.2` | Mistral instruction model |
| `BAAI/bge-small-en-v1.5` | Embedding model |

> **Note:** vLLM supports many other models that can be hosted locally or remotely.

## Setup & Usage

### Chat Completion

**Step 1:** Import required modules.

```python
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput
```

**Step 2:** Set your vLLM server URL.

```python
vllm_url = 'http://localhost:8000'
chatbot = Chatbot(
    api_key=None,  # API key is optional for vLLM
    provider=ChatProvider.VLLM,
    options={"baseUrl": vllm_url}
)
```

**Step 3:** Create input and add user message.

```python
chat_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="meta-llama/Llama-3.1-8B-Instruct",
    max_tokens=100,
    temperature=0.7
)
chat_input.add_user_message("What is machine learning?")
```

**Step 4:** Get response from your chatbot.

```python
response = chatbot.chat(chat_input)
print("Chatbot response:", response)
```

### DeepSeek Model Example

```python
deepseek_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
    max_tokens=150,
    temperature=0.6
)
deepseek_input.add_user_message("Explain quantum computing briefly.")
response = chatbot.chat(deepseek_input)
print("DeepSeek response:", response)
```

### Streaming Responses

vLLM supports streaming responses, which is especially useful for real-time interactions:

```python
import sys

stream_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="meta-llama/Llama-3.1-8B-Instruct",
    max_tokens=150,
    temperature=0.6
)
stream_input.add_user_message("Write a short poem about artificial intelligence.")

# Stream response token by token
print("Streaming response: ", end="")
for chunk in chatbot.stream(stream_input):
    print(chunk, end="")
    sys.stdout.flush()  # Ensure output is displayed immediately
print()  # Final newline
```
