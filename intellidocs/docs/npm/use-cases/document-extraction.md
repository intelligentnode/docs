---
sidebar_position: 5
---

# Document data extraction

Invoices, purchase orders and contracts arrive as PDFs and emails in a dozen formats. Finance keys the numbers into the ERP by hand, legal skims contracts for the clauses that matter, and the product team pays an agency to translate the interface strings.

With structured output every document becomes a validated JSON record, and the same one-line functions handle summaries and translations. Sensitive documents can be processed by a model inside your network.

<img src="/img/use-cases/document-extraction.jpg" width="100%" alt="Documents being turned into structured data" />

### 1. Define the record once

Start from a JSON Schema. You can write it, or let intellinode draft it from a description and adjust it.

```javascript
const { Gen } = require('intellinode');

const invoiceSchema = await Gen.generate_json_schema(
  'an invoice with supplier name, supplier VAT id, invoice number, issue date (ISO 8601), due date, currency, '
  + 'line items (description, quantity, unit price, total) and the grand total',
  process.env.OPENAI_API_KEY,
);
```

A hand-written schema works just as well:

```javascript
const invoiceSchema = {
  type: 'object',
  properties: {
    supplier: { type: 'string' },
    vatId: { type: 'string' },
    invoiceNumber: { type: 'string' },
    issueDate: { type: 'string' },
    dueDate: { type: 'string' },
    currency: { type: 'string' },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: { description: { type: 'string' }, quantity: { type: 'number' }, unitPrice: { type: 'number' }, total: { type: 'number' } },
        required: ['description', 'quantity', 'unitPrice', 'total'],
      },
    },
    total: { type: 'number' },
  },
  required: ['supplier', 'invoiceNumber', 'issueDate', 'currency', 'lines', 'total'],
};
```

### 2. Extract with one call per document

`generate_json` uses the provider's structured output, so the record matches the schema. Add a check the model cannot get wrong by accident, such as the line totals adding up.

```javascript
async function extractInvoice(text) {
  const invoice = await Gen.generate_json(
    `Extract the invoice data from this document. Use null for missing fields.\n\n${text}`,
    invoiceSchema,
    process.env.OPENAI_API_KEY,
    'openai',
    { timeout: 45000, retries: 2 },
  );

  const sum = invoice.lines.reduce((acc, line) => acc + line.total, 0);
  invoice.needsReview = Math.abs(sum - invoice.total) > 0.01;
  return invoice;
}
```

Process a batch with a deadline for the whole run:

```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 10 * 60 * 1000);

const records = await Promise.all(documents.map((doc) => Gen.generate_json(
  `Extract the invoice data from this document.\n\n${doc.text}`,
  invoiceSchema,
  process.env.OPENAI_API_KEY,
  'openai',
  { signal: controller.signal },
)));
```

### 3. Contracts: summaries and risk flags

```javascript
const clauseSchema = {
  type: 'object',
  properties: {
    parties: { type: 'array', items: { type: 'string' } },
    term: { type: 'string' },
    autoRenewal: { type: 'boolean' },
    noticePeriodDays: { type: 'integer' },
    liabilityCap: { type: 'string' },
    governingLaw: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } },
  },
  required: ['parties', 'term', 'autoRenewal', 'risks'],
};

const contract = await Gen.generate_json(
  `Summarise the key clauses of this contract and list the risks for the customer.\n\n${contractText}`,
  clauseSchema,
  process.env.ANTHROPIC_API_KEY,
  'anthropic',
  { maxTokens: 16000 },
);
```

### 4. Keep confidential documents in house

Point the same functions at a model that runs on your own servers. Nothing else in the code changes.

```javascript
const invoice = await Gen.generate_json(`Extract the invoice data.\n\n${text}`, invoiceSchema, null, 'ollama', { model: 'qwen3' });
```

### 5. Localise the product

The interface strings are a JSON object; the translation keeps the keys and the placeholders, so the result drops straight into the app.

```javascript
const strings = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));

for (const language of ['German', 'Spanish', 'Japanese']) {
  const translated = await Gen.translate_ui_strings(strings, process.env.OPENAI_API_KEY, 'openai', { targetLanguage: language });
  fs.writeFileSync(`locales/${language.toLowerCase()}.json`, JSON.stringify(translated, null, 2));
}
```

### Why it helps

- Documents become validated records in seconds, with a review flag when the numbers do not add up.
- The schema is the contract between the model and your systems, so changes are explicit.
- Confidential documents can stay inside your network, on the same code path as the cloud providers.
