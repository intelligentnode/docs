---
sidebar_position: 2
title: "Vector Stores and Chat History in Node.js"
sidebar_label: "Vector stores"
description: "One IntelliNode interface for Pinecone, Qdrant, Chroma, Weaviate, Milvus, Elasticsearch, pgvector, MongoDB Atlas, Firestore and Vertex AI, plus stores for chat history."
keywords: ["vector database node.js","pinecone node.js","qdrant node.js","pgvector node.js","firestore vector search","vertex ai rag engine node.js"]
---

# Vector stores and chat history

A vector store saves your text together with an embedding, a list of numbers that captures what the text means. When a question comes in, the store finds the passages closest in meaning, even when they use different words. This is how the [Assistant](./get-started) answers from your documents and remembers earlier conversations.

IntelliNode gives every vector database the same methods. You can start with the in-memory store and switch to a database later by changing one line.

## What's supported

### Vector stores

| Database | Class | What you need first |
| --- | --- | --- |
| In memory, with an optional JSON file | `MemoryVectorStore({ path })` | Nothing. Good for getting started, tests and up to a few thousand chunks. |
| Pinecone | `PineconeVectorStore({ apiKey, indexHost })` | An index with the same dimension as your embedder |
| Qdrant | `QdrantVectorStore({ url, apiKey, collection })` | A Qdrant server or Qdrant Cloud |
| Chroma | `ChromaVectorStore({ url, collection })` | `chroma run`, or Chroma Cloud |
| Weaviate | `WeaviateVectorStore({ url, apiKey, className })` | A Weaviate server or Weaviate Cloud. The class name starts with a capital letter. |
| Milvus or Zilliz | `MilvusVectorStore({ url, token, collection, dimension })` | Milvus 2.5 or later |
| Elasticsearch | `ElasticsearchVectorStore({ url, apiKey, index, dimension })` | Elasticsearch 8 or later |
| Postgres with pgvector, including AlloyDB, Cloud SQL, Supabase and Neon | `PgVectorStore({ client, dimension })` | `npm i pg` and the pgvector extension |
| MongoDB Atlas | `MongoDBAtlasVectorStore({ collection })` | `npm i mongodb` and an Atlas vector index |
| Google Cloud Firestore | `FirestoreVectorStore({ projectId, collection })` | [Google Cloud sign-in](#google-cloud-sign-in) and a vector index |
| Vertex AI RAG Engine | `VertexRAGStore({ projectId, location, corpus })` | Google Cloud sign-in. Google reads, splits and embeds your files for you. |
| Vertex AI Vector Search | `VertexVectorSearchStore({ projectId, collection })` | Google Cloud sign-in |

Qdrant creates its collection, and pgvector its table and index, the first time you write to them.

### Embedders

An embedder turns text into vectors. You set it once on the store:

| Provider | Setting |
| --- | --- |
| OpenAI | `{ provider: 'openai', apiKey }` |
| Gemini Developer API | `{ provider: 'gemini', apiKey }` |
| Gemini on Vertex AI | `{ provider: 'vertex', apiKey, dimensions: 768 }` |
| Cohere | `{ provider: 'cohere', apiKey }` |
| NVIDIA | `{ provider: 'nvidia', apiKey }` |
| A local Ollama model | `{ provider: 'ollama', model: 'nomic-embed-text', options: { baseUrl: 'http://localhost:11434/v1' } }` |
| Your own code | `async (texts) => vectors` |

Anthropic has no embedder. If your assistant runs on Claude, give its stores one of the embedders above.

### Chat history

The Assistant saves conversations through a history store:

| Class | Where it saves | Good for |
| --- | --- | --- |
| `MemoryChatHistory()` | Process memory, lost on restart | Tests. The Assistant uses it when you set none. |
| `FileChatHistory({ dir })` | One JSON file per conversation | Local apps and desktop tools |
| `FirestoreChatHistory({ projectId, collection })` | Google Cloud Firestore | Servers with many users |

For another database, see [Your own chat history](#your-own-chat-history).

## Save and search documents

This example needs only an OpenAI key:

```javascript
const { MemoryVectorStore } = require('intellinode');

const store = new MemoryVectorStore({
  embedder: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  path: './data/vectors.json',
});

await store.addDocuments([
  { id: 'a', text: 'IntelliNode supports Gemini and Vertex AI.', metadata: { lang: 'en' } },
  { id: 'b', text: 'Refunds take five working days.', metadata: { lang: 'en' } },
]);

const hits = await store.search('Which models can I use?', 3);
console.log(hits[0]);   // { id: 'a', score: 0.71, text: 'IntelliNode supports Gemini...', metadata: { lang: 'en' } }
```

`score` is a similarity, so a higher score means a closer match. The score above is only an example.

To move to a database, change only the store you create. The rest of the code stays the same:

```javascript
const { QdrantVectorStore } = require('intellinode');

const store = new QdrantVectorStore({
  url: 'http://localhost:6333',
  collection: 'docs',
  embedder: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
});
```

Once a store has documents, keep the same embedder. Vectors from a different model, or with a different `dimensions`, can't be compared with the ones already saved.

### The methods

Every store has these five:

| Method | What it does |
| --- | --- |
| `addDocuments(docs)` | Embeds each `{ id, text, metadata }` and saves it. Adding the same id again replaces it. |
| `search(text, topK, filter)` | Returns the `topK` closest documents to the text. |
| `query({ text, topK, filter })` | The same search, with an object. Pass `vector` instead of `text` to search with your own vector. |
| `upsert(items)` | Saves vectors you made yourself, as `{ id, vector, text, metadata }`. |
| `delete(ids)` | Removes documents by id. |

### Filter by metadata

The third argument of `search` keeps only documents whose metadata matches:

```javascript
await store.search('refund policy', 5, { lang: 'en' });            // only documents with lang: 'en'
await store.search('refund policy', 5, { lang: ['en', 'fr'] });    // lang is 'en' or 'fr'
```

For filters beyond exact matches, pass the database's own filter syntax as `nativeFilter` in `query`.

## Google Cloud sign-in

Firestore, Vertex AI RAG Engine and Vector Search don't accept API keys. On your own machine, sign in once:

```bash
gcloud auth application-default login
```

On Cloud Run, GKE or Compute Engine, the sign-in comes from the environment and you don't need this step. Anywhere else, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account key file, or pass `accessToken` to the store.

Firestore also needs a vector index. `store.indexCommand(768)` prints the `gcloud` command that creates one for 768-number vectors.

### Keep everything in Firestore

With Firestore for both history and memory, a user's conversations stay in your Google Cloud project:

```javascript
const { Assistant, FirestoreChatHistory, FirestoreVectorStore } = require('intellinode');

const embedder = { provider: 'vertex', apiKey: process.env.VERTEX_API_KEY, dimensions: 768 };
const assistant = new Assistant({
  provider: 'vertex',
  apiKey: process.env.VERTEX_API_KEY,
  history: new FirestoreChatHistory({ projectId }),
  memory: new FirestoreVectorStore({ projectId, collection: 'memories', embedder }),
});
```

## Your own chat history

To save conversations in another database, such as Redis or DynamoDB, extend `ChatHistory` and write its seven methods: `getMessages`, `addMessages`, `getConversation`, `saveConversation`, `listConversations`, `deleteConversation` and `deleteLastMessages`. Then pass an instance as `history` to the Assistant.
