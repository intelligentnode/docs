---
sidebar_position: 4
---

# DeepSeek & Llama

Integrate NVIDIA’s latest language models **Deepseek** and **Llama**— via a unified chatbot interface. With minimal code changes, you can switch between NVIDIA, OpenAI, and other providers.

## Supported Models

| Model Name                                 | Type       |
|--------------------------------------------|------------|
| deepseek-ai/deepseek-r1                    | Chat       |
| meta/llama-3.3-70b-instruct                | Chat       |
| nvidia/llama-3.2-nv-embedqa-1b-v2          | Embedding  |

## Get Started

### API Key
Visit [https://build.nvidia.com/models](https://build.nvidia.com/models) to get your NVIDIA API key.

## Chat

```python
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput

# Create a chatbot sing your API key.
nvidia_bot = Chatbot("YOUR_NVIDIA_API_KEY", ChatProvider.NVIDIA.value)

# Prepare chat input
input_obj = ChatModelInput("You are a helpful assistant.", model="deepseek-ai/deepseek-r1", max_tokens=512, temperature=0.6)
input_obj.add_user_message("Which number is larger, 9.11 or 9.8?")
# Get chat response
response = nvidia_bot.chat(input_obj)
```

## Stream
```python
import asyncio

# Example of streaming in an async context
async def stream_nvidia():
    for chunk in nvidia_bot.stream(input_obj):
        print(chunk, end="")

# In async environment, you can run:
await stream_nvidia()
```


## Multiple Messages

```python
nvidia_bot = Chatbot("YOUR_NVIDIA_API_KEY", ChatProvider.NVIDIA.value)

input_obj = ChatModelInput("You are an insightful assistant.", model="deepseek-ai/deepseek-r1", max_tokens=512, temperature=0.6)
input_obj.add_user_message("What is the secret to a happy and balanced life?")
input_obj.add_assistant_message("Happiness comes from gratitude and meaningful connections.")
input_obj.add_user_message("Can you elaborate?")

responses = nvidia_bot.chat(input_obj)
for resp in responses:
    print("- " + resp)
```

## Embeddings

NVIDIA also provides embedding models like **nvidia/llama-3.2-nv-embedqa-1b-v2** for text embeddings.

```python
from intelli.controller.remote_embed_model import RemoteEmbedModel
from intelli.model.input.embed_input import EmbedInput

# Create the embed controller
embed_model = RemoteEmbedModel("YOUR_NVIDIA_API_KEY", "nvidia")

# Prepare the embed input
embed_input = EmbedInput(
    texts=["What is the capital of France?"],
    model="nvidia/llama-3.2-nv-embedqa-1b-v2"
)

# Get the embeddings
result = embed_model.get_embeddings(embed_input)
print("Embedding result:", result)
```

## Docs Chat Integration with NVIDIA

Intellinode Cloud allows you to connect your data to various chatbot engines—including NVIDIA Chat—to tailor responses based on your uploaded documents or images.

1. Visit the [IntelliNode App](https://app.intellinode.ai/).
2. Start a project using the **Document** option.
3. Upload your documents or images (PDF, DOC, DOCX, PNG, JPG, etc.).
4. Copy the generated **One Key**; this key connects NVIDIA Chat to your data.

#### Example: NVIDIA Chat with One Key

```python
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput

intelli_key = "<YOUR_ONE_KEY>"
nvidia_bot = Chatbot("YOUR_NVIDIA_API_KEY", ChatProvider.NVIDIA.value, options={"one_key": intelli_key})

input_obj = ChatModelInput("You are a helpful assistant.", model="deepseek-ai/deepseek-r1", max_tokens=512, temperature=0.6)
input_obj.add_user_message("List the key features of our new digital platform.")
responses = nvidia_bot.chat(input_obj)
```
