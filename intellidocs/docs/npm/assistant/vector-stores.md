---
sidebar_position: 2
title: "Vector Stores and Chat History in Node.js"
sidebar_label: "Vector stores"
description: "One IntelliNode interface for Pinecone, Qdrant, Chroma, Weaviate, Milvus, Elasticsearch, pgvector, MongoDB Atlas, Firestore and Vertex AI, plus stores for chat history."
keywords: ["vector database node.js","pinecone node.js","qdrant node.js","pgvector node.js","firestore vector search","vertex ai rag engine node.js"]
---

# Vector stores and chat history

Every IntelliNode vector store has the same five methods, so you can start with an in-memory store and move to a database later without changing the rest of your code. The [Assistant](./get-started) uses these stores for documents and memory, and you can also use them on their own.

### The shared interface

```javascript
const { QdrantVectorStore } = require('intellinode');

const store = new QdrantVectorStore({
  url: 'http://localhost:6333',
  collection: 'docs',
  embedder: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
});

await store.addDocuments([{ id: 'a', text: 'IntelliNode supports Gemini.', metadata: { lang: 'en' } }]);
const hits = await store.search('Which models are supported?', 3, { lang: 'en' });
// [{ id, score, text, metadata }]
```

| Method | What it does |
| --- | --- |
| `addDocuments(docs)` | Embeds the text with the store's embedder and saves it under your ids. |
| `upsert(items)` | Saves vectors you made yourself: `{ id, vector, text, metadata }`. |
| `search(text, topK, filter)` | Finds the closest documents to a question. |
| `query({ text or vector, topK, filter })` | The same search, with an object. |
| `delete(ids)` | Removes documents by id. |

`score` is a similarity, so higher means closer. `filter` matches metadata values exactly, and an array means "one of". For anything more, pass the database's own filter as `nativeFilter`.

### Pick an embedder

The `embedder` turns text into vectors:

```javascript
{ provider: 'openai', apiKey }                                   // text-embedding-3-small
{ provider: 'gemini', apiKey }                                   // 3072 numbers
{ provider: 'vertex', apiKey, dimensions: 768 }                  // gemini-embedding-001 on Vertex AI
{ provider: 'cohere', apiKey }
{ provider: 'ollama', model: 'nomic-embed-text', options: { baseUrl: 'http://localhost:11434/v1' } }
async (texts) => myVectors(texts)                                 // your own function
```

Keep the same embedder for the life of a store. A different model or `dimensions` makes the saved vectors useless.

### Pick a store

| Class | Use it for | Needs |
| --- | --- | --- |
| `MemoryVectorStore({ path })` | Local apps, tests and the browser, up to a few thousand chunks | Nothing. `path` saves it to a JSON file. |
| `PineconeVectorStore({ apiKey, indexHost })` | Managed vector search | An index with the right dimension |
| `QdrantVectorStore({ url, apiKey, collection })` | Self-hosted or Qdrant Cloud | A Qdrant server |
| `ChromaVectorStore({ url, collection })` | Local development | `chroma run` or Chroma Cloud |
| `WeaviateVectorStore({ url, apiKey, className })` | Weaviate 1.2x and later | A capitalized class name |
| `MilvusVectorStore({ url, token, collection, dimension })` | Milvus or Zilliz | Milvus 2.5 or later |
| `ElasticsearchVectorStore({ url, apiKey, index, dimension })` | An existing Elasticsearch cluster | Elasticsearch 8 or later |
| `PgVectorStore({ client, dimension })` | Postgres, AlloyDB, Cloud SQL, Supabase, Neon | `npm i pg` and the pgvector extension |
| `MongoDBAtlasVectorStore({ collection })` | MongoDB Atlas | `npm i mongodb` and an Atlas vector index |
| `FirestoreVectorStore({ projectId, collection })` | Data next to your Firestore app data | Google Cloud OAuth and a vector index |
| `VertexRAGStore({ projectId, location, corpus })` | Google parses, chunks and embeds your files | Google Cloud OAuth |
| `VertexVectorSearchStore({ projectId, collection })` | Vertex AI Vector Search 2.0 | Google Cloud OAuth |

`PgVectorStore` creates its table and index on first use, and Qdrant creates its collection on the first write.

### Google Cloud stores

Firestore, RAG Engine and Vector Search don't accept API keys. For local development, sign in once:

```bash
gcloud auth application-default login
```

On Cloud Run, GKE or Compute Engine the token comes from the environment. Anywhere else, point `GOOGLE_APPLICATION_CREDENTIALS` at a service account key file, or pass `accessToken`.

Firestore also needs a vector index. `store.indexCommand(768)` prints the `gcloud` command that creates it.

### Chat history

The Assistant saves conversations through one of these:

| Class | Where it saves | Good for |
| --- | --- | --- |
| `MemoryChatHistory()` | Process memory, lost on restart | Tests. It is the default. |
| `FileChatHistory({ dir })` | One JSON file per conversation | Local apps and desktop tools |
| `FirestoreChatHistory({ projectId, collection })` | Firestore | Servers with many users |

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

For another database, such as Redis or DynamoDB, extend `ChatHistory` and write its seven methods: `getMessages`, `addMessages`, `getConversation`, `saveConversation`, `listConversations`, `deleteConversation` and `deleteLastMessages`.
