---
sidebar_position: 4
title: "AI Image Generation in Node.js"
sidebar_label: "Image generation"
description: "Generate images from text prompts in Node.js with IntelliNode using OpenAI gpt-image-2 or Stability AI, and control the size and image count."
keywords: ["node.js image generation","intellinode image generation","openai gpt-image-2 node.js","stable diffusion node.js","text to image api","npm intellinode images"]
---
# Image generation

The Image generation controller lets you create images based on text descriptions. This empowers developers to dynamically produce visuals for various applications.

### Supported Providers

Intellinode supports image generation with the following providers: openai, stability.

### Parameters

Specify the following parameters when initiating an image generation controller:

- **provider**: Identifier for the chosen AI service provider (`'openai'` for gpt-image-2, `'stability'` for Stable Diffusion).
- **apiKey**: Your API key for accessing the selected provider's services.
- **prompt**: The text description based on which the image will be generated.
- **model**: The specific model variant to use.
- **numberOfImages**: How many different images to generate.
- **width** and **height**: Dimensions of the generated images.

### Example

Import 
```javascript
const { RemoteImageModel, ImageModelInput } = require('intellinode');
```

Generate an image using stable diffusion.

```javascript

const stabilityKey = 'your_stability_api_key';

async function generateImageWithStability() {
    const prompt = "A landscape of a futuristic city at sunset";

    try {
        const imageGenerator = new RemoteImageModel(stabilityKey, "stability");
        const images = await imageGenerator.generateImages(new ImageModelInput({
          prompt: prompt,
          numberOfImages: 1,
          width: 512,
          height: 512
        }));

        console.log("Generated Images:", images);
    } catch (error) {
        console.error("Image generation failed:", error);
    }
}

generateImageWithStability();
```

Generate an image using OpenAI `gpt-image-2`, the default OpenAI image model.

```javascript

const openaiKey = 'your_openai_api_key';

async function generateImageWithOpenAI() {
    const prompt = "A photorealistic painting of an astronaut riding a horse in space";

    try {
        const imageGenerator = new RemoteImageModel(openaiKey, "openai");
        const images = await imageGenerator.generateImages(new ImageModelInput({
          prompt,
          model: 'gpt-image-2',
          numberOfImages: 1
        }));

        console.log("Generated Images:", images);
    } catch (error) {
        console.error("Image generation failed:", error);
    }
}

generateImageWithOpenAI();
```

The gpt-image models return base64 images; save one with `fs.writeFileSync('image.png', Buffer.from(images[0], 'base64'))`.
