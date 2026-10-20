import json, base64, sys, os, re, subprocess
from concurrent.futures import ThreadPoolExecutor
from g import call
VOICE = sys.argv[1] if len(sys.argv) > 1 else "Puck"
STYLE = "You are the voice of a short TikTok for developers. Speak upbeat, friendly, confident and natural, at a quick pace with no long pauses. Speak only the user's text, word for word."
S = json.load(open("scripts.json")); os.makedirs("voice", exist_ok=True)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace(".si", " dot s i").replace("vllm", "v l l m").replace("intellenode","intellinode"))
def transcribe(path):
    b = base64.b64encode(open(path,"rb").read()).decode()
    r = call("gemini-3.8-flash","generateContent",{"contents":[{"role":"user","parts":[{"inlineData":{"mimeType":"audio/wav","data":b}},{"text":"Transcribe this audio exactly. Output only the words spoken."}]}]})
    return "".join(p.get("text","") for p in r["candidates"][0]["content"]["parts"])
def gen(job):
    vid, i, text = job
    path = f"voice/{vid}_{i}.wav"
    for attempt in range(5):
        r = call("gemini-3.8-flash-tts", "generateContent", {
            "contents":[{"role":"user","parts":[{"text": text}]}],
            "generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":VOICE}}}}}, timeout=180)
        if "error" in r: continue
        open(path,"wb").write(base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]))
        heard = transcribe(path)
        ok = norm(heard) == norm(text) or norm(heard.replace(".si", " dot s i").replace("vLLM","v l l m")) == norm(text)
        dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",path]))
        if ok: return vid, i, attempt, round(dur,2), "OK"
    dur = locals().get('dur', 0); heard = locals().get('heard', 'no audio')
    return vid, i, attempt, round(dur,2), "MISMATCH: " + heard
ONLY = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
jobs = [(v, i, l["say"]) for v in S for i, l in enumerate(S[v]) if not ONLY or f"{v}_{i}" in ONLY]
with ThreadPoolExecutor(8) as ex:
    for res in ex.map(gen, jobs): print(res, flush=True)
