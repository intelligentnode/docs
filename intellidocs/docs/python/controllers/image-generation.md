---
sidebar_position: 3
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
    model="dall-e-3"
)

# Generate the image
images = image_model.generate_images(image_input)
```
