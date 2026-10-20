"""Render a 1080x1920 TikTok video for IntelliNode from voice lines, Veo clips, image plates and real flow graphs.

usage: python3 render.py v1|v2 [--preview t1,t2,...]
"""
import json, math, os, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.signal import resample_poly
from scipy import ndimage

TT = os.path.dirname(os.path.abspath(__file__))  # media/, voice/, vibe/, out/ and check/ live next to this file
IMG = "/Users/ahmad/Work/Github/docs/intellidocs/static/img"
W, H, FPS, SR = 1080, 1920, 30, 48000

INK = (20, 22, 27); WHITE = (255, 255, 255); MARK = (200, 224, 255)
BLUE = (41, 146, 254); LILAC = (184, 160, 245); TEAL = (46, 196, 165)
NAVY = (16, 26, 56); NAVY2 = (27, 39, 72); CODE_FG = (230, 235, 255); CODE_STR = (95, 208, 192); CODE_KW = (184, 160, 245)

_fonts = {}
def inter(size, w=800):
    k = ("inter", size, w)
    if k not in _fonts:
        f = ImageFont.truetype(f"{TT}/InterTight.ttf", size); f.set_variation_by_axes([w]); _fonts[k] = f
    return _fonts[k]
def avenir(size, face=5):  # 5 Medium, 2 Demi Bold
    k = ("av", size, face)
    if k not in _fonts: _fonts[k] = ImageFont.truetype("/System/Library/Fonts/Avenir Next.ttc", size, index=face)
    return _fonts[k]
def mono(size, bold=False):
    k = ("mono", size, bold)
    if k not in _fonts: _fonts[k] = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", size, index=1 if bold else 0)
    return _fonts[k]

def ease(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x):  # small overshoot for pops
    x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------------------------------------------------------------- audio and timing

def load_voice(path):
    data = open(path, "rb").read()
    with wave.open(path) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x = resample_poly(x, SR, sr).astype(np.float32)
    hop = SR // 100
    rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, "same"))[::hop]
    on = np.where(rms > rms.max() * 0.04)[0]
    a, b = max(on[0] - 3, 0) * hop, min((on[-1] + 5) * hop, len(x))
    return x[a:b]

def syll(w):
    w = w.lower()
    if w in ("ai", "s", "i"): return 1.2
    if w == "vllm": return 4
    return max(1, len(re.findall(r"[aeiouy]+", w))) + 0.35

def word_times(audio, words, start):
    """Spread spoken words over the clip, snapping punctuation breaks to real pauses."""
    hop = SR // 100
    rms = np.sqrt(np.convolve(audio ** 2, np.ones(hop) / hop, "same"))[::hop]
    quiet = rms < rms.max() * 0.07
    gaps, i = [], 5
    while i < len(quiet) - 5:
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if j - i >= 7 and j < len(quiet) - 5: gaps.append((i, j))
            i = j
        else: i += 1
    breaks = [k for k, w in enumerate(words[:-1]) if w[-1] in ",.?"]
    dur = len(audio) / SR
    spans = [(0, len(words), 0.0, dur)]
    if breaks and len(gaps) >= len(breaks):
        chosen = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[:len(breaks)])
        spans, prev_w, prev_t = [], 0, 0.0
        for k, (g0, g1) in zip(breaks, chosen):
            spans.append((prev_w, k + 1, prev_t, g0 / 100)); prev_w, prev_t = k + 1, g1 / 100
        spans.append((prev_w, len(words), prev_t, dur))
    out = [None] * len(words)
    for w0, w1, t0, t1 in spans:
        wt = [syll(w) for w in words[w0:w1]]; tot = sum(wt); acc = t0
        for k, x in enumerate(wt):
            d = (t1 - t0) * x / tot; out[w0 + k] = (start + acc, start + acc + d); acc += d
    return out

def norm(w): return re.sub(r"[^a-z0-9]", "", w.lower().replace(".si", "dotsi"))

def map_display(spoken, stimes, display):
    out, j = [], 0
    for dw in display:
        s, acc, target = j, "", norm(dw)
        while j < len(spoken) and acc != target:
            acc += norm(spoken[j]); j += 1
        out.append((stimes[s][0], stimes[max(j - 1, s)][1]))
    return out

def synth_sfx():
    rng = np.random.default_rng(7)
    n = int(0.45 * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n).astype(np.float32)
    env = np.minimum(t / 0.16, 1) * np.exp(-np.maximum(t - 0.16, 0) / 0.09)
    cut = 0.04 + 0.5 * np.minimum(t / 0.16, 1)  # rising brightness
    y = np.zeros(n, np.float32); s = 0.0
    for k in range(n): s += cut[k] * (noise[k] - s); y[k] = s
    whoosh = (y * env / np.abs(y * env).max() * 0.22).astype(np.float32)
    n = int(0.09 * SR); t = np.arange(n) / SR
    f = 950 - 380 * t / 0.09
    pop = (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * 0.28).astype(np.float32)
    n = int(0.012 * SR)
    click = (np.diff(rng.standard_normal(n + 1)) * np.exp(-np.arange(n) / (0.002 * SR)) * 0.05).astype(np.float32)
    return {"whoosh": whoosh, "pop": pop, "click": click}

