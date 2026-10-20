import asyncio, json, sys
sys.path.insert(0, "/Users/ahmad/Work/Github/Intelli")
from intelli.flow.vibe import VibeAgent
from g import call

def gemini_planner(system_prompt, user_prompt):
    r = call("gemini-3.8-flash", "generateContent", {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}}, timeout=300)
    text = "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"])
    return json.loads(text)

DESCRIPTION = sys.argv[1]
async def main():
    vf = VibeAgent(planner_provider="gemini", planner_model="gemini-3.8-flash", planner_fn=gemini_planner)
    flow = await vf.build(DESCRIPTION, save_dir="vibe", graph_name="vibe_graph")
    print(json.dumps(vf.last_spec, indent=1)[:3000])
asyncio.run(main())
