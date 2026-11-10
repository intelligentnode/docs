Build your own AI gateway in Node.js with IntelliNode
https://www.intellinode.ai/articles/build-ai-gateway-nodejs

1. npm install
2. node gateway.js                  (the gateway, on http://localhost:8787/v1)
3. node flaky_provider.js           (optional: a provider that always answers 429, to watch the fallback)
4. curl http://localhost:8787/v1/chat/completions -H "Authorization: Bearer demo-key" \
     -H "Content-Type: application/json" -d '{"model":"demo","messages":[{"role":"user","content":"Hello"}]}'
5. node usage_report.js             (calls, tokens and fallbacks per team)

routes.js         the routes (fast, smart, private, demo) and the providers in each, in order
gateway.js        the OpenAI-compatible endpoint, the fallback and the log
flaky_provider.js a fake rate-limited provider for testing
usage_report.js   a summary of logs/calls.jsonl
