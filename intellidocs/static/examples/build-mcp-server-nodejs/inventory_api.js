// A stand-in for your inventory API: six products, one API key, plain Node with no packages.
// Run it with `node inventory_api.js` and leave it running. Point the MCP server at your real API later.
const http = require('http');

const API_KEY = process.env.INVENTORY_API_KEY || 'demo-key';
const PORT = Number(process.env.PORT || 8001);

// daily_sales is the average over the last 30 days; lead_days is how long the supplier takes to deliver
const products = [
  { sku: 'TEE-BLK-M', name: 'Black organic tee, size M', stock: 42, daily_sales: 6, supplier: 'Northwind Textiles', lead_days: 10, unit_cost: 6.4 },
  { sku: 'TEE-BLK-L', name: 'Black organic tee, size L', stock: 118, daily_sales: 5, supplier: 'Northwind Textiles', lead_days: 10, unit_cost: 6.4 },
  { sku: 'HOOD-GRY-M', name: 'Grey hoodie, size M', stock: 9, daily_sales: 2, supplier: 'Northwind Textiles', lead_days: 14, unit_cost: 17.9 },
  { sku: 'CAP-NVY', name: 'Navy cap', stock: 260, daily_sales: 3, supplier: 'Harbor Headwear', lead_days: 7, unit_cost: 4.1 },
  { sku: 'MUG-WHT', name: 'White logo mug', stock: 15, daily_sales: 4, supplier: 'Clayworks', lead_days: 5, unit_cost: 2.3 },
  { sku: 'TOTE-NAT', name: 'Natural canvas tote', stock: 0, daily_sales: 3, supplier: 'Clayworks', lead_days: 5, unit_cost: 3.0 },
];
const purchaseOrders = [];

function daysLeft(product) {
  return product.daily_sales ? Math.floor(product.stock / product.daily_sales) : null;
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data ? JSON.parse(data) : {}));
  });
}

http.createServer(async (req, res) => {
  if (req.headers['x-api-key'] !== API_KEY) return send(res, 401, { error: 'Missing or wrong API key' });
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && parts[0] === 'products' && parts[1]) {
    const product = products.find((p) => p.sku === parts[1].toUpperCase());
    return product ? send(res, 200, { ...product, days_left: daysLeft(product) }) : send(res, 404, { error: 'No such SKU' });
  }
  if (req.method === 'GET' && parts[0] === 'products') {
    const words = (url.searchParams.get('search') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const found = products.filter((p) => words.every((w) => `${p.name} ${p.sku}`.toLowerCase().includes(w)));
    return send(res, 200, found.map((p) => ({ ...p, days_left: daysLeft(p) })));
  }
  if (req.method === 'GET' && parts[0] === 'low-stock') {
    const days = Number(url.searchParams.get('days') || 14);
    const low = products.filter((p) => daysLeft(p) !== null && daysLeft(p) <= days);
    return send(res, 200, low.map((p) => ({ ...p, days_left: daysLeft(p) })));
  }
  if (req.method === 'POST' && parts[0] === 'purchase-orders') {
    const body = await readBody(req);
    const order = { id: `PO-${1001 + purchaseOrders.length}`, status: 'draft', created: new Date().toISOString(), ...body };
    purchaseOrders.push(order);
    return send(res, 201, order);
  }
  send(res, 404, { error: 'Not found' });
}).listen(PORT, () => console.log(`Inventory API on http://localhost:${PORT}`));