# ---------------------------------------------------------------- drawing helpers

def rrect(size, radius, fill, outline=None, width=0):
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius, fill=fill, outline=outline, width=width)
    return im

_shadow = {}
def shadowed(card, blur=26, alpha=90, dy=14, strength=1.0):
    pad = blur * 2
    key = card.size
    if key not in _shadow:
        base = rrect(card.size, 28, (0, 0, 0, alpha))
        sh = Image.new("RGBA", (card.width + pad * 2, card.height + pad * 2 + dy), (0, 0, 0, 0))
        sh.alpha_composite(base, (pad, pad + dy)); _shadow[key] = sh.filter(ImageFilter.GaussianBlur(blur))
    out = _shadow[key].copy()
    if strength < 1: out.putalpha(out.getchannel("A").point(lambda a: int(a * strength)))
    out.alpha_composite(card, (pad, pad))
    return out, pad

def _unused_shadowed(card, blur=26, alpha=90, dy=14):
    pad = blur * 2
    out = Image.new("RGBA", (card.width + pad * 2, card.height + pad * 2 + dy), (0, 0, 0, 0))
    sh = Image.new("RGBA", card.size, (0, 0, 0, alpha)); sh.putalpha(card.getchannel("A").point(lambda a: a * alpha // 255))
    out.alpha_composite(sh, (pad, pad + dy)); out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(card, (pad, pad))
    return out, pad

def paste_center(frame, im, cx, y, scale=1.0, alpha=1.0):
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BICUBIC)
    if alpha < 1.0:
        im = im.copy(); im.putalpha(im.getchannel("A").point(lambda a: int(a * alpha)))
    frame.alpha_composite(im, (int(cx - im.width / 2), int(y - im.height / 2)))

def pill(text, bg=WHITE, fg=INK, size=36, padx=30, pady=16, font=None):
    f = font or inter(size, 750)
    l, t, r, b = f.getbbox(text)
    im = rrect((r - l + padx * 2, size + pady * 2), (size + pady * 2) // 2, bg)
    ImageDraw.Draw(im).text((padx - l, pady + size * 0.5), text, font=f, fill=fg, anchor="lm")
    return im

def marker_band(w, h, color, seed=1):
    """A highlighter stroke like the one under the site headline."""
    rng = np.random.default_rng(seed)
    im = Image.new("RGBA", (w + 24, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    top = [(12 + x, h * 0.12 + rng.uniform(-3, 3)) for x in np.linspace(0, w, 9)]
    bot = [(12 + x, h * 0.92 + rng.uniform(-3, 3)) for x in np.linspace(w, 0, 9)]
    d.polygon([(4, h * 0.2)] + top + [(w + 20, h * 0.18), (w + 22, h * 0.86)] + bot + [(2, h * 0.9)], fill=color)
    return im

def wrap(text, font, maxw):
    lines, cur = [], ""
    for w in text.split(" "):
        test = (cur + " " + w).strip()
        if font.getlength(test) <= maxw: cur = test
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

# ---------------------------------------------------------------- backgrounds

PREVIEW = False
class VideoBG:
    def __init__(self, path, offset=0.0, letterbox=False):
        vf = "fps=30"
        if letterbox: vf += ",crop=1080:1584:0:168,scale=1310:1920,crop=1080:1920:115:0"
        self.path, self.offset, self.vf = path, offset, vf
        if PREVIEW: return
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(offset), "-i", path, "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.last = None
    def frame(self, t):
        if PREVIEW:
            raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(self.offset + t), "-i", self.path, "-vf", self.vf, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
            if len(raw) == W * H * 3: self.last = Image.frombytes("RGB", (W, H), raw).convert("RGBA")
            return self.last.copy()
        raw = self.p.stdout.read(W * H * 3)
        if len(raw) == W * H * 3: self.last = Image.frombytes("RGB", (W, H), raw).convert("RGBA")
        return self.last.copy()

class PlateBG:
    def __init__(self, path, drift=(1, 1)):
        im = Image.open(path).convert("RGB").resize((int(W * 1.12), int(H * 1.12)), Image.LANCZOS)
        im = Image.blend(im, Image.new("RGB", im.size, (10, 12, 26)), 0.12)
        self.im = im.convert("RGBA"); self.drift = drift
    def frame(self, t):
        mx, my = self.im.width - W, self.im.height - H
        u = 0.5 + 0.5 * math.sin(t * 0.09)
        x = int(mx * (u if self.drift[0] > 0 else 1 - u)); y = int(my * (0.3 + 0.4 * u))
        return self.im.crop((x, y, x + W, y + H))

def scrim():
    a = np.zeros((H, 1), np.float32); y = np.arange(H)
    a[:, 0] = np.clip((y - 900) / 900, 0, 1) ** 1.4 * 150
    al = Image.fromarray(np.repeat(a, W, 1).astype(np.uint8))
    im = Image.new("RGBA", (W, H), (8, 10, 18, 255)); im.putalpha(al); return im
SCRIM = None

# ---------------------------------------------------------------- cards

def terminal_card(title, lines, width=960):
    """lines: list of (prefix, text, color). Returns (base card, draw function for typed text)."""
    f = mono(29); lh = 52
    h = 92 + lh * len(lines) + 40
    card = rrect((width, h), 26, NAVY + (255,))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle([0, 0, width - 1, 70], 26, fill=NAVY2 + (255,)); d.rectangle([0, 40, width - 1, 70], fill=NAVY2 + (255,))
    for i, c in enumerate([(242, 105, 92), (245, 189, 79), (95, 195, 139)]):
        d.ellipse([28 + i * 30, 26, 46 + i * 30, 44], fill=c)
    d.text((width / 2, 36), title, font=inter(28, 700), fill=(154, 166, 200), anchor="mm")
    return card, f, lh

def draw_typed(card, f, lh, lines, chars, cursor_on):
    im = card.copy(); d = ImageDraw.Draw(im); left = chars
    for i, (prefix, text, color) in enumerate(lines):
        y = 92 + i * lh + lh / 2
        if left <= 0 and i > 0: break
        x = 40
        if prefix: d.text((x, y), prefix, font=f, fill=TEAL, anchor="lm"); x += f.getlength(prefix)
        shown = text[:max(left, 0)]; left -= len(text)
        if isinstance(color, list):  # per-char colors
            for k, ch in enumerate(shown):
                d.text((x, y), ch, font=f, fill=color[k], anchor="lm"); x += f.getlength(ch)
        else:
            d.text((x, y), shown, font=f, fill=color, anchor="lm"); x += f.getlength(shown)
        if left <= 0 or i == len(lines) - 1:
            if cursor_on: d.rectangle([x + 3, y - 18, x + 19, y + 18], fill=CODE_FG)
            break
    return im

def py_colors(text):
    cols = [CODE_FG] * len(text)
    for m in re.finditer(r'"[^"]*"?', text):
        for k in range(m.start(), m.end()): cols[k] = CODE_STR
    for m in re.finditer(r"\b(from|import|await)\b", text):
        for k in range(m.start(), m.end()): cols[k] = CODE_KW
    for m in re.finditer(r"#.*$", text):
        for k in range(m.start(), m.end()): cols[k] = (130, 142, 178)
    return cols

def graph_card(path, crop, width, labels=()):
    """The real flow picture, with its small labels re-set large enough to read on a phone.
    labels: (x, y, name, tag, dy) in source image pixels; dy is where the original label starts below the node."""
    g = Image.open(path).convert("RGB").crop(crop)
    s = (width - 48) / g.width
    g = g.resize((int(g.width * s), int(g.height * s)), Image.LANCZOS)
    card = rrect((width, g.height + 48), 28, WHITE + (255,))
    card.alpha_composite(g.convert("RGBA"), (24, 24))
    d = ImageDraw.Draw(card); fn, ft = inter(25, 700), mono(19)
    for x, y, name, tag, dy in labels:
        cx = 24 + (x - crop[0]) * s; ly = 24 + (y - crop[1] + dy) * s
        d.rectangle([cx - 85 * s, ly - 4, cx + 85 * s, ly + 38 * s], fill=WHITE)
        w = max(fn.getlength(name), ft.getlength(tag)) + 28
        x0 = min(max(cx - w / 2, 10), width - 10 - w)
        d.rounded_rectangle([x0, ly - 6, x0 + w, ly + 60], 12, fill=WHITE, outline=(222, 226, 236), width=2)
        d.text((x0 + w / 2, ly + 14), name, font=fn, fill=INK, anchor="mm")
        d.text((x0 + w / 2, ly + 42), tag, font=ft, fill=(96, 104, 122), anchor="mm")
    return card, s

def ring(card, cx, cy, r, color, p):
    if p <= 0: return
    d = ImageDraw.Draw(card); rr = r * (0.6 + 0.4 * back(p)); w = 7
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=color + (int(255 * min(p * 2, 1)),), width=w)

# ---------------------------------------------------------------- captions

def caption_chunks(words, times):
    chunks, cur = [], []
    for k, w in enumerate(words):
        if cur and len(" ".join(words[i] for i in cur + [k])) > 17:
            chunks.append(cur); cur = []
        cur.append(k)
        if w[-1] in ",.?" or len(cur) == 3:
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    return chunks

def render_caption(words, active, appear_p):
    f = inter(82, 800); space = f.getlength(" ") + 20
    widths = [f.getlength(w) for w in words]
    lines, cur, cw = [], [], 0
    for k, w in enumerate(words):
        if cur and cw + space + widths[k] > 860: lines.append(cur); cur, cw = [], 0
        cw += (space if cur else 0) + widths[k]; cur.append(k)
    lines.append(cur)
    lh = 104; im = Image.new("RGBA", (980, lh * len(lines) + 30), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for li, ln in enumerate(lines):
        tw = sum(widths[k] for k in ln) + space * (len(ln) - 1); x = (980 - tw) / 2; y = 15 + li * lh + lh / 2
        for k in ln:
            if k == active:
                band = marker_band(int(widths[k]) + 4, 92, MARK + (255,), seed=k + 3)
                im.alpha_composite(band, (int(x - 14), int(y - 46)))
                d.text((x, y), words[k], font=f, fill=INK, anchor="lm")
            else:
                d.text((x, y), words[k], font=f, fill=WHITE, anchor="lm", stroke_width=8, stroke_fill=(10, 12, 18))
            x += widths[k] + space
    return im

# ---------------------------------------------------------------- the two videos

def build(vid):
    S = json.load(open(f"{TT}/scripts.json"))[vid]
    sfx = synth_sfx()
    t = 0.12; lines = []
    for i, L in enumerate(S):
        a = load_voice(f"{TT}/voice/{vid}_{i}.wav")
        spoken = L["say"].split(" "); display = L.get("show", L["say"]).split(" ")
        st = word_times(a, spoken, t)
        dt = map_display(spoken, st, display) if "show" in L else st
        lines.append(dict(start=t, end=t + len(a) / SR, audio=a, scene=L["scene"], words=display, times=dt))
        nxt = S[i + 1]["scene"] if i + 1 < len(S) else None
        t = lines[-1]["end"] + (0.14 if nxt == L["scene"] else 0.3)
    total = lines[-1]["end"] + 1.5
    # scene spans
    scenes = []
    for L in lines:
        if not scenes or scenes[-1]["name"] != L["scene"]:
            scenes.append(dict(name=L["scene"], start=0.0 if not scenes else L["start"] - 0.12, lines=[]))
        scenes[-1]["lines"].append(L)
    for k, sc in enumerate(scenes): sc["end"] = scenes[k + 1]["start"] if k + 1 < len(scenes) else total
    return S, lines, scenes, total, sfx

def word_at(L, word):
    for w, tm in zip(L["words"], L["times"]):
        if norm(w).startswith(norm(word)): return tm[0]
    return L["start"]

def make_scenes(vid, scenes):
    """Return dict name -> render(frame_t, scene) -> RGBA frame, plus sfx events."""
    events = []  # (time, kind)
    R = {}
    plate = PlateBG(f"{TT}/media/plate1.jpeg" if vid == "v1" else f"{TT}/media/plate2.jpeg", (1, 1) if vid == "v1" else (-1, 1))
    S = {s["name"]: s for s in scenes}
    for s in scenes[1:]: events.append((s["start"], "whoosh"))

    def step_pill(text, s, frame, t, y=330):
        p = ease((t - s["start"]) / 0.3)
        paste_center(frame, pill(text, WHITE, INK, 38), 540, y - 30 * (1 - p), alpha=p)

    # hook
    hook = S["hook"]
    if vid == "v1":
        bg = VideoBG(f"{TT}/media/v_dev.mp4", 0.6, letterbox=True)
        head = ["Make Claude Code show", "you what it built"]
    else:
        bg = VideoBG(f"{TT}/media/v_knot.mp4", 0.3)
        head = ["Turn 1 sentence into", "a full AI agent"]
    def r_hook(t, s):
        fr = bg.frame(t); fr.alpha_composite(SCRIM)
        f = inter(66, 800); y = 300
        for i, ln in enumerate(head):
            b = pill(ln, WHITE, INK, 66, padx=28, pady=14, font=f)
            paste_center(fr, b, 540, y + i * 100)
        p = ease((t - 0.5) / 0.3)
        if p > 0: paste_center(fr, pill("Free and open source", BLUE, WHITE, 34), 540, y + 210, scale=0.8 + 0.2 * back(p), alpha=min(1, p * 2))
        return fr
    R["hook"] = r_hook
    events.append((0.5, "pop"))

    if vid == "v1":
        s = S["install"]
        cmds = [("> ", "/plugin marketplace add intelligentnode/Intelli", CODE_FG), ("> ", "/plugin install intelli-flows@intellinode", CODE_FG)]
        card, f, lh = terminal_card("Claude Code", cmds)
        n = sum(len(c[1]) for c in cmds); t0 = s["start"] + 0.35; t1 = s["end"] - 0.5
        for k in range(0, n, 3): events.append((t0 + (t1 - t0) * k / n, "click"))
        def r_install(t, s=s, card=card, f=f, lh=lh, cmds=cmds, n=n, t0=t0, t1=t1):
            fr = plate.frame(t); step_pill("Step 1: Add the free skill", s, fr, t)
            chars = int(n * min(max((t - t0) / (t1 - t0), 0), 1))
            im = draw_typed(card, f, lh, cmds, chars, int(t * 3) % 2 == 0)
            # gap between the two commands
            sh, pad = shadowed(im); paste_center(fr, sh, 540, 600)
            for i, name in enumerate(["Claude Code", "Codex"]):
                p = ease((t - s["start"] - 0.2 - i * 0.15) / 0.3)
                if p > 0: paste_center(fr, pill(name, LILAC if i == 0 else TEAL, INK, 34), 380 + i * 300, 820, alpha=p)
            return fr
        R["install"] = r_install

        s = S["ask"]
        prompt = ("Build a support ticket triage tool with Intelli. Run three steps per ticket in parallel. "
                  "High urgency tickets get an escalation note, the rest get a customer reply. Then show me the flow picture.")
        fa = avenir(40, 5); plines = wrap(prompt, fa, 820)
        t0 = s["start"] + 0.25; t1 = s["end"] - 0.35; n = len(prompt)
        for k in range(0, n, 4): events.append((t0 + (t1 - t0) * k / n, "click"))
        ch = 120 + 58 * len(plines) + 40
        def r_ask(t, s=s, fa=fa, plines=plines, t0=t0, t1=t1, n=n, ch=ch):
            fr = plate.frame(t); step_pill("Step 2: Ask in plain words", s, fr, t)
            card = rrect((940, ch), 30, WHITE + (255,)); d = ImageDraw.Draw(card)
            d.ellipse([40, 36, 92, 88], fill=MARK); d.text((66, 62), "Y", font=inter(30, 800), fill=INK, anchor="mm")
            d.text((110, 62), "You", font=avenir(32, 2), fill=INK, anchor="lm")
            d.text((900, 62), "to Claude Code", font=avenir(28, 5), fill=(120, 124, 135), anchor="rm")
            left = int(n * min(max((t - t0) / (t1 - t0), 0), 1)); y = 130
            for ln in plines:
                shown = ln[:max(left, 0)]; left -= len(ln) + 1
                d.text((40, y), shown, font=fa, fill=INK)
                if 0 <= left + len(ln) + 1 <= len(ln) + 1 and left < 0 and int(t * 3) % 2 == 0:
                    x = 40 + fa.getlength(shown); d.rectangle([x + 3, y + 6, x + 7, y + 48], fill=BLUE)
                y += 58
            sh, pad = shadowed(card); paste_center(fr, sh, 540, 430 + ch / 2)
            return fr
        R["ask"] = r_ask

        s = S["graph"]
        gpath = f"{IMG}/articles/flows/triage_openai_graph.png"
        TL = [(105, 76, "category"), (489, 76, "urgency"), (873, 76, "summary"), (489, 409, "triage_card"), (298, 741, "escalation_note"), (680, 741, "customer_reply")]
        card0, sc = graph_card(gpath, (30, 30, 951, 812), 880, [(x, y, nm, "text: openai", 34) for x, y, nm in TL])
        L4, L5 = s["lines"]
        t_pic = word_at(L4, "picture"); t_tri = word_at(L5, "triage"); t_route = word_at(L5, "route")
        events += [(t_pic, "pop"), (t_tri, "pop")]
        def r_graph(t, s=s, card0=card0, sc=sc, L4=L4, L5=L5, t_pic=t_pic, t_tri=t_tri, t_route=t_route):
            fr = plate.frame(t); step_pill("Step 3: Check the picture", s, fr, t)
            card = card0.copy()
            p = ease((t - s["start"] - 0.15) / 1.1)
            if p < 1:
                cut = int(card.height * p); m = Image.new("L", card.size, 0); ImageDraw.Draw(m).rectangle([0, 0, card.width, cut], fill=255)
                a = card.getchannel("A"); card.putalpha(Image.composite(a, m, m))
            ring(card, 24 + (489 - 30) * sc, 24 + (409 - 30) * sc, 46, BLUE, (t - t_tri) / 0.35)
            for nx in (298, 680):
                ring(card, 24 + (nx - 30) * sc, 24 + (741 - 30) * sc, 40, LILAC, (t - t_route) / 0.35)
            zoom = 1 + 0.06 * ease((t - L5["start"]) / 1.2)
            sh, pad = shadowed(card, strength=p); paste_center(fr, sh, 540, 410 + card.height / 2, scale=zoom)
            q = ease((t - t_pic) / 0.3)
            if q > 0: paste_center(fr, pill("Saved before anything runs", TEAL, INK, 32), 540, 410 + card.height * zoom + 60, scale=0.8 + 0.2 * back(q), alpha=min(1, 2 * q))
            return fr
        R["graph"] = r_graph

        s = S["mixed"]
        card0, sc = graph_card(f"{IMG}/articles/flows/triage_mixed_graph.png", (30, 30, 951, 812), 880,
                               [(x, y, nm, "text: anthropic" if nm == "customer_reply" else "text: vllm", 34) for x, y, nm in TL])
        L6 = s["lines"][0]; t_local = word_at(L6, "local"); t_claude = word_at(L6, "Claude")
        events += [(t_local, "pop"), (t_claude, "pop")]
        def r_mixed(t, s=s, card0=card0, sc=sc, t_local=t_local, t_claude=t_claude):
            fr = plate.frame(t); step_pill("Bonus: keep data on your machine", s, fr, t)
            card = card0.copy()
            for (nx, ny) in [(105, 76), (489, 76), (873, 76), (489, 409), (298, 741)]:
                ring(card, 24 + (nx - 30) * sc, 24 + (ny - 30) * sc, 40, TEAL, (t - t_local) / 0.35)
            ring(card, 24 + (680 - 30) * sc, 24 + (741 - 30) * sc, 48, LILAC, (t - t_claude) / 0.35)
            sh, pad = shadowed(card); paste_center(fr, sh, 540, 410 + card.height / 2)
            q = ease((t - t_local) / 0.3)
            if q > 0: paste_center(fr, pill("Local model", TEAL, INK, 32), 330, 410 + card.height + 60, alpha=q)
            q = ease((t - t_claude) / 0.3)
            if q > 0: paste_center(fr, pill("Only this step: Claude", LILAC, INK, 32), 700, 410 + card.height + 60, alpha=q)
            return fr
        R["mixed"] = r_mixed

    else:
        s = S["code"]
        code = ['from intelli.flow import VibeAgent', '', 'agent = VibeAgent(planner_provider="gemini")', 'flow = await agent.build(',
                '  "Write a launch post for my app with Claude,', '   make a cover image and a voice over',
                '   from it, and review the image with Gemini.")']
        cmds = [("", c, py_colors(c)) for c in code]
        card, f, lh = terminal_card("vibe_agent.py", cmds)
        pre = sum(len(c) for c in code[:4]); n = sum(len(c) for c in code)
        t0 = s["start"] + 0.2; t1 = s["end"] - 0.3
        for k in range(pre, n, 3): events.append((t0 + (t1 - t0) * (k - pre) / (n - pre), "click"))
        def r_code(t, s=s, card=card, f=f, lh=lh, cmds=cmds, pre=pre, n=n, t0=t0, t1=t1):
            fr = plate.frame(t); step_pill("Step 1: Describe it in one sentence", s, fr, t)
            chars = pre + int((n - pre) * min(max((t - t0) / (t1 - t0), 0), 1))
            im = draw_typed(card, f, lh, cmds, chars, int(t * 3) % 2 == 0)
            sh, pad = shadowed(im); paste_center(fr, sh, 540, 430 + card.height / 2)
            return fr
        R["code"] = r_code

        s = S["graph"]
        VL = [(479, 75, "write_launch_post", "assistant: anthropic"), (95, 287, "generate_image_prompt", "assistant: anthropic"),
              (863, 288, "generate_voiceover", "speech: openai"), (479, 499, "generate_cover_image", "image: openai"), (479, 711, "review_image", "vision: gemini")]
        card0, sc = graph_card(f"{TT}/vibe/vibe_graph.png", (40, 30, 930, 770), 880, [(x, y, nm, tg, 24) for x, y, nm, tg in VL])
        L2, L3 = s["lines"]
        tc, to, tg = word_at(L3, "Claude"), word_at(L3, "OpenAI"), word_at(L3, "Gemini")
        events += [(tc, "pop"), (to, "pop"), (tg, "pop")]
        N = {"post": (479, 75), "prompt": (95, 287), "voice": (863, 288), "image": (479, 499), "review": (479, 711)}
        def r_graph(t, s=s, card0=card0, sc=sc, tc=tc, to=to, tg=tg, N=N):
            fr = plate.frame(t); step_pill("Step 2: VibeAgent builds the graph", s, fr, t)
            card = card0.copy()
            p = ease((t - s["start"] - 0.15) / 1.2)
            if p < 1:
                cut = int(card.height * p); m = Image.new("L", card.size, 0); ImageDraw.Draw(m).rectangle([0, 0, card.width, cut], fill=255)
                card.putalpha(Image.composite(card.getchannel("A"), m, m))
            for key, tt, col in [("post", tc, LILAC), ("prompt", tc, LILAC), ("image", to, BLUE), ("voice", to, BLUE), ("review", tg, TEAL)]:
                nx, ny = N[key]; ring(card, 24 + (nx - 40) * sc, 24 + (ny - 30) * sc, 44, col, (t - tt) / 0.35)
            sh, pad = shadowed(card, strength=p); paste_center(fr, sh, 540, 410 + card.height / 2)
            q = ease((t - s["start"] - 0.9) / 0.3)
            if q > 0: paste_center(fr, pill("Real output from the code above", WHITE, INK, 30), 540, 410 + card.height + 60, alpha=q)
            return fr
        R["graph"] = r_graph

        s = S["models"]
        L4 = s["lines"][0]
        names = ["OpenAI", "Claude", "Gemini", "Mistral", "Cohere", "NVIDIA", "Azure OpenAI", "vLLM: your own"]
        t_v = word_at(L4, "vLLM")
        times = [s["start"] + 0.2 + k * 0.22 for k in range(7)] + [t_v]
        events += [(x, "pop") for x in times]
        def r_models(t, s=s, names=names, times=times):
            fr = plate.frame(t); step_pill("Step 3: Pick any model", s, fr, t)
            for k, nm in enumerate(names):
                p = (t - times[k]) / 0.3
                if p <= 0: continue
                last = k == 7
                b = pill(nm, TEAL if last else WHITE, INK, 44 if last else 40, padx=34, pady=22)
                cx = 540 if last else (300 if k % 2 == 0 else 780); cy = 1030 if last else 470 + (k // 2) * 135
                paste_center(fr, b, cx, cy, scale=0.7 + 0.3 * back(p), alpha=min(1, p * 2))
            return fr
        R["models"] = r_models

        s = S["install"]
        cmds = [("", "# Python", py_colors("# Python")), ("$ ", "pip install intelli", CODE_FG), ("", "", CODE_FG),
                ("", "# Node.js", py_colors("# Node.js")), ("$ ", "npm i intellinode", CODE_FG)]
        card, f, lh = terminal_card("Terminal", cmds)
        n = sum(len(c[1]) for c in cmds); t0 = s["start"] + 0.2; t1 = s["start"] + 1.6
        for k in range(0, n, 3): events.append((t0 + (t1 - t0) * k / n, "click"))
        L5 = s["lines"][0]; t_light = word_at(L5, "light")
        events.append((t_light, "pop"))
        def r_install(t, s=s, card=card, f=f, lh=lh, cmds=cmds, n=n, t0=t0, t1=t1, t_light=t_light):
            fr = plate.frame(t); step_pill("Free and open source", s, fr, t)
            chars = int(n * min(max((t - t0) / (t1 - t0), 0), 1))
            im = draw_typed(card, f, lh, cmds, chars, int(t * 3) % 2 == 0)
            sh, pad = shadowed(im); paste_center(fr, sh, 540, 430 + card.height / 2)
            q = ease((t - t_light) / 0.3)
            if q > 0: paste_center(fr, pill("Light core: drops into your project", MARK, INK, 34), 540, 1010, scale=0.8 + 0.2 * back(q), alpha=min(1, 2 * q))
            return fr
        R["install"] = r_install

    # end card
    s = S["end"]
    ebg = VideoBG(f"{TT}/media/v_beads.mp4", 0.2)
    logo = Image.open(f"{IMG}/logo-dark.png").convert("RGBA"); logo = logo.resize((520, int(520 * logo.height / logo.width)), Image.LANCZOS)
    Lend = s["lines"][0]; t_save = word_at(Lend, "Save"); t_url = word_at(Lend, "intellinode.si")
    events += [(s["start"] + 0.5, "pop"), (t_url, "pop")]
    def r_end(t, s=s, logo=logo, t_save=t_save, t_url=t_url):
        lt = t - s["start"]; fr = ebg.frame(lt)
        p = ease(lt / 0.4); paste_center(fr, logo, 540, 330 - 20 * (1 - p), alpha=p)
        f = inter(108, 800)
        p2 = ease((lt - 0.2) / 0.4)
        if p2 > 0:
            w1 = f.getlength("Super Intelligence")
            band = marker_band(int(w1 * p2) + 10, 118, MARK + (255,), seed=11)
            fr.alpha_composite(band, (int(540 - w1 / 2 - 16), 430))
            d = ImageDraw.Draw(fr)
            d.text((540, 490), "Super Intelligence", font=f, fill=INK, anchor="mm")
            d.text((540, 615), "is open.", font=f, fill=INK, anchor="mm")
        q = (t - t_url) / 0.3
        if q > 0: paste_center(fr, pill("intellinode.si", INK, WHITE, 54, padx=40, pady=22), 540, 770, scale=0.7 + 0.3 * back(q), alpha=min(1, 2 * q))
        q = ease((t - t_save) / 0.3)
        if q > 0: paste_center(fr, pill("Save this for your next agent", BLUE, WHITE, 34), 540, 890, alpha=q)
        return fr
    R["end"] = r_end
    return R, events

def main():
    global SCRIM, PREVIEW
    vid = sys.argv[1]; preview = None
    if "--preview" in sys.argv: PREVIEW = True; preview = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]
    SCRIM = scrim()
    S, lines, scenes, total, sfx = build(vid)
    R, events = make_scenes(vid, scenes)
    nframes = int(total * FPS)

    # caption schedule
    caps = []
    for li, L in enumerate(lines):
        chunks = caption_chunks(L["words"], L["times"])
        for ci, ch in enumerate(chunks):
            a = L["times"][ch[0]][0] - 0.04
            if ci + 1 < len(chunks): b = L["times"][chunks[ci + 1][0]][0] - 0.04
            elif li + 1 < len(lines): b = lines[li + 1]["start"] - (0.04 if lines[li + 1]["scene"] == L["scene"] else 0.14)
            else: b = L["end"] + 0.6
            caps.append(dict(a=a, b=b, words=[L["words"][k] for k in ch], times=[L["times"][k] for k in ch], end_scene=L["scene"] == "end"))

    if preview:
        frames = [int(x * FPS) for x in preview]
    else:
        frames = range(nframes)
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", f"{TT}/out/{vid}_video.mp4"], stdin=subprocess.PIPE)
    out_prev = []
    fi = 0
    for fn in (frames if preview else range(nframes)):
        t = fn / FPS
        sc = next(s for s in scenes if s["start"] <= t < s["end"] or s is scenes[-1])
        # backgrounds are sequential readers, so in preview we still advance them in order
        fr = R[sc["name"]](t, sc)
        if sc["name"] not in ("hook",):
            pass
        cap = next((c for c in caps if c["a"] <= t < c["b"]), None)
        if cap:
            act = max([k for k, tm in enumerate(cap["times"]) if tm[0] - 0.04 <= t] or [0])
            p = (t - cap["a"]) / 0.12
            im = render_caption(cap["words"], act, p)
            sc_ = 0.88 + 0.12 * back(min(p, 1))
            paste_center(fr, im, 520, 1335 if not cap["end_scene"] else 1350, scale=sc_)
        # punch-in on scene cuts
        k = (t - sc["start"]) / 0.18
        if sc is not scenes[0] and k < 1:
            z = 1 + 0.05 * (1 - ease(k))
            big = fr.resize((int(W * z), int(H * z)), Image.BILINEAR)
            ox, oy = (big.width - W) // 2, (big.height - H) // 2; fr = big.crop((ox, oy, ox + W, oy + H))
        rgb = fr.convert("RGB")
        if preview: out_prev.append(rgb)
        else: enc.stdin.write(rgb.tobytes())
    if preview:
        sheet = Image.new("RGB", (len(out_prev) * 545, 960), "white")
        for i, im in enumerate(out_prev): sheet.paste(im.resize((540, 960)), (i * 545, 0))
        sheet.save(f"{TT}/check/{vid}_preview.jpg", quality=88); print("preview saved"); return
    enc.stdin.close(); enc.wait()

    # audio mix
    n = int(total * SR) + SR
    voice = np.zeros(n, np.float32)
    for L in lines:
        a = L["audio"] / (np.sqrt(np.mean(L["audio"] ** 2)) + 1e-9) * 0.11
        i0 = int(L["start"] * SR); voice[i0:i0 + len(a)] += a
    fx = np.zeros(n, np.float32)
    for tm, kind in events:
        x = sfx[kind]; i0 = int(tm * SR)
        if 0 <= i0 < n: fx[i0:i0 + len(x)] += x[:n - i0] * (np.random.uniform(0.7, 1.0) if kind == "click" else 1)
    with wave.open(f"{TT}/media/{'m_one' if vid == 'v1' else 'm_two'}.wav") as w:
        m = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2).mean(1) / 32768
    while len(m) < n:  # loop with a one second crossfade
        xf = SR; tail = m[-xf:] * np.linspace(1, 0, xf); head = m[8 * SR: 8 * SR + xf] * np.linspace(0, 1, xf)
        m = np.concatenate([m[:-xf], tail + head, m[8 * SR + xf:]])
    m = m[:n] / (np.sqrt(np.mean(m[:n] ** 2)) + 1e-9) * 0.035
    env = np.ones(n, np.float32); fo = int(1.2 * SR); end_i = int(total * SR)
    env[end_i - fo:end_i] = np.linspace(1, 0, fo); env[end_i:] = 0
    fi_ = int(0.05 * SR); env[:fi_] = np.linspace(0, 1, fi_)
    mix = np.tanh((voice + fx + m * env) * 1.6) / 1.6
    mix = mix[:int(total * SR)]
    with wave.open(f"{TT}/out/{vid}_mix.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
    print("total", round(total, 2), "frames", nframes)

if __name__ == "__main__":
    main()
