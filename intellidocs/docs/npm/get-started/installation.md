---
sidebar_position: 1
---

# Installation

Intellinode simplifies the integration of a wide range of AI models into your javascript application.

### System Requirements
- Node.js 18 or newer.
- npm (Node Package Manager), pnpm or yarn.

### Installation Methods

**Using npm (Recommended):**

Run the following command in your terminal to install IntelliNode:
```bash
npm install intellinode
```
This command downloads and installs the latest stable version of IntelliNode along with its dependencies.

**Using yarn:**

If you prefer using yarn, execute this command in your terminal:
```bash
yarn add intellinode
```

### Importing

Import intellinode into your project to start leveraging the wide array of AI capabilities.

```javascript
const { Chatbot, Gen, SemanticSearch } = require('intellinode');
```

### TypeScript

The package ships its own declarations (`index.d.ts`), so every class, input and `Gen` function is typed without an extra `@types` package:

```typescript
import { Chatbot, ChatGPTInput, Gen } from 'intellinode';
```

### Browser

The same library is available as a single file for the browser, see the [Frontend JS](../frontend) page.

### Command line

The package installs the `intellinode` command, used to start the MCP server for coding assistants:

```bash
npx intellinode mcp
```

See the [MCP](../mcp/get-started) section for the details.
