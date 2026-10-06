---
sidebar_position: 1
title: "Build a ChatGPT-Style Assistant in Python"
sidebar_label: "Assistant"
description: "Use the Intelli Assistant to build a ChatGPT- or Gemini-style chat app in Python with saved conversations, answers from your documents with sources, long-term memory, tools and flow steps."
keywords: ["python chat assistant","chatgpt style app python","rag chatbot python","intelli assistant","chat history python","gemini chat app python"]
---

# Assistant

`Assistant` gives you the parts of a ChatGPT or Gemini style app in one class: saved conversations, answers from your own documents with numbered sources, long-term memory, attachments, tools and streaming.

It needs Intelli 2.1.3 or later:

```bash
pip install -U intelli
```

### What you can choose

You build an assistant from up to four settings. Only the model is required.

| Setting | Options | If you leave it out |
| --- | --- | --- |
| `provider`: the model that answers | `openai`, `anthropic`, `gemini`, `vertex` (Gemini on Vertex AI), `aws` (Amazon Bedrock), `mistral`, `nvidia`. <br/>**Local models**: `ollama`, `vllm`, `llamacpp`, `keras`. | `openai` |
| `history`: where conversations are saved | `MemoryChatHistory` (lost on restart), `FileChatHistory` (JSON files on disk), `FirestoreChatHistory` (Google Cloud) | `MemoryChatHistory` |
| `knowledge`: your documents | `MemoryVectorStore`, or a database such as Pinecone, Qdrant, pgvector or Firestore | No answers from documents |
| `memory`: what it remembers across conversations | The same stores as `knowledge` | No long-term memory |

Documents and memory are searched by meaning, so each store needs an embedder that turns text into vectors: `openai`, `gemini`, `vertex`, `cohere`, `mistral`, `nvidia`, `aws` or a local Ollama or vLLM model. Anthropic, llama.cpp and Keras have no embedder, so an assistant on one of them uses another provider's embedder. [Vector stores and chat history](./vector-stores) lists every store and embedder.

Some features depend on the provider:

| Feature | Providers |
| --- | --- |
| Conversations, answers from documents, memory, streaming | All |
| Image attachments | `gemini`, `vertex`, `anthropic`, `aws`, `openai`, `mistral`, `nvidia`, `vllm` |
| PDF attachments | `gemini`, `vertex`, `anthropic`, `aws` |
| Video attachments | `gemini`, `vertex`, `aws` |
| Audio attachments | `gemini`, `vertex` |
| Google Search | `gemini`, `vertex` |
| Tools | `openai`, `anthropic`, `gemini`, `vertex`, `aws`, `mistral`, `nvidia`, `vllm`, `ollama` |

### A first assistant

This example runs on OpenAI and keeps everything in local files, so there is nothing else to set up.

```python
import os
from intelli.function.assistant import Assistant
from intelli.store import FileChatHistory, MemoryVectorStore

key = os.environ["OPENAI_API_KEY"]
embedder = {"provider": "openai", "api_key": key}
knowledge = MemoryVectorStore(embedder=embedder, path="./data/knowledge.json")

assistant = Assistant(
    provider="openai",
    api_key=key,
    system_message="You are the support assistant for Acme.",
    history=FileChatHistory(dir="./data/conversations"),
    knowledge=knowledge,
)

# embed the documents once, not on every start
if knowledge.count() == 0:
    assistant.add_documents([{"id": "refunds.md", "text": "Refunds take 5 working days. Laptops take 10."}])

reply = assistant.chat("How long do refunds take?", user_id="u1")
print(reply["text"])
```

Each part has one job:

- `history` saves the conversations. `FileChatHistory` writes one JSON file per conversation.
- `knowledge` holds your documents. `add_documents` splits each one into chunks and embeds them with the `embedder`.
- `chat` finds the chunks that match the question, sends them to the model with the recent messages, and saves the exchange.

### Continue the conversation

The reply carries a `conversation_id`. Pass it back to keep talking in the same conversation:

```python
follow_up = assistant.chat("And for laptops?", conversation_id=reply["conversation_id"], user_id="u1")
```

Pass the signed-in user's id as `user_id` on every call. A conversation belongs to the first user who used it, and any other `user_id` gets a `PermissionError`.

### Read the reply

`chat` returns a dictionary:

| Key | What it holds |
| --- | --- |
| `text` | The answer. |
| `conversation_id` | The id to continue with. |
| `references` | The document chunks found for the question. The ones the answer cites as `[1]`, `[2]` have `cited: True`. |
| `citations` | Web sources when Google Search is on. |
| `memories` | What was recalled from earlier conversations. |
| `tool_steps` | Every tool call the model made, with its result. |
| `usage`, `model` | Token counts and the model that answered. |

To list the sources under an answer:

```python
sources = [f"[{ref['index']}] {ref['id']}" for ref in reply["references"] if ref["cited"]]
```

### Stream the answer

`stream` takes the same arguments as `chat` and yields events:

```python
for event in assistant.stream("Who approves refunds?", conversation_id=reply["conversation_id"], user_id="u1"):
    if event["type"] == "text":
        print(event["text"], end="", flush=True)
```

You get a `start` event with the sources found, then `text` chunks, then a `done` event with the same dictionary `chat` returns. With tools, or on a model that doesn't stream, the whole answer arrives as one `text` event.

