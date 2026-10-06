---
sidebar_position: 1
title: "Build a ChatGPT-Style Assistant in Node.js"
sidebar_label: "Assistant"
description: "Use the IntelliNode Assistant to build a ChatGPT- or Gemini-style chat app in Node.js with saved conversations, answers from your documents with sources, and long-term memory."
keywords: ["node.js chat assistant","chatgpt style app node.js","rag chatbot node.js","intellinode assistant","chat history node.js","gemini chat app node.js"]
---

# Assistant

`Assistant` gives you the parts of a ChatGPT or Gemini style app in one class: saved conversations, answers from your own documents with numbered sources, long-term memory, attachments and streaming.

It needs IntelliNode 3.1 or later:

```bash
npm install intellinode
```

### What you can choose

You build an assistant from up to four settings. Only the model is required.

| Setting | Options | If you leave it out |
| --- | --- | --- |
| `provider`: the model that answers | `openai`, `anthropic`, `gemini`, `vertex`, `mistral`, `cohere`, `nvidia`. Hosted services: `openrouter`, `groq`, `deepseek`, `xai`, `together`. <br/>**Local models**: `ollama`, `lmstudio`, `vllm`. | `openai` |
| `history`: where conversations are saved | `MemoryChatHistory` (lost on restart), `FileChatHistory` (JSON files on disk), `FirestoreChatHistory` (Google Cloud) | `MemoryChatHistory` |
| `knowledge`: your documents | `MemoryVectorStore`, or a database such as Pinecone, Qdrant, pgvector or Firestore | No answers from documents |
| `memory`: what it remembers across conversations | The same stores as `knowledge` | No long-term memory |

Documents and memory are searched by meaning, so each store needs an embedder that turns text into vectors: `openai`, `gemini`, `vertex`, `cohere`, `nvidia` or a local Ollama model. Anthropic has no embedder, so an assistant on Claude uses another provider's embedder. [Vector stores and chat history](./vector-stores) lists every store and embedder.

Some features depend on the provider:

| Feature | Providers |
| --- | --- |
| Conversations, answers from documents, memory, streaming | All |
| Image attachments | `gemini`, `vertex`, `anthropic`, `openai`, and other providers with a model that reads images |
| PDF attachments | `gemini`, `vertex`, `anthropic` |
| Audio and video attachments | `gemini`, `vertex` |
| Google Search | `gemini`, `vertex` |
| Tools | All except `cohere` |

### A first assistant

This example runs on OpenAI and keeps everything in local files, so there is nothing else to set up.

```javascript
const { Assistant, FileChatHistory, MemoryVectorStore } = require('intellinode');

const embedder = { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
const knowledge = new MemoryVectorStore({ embedder, path: './data/knowledge.json' });

const assistant = new Assistant({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  systemMessage: 'You are the support assistant for Acme.',
  history: new FileChatHistory({ dir: './data/conversations' }),
  knowledge,
});

// embed the documents once, not on every start
if (await knowledge.count() === 0) {
  await assistant.addDocuments([{ id: 'refunds.md', text: 'Refunds take 5 working days. Laptops take 10.' }]);
}

const reply = await assistant.chat('How long do refunds take?', { userId: 'u1' });
console.log(reply.text);
```

Each part has one job:

- `history` saves the conversations. `FileChatHistory` writes one JSON file per conversation.
- `knowledge` holds your documents. `addDocuments` splits each one into chunks and embeds them with the `embedder`.
- `chat` finds the chunks that match the question, sends them to the model with the recent messages, and saves the exchange.

### Continue the conversation

The reply carries a `conversationId`. Pass it back to keep talking in the same conversation:

```javascript
const next = await assistant.chat('And for laptops?', { conversationId: reply.conversationId, userId: 'u1' });
```

Pass the signed-in user's id as `userId` on every call. A conversation belongs to the first user who used it, and any other `userId` gets an error.

### Read the reply

| Field | What it holds |
| --- | --- |
| `text` | The answer. |
| `conversationId` | The id to continue with. |
| `references` | The document chunks found for the question. The ones the answer cites as `[1]`, `[2]` have `cited: true`. |
| `citations` | Web sources `{ title, uri }` when Google Search is on. |
| `memories` | What was recalled from earlier conversations. |
| `usage`, `model` | Token counts and the model that answered. |

