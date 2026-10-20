import json, time, base64, sys
from g import call
BASE = "https://us-central1-aiplatform.googleapis.com/v1/projects/medwrite-ai-studio/locations/us-central1/publishers/google/models/"
VEO = "veo-3.1-fast-generate-001"
STYLE = " Soft natural light, muted matte colors, realistic film look, no neon, no glow. No readable text, no logos, no captions, no watermarks."
CLIPS = {
 "v_dev": "Vertical 9:16 shot over the shoulder of a software developer at a wooden desk in a calm home office at dusk. A laptop screen shows long lines of code scrolling fast, the code is soft and out of focus. The developer stops scrolling, leans back and rubs their forehead, unsure. Slow push-in, shallow depth of field, deep navy and warm wood tones." + STYLE,
 "v_knot": "Vertical 9:16 top-down shot of two hands trying to untangle a big messy knot of many thin cables in muted blue, lilac and teal on a light oak desk. The knot only gets worse and the hands pause in frustration. Gentle camera push-in, soft daylight." + STYLE,
 "v_beads": "Vertical 9:16 top-down macro shot of a plain off-white paper surface. Small matte wooden beads in muted blue, lilac and teal slide into place one by one and thin grey threads pull taut between them, forming a neat, calm network graph in the lower half of the frame. Stop-motion feel, even soft daylight, gentle shadows, minimal, lots of empty paper in the upper half." + STYLE,
}
ops = {}
for name, prompt in CLIPS.items():
    body = {"instances":[{"prompt":prompt}],"parameters":{"aspectRatio":"9:16","durationSeconds":8,"sampleCount":1,"generateAudio":False,"resolution":"1080p","personGeneration":"allow_adult"}}
    r = call(VEO, "predictLongRunning", body, base=BASE)
    if "error" in r:
        body["parameters"].pop("resolution"); r = call(VEO, "predictLongRunning", body, base=BASE)
    print(name, r.get("name") or r, flush=True); ops[name] = r.get("name")

MUSIC = {
 "m_one": "Minimal modern electronic beat for a short tech video, 100 BPM, warm soft synth plucks, light clean drums, confident and upbeat but calm, steady groove from the first second, no build up, instrumental",
 "m_two": "Lo-fi chill hop beat for a developer video, 92 BPM, mellow electric piano chords, soft vinyl texture, punchy but quiet kick and snare, positive and focused, steady from the first second, instrumental",
}
for name, prompt in MUSIC.items():
    r = call("lyria-002", "predict", {"instances":[{"prompt":prompt,"negative_prompt":"vocals, singing, voice, harsh distortion"}],"parameters":{"sample_count":1}}, base=BASE)
    if "error" in r: print(name, r); continue
    p = r["predictions"][0]; k = [k for k in p if "ase64" in k or "audio" in k.lower()][0]
    open(f"media/{name}.wav","wb").write(base64.b64decode(p[k])); print(name, "saved", k, flush=True)

pending = {n:o for n,o in ops.items() if o}
while pending:
    time.sleep(20)
    for n,o in list(pending.items()):
        r = call(VEO, "fetchPredictOperation", {"operationName": o}, base=BASE)
        if r.get("done"):
            if "error" in r: print(n, "ERROR", r["error"], flush=True)
            else:
                vids = r["response"].get("videos", [])
                for i,v in enumerate(vids):
                    open(f"media/{n}.mp4","wb").write(base64.b64decode(v["bytesBase64Encoded"]))
                print(n, "saved", len(vids), r["response"].get("raiMediaFilteredCount"), flush=True)
            pending.pop(n)
print("ALL DONE")
