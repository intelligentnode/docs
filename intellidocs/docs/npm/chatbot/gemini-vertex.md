---
title: "Gemini and Vertex AI in Node.js"
sidebar_label: "Gemini and Vertex AI"
description: "Call Gemini on the Gemini Developer API or Vertex AI from Node.js with IntelliNode: chat, streaming, Google Search grounding, images, speech, embeddings, Veo video, Lyria music and the Live API."
keywords: ["gemini node.js","vertex ai node.js","gemini api javascript","google search grounding node.js","veo video node.js","gemini text to speech node.js"]
---

# Gemini and Vertex AI

IntelliNode reaches Gemini in two places: the Gemini Developer API and Vertex AI on Google Cloud. The same code works for both, and the key you have decides which one you use.

### Which key you have

| Your key | Provider | What you get |
| --- | --- | --- |
| An AI Studio key from aistudio.google.com | `'gemini'` | The Gemini Developer API |
| A Google Cloud Agent Platform key (it starts with `AQ.`) | `'vertex'` | Vertex AI in express mode |
| The same key plus a `projectId` | `'vertex'` | Project mode, which adds Veo video and the Live API on Vertex AI |

A Vertex key sent to the Developer API fails with `API_KEY_SERVICE_BLOCKED`, so match the provider to the key. With no key at all, a `projectId` uses your `gcloud` login (Application Default Credentials) in Node.

### Chat

Use `Chatbot` as with any other provider:

```javascript
const { Chatbot } = require('intellinode');

const bot = new Chatbot(process.env.VERTEX_API_KEY, 'vertex');   // or (GEMINI_API_KEY, 'gemini')
const input = Chatbot.createInput('vertex', 'You are concise.', {
  systemInstruction: true,
  generationConfig: { thinkingConfig: { thinkingLevel: 'low' } },
});
input.addUserMessage('Describe this image.', [{ data: base64Png, mimeType: 'image/png' }]);

const [answer] = await bot.chat(input);
for await (const chunk of bot.stream(input)) process.stdout.write(chunk);
```

Two options are worth setting:

- `systemInstruction: true` sends your system message as a real Gemini system instruction.
- Gemini 3 models think before they answer, and the thinking counts toward `maxTokens`. A low thinking level keeps chat fast. If you get an empty answer, raise `maxTokens`.

For project mode, pass options as the fourth argument: `new Chatbot(key, 'vertex', null, { projectId, location: 'global' })`. `Gen` takes the same provider ids, for example `Gen.generate_text('Write a haiku', key, 'vertex')`.

### Everything else: GoogleAIWrapper

`GoogleAIWrapper` covers the features only Gemini has:

```javascript
const fs = require('fs');
const { GoogleAIWrapper } = require('intellinode');

const google = new GoogleAIWrapper(process.env.VERTEX_API_KEY, { vertex: true });   // or new GoogleAIWrapper(GEMINI_API_KEY)

// answer from Google Search, with sources
const grounded = await google.generateContent({ contents: 'Latest Node.js LTS?', tools: [{ googleSearch: {} }] });
console.log(GoogleAIWrapper.extractText(grounded));
console.log(GoogleAIWrapper.extractCitations(grounded));   // [{ title, uri, domain }]

// an image
const [image] = GoogleAIWrapper.extractImages(await google.generateImage('A watercolor fox', { imageConfig: { aspectRatio: '16:9' } }));
fs.writeFileSync('fox.png', Buffer.from(image.data, 'base64'));

// speech, as a WAV buffer
fs.writeFileSync('hello.wav', await google.textToSpeech('Welcome to IntelliNode', { voice: 'Puck' }));

// read a PDF, image, audio or video file
const summary = await google.mediaToText('Summarize this report.', ['report.pdf']);
```

`startChat()` keeps the history for you, which Gemini 3 needs for function calling:

```javascript
const chat = google.startChat({ systemInstruction: 'You are a tutor.' });
await chat.sendText('My name is Sam.');
for await (const chunk of chat.stream('What is my name?')) process.stdout.write(chunk);
```

Save `chat.history` as JSON and resume later with `startChat({ history })`.

### Video, music and voice

Video and music are billed per call, and a video takes minutes. Music works with either key. Veo video runs on the Developer API, or on Vertex AI in project mode (`{ vertex: true, projectId }`):

```javascript
const project = new GoogleAIWrapper(process.env.VERTEX_API_KEY, { vertex: true, projectId });

const operation = await project.generateVideo('Drone shot over a misty forest', { durationSeconds: 4, resolution: '720p' });
const [video] = GoogleAIWrapper.extractVideos(await project.waitForVideoCompletion(operation));

const [track] = GoogleAIWrapper.extractAudio(await google.generateMusic('Calm piano with soft rain'));
fs.writeFileSync('music.wav', GoogleAIWrapper.audioToWav(track));
```

The Live API (`liveConnect`, `liveGenerate`) holds a voice session over a WebSocket, with the same rule as video on Vertex AI. It needs Node 22, or `node --experimental-websocket` on Node 20.

### What works where

| Feature | Developer API | Vertex express | Vertex project |
| --- | --- | --- | --- |
| Chat, streaming, JSON, function calling | yes | yes | yes |
| Google Search grounding | yes | yes | yes |
| Images, speech, music, embeddings, media understanding | yes | yes | yes |
| Veo video | yes | no | yes |
| Live API | yes | no | yes |
| Files API | yes | no | no |
| Context caching | yes | no | with OAuth |

Errors come back as `GoogleAIError` with `status` and `details`, and IntelliNode removes your key from the message. The [Assistant](../assistant/get-started) uses all of this to build a Gemini-style chat app.