### Remember across conversations

Add a `memory` store. The assistant saves each exchange there and recalls the relevant ones in the same user's later conversations:

```python
assistant = Assistant(
    provider="openai",
    api_key=key,
    history=FileChatHistory(dir="./data/conversations"),
    knowledge=knowledge,
    memory=MemoryVectorStore(embedder=embedder, path="./data/memory.json"),
)
```

### Send a file with a question

Users often add a file to a message, such as a screenshot or an invoice. Put it in `attachments` when you call `chat` or `stream`:

```python
reply = assistant.chat("What is the total on this invoice?", user_id="u1", attachments=["./uploads/invoice.png"])
```

A file path is the simplest form. If the file isn't on disk, for example it came from an upload in your web app, pass its content and type instead:

```python
attachments=[{"data": file_bytes, "mime_type": "application/pdf"}]   # data is bytes or a base64 string
```

A link works too: `https://`, `gs://` for Gemini on Vertex AI, or `s3://` for Amazon Bedrock. Anthropic needs the file itself, not a link.

The file types the model can read depend on the provider, as listed in [What you can choose](#what-you-can-choose). A file type the provider can't read raises an error.

### Answer from the web with Google Search

This option is for assistants that run on Gemini, which means `provider="gemini"` or `provider="vertex"`. With it on, Gemini searches Google before it answers, and the pages it used come back in `reply["citations"]`.

To search on every question, turn it on when you create the assistant:

```python
assistant = Assistant(provider="gemini", api_key=os.environ["GEMINI_API_KEY"], google_search=True)
```

To search for one question only, pass it with that question:

```python
reply = assistant.chat("What changed in the latest Python release?", user_id="u1", google_search=True)
```

### Give it tools

A tool is a plain Python function. Its name, the first paragraph of its docstring and its type hints tell the model what it does:

```python
def order_status(order_id: str) -> dict:
    """Look up the delivery status of an order."""
    return {"order_id": order_id, "status": "shipped"}

assistant = Assistant(provider="openai", api_key=key, tools=[order_status])
reply = assistant.chat("Where is order 1234?", user_id="u1")
print(reply["text"], reply["tool_steps"])
```

The assistant calls the tool, sends the result back to the model, and repeats up to `max_tool_steps` times (5 by default). If a tool raises an error, the model gets the error message and can try another way.

### Manage conversations

```python
assistant.list_conversations(user_id="u1")                      # the user's conversations, for a sidebar
assistant.get_messages(conversation_id)                         # every message in one conversation
assistant.rename_conversation(conversation_id, "Refund questions")
assistant.regenerate(conversation_id)                           # answer the last question again
assistant.delete_conversation(conversation_id)                  # also removes its memories
```

Set `auto_title=True` to name a new conversation after its first exchange. It costs one extra model call.

### Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `top_k` | 4 | How many document chunks go to the model with each question. |
| `memory_top_k` | 3 | How many past exchanges it recalls for each question. |
| `min_score` | none | Leaves out documents and memories whose similarity score is below this value. |
| `max_history` | 20 | How many recent messages of the conversation go to the model with each question. |
| `model` | the provider's default | The model to use, such as `gpt-5-mini`. |
| `options` | none | Provider settings, such as `project_id` and `location` for Vertex AI, or `region` for AWS. |

`add_documents` takes `chunk_size` and `chunk_overlap` (1200 and 150 characters by default). `add_files(["faq.md"])` reads text files such as txt, md, csv, json and html, and uses the file name as the source.

### Use an assistant as a flow step

In a [flow](../flows/get-started), an `Agent` of type `"assistant"` is a step with everything above. Without stores it is a plain model call, so you add a knowledge store, a history or tools only to the steps that need them:

```python
import asyncio
import os
from intelli.flow import Agent, Task, TextTaskInput, Flow

key = os.environ["OPENAI_API_KEY"]

answer = Agent("assistant", "openai", "You are Acme support. Answer in two sentences.",
               {"key": key, "model": "gpt-5-mini", "show_sources": True},
               {"knowledge": {"type": "memory", "path": "./knowledge.json"},
                "files": ["./handbook.md"]})
reply = Agent("assistant", "openai", "You write short, polite replies.", {"key": key, "model": "gpt-5-mini"})

flow = Flow(tasks={"answer": Task(TextTaskInput("Answer the customer's question."), answer),
                   "reply": Task(TextTaskInput("Turn the answer into a reply email."), reply)},
            map_paths={"answer": ["reply"]})

output = asyncio.run(flow.start(initial_input="How long do I have to return a laptop?"))
```

The first step searches the handbook with the customer's question and answers with its sources. The second step turns that answer into an email.

- **Stores as settings:** `knowledge`, `memory` and `history` take a store object, or settings such as `{"type": "qdrant", "url": "http://localhost:6333", "collection": "docs"}`.
- **Documents:** the files in `files` are added to the knowledge store the first time the step runs, unless the store already has records.
- **Embedder:** stores created from settings embed with the step's provider. On `anthropic`, `vllm` or `llamacpp`, add an `"embedder"` to the settings.
- **Conversations:** without a `conversation_id` in the model settings, every run starts a new conversation.

[Vibe Agents](../vibe-agents) can also plan assistant steps from a plain request.

To keep conversations and documents in a database instead of files, see [Vector stores and chat history](./vector-stores).
