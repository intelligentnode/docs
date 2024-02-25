---
sidebar_position: 2
---

# Generate HTML

Intellinode provides powerful functions like `generate_html_page()` and `save_html_page()` to create and store HTML pages with CSS and JavaScript. In this use case, we will demonstrate how to generate an HTML registration page using GPT-4.

<img src="https://raw.githubusercontent.com/Barqawiz/IntelliNode/main/images/model_output/register-page.png" width="400em"/>

First import the Gen function

```javascript
const { Gen } = require("intellinode");
```

### 1. Generate HTML Page

Use the `generate_html_page()` function to create an HTML page based on a specific use case, such as a registration page.

```javascript
const openaiKey = 'your_openai_api_key';
const modelName = 'gpt-4'; // or 'gpt-3.5-turbo'

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
