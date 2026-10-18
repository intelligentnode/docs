# orders_api.py: a small stand-in for your own API, so the example runs anywhere.
# It serves orders as JSON on http://localhost:8001 and needs the X-API-Key header.
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

API_KEY = os.environ.get("ORDERS_API_KEY", "demo-key")

ORDERS = {
    "A1041": {"id": "A1041", "customer": "Lena Fischer", "status": "delivered", "carrier": "DHL", "expected": "2026-10-14"},
    "A1042": {"id": "A1042", "customer": "Omar Haddad", "status": "delayed", "carrier": "UPS", "expected": "2026-10-21", "reason": "Missed the truck at the Leeds warehouse"},
    "A1043": {"id": "A1043", "customer": "Grace Kim", "status": "shipped", "carrier": "FedEx", "expected": "2026-10-20"},
    "A1044": {"id": "A1044", "customer": "Diego Alvarez", "status": "delayed", "carrier": "DHL", "expected": "2026-10-23", "reason": "Item out of stock, restock due Tuesday"},
    "A1045": {"id": "A1045", "customer": "Priya Nair", "status": "processing", "carrier": "UPS", "expected": "2026-10-22"},
}


class OrdersHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.headers.get("X-API-Key") != API_KEY:
            return self.send_json(401, {"error": "missing or wrong API key"})
        url = urlparse(self.path)
        if url.path == "/orders":
            status = parse_qs(url.query).get("status", [None])[0]
            orders = [o for o in ORDERS.values() if status in (None, o["status"])]
            return self.send_json(200, orders)
        if url.path.startswith("/orders/"):
            order = ORDERS.get(url.path.split("/")[-1].upper())
            if order:
                return self.send_json(200, order)
            return self.send_json(404, {"error": "order not found"})
        self.send_json(404, {"error": "unknown path"})

    def send_json(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print("Orders API running on http://localhost:8001")
    HTTPServer(("localhost", 8001), OrdersHandler).serve_forever()
