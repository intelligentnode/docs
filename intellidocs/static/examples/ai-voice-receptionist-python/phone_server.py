"""Answer real phone calls through Twilio.

Each turn: Twilio records what the caller says and sends us the recording, we hear, think and speak,
and Twilio plays our mp3 back and records again. Run it with:  uvicorn phone_server:app --port 8000
"""
import os
import tempfile
import uuid

import requests
from fastapi import FastAPI, Form, Response
from fastapi.staticfiles import StaticFiles

from receptionist import hear, speak, think

PUBLIC_URL = os.environ.get("PUBLIC_URL", "http://localhost:8000")  # the https address Twilio can reach
TWILIO_AUTH = (os.environ.get("TWILIO_ACCOUNT_SID", ""), os.environ.get("TWILIO_AUTH_TOKEN", ""))
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "audio")
os.makedirs(AUDIO, exist_ok=True)

app = FastAPI()
app.mount("/audio", StaticFiles(directory=AUDIO), name="audio")

LISTEN = f'<Record action="{PUBLIC_URL}/turn" maxLength="30" timeout="2" playBeep="false" trim="trim-silence"/>'
GOODBYE = "<Say>Sorry, I did not hear anything. Please call again. Goodbye.</Say><Hangup/>"


def twiml(body):
    return Response(f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>', media_type="text/xml")


def say_with_our_voice(text):
    name = f"{uuid.uuid4().hex}.mp3"
    with open(os.path.join(AUDIO, name), "wb") as file:
        file.write(speak(text))
    return f"<Play>{PUBLIC_URL}/audio/{name}</Play>"


@app.post("/voice")
def incoming_call():
    """Twilio calls this when the phone rings."""
    return twiml(say_with_our_voice("Thanks for calling Bright Smile Dental, this is Sam. How can I help?")
                 + LISTEN + GOODBYE)


@app.post("/turn")
def caller_spoke(CallSid: str = Form(...), From: str = Form(""), RecordingUrl: str = Form(...)):
    """Twilio calls this each time the caller stops talking."""
    recording = requests.get(RecordingUrl + ".mp3", auth=TWILIO_AUTH, timeout=30)
    recording.raise_for_status()
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as file:
        file.write(recording.content)
    try:
        question = hear(file.name)
    finally:
        os.remove(file.name)

    reply = think(question, caller=From or CallSid, call_id=CallSid)
    return twiml(say_with_our_voice(reply) + LISTEN + GOODBYE)
