---
sidebar_position: 1
---

# Gen

The `Gen` class is a high-level layer to simplify AI integration and content generation with **one line call**. It abstracts the prompt, the provider call and the output parsing, so a complete task is a single function: build a component, write the SQL, review the code, produce the SEO tags.

Every function takes the same arguments and works with every chat provider:

```javascript
const { Gen } = require('intellinode');

const result = await Gen.<function>(input, apiKey, provider, options);
```

- **input**: the description, code or data the function works on.
- **apiKey**: the provider key (`null` for a local Ollama or LM Studio).
- **provider**: `openai` (default), `anthropic`, `gemini`, `mistral`, `cohere`, `nvidia`, `vllm`, or an OpenAI-compatible service: `openrouter`, `groq`, `deepseek`, `xai`, `together`, `ollama`, `lmstudio`, `openai_compatible`.
- **options**: the function's own options plus the common ones below.

Common options:

| Option | Purpose |
| --- | --- |
| `model` | Model name at the provider (defaults to the intellinode default of the provider). |
| `maxTokens`, `temperature` | Tune the generation. |
| `system` | Override the system message. |
| `baseUrl`, `headers` | For `openai_compatible` and the presets. |
| `timeout`, `retries`, `retryDelay`, `signal` | The [request options](../../chatbot/request-options). |
| `customProxyHelper` | Azure OpenAI or a proxy. |

Code functions return the code as a string (no markdown fences); structured functions return parsed objects. The output parser removes the reasoning of models that return it inline and repairs common JSON slips.

### Categories

| Page | Functions |
| --- | --- |
| [Text and JSON](./text) | `generate_text`, `generate_json`, `instructUpdate` |
| [UI and pages](./ui) | `generate_component`, `generate_form`, `generate_page_section`, `generate_css`, `improve_accessibility`, `generate_email_template`, `generate_svg_icon`, `generate_color_palette`, `generate_design_tokens`, `generate_html_page`, `save_html_page`, `generate_dashboard` |
| [Backend and data](./backend) | `generate_api_endpoint`, `generate_sql`, `generate_json_schema`, `generate_mock_data`, `generate_regex`, `generate_openapi_spec` |
| [Code quality](./code) | `generate_unit_tests`, `review_code`, `fix_code`, `explain_code`, `convert_code`, `generate_commit_message`, `generate_readme`, `generate_release_notes` |
| [Content and marketing](./content) | `get_marketing_desc`, `get_blog_post`, `generate_landing_copy`, `generate_faq`, `generate_seo_meta`, `translate_ui_strings`, `generate_image_from_desc`, `generate_speech_synthesis` |

### Example

```javascript
const { Gen } = require('intellinode');

// UI code with OpenAI (gpt-5.5 is default)
const code = await Gen.generate_component('a pricing card with a plan name, price and a CTA button', openaiKey, 'openai',
  { framework: 'react', language: 'typescript', styling: 'tailwind' });

// the same function with Claude
const form = await Gen.generate_form('a contact form with name, email and message', anthropicKey, 'anthropic');

// structured results
const review = await Gen.review_code(code, openaiKey);           // { summary, score, issues }
const regex = await Gen.generate_regex('a US phone number', openaiKey);   // { pattern, flags, regex, matches, nonMatches, verified }

// a local model, no key
const sql = await Gen.generate_sql('top 10 customers by order total', null, 'ollama', { model: 'qwen3' });
```

The same functions are exposed as MCP tools by `npx intellinode mcp`, so a coding assistant can call them on any provider. See the [MCP server](../../mcp/server) page.
