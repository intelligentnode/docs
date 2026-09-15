---
sidebar_position: 3
title: "AI Image Generation in Python"
sidebar_label: "Image generation"
description: "Generate images from text prompts with Intelli for Python. Configure RemoteImageModel and ImageModelInput for OpenAI or Stability providers."
keywords: ["python image generation","intelli image generation","remoteimagemodel python","openai image generation python","stability image generation","imagemodelinput"]
---
# Image generation

The Image generation controller lets you create images based on text descriptions. This empowers developers to dynamically produce visuals for various applications.

### Supported Providers

The framework supports different image generation models, allowing you to choose based on your needs: openai, stability.

### Parameters

Specify these parameters to generate images:

- **api_key**: Your API key or authentication token for the chosen provider.
- **provider**: The name of the AI service provider (`openai` or `stability`).
- **image_input**: This can be an instance of `ImageModelInput` containing the details of the image you want to generate, such as the prompt, dimensions, and model-specific parameters.

### Example

Create an instance of the `RemoteImageModel` with your chosen provider and API key.

```python
from intelli.controller.remote_image_model import RemoteImageModel

image_model = RemoteImageModel(api_key="your_api_key_here", provider="openai")
```

Prepare your image input, specifying the prompt and any other necessary parameters.

```python
from intelli.model.input.image_input import ImageModelInput

# define the prompt and image parameters
prompt = "A futuristic city skyline at sunset, with flying cars."
image_input = ImageModelInput(
    prompt=prompt,
    width=1024,
    height=1024,
    model="gpt-image-2"
)

# Generate the image
images = image_model.generate_images(image_input)
```

### Openai Image Parameters

`gpt-image-2` is the default openai model, and the gpt-image family returns base64 images. It accepts additional parameters:

```python
image_input = ImageModelInput(
    prompt=prompt,
    model="gpt-image-2",
    quality="low",              # low, medium, high, auto
    background="transparent",
    output_format="webp",       # png, jpeg, webp
    output_compression=80,      # jpeg and webp only
    moderation="auto",
)
```

The older `dall-e-3` model was retired by openai. If your code still passes the parameters of that era, intelli maps them for you, so `quality="standard"` becomes `medium`, `quality="hd"` becomes `high`, and `response_format` and `style` are dropped.
