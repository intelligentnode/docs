---
sidebar_position: 6
title: "Generate Marketing Copy and SEO Tags in Node.js"
sidebar_label: "Write Marketing Copy"
description: "Generate marketing descriptions, blog posts, landing copy, FAQs, SEO meta, translations, images, and speech using the IntelliNode Node.js library."
keywords: ["intellinode marketing copy","node.js ai copy generation","generate seo meta node.js","ai landing page copy","node.js text to speech","generate image from description"]
---

# Write Marketing Copy

Copy, metadata, translations, images and speech.

### get_marketing_desc

```javascript
const desc = await Gen.get_marketing_desc('an ergonomic gaming chair', apiKey, provider);
```

### get_blog_post

```javascript
const post = await Gen.get_blog_post('the future of remote work', apiKey, provider);
```

### generate_landing_copy

```javascript
const copy = await Gen.generate_landing_copy('an AI meeting assistant', apiKey, provider, { featureCount: 4, tone: 'friendly' });
// { headline, subheadline, features, cta, socialProof, faq }
```

### generate_faq

```javascript
const faq = await Gen.generate_faq('a specialty coffee subscription', apiKey, provider, { count: 5 });
// [{ question, answer }]
```

### generate_seo_meta

```javascript
const meta = await Gen.generate_seo_meta('a product page for wireless headphones', apiKey, provider, { url, siteName });
// { title, description, keywords, openGraph, twitter, jsonLd, html }
```

`html` holds the rendered `<title>`, meta, Open Graph, Twitter card and JSON-LD tags, ready for the page head.

### translate_ui_strings

```javascript
const spanish = await Gen.translate_ui_strings({ save: 'Save', greeting: 'Hello, {name}!' }, apiKey, provider, { targetLanguage: 'Spanish' });
// { save: 'Guardar', greeting: '¡Hola, {name}!' }
```

Keys and placeholders are kept. Options: `targetLanguage` (required), `sourceLanguage`.

### generate_image_from_desc

```javascript
const image = await Gen.generate_image_from_desc('A vibrant coral reef teeming with fish', openaiKey, stabilityKey, true);
```

Writes an image description with the chat model, then generates the image (Stability by default, or `'openai'` as the provider argument). Returns a base64 string, or a Buffer when `is_base64` is `false`.

### generate_speech_synthesis

```javascript
const speech = await Gen.generate_speech_synthesis('Welcome to the AI revolution!', googleKey);
```

Text to speech with Google.
