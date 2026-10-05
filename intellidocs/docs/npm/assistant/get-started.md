---
sidebar_position: 1
title: "Build a ChatGPT-Style Assistant in Node.js"
sidebar_label: "Assistant"
description: "Use the IntelliNode Assistant to build a ChatGPT- or Gemini-style chat app in Node.js with saved conversations, answers from your documents with sources, and long-term memory."
keywords: ["node.js chat assistant","chatgpt style app node.js","rag chatbot node.js","intellinode assistant","chat history node.js","gemini chat app node.js"]
---

# Assistant

`Assistant` gives you the parts of a ChatGPT or Gemini style app in one class: saved conversations, answers from your own documents with numbered sources, long-term memory, attachments and streaming. It works with any chat provider.

It needs IntelliNode 3.1 or later:

```bash
npm install intellinode
```

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

### Attachments and Google Search

Pass files with a turn. An attachment is a file path, `{ data, mimeType }` or `{ uri, mimeType }`:

```javascript
await assistant.chat('What is in this invoice?', { userId: 'u1', attachments: ['invoice.png'] });
```

Gemini reads images, PDFs, audio and video. Anthropic reads images and PDFs, and OpenAI reads images.

On the `gemini` and `vertex` providers, `googleSearch: true` grounds the answer on the web and fills `citations`. Set it in the settings for every turn, or in the `chat` options for one turn.

### Manage conversations

```javascript
await assistant.listConversations({ userId: 'u1' });
await assistant.getMessages(conversationId);
await assistant.renameConversation(conversationId, 'Refund questions');
await assistant.regenerate(conversationId, { userId: 'u1' });   // answer the last question again
await assistant.deleteConversation(conversationId);
```

Set `autoTitle: true` to name a new conversation after its first exchange. It costs one extra model call.

### Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `topK` | 4 | Document chunks sent with each question. |
| `memoryTopK` | 3 | Memories recalled per turn. |
| `minScore` | none | Drops weak matches below this similarity. |
| `maxHistory` | 20 | Recent messages sent with each turn. |
| `tools` | none | Tools the model can call, as in [tool calling](../chatbot/tool-calling). |
| `inputOptions` | none | Extra input options, such as Gemini thinking settings. |

`addDocuments` takes `{ chunkSize, chunkOverlap }` (1200 and 150 characters by default). `addFiles(['faq.md'])` reads text files such as txt, md, csv, json and html, and uses the file name as the source.

### Try the chat app

The package ships a complete local app: a small Node server and one web page with conversations, sources, a web search toggle and `/image`. Copy [skills/intellinode/assets/chat-app](https://github.com/intelligentnode/IntelliNode/tree/main/IntelliNode/skills/intellinode/assets/chat-app) into your project, set one key, then run:

```bash
npm install intellinode dotenv
node server.js
```

The server listens on 127.0.0.1 because it holds your key. Put authentication in front of it before you expose it.

To keep conversations and documents in a database instead of files, see [Vector stores and chat history](./vector-stores).
