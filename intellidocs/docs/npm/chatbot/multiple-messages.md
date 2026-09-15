---
sidebar_position: 2
title: "Multi-Turn Chat Conversations in Node.js"
sidebar_label: "Multiple messages"
description: "Build a conversation style flow with multiple user and assistant messages using the IntelliNode Node.js chatbot framework and ChatGPTInput."
keywords: ["intellinode multiple messages","node.js chatbot messages","chatgptinput add user message","chatgptinput add assistant message","intellinode chatbot framework"]
---

# Multiple messages


The intelliNode chatbot framework allows for a conversation-like flow with multiple messages.

## Example

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const input = new ChatGPTInput('You are an insightful assistant.');

input.addUserMessage("What's the gist of the Inception movie?");
input.addAssistantMessage("It's about a thief who enters the dreams of others to steal secrets and implant an idea.");
input.addUserMessage("And what about The Dark Knight?");
```
