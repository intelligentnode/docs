---
sidebar_position: 2
title: "Vector Stores and Chat History in Python"
sidebar_label: "Vector stores"
description: "One Intelli interface for Pinecone, Qdrant, Chroma, Weaviate, Milvus, Elasticsearch, pgvector, MongoDB Atlas, Firestore and Vertex AI, plus stores for chat history."
keywords: ["vector database python","pinecone python","qdrant python","pgvector python","firestore vector search python","vertex ai rag engine python"]
---

# Vector stores and chat history

A vector store saves your text together with an embedding, a list of numbers that captures what the text means. When a question comes in, the store finds the passages closest in meaning, even when they use different words. This is how the [Assistant](./get-started) answers from your documents and remembers earlier conversations.

Intelli gives every vector database the same methods. You can start with the in-memory store and switch to a database later by changing one line. The stores talk to each database over its REST API, so most need no extra package.

## What's supported

### Vector stores

| Database | Class | What you need first |
| --- | --- | --- |
| In memory, with an optional JSON file | `MemoryVectorStore(path=)` | Nothing. Good for getting started, tests and up to a few thousand chunks. |
| Pinecone | `PineconeVectorStore(api_key=, index_host=)` | An index with the same dimension as your embedder |
| Qdrant | `QdrantVectorStore(url=, api_key=, collection=)` | A Qdrant server or Qdrant Cloud |
| Chroma | `ChromaVectorStore(url=, collection=)` | `chroma run`, or Chroma Cloud |
| Weaviate | `WeaviateVectorStore(url=, api_key=, class_name=)` | A Weaviate server or Weaviate Cloud. The class name starts with a capital letter. |
| Milvus or Zilliz | `MilvusVectorStore(url=, token=, collection=)` | A Milvus server or Zilliz Cloud |
| Elasticsearch | `ElasticsearchVectorStore(url=, api_key=, index=)` | Elasticsearch 8 or later. `username=` and `password=` work instead of a key. |
| Postgres with pgvector, including AlloyDB, Cloud SQL, Supabase and Neon | `PgVectorStore(connection=, dimension=)` | A database connection, such as `psycopg.connect(url)` from `pip install "psycopg[binary]"` |
| MongoDB Atlas | `MongoDBAtlasVectorStore(collection=)` | `pip install pymongo`, then pass a pymongo collection |
| Google Cloud Firestore | `FirestoreVectorStore(project_id=, collection=)` | [Google Cloud sign-in](#google-cloud-sign-in) and a vector index |
| Vertex AI RAG Engine | `VertexRAGStore(project_id=, location=, corpus=)` | Google Cloud sign-in. Google reads, splits and embeds your files for you. |
| Vertex AI Vector Search 2.0 | `VertexVectorSearchStore(project_id=, collection=)` | Google Cloud sign-in |
| Vertex AI Vector Search 1.0 | `VertexVectorSearchIndexStore(index=, index_endpoint=, deployed_index_id=, public_endpoint_domain=)` | Google Cloud sign-in and a deployed index |

Qdrant creates its collection, and pgvector its table and index, the first time you write to them.

### Embedders

An embedder turns text into vectors. You set it once on the store, as `embedder=`:

| Provider | Setting |
| --- | --- |
| OpenAI | `{"provider": "openai", "api_key": key}` |
| Gemini Developer API | `{"provider": "gemini", "api_key": key}` |
| Gemini on Vertex AI | `{"provider": "vertex", "api_key": key, "dimensions": 768}` |
| Cohere | `{"provider": "cohere", "api_key": key}` |
| Mistral | `{"provider": "mistral", "api_key": key}` |
| NVIDIA | `{"provider": "nvidia", "api_key": key}` |
| Amazon Bedrock (Titan) | `{"provider": "aws", "options": {"region": "us-east-1"}}` |
| A local Ollama model | `{"provider": "ollama", "model": "nomic-embed-text"}` |
| Your own code | a function that takes a list of texts and returns a list of vectors |

Anthropic, llama.cpp and Keras have no embedder. If your assistant runs on one of them, give its stores one of the embedders above.

### Chat history

The Assistant saves conversations through a history store:

| Class | Where it saves | Good for |
| --- | --- | --- |
| `MemoryChatHistory()` | Process memory, lost on restart | Tests. The Assistant uses it when you set none. |
| `FileChatHistory(dir=)` | One JSON file per conversation | Local apps and desktop tools |
| `FirestoreChatHistory(project_id=, collection=)` | Google Cloud Firestore | Servers with many users |

Files and Firestore use the same format as IntelliNode, the Node.js library, so a Python app and a Node.js app can share the same conversations and vectors.

For another database, see [Your own chat history](#your-own-chat-history).

## Save and search documents

This example needs only an OpenAI key:

```python
import os
from intelli.store import MemoryVectorStore

store = MemoryVectorStore(
    embedder={"provider": "openai", "api_key": os.environ["OPENAI_API_KEY"]},
    path="./data/vectors.json",
)

store.add_documents([
    {"id": "a", "text": "Intelli supports Gemini and Vertex AI.", "metadata": {"lang": "en"}},
    {"id": "b", "text": "Refunds take five working days.", "metadata": {"lang": "en"}},
])

hits = store.search("Which models can I use?", top_k=3)
print(hits[0])   # {'id': 'a', 'score': 0.71, 'text': 'Intelli supports Gemini...', 'metadata': {'lang': 'en'}}
```

`score` is a similarity, so a higher score means a closer match. The score above is only an example.

To move to a database, change only the store you create. The rest of the code stays the same:

```python
from intelli.store import QdrantVectorStore

store = QdrantVectorStore(
    url="http://localhost:6333",
    collection="docs",
    embedder={"provider": "openai", "api_key": os.environ["OPENAI_API_KEY"]},
)
```

Once a store has documents, keep the same embedder. Vectors from a different model, or with a different `dimensions`, can't be compared with the ones already saved.

### The methods

Every store has these five:

| Method | What it does |
| --- | --- |
| `add_documents(documents)` | Embeds each `{"id", "text", "metadata"}` and saves it. Adding the same id again replaces it. |
| `search(text, top_k=5, filter=None)` | Returns the `top_k` closest documents to the text. |
| `query(vector=None, text=None, top_k=5, filter=None)` | The same search. Pass `vector` instead of `text` to search with your own vector. |
| `upsert(records)` | Saves vectors you made yourself, as `{"id", "vector", "text", "metadata"}`. |
| `delete(ids)` | Removes documents by id. |

A failed call raises `StoreError`, with the HTTP `status_code` and the database's `details`.

### Filter by metadata

`filter` keeps only documents whose metadata matches:

```python
store.search("refund policy", top_k=5, filter={"lang": "en"})             # only documents with lang 'en'
store.search("refund policy", top_k=5, filter={"lang": ["en", "fr"]})     # lang is 'en' or 'fr'
```

For filters beyond exact matches, pass the database's own filter syntax as `native_filter` in `query`.

### Create a store from settings

`create_vector_store` and `create_chat_history` build a store from a dictionary, which is handy when the settings come from a file. Flows and Vibe Agents use the same format:

```python
from intelli.store import create_vector_store, create_chat_history

store = create_vector_store({"type": "qdrant", "url": "http://localhost:6333", "collection": "docs",
                             "embedder": {"provider": "openai", "api_key": key}})
history = create_chat_history({"type": "file", "dir": "./conversations"})
```

The types are `memory`, `qdrant`, `chroma`, `weaviate`, `milvus`, `elasticsearch`, `pinecone`, `pgvector`, `mongodb`, `firestore`, `vertex_rag`, `vertex_vector_search` and `vertex_vector_search_index`. For history: `memory`, `file` and `firestore`.

## Google Cloud sign-in

Firestore, Vertex AI RAG Engine and Vector Search don't accept API keys. Install Google's sign-in package and sign in once on your own machine:

```bash
pip install google-auth
gcloud auth application-default login
```

On Cloud Run, GKE or Compute Engine, the sign-in comes from the environment and you don't need the second step. Anywhere else, pass `credentials=` (a google.auth object) or `access_token=` to the store.

Firestore also needs a vector index. `store.index_command(768)` prints the `gcloud` command that creates one for 768-number vectors.

### Keep everything in Firestore

With Firestore for both history and memory, a user's conversations stay in your Google Cloud project:

```python
from intelli.function.assistant import Assistant
from intelli.store import FirestoreChatHistory, FirestoreVectorStore

key = os.environ["VERTEX_API_KEY"]
embedder = {"provider": "vertex", "api_key": key, "dimensions": 768}
assistant = Assistant(
    provider="vertex",
    api_key=key,
    history=FirestoreChatHistory(project_id=project_id),
    memory=FirestoreVectorStore(project_id=project_id, collection="memories", embedder=embedder),
)
```

## Your own chat history

To save conversations in another database, such as Redis or DynamoDB, subclass `ChatHistory` and write its seven methods: `get_messages`, `add_messages`, `get_conversation`, `save_conversation`, `list_conversations`, `delete_conversation` and `delete_last_messages`. Then pass an instance as `history` to the Assistant.
