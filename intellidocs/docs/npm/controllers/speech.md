---
sidebar_position: 5
---
# Speech

Intellinode speech synthesis controller enables your application to convert text into spoken words, leveraging advanced text-to-speech (TTS) technologies from leading providers such as Google and OpenAI.

### Parameters

To synthesize speech, you'll need to specify:

- **provider**: The AI service provider (`'google'` or `'openai'`).
- **apiKey**: Your API key for the chosen provider.
- **text**: The text content you want to convert to speech.
- **language** (Google only): The language code for the speech output.
- **gender** (Google only): Selection between `FEMALE` and `MALE`.
- **model** (OpenAI only): Specifies the OpenAI model variant for speech synthesis.
- **voice** (OpenAI only): The voice model to use for speech output.

For google provider, the language code (`language`) parameter determines the accent and language of the synthesized speech. Supported languages include English (`en-gb` or `en` for British English), Turkish (`tr-tr` or `tr`), Mandarin Chinese (`cmn-cn` or `cn`), German (`de-de` or `de`), and Arabic (`ar-xa` or `ar`), among others. The gender (`gender`) parameter allows for the selection between `FEMALE` and `MALE` voices.

### Example

```javascript
const { RemoteSpeechModel, SupportedSpeechModels, Text2SpeechInput } = require('intellinode');
```

**Google Text-to-Speech**

```javascript

const remoteSpeechModel = new RemoteSpeechModel(process.env.GOOGLE_API_KEY, SupportedSpeechModels.GOOGLE);

const input = new Text2SpeechInput({
  text: 'Welcome to IntelliNode',
  language: 'en-gb'
});

// get the audio content
const audioContent = await remoteSpeechModel.generateSpeech(input);
```

Save the audio:

```javascript
const AudioHelper = require('intellinode');

const audioHelper = new AudioHelper();
const decodedAudio = audioHelper.decode(audioContent);
const saved = audioHelper.saveAudio(decodedAudio, tempDir, 'temp.mp3');
```

**OpenAI Text-to-Speech**

```javascript

const openAiRemoteSpeechModel = new RemoteSpeechModel(process.env.OPENAI_API_KEY, SupportedSpeechModels.OPENAI);

const input = new Text2SpeechInput({
  model: 'tts-1',
  text: "The quick brown fox jumped over the lazy dog.",
  voice: "alloy",
  stream: true
});

const result = await openAiRemoteSpeechModel.generateSpeech(input);
```

Save the audio:
```javascript
const fs = require('fs');

const filePath = './temp/downloaded_audio.mp3';

// create the write stream
const writer = fs.createWriteStream(filePath);
result.pipe(writer);

// handle the completion of writing the file
writer.on('finish', () => {
  const fileExists = fs.existsSync(filePath);
  console.log('Audio file downloaded successfully!');
});
```
