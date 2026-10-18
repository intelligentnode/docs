---
sidebar_position: 5
title: "Offline Whisper Speech to Text in Python (Bundle the Weights)"
sidebar_label: "Whisper"
description: "Run Whisper offline in Python with pip install intelli[offline], then bundle the model weights with your app or Docker image so transcription runs with no internet and no API key."
keywords: ["python whisper offline","pypi whisper offline","whisper tiny offline","whisper model weights offline","bundle whisper model weights","pip whisper offline package","whisper offline docker","offline speech recognition python","speech to text offline python","local audio transcription"]
---

# Whisper

You can use Whisper models offline for speech recognition. They work entirely on your local machine, supporting both **English-only** and **multilingual** variants. The module supports long audio files and user prompts.

### Does the package include the Whisper weights?

Not inside the pip package. `pip install intelli[offline]` installs the code only, which keeps the package small. You have two ways to get the weights:

- **Download on first use.** The first time you load a model, its weights download from Kaggle and are cached on your machine (`~/.cache/kagglehub`). After that, transcription runs offline with no API key.
- **Bundle the weights with your app.** Download them once into your project folder and ship that folder with your code or Docker image. The machine that runs the app never needs internet. See [Bundle the weights with your app](#bundle-the-weights-with-your-app).

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

## Bundle the weights with your app

Use this when the app runs where there is no internet, such as an air-gapped server, a factory PC or a container without network access. You download the weights once on a connected machine, keep them in a folder next to your code, and point the app at that folder.

The folder location comes from the `KAGGLEHUB_CACHE` environment variable. Without it, the weights go to `~/.cache/kagglehub`.

**1. Download the weights into your project.** Run this once on a machine with internet, from your project folder:

```bash
KAGGLEHUB_CACHE=./whisper_weights python -c "from intelli.wrappers.keras_wrapper import KerasWrapper; KerasWrapper(model_name='whisper_tiny_en')"
```

The `whisper_weights` folder now holds the model. For `whisper_tiny_en` it is about 150 MB. Larger models take more space.

**2. Point the app at the folder.** Set the variable before you load the model:

```python
import os
os.environ["KAGGLEHUB_CACHE"] = "./whisper_weights"

from intelli.wrappers.keras_wrapper import KerasWrapper
wrapper = KerasWrapper(model_name="whisper_tiny_en")
```

The model now loads from `whisper_weights` and makes no network call. Copy the folder with your code to any machine, or bake it into a Docker image:

```dockerfile
COPY whisper_weights /app/whisper_weights
ENV KAGGLEHUB_CACHE=/app/whisper_weights
```

Already downloaded a model the default way? Copy `~/.cache/kagglehub` into your project instead of downloading again, and set `KAGGLEHUB_CACHE` to the copied folder.


