// A fake provider that is always rate limited, so you can watch the gateway fall back.
//   node flaky_provider.js
require('http').createServer((req, res) => {
  res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '1' });
  res.end(JSON.stringify({ error: { message: 'Rate limit reached. Try again later.' } }));
}).listen(9100, () => console.log('Flaky provider on http://127.0.0.1:9100, answering 429 to everything'));
