---
sidebar_position: 5
title: "Offline Whisper Speech to Text in Python (pip, Local Weights)"
sidebar_label: "Whisper"
description: "Run Whisper tiny to large offline in Python with pip install intelli[offline]. The weights download once and are cached on disk, then transcription runs with no internet or API key."
keywords: ["python whisper offline","pypi whisper offline","whisper tiny offline","whisper model weights offline","pip whisper offline package","offline speech recognition python","whisper transcription python","local audio transcription"]
---

# Whisper

You can use Whisper models offline for speech recognition. They work entirely on your local machine, supporting both **English-only** and **multilingual** variants. The module supports long audio files and user prompts.

### Does the package include the Whisper weights?

No. `pip install intelli[offline]` installs the code, not the model weights, which keeps the package small. The first time you load a model, its weights download from Kaggle and are cached on your machine. After that, transcription runs fully offline, with no internet connection and no API key.

To use Whisper on a machine without internet, load the model once on a connected machine, then copy the KaggleHub cache folder (`~/.cache/kagglehub` by default) to the offline machine.

### Available Whisper Models
| **Model Name**            | **Parameters** |
|---------------------------|---------------:|
| **whisper_tiny_en**       |       37.18M   |
| **whisper_tiny_multi**    |       37.76M   |
| **whisper_base_en**       |      124.44M   |
| **whisper_base_multi**    |       72.59M   |
| **whisper_small_en**      |      241.73M   |
| **whisper_small_multi**   |      241.73M   |
| **whisper_medium_en**     |      763.86M   |
| **whisper_medium_multi**  |      763.86M   |
| **whisper_large_multi**   |       1.54B    |
| **whisper_large_multi_v2**|       1.54B    |

## Setup

1. **Create a Kaggle account** (if you don't already have one) to download any large Whisper model for the first time.
2. **Accept** the respective license on Kaggle for the chosen model preset.
3. **Generate an access token** in your Kaggle settings.

### Installation

Make sure to install the necessary packages:
```bash
pip install --upgrade intelli["offline"]
```

### Importing

```python
# audio
import os
import soundfile as sf
# inference wrapper
from intelli.wrappers.keras_wrapper import KerasWrapper
```
### Using the Model
Load the audio

```python
test_file = "long_audio.ogg"
audio_data, sample_rate = sf.read(test_file)
```
Run the Inference
```python
wrapper = KerasWrapper(model_name="whisper_large_multi_v2")

result = wrapper.transcript(
    audio_data=audio_data,
    sample_rate=sample_rate,            # e.g., 16000
    language="<|en|>",                  # Use "<|en|>" or another language token
    user_prompt="You are a helpful assistant transcribing teacher's notes.",
    condition_on_previous_text=True,    # Provide context from previous segments
    max_steps=100,                      # Max decoding steps per chunk
    max_chunk_sec=30                    # Max chunk length in seconds
)
```


