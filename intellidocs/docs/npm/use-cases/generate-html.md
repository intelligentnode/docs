---
sidebar_position: 2
title: "Generate HTML Pages with AI in Node.js"
sidebar_label: "Generate HTML"
description: "Generate and save complete HTML pages with CSS and JavaScript in Node.js using the IntelliNode Gen functions and OpenAI GPT-5.5."
keywords: ["intellinode generate html","node.js generate html with ai","generate html page openai","save html page node.js","ai html page generation","intellinode gen functions"]
---

# Generate HTML

Intellinode provides powerful functions like `generate_html_page()` and `save_html_page()` to create and store HTML pages with CSS and JavaScript. In this use case, we will demonstrate how to generate an HTML registration page using GPT-5.5.

<img src="https://raw.githubusercontent.com/Barqawiz/IntelliNode/main/images/model_output/register-page.png" alt="Registration page generated with Gen.generate_html_page" width="400em"/>

First import the Gen function

```javascript
const { Gen } = require("intellinode");
```

### 1. Generate HTML Page

Use the `generate_html_page()` function to create an HTML page based on a specific use case, such as a registration page.

```javascript
const openaiKey = 'your_openai_api_key';
const modelName = 'gpt-5.5'; // or 'gpt-4.1'

const prompt = "Create a registration page with flat modern design.";
const htmlContent = await Gen.generate_html_page(prompt, openaiKey, modelName);

```

### 2. Save HTML Page

To save the generated HTML page directly to the file system, use the `save_html_page()` function instead of the generate html:

```javascript
const folder = './views';
const file_name = 'registration_page.html';

await Gen.save_html_page(prompt, folder, file_name, openaiKey, modelName);
```
