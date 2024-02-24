---
sidebar_position: 5
---
# Vision

The Vision controller is designed generate descriptive texts from images. 

### Supported Models

Intelli framework's Vision controller integrates with leading AI providers for vision tasks: openai, gemini.


### Parameters

To use the Vision controller, you'll need to specify several parameters:

- **api_key**: Your API key or authentication token for the chosen provider.
- **provider**: The name of the AI service provider (`openai` or `gemini`).
- **vision_input**: An instance of `VisionModelInput` that contains the image data and any additional parameters required by the model.

### Example

Create an instance of the `RemoteVisionModel` with your chosen provider and API key:

```python
from intelli.controller.remote_vision_model import RemoteVisionModel

vision_model = RemoteVisionModel(api_key="your_api_key_here", provider="openai")
```


Prepare your vision input by specifying the image and any model-specific parameters. 

```python
from intelli.model.input.vision_input import VisionModelInput

# prepare the input
image_data = open("path_to_your_image.jpg", "rb").read()

vision_input = VisionModelInput(
    content="Describe the image",
    image_data=image_data,
    model="davinci"  # Example model name, adjust based on provider and availability
)

# generate a description for the image
description = vision_model.image_to_text(vision_input)
```
