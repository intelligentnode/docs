import json, os, sys, time, base64, urllib.request, urllib.error
ENVF = "/Users/ahmad/Work/Github/Intelli/intelli/.env"
KEY = [l.split("=",1)[1].strip() for l in open(ENVF) if l.startswith("VERTEX_API_KEY=")][0]
BASE = "https://aiplatform.googleapis.com/v1/publishers/google/models/"

def call(model, method, body, base=BASE, timeout=600):
    url = f"{base}{model}:{method}?key={KEY}"
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()[:400]}

def get_op(model, name):
    return call(model, "fetchPredictOperation", {"operationName": name})
