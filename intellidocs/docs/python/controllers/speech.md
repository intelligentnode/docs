---
sidebar_position: 4
---
# Speech

The Speech controller facilitates the conversion of text into spoken audio, leveraging advanced text-to-speech (TTS) technologies.

### Supported Models

The Intelli framework integrates with various TTS providers, allowing you to choose the one that best suits your needs: google, openai.

### Parameters

Specify several parameters to synthesize speech:

- **key_value**: Your API key or authentication token for the chosen provider.
- **provider** (optional): The name of the TTS service provider. If not specified, a default provider will be used.
- **input_params**: An instance of `Text2SpeechInput`, which includes the text to be converted, language code, voice type, and other provider-specific options.

### Example

Create an instance of the `RemoteSpeechModel` with your API key and optionally specify the provider:

```python
from intelli.controller.remote_speech_model import RemoteSpeechModel

speech_model = RemoteSpeechModel(key_value="your_api_key_here", provider="google")
```

Prepare your text-to-speech input parameters.

```python
from intelli.model.input.text_speech_input import Text2SpeechInput

# define the text and speech parameters
input_params = Text2SpeechInput(
    text="Hello, welcome to the Intelli framework.",
    language_code="en-US",
    voice_gender="MALE"
)

# generate the speech
audio_content = speech_model.generate_speech(input_params)

# audio_content typically a base64-encoded data.
```
