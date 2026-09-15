---
sidebar_position: 3
title: "Generate Web UI Components with AI in Node.js"
sidebar_label: "Build Web UI"
description: "Generate frontend components, forms, CSS, page sections, HTML pages, email templates, SVG icons, palettes, and design tokens with IntelliNode."
keywords: ["intellinode web ui","node.js frontend generation","generate react component node.js","generate html page node.js","ai css generation","design tokens generator"]
---

# Build Web UI

Generate frontend code and complete pages. Code functions return the source as a string, ready to save to a file.

### generate_component

```javascript
const code = await Gen.generate_component(description, apiKey, provider, options);
```

Options: `framework` (`react` default, `vue`, `svelte`, `angular`, `html`), `language` (`javascript` default, `typescript`), `styling` (`css` default, `tailwind`, `css-modules`, `styled-components`).

```javascript
const code = await Gen.generate_component('a pricing card with a plan name, price and a CTA button', openaiKey, 'openai',
  { framework: 'react', language: 'typescript', styling: 'tailwind' });
```

### generate_form

```javascript
const form = await Gen.generate_form(description, apiKey, provider, options);
```

A form with client-side validation. Options: `framework` (`html` default, `react`, `vue`, `svelte`), `action` (URL that receives the values as JSON).

### generate_page_section

```javascript
const hero = await Gen.generate_page_section(description, apiKey, provider, { sectionType: 'hero', styling: 'tailwind' });
```

One section of a page: hero, pricing, features, testimonials, footer, and so on.

### generate_css

```javascript
const css = await Gen.generate_css(description, apiKey, provider, options);
```

A stylesheet from a description. Options: `format` (`css` default, `scss`, `tailwind`), `html` (markup to style).

### improve_accessibility

```javascript
const { html, issues } = await Gen.improve_accessibility(html, apiKey, provider);
// issues: [{ issue, fix, wcag }]
```

Fixes accessibility problems in markup and lists what changed with the WCAG reference.

### generate_email_template

```javascript
const email = await Gen.generate_email_template('a welcome email with a "Get started" button', apiKey);
```

A responsive HTML email that works in email clients.

### generate_svg_icon

```javascript
const icon = await Gen.generate_svg_icon('a shopping cart', apiKey, provider, { size: 24, style: 'outline' });
```

SVG markup only.

### generate_color_palette

```javascript
const palette = await Gen.generate_color_palette('a calm fintech dashboard', apiKey, provider, { count: 6 });
// { name, colors: [{ name, hex, usage }], css }
```

### generate_design_tokens

```javascript
const tokens = await Gen.generate_design_tokens('a calm fintech dashboard', apiKey, provider, { brandColor: '#4F46E5' });
// tokens.palette, tokens.semantic, tokens.typography, tokens.radius, tokens.spacing
// tokens.css      -> ':root { --color-primary-500: #4f46e5; ... }'
// tokens.tailwind -> theme.extend object
// tokens.contrast, tokens.warnings
```

11-step color scales, light and dark semantic roles, typography, radius and spacing. The CSS custom properties, the Tailwind theme and the WCAG contrast checks are computed by the library, not by the model. Options: `brandColor` (used exactly as primary 500), `modes` (`['light', 'dark']`), `includeTypography`, `includeSpacing`, `cssPrefix` (`color`).

### Full pages

```javascript
// a page as { html, message }
const page = await Gen.generate_html_page('a registration page with a flat modern theme', openaiKey);

// generate and save the page to a file
await Gen.save_html_page('a registration page with a flat modern theme', './out', 'register.html', openaiKey);

// an HTML dashboard from CSV data
const dashboard = await Gen.generate_dashboard(csvString, 'website growth', openaiKey, undefined, 2);
```

`generate_html_page(text, apiKey, modelName, provider)`, `save_html_page(text, folder, fileName, apiKey, modelName, provider)` and `generate_dashboard(csv, topic, apiKey, modelName, numGraphs, provider)` keep their original argument order.
