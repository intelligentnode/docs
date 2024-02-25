---
sidebar_position: 3
---
# Fine tuning

Provides a unified layer to fine tune LLMs. By training on a subset of your data, the model can produce more relevant and accurate outputs for your particular use cases.

### Supported Providers

Intellinode supports fine-tuning with openai provider in the current version.

### Parameters

To fine-tune a model for your application, you'll need configuration parameters including:

- **provider**: The AI service provider (`'openai'`).
- **apiKey**: Your API key for accessing the provider.
- **trainingData**: Your fine-tuning dataset, formatted as jsonl.
- **model**: (Optional) The specific model you're fine-tuning if the provider supports multiple models.

### Example

This node example demonstrates initiating a fine-tuning task with openai provider:

**Openai embedding**
1. Prepare the imports.
```javascript
const { RemoteFineTuneModel, SupportedFineTuneModels, FineTuneInput } = require('intellinode');
const { createReadStream } = require("fs");
const FormData = require("form-data");

```

2. Upload the tuning file.

```javascript
// read the file
const filePath = './temp/training_data.jsonl'

const filePayload = new FormData();
filePayload.append('file', createReadStream(filePath));
filePayload.append('purpose', 'fine-tune');

// upload the file to openai platform
const file = await tuner.uploadFile(filePayload)
```

3. Start the tuning task using the file id.

```javascript
const input = new FineTuneInput({
    model: 'gpt-3.5-turbo',
    training_file: file.id
})

const result = await tuner.generateFineTune(input)
```
4. List fine tuning tasks and results. 
```javascript
const list = await tuner.listFineTune()

const value = list.data.filter(b => b.id === result.id)
console.log('Fine tuning Model Result:\n', value, '\n');
```
