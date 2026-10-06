---
slug: automate-evaluating-language-models
title: "Automate LLM Evaluation: Compare Models on Your Own Questions"
description: "Compare GPT, Claude, Gemini and local models on your own questions in Node.js. IntelliNode scores every answer against the answers you accept, in one script."
keywords: ["llm evaluation", "compare llm models", "evaluate language models", "how to choose an llm", "llm benchmark node.js", "cosine similarity llm", "llm model selection"]
tags: [{label: "Node.js", permalink: "/nodejs"}, "LLM Evaluation", "Model Selection"]
authors: [intellinode]
image: /img/articles/automate-evaluating-language-models.jpg
image_alt: "Score bars of different lengths beside target rings, with dots landing at different distances from the center"
date: 2023-12-06T09:00:00Z
last_update:
  date: 2026-10-06
---

*Updated in October 2026 for IntelliNode 3.1 and today's models.*

Every few weeks a new model takes the top spot on some leaderboard. Your team still has a plainer question to answer: which model should our product use for this job? Public benchmarks test someone else's tasks. What you want is to ask your own questions to a few models and see whose answers come closest to an answer you would accept.

This guide builds that check as one Node.js script. You write a question and one or two good answers. IntelliNode sends the question to each model and scores every reply against your answers, so the comparison takes minutes instead of a week of reading.

![Score bars of different lengths beside target rings, with dots landing at different distances from the center](/img/articles/automate-evaluating-language-models.jpg)

<!-- truncate -->

## How the scoring works

A computer can't tell whether two sentences mean the same thing by comparing words. "You can return it within 30 days" and "Returns are accepted for a month" share almost no words, yet say the same thing.

So IntelliNode first turns each text into an embedding, a list of numbers that captures its meaning. Texts that mean the same thing get similar numbers, whatever the wording. Then it compares the numbers in three ways:

| Score | Better when | In plain words |
| --- | --- | --- |
| Cosine similarity | closer to 1 | Do the two answers point at the same meaning? |
| Euclidean distance | lower | How far apart are they, in a straight line? |
| Manhattan distance | lower | The same idea, measured along each number separately. |

Cosine similarity is the one to read first. The two distances usually agree with it and help break a tie.

One limit to keep in mind: these scores measure how close a reply is to your answers, not whether your answers are right. Write the good answers carefully, and keep a person reading the top replies before you decide.

## Set up the project

```bash
npm init -y
npm i intellinode
```

Set a key for each provider you want to compare, for example `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` and `GEMINI_API_KEY`. A local model through [Ollama](https://ollama.com) needs no key.

## Write the comparison

First, list the models. Each entry names the provider, the model and its key:

```javascript
const { LLMEvaluation } = require('intellinode');

const models = [
  { provider: 'openai', type: 'chat', model: 'gpt-5.5', apiKey: process.env.OPENAI_API_KEY },
  { provider: 'anthropic', type: 'chat', model: 'claude-sonnet-5', apiKey: process.env.ANTHROPIC_API_KEY, maxTokens: 2000 },
  { provider: 'gemini', type: 'chat', model: 'gemini-3.6-flash', apiKey: process.env.GEMINI_API_KEY, maxTokens: 2000 },
  { provider: 'ollama', type: 'chat', model: 'qwen2.5:7b', maxTokens: 2000 },   // free, runs on your machine
];
```

Claude and Gemini think before they answer, and the thinking counts toward `maxTokens`, so give them room. The local model is [Qwen2.5 7B](https://ollama.com/library/qwen2.5:7b), a 4.7 GB download that runs on a laptop.

Then write the question and the answers you would accept. Put the facts the model needs in the question, the way your product would:

```javascript
const question =
  'Our policy: laptops can be returned within 30 days in the original box. ' +
  'A customer asks: can I return my laptop after 20 days?';

const goodAnswers = [
  'Yes. Laptops can be returned within 30 days, so 20 days is fine if it is in the original box.',
  'You still have 10 days left to return it. Keep the original packaging.',
];

// one embedding model scores every reply, so the comparison is fair
const evaluation = new LLMEvaluation(process.env.OPENAI_API_KEY, 'openai');
const results = await evaluation.compareModels(question, goodAnswers, models);
```

`compareModels` asks each model in turn. If a call fails, for example because a key is missing, that model is marked with `stop_reason: 'error'` and the others still run.

## Read the results

Each model comes back under its `provider/model` name, with its reply and its scores. The shape looks like this, and your numbers will differ:

```javascript
{
  'openai/gpt-5.5': [{
    prediction: 'Yes, you can. You are within the 30 day window as long as it is in the original box.',
    score_cosine_similarity: 0.93,
    score_euclidean_distance: 0.37,
    score_manhattan_distance: 13.2,
    stop_reason: 'complete'
  }],
  'ollama/qwen2.5:7b': [ ... ],
  lookup: { cosine_similarity: 'a value closer to 1 indicates a higher degree of similarity...', ... }
}
```

To rank the models, sort by cosine similarity:

```javascript
const ranking = Object.entries(results)
  .filter(([name]) => name !== 'lookup')
  .map(([name, [reply]]) => ({ model: name, score: reply.score_cosine_similarity ?? 0, answer: reply.prediction }))
  .sort((a, b) => b.score - a.score);

console.table(ranking);
```

The interesting result is rarely who wins. It is how close the cheaper options come. If the local model scores within a few points of the best one on your questions, it may be good enough for that job, at no cost per call and with the data staying on your machine.

## Make it a routine

One question tells you little. A useful check takes ten to twenty real questions from your own work, such as support tickets, product questions or internal docs, each with one or two good answers. Run them all, and average the scores per model.

Keep the script in your repository and run it again when a provider ships a new model. Switching then becomes a decision with numbers behind it, and IntelliNode's one interface means the switch itself is a change of provider name.

If the results say different jobs need different models, you don't have to pick one for everything. [Route each request](/docs/npm/use-cases/model-routing) to the model that fits it, with a fallback when a provider is down.

## Next step

Copy the script, replace the question with one your team answers every day, and run it on two models you are considering. The [LLM evaluation page](/docs/npm/functions/llm-evaluation) in the docs has the full reference.
