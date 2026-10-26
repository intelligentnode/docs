"""The receptionist: it hears a caller, answers from the clinic's documents, books visits and speaks the reply.

Everything here runs on one OpenAI key. try_it.py and phone_server.py both use these three functions:
hear(audio_path) -> text, think(text, caller) -> text, speak(text) -> mp3 bytes.
"""
import json
import os
from datetime import date, timedelta

from intelli.controller.remote_recognition_model import RemoteRecognitionModel
from intelli.controller.remote_speech_model import RemoteSpeechModel
from intelli.function.assistant import Assistant
from intelli.model.input.text_recognition_input import SpeechRecognitionInput
from intelli.model.input.text_speech_input import Text2SpeechInput
from intelli.store import FileChatHistory, MemoryVectorStore

KEY = os.environ.get("OPENAI_API_KEY")
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
BOOKINGS = os.path.join(DATA, "bookings.json")
MESSAGES = os.path.join(DATA, "messages.json")

INSTRUCTIONS = f"""You are Sam, the phone receptionist at Bright Smile Dental. Today is {date.today():%A %d %B %Y}.
You are speaking on the phone, so answer in one to three short sentences, with no lists, no markdown and no links.
Answer questions only from the clinic documents. If the answer is not there, offer to take a message.
To book, first check open slots, then confirm the day, time, the caller's name and phone number before you book.
Never give medical advice. For severe pain or swelling, offer the earliest emergency slot."""

OPEN_HOURS = {0: range(8, 18), 1: range(8, 18), 2: range(8, 18), 3: range(8, 18), 4: range(8, 14), 5: range(9, 13)}


def _load(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def _save(path, items):
    os.makedirs(DATA, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(items, file, indent=2)


# The tools. The assistant reads each docstring to decide when to call it.
# Swap the JSON files for your booking system's API when you go live.

def check_open_slots(day: str) -> list:
    """List the free appointment times on one day. day is a date such as 2026-11-03."""
    when = date.fromisoformat(day)
    hours = OPEN_HOURS.get(when.weekday())
    if not hours:
        return ["Closed that day."]
    taken = {b["time"] for b in _load(BOOKINGS) if b["day"] == day}
    return [f"{h:02d}:00" for h in hours if f"{h:02d}:00" not in taken]


def book_appointment(name: str, phone: str, day: str, time: str, reason: str) -> str:
    """Book a visit after the caller confirmed it. day is like 2026-11-03 and time is like 10:00."""
    if time not in check_open_slots(day):
        return f"{time} on {day} is not free. Offer another time."
    bookings = _load(BOOKINGS)
    bookings.append({"name": name, "phone": phone, "day": day, "time": time, "reason": reason})
    _save(BOOKINGS, bookings)
    return f"Booked {name} on {day} at {time}."


def take_message(name: str, phone: str, message: str) -> str:
    """Leave a message for the clinic staff when the caller needs a person or the documents have no answer."""
    messages = _load(MESSAGES)
    messages.append({"name": name, "phone": phone, "message": message})
    _save(MESSAGES, messages)
    return "Message saved. A team member calls back within one working day."


# The brain: an assistant with the clinic documents in a vector store.

embedder = {"provider": "openai", "api_key": KEY}
knowledge = MemoryVectorStore(embedder=embedder, path=os.path.join(DATA, "knowledge.json"))

assistant = Assistant(
    provider="openai",
    api_key=KEY,
    model="gpt-5-mini",
    system_message=INSTRUCTIONS,
    history=FileChatHistory(dir=os.path.join(DATA, "calls")),
    knowledge=knowledge,
    memory=MemoryVectorStore(embedder=embedder, path=os.path.join(DATA, "callers.json")),
    tools=[check_open_slots, book_appointment, take_message],
    top_k=3,
)

# Embed the clinic documents once, not on every start.
if knowledge.count() == 0:
    assistant.add_files([os.path.join(HERE, "clinic_info.md")], chunk_size=500, chunk_overlap=50)

ears = RemoteRecognitionModel(key_value=KEY, provider="openai")
voice = RemoteSpeechModel(key_value=KEY, provider="openai")
calls = {}  # call id -> conversation id, so each call keeps its own conversation


def hear(audio_path):
    """Turn the caller's recording into text."""
    return ears.recognize_speech(SpeechRecognitionInput(audio_file_path=audio_path, language="en"))


def think(text, caller, call_id="local"):
    """Answer one thing the caller said. caller is their phone number, so the assistant remembers past calls."""
    reply = assistant.chat(text, conversation_id=calls.get(call_id), user_id=caller)
    calls[call_id] = reply["conversation_id"]
    return reply["text"]


def speak(text):
    """Turn the answer into mp3 audio."""
    return voice.generate_speech(Text2SpeechInput(text=text, voice="nova", model="tts-1", stream=False))
