---
sidebar_position: 5
---

# vLLM Integration

Intelli Python provide integration with **self-hosted vLLM models**.

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

## Connect Self-Hosted vLLM with RAG

Intelli Python supports connecting your self-hosted vLLM models with Retrieval-Augmented Generation (RAG) using a unified "One Key." 
This enables your chatbot to reference your uploaded documents or knowledge bases seamlessly.

### How it works:

- **Upload documents** or knowledge base via IntelliNode Cloud.
- Get a **One Key** that connects your vLLM chatbot directly to your documents.
- Enjoy **personalized responses** powered by your data.

See the [IntelliCloud Docs](https://docs.intellinode.ai/docs/python/intellicloud) for detailed instructions.

### Example: vLLM + One Key

```python
intelli_key = "<your_one_key>"
chatbot = Chatbot(
    api_key=None,
    provider=ChatProvider.VLLM,
    options={
        "baseUrl": "http://localhost:8000",
        "one_key": intelli_key,
        # "api_base": "self hosted intellicloud URL" (optional)
    }
)

input_obj = ChatModelInput(
    system="You are a helpful assistant.",
    model="meta-llama/Llama-3.1-8B-Instruct",
    max_tokens=200,
    temperature=0.5
)
input_obj.add_user_message("Summarize the key points from our uploaded annual report.")
response = chatbot.chat(input_obj)
print("Personalized response:", response)
```

This integration allows your chatbot to deliver accurate and context-aware responses derived directly from your own data sources.
