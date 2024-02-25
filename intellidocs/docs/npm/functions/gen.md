---
sidebar_position: 1
---

# Gen

The `Gen` class is a high-level wrapper to simplify AI integration and content generation with one line call. It abstract complex multi-step workflows, allowing developers to seamlessly leverage various AI models for tasks like:

- Content creation (marketing descriptions, blog posts)
- Image generation from text descriptions
- Speech synthesis from text
- HTML page generation from descriptions
- Data visualization dashboards

### Available Functions:

- `get_marketing_desc(promptString, apiKey, provider)`: Generates a marketing description for a given product/concept (OpenAI by default).
- `get_blog_post(promptString, apiKey, provider)`: Creates a blog post based on a topic (OpenAI by default).
- `generate_image_from_desc(promptString, openaiApiKey, imageApiKey, is_base64, provider)`: Generates an image from a text description (Stability by default).
- `generate_speech_synthesis(text, googleKey)`: Converts text to spoken audio using Google's text-to-speech service.
- `generate_html_page(text, openaiKey, model_name)`: Generates an HTML page from a text description (OpenAI by default).
- `save_html_page(text, folder, file_name, openaiKey)`: Generates and saves an HTML page to a specified location.
- `generate_dashboard(csvStrData, topic, openaiKey, num_graphs)`: Generates an HTML dashboard from CSV data (OpenAI by default).
- `instructUpdate(modelOutput, userInstruction, type, openaiKey)`: Updates a model output based on user instructions (OpenAI by default).

### Example
```javascript
const { Gen } = require("intellinode");

// generate a marketing description for a product:
const desc = await Gen.get_marketing_desc("AI-powered writing assistant", myOpenaiKey);
console.log("Marketing Description:", desc);

// create an image from a text description:
const image = await Gen.generate_image_from_desc("A vibrant coral reef teeming with fish", myOpenaiKey, myStabilityApiKey, true);
console.log("Generated Image (Base64):", image);

// convert text to speech:
const speech = await Gen.generate_speech_synthesis("Welcome to the AI revolution!", myGoogleApiKey);
console.log("Generated Speech (Base64):", speech);
```