To list the sources under an answer:

```javascript
const sources = reply.references.filter((ref) => ref.cited).map((ref) => `[${ref.index}] ${ref.id}`);
```

### Stream the answer

`stream` takes the same arguments as `chat` and yields events:

```javascript
for await (const event of assistant.stream('Who approves refunds?', { conversationId: reply.conversationId, userId: 'u1' })) {
  if (event.type === 'text') process.stdout.write(event.text);
}
```

You get a `start` event with the sources found, then `text` chunks, then a `done` event with the same object `chat` returns. To stream to a browser, write each event as a server-sent event: `` res.write(`data: ${JSON.stringify(event)}\n\n`) ``.

### Remember across conversations

Add a `memory` store. The assistant saves each exchange there and recalls the relevant ones in the same user's later conversations:

```javascript
const assistant = new Assistant({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  history: new FileChatHistory({ dir: './data/conversations' }),
  knowledge,
  memory: new MemoryVectorStore({ embedder, path: './data/memory.json' }),
});
```

### Send a file with a question

Users often add a file to a message, such as a screenshot or an invoice. Put it in `attachments` when you call `chat` or `stream`:

```javascript
const reply = await assistant.chat('What is the total on this invoice?', {
  userId: 'u1',
  attachments: ['./uploads/invoice.png'],
});
```

A file path is the simplest form. If the file isn't on disk, for example it came from an upload in your web app, pass its content and type instead:

```javascript
attachments: [{ data: fileBuffer, mimeType: 'application/pdf' }]   // data is a Buffer or a base64 string
```

The file types the model can read depend on the provider, as listed in [What you can choose](#what-you-can-choose). A file type the provider can't read throws an error that names a provider that can.

### Answer from the web with Google Search

This option is for assistants that run on Gemini, which means `provider: 'gemini'` or `provider: 'vertex'`. With it on, Gemini searches Google before it answers, and the pages it used come back in `reply.citations`.

To search on every question, turn it on when you create the assistant:

```javascript
const assistant = new Assistant({ provider: 'gemini', apiKey: process.env.GEMINI_API_KEY, googleSearch: true });
```

To search for one question only, pass it with that question:

```javascript
const reply = await assistant.chat('What changed in the latest Node.js release?', { userId: 'u1', googleSearch: true });
for (const source of reply.citations) console.log(source.title, source.uri);
```

### Manage conversations

```javascript
await assistant.listConversations({ userId: 'u1' });                      // the user's conversations, for a sidebar
await assistant.getMessages(conversationId);                              // every message in one conversation
await assistant.renameConversation(conversationId, 'Refund questions');
await assistant.regenerate(conversationId, { userId: 'u1' });             // answer the last question again
await assistant.deleteConversation(conversationId);
```

Set `autoTitle: true` to name a new conversation after its first exchange. It costs one extra model call.

### Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `topK` | 4 | How many document chunks go to the model with each question. |
| `memoryTopK` | 3 | How many past exchanges it recalls for each question. |
| `minScore` | none | Leaves out documents and memories whose similarity score is below this value. |
| `maxHistory` | 20 | How many recent messages of the conversation go to the model with each question. |
| `tools` | none | Functions the model can call, defined as in [tool calling](../chatbot/tool-calling). |
| `inputOptions` | none | Extra model settings. For example, `{ generationConfig: { thinkingConfig: { thinkingLevel: 'low' } } }` makes Gemini answer faster. |

`addDocuments` takes `{ chunkSize, chunkOverlap }` (1200 and 150 characters by default). `addFiles(['faq.md'])` reads text files such as txt, md, csv, json and html, and uses the file name as the source.

### Try the chat app

The package ships a complete local app: a small Node server and one web page with conversations, sources, a web search toggle and `/image`. Copy [skills/intellinode/assets/chat-app](https://github.com/intelligentnode/IntelliNode/tree/main/IntelliNode/skills/intellinode/assets/chat-app) into your project, set one key, then run:

```bash
npm install intellinode dotenv
node server.js
```

The server listens on 127.0.0.1 because it holds your key. Put authentication in front of it before you expose it.

To keep conversations and documents in a database instead of files, see [Vector stores and chat history](./vector-stores).
