// The routes your apps can ask for, by name, in the "model" field. Each route is a list of providers,
// tried in order: the gateway moves to the next one when a provider is down, slow or rate limited.
// A provider whose key is not set is skipped, so you can start with one key and add the others later.
module.exports = {
  // everyday work: quick and cheap first
  fast: [
    { provider: 'openai', model: 'gpt-5-mini', keyEnv: 'OPENAI_API_KEY' },
    { provider: 'gemini', model: 'gemini-3.6-flash', keyEnv: 'GEMINI_API_KEY' },
    { provider: 'ollama', model: 'qwen2.5:3b' },
  ],
  // harder questions: the strongest models first
  smart: [
    { provider: 'anthropic', model: 'claude-sonnet-5-5', keyEnv: 'ANTHROPIC_API_KEY' },
    { provider: 'openai', model: 'gpt-5.5', keyEnv: 'OPENAI_API_KEY' },
  ],
  // customer data: a model on your own machine only, so nothing leaves the network
  private: [
    { provider: 'ollama', model: 'qwen2.5:3b' },
  ],
  // for trying the fallback: a provider that always answers 429, then the local model
  demo: [
    { provider: 'openai_compatible', model: 'flaky-model', baseUrl: 'http://127.0.0.1:9100/v1', label: 'flaky provider' },
    { provider: 'ollama', model: 'qwen2.5:3b' },
  ],
};
