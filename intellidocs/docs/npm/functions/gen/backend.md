---
sidebar_position: 4
---

# Backend and data

Generate server code, SQL, schemas, fixtures and expressions.

### generate_api_endpoint

```javascript
const code = await Gen.generate_api_endpoint('POST /api/todos that creates a todo', apiKey, provider, { framework: 'express' });
```

Options: `framework` (`express` default, `fastify`, `nextjs`, `koa`, `hono`, `flask`, `fastapi`), `language` (defaults to python for flask and fastapi, otherwise javascript).

### generate_sql

```javascript
const sql = await Gen.generate_sql('top 10 customers by order total', apiKey, provider, { dialect: 'postgresql', schema });
```

Options: `dialect` (`postgresql` default, `mysql`, `sqlite`, `sqlserver`), `schema` (existing `CREATE TABLE` statements so the SQL matches them). Returns the SQL only.

### generate_json_schema

```javascript
const schema = await Gen.generate_json_schema('a blog post with title, slug, tags and author', apiKey);
```

A JSON Schema (draft 2020-12) object, ready for `generate_json`, `generate_mock_data` or validation libraries.

### generate_mock_data

```javascript
const rows = await Gen.generate_mock_data('a user with id, fullName, email and role', apiKey, provider, { count: 20 });
```

Realistic records as an array. The first argument is a JSON Schema, a TypeScript type, a SQL table or a plain description.

### generate_regex

```javascript
const result = await Gen.generate_regex('a US phone number', apiKey, provider, { language: 'JavaScript' });
// { pattern, flags, explanation, matches, nonMatches, regex, verified }
```

`regex` is a ready `RegExp`. `verified` is `true` when the pattern behaves as the model's own examples claim, `false` when it does not, and `null` for a language other than JavaScript (the check runs with JavaScript regex semantics).

### generate_openapi_spec

```javascript
const spec = await Gen.generate_openapi_spec(expressRouterCode, apiKey, provider, { title: 'Users API', basePath: '/api/v1' });
```

An OpenAPI 3.1 document (plain object) from route code or an API description. The library normalises it so paths use `{param}` keys, path parameters are declared, operationIds are unique and every `$ref` resolves, so Swagger UI and generators accept it. Options: `title`, `version`, `openapiVersion` (`3.1.0`), `basePath`, `serverUrl`.
