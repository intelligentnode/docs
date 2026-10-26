AI voice receptionist in Python with Intelli
https://www.intellinode.ai/articles/build-ai-voice-agent-python

1. pip install -U intelli fastapi uvicorn python-multipart
2. export OPENAI_API_KEY="your-key"
3. python try_it.py               (talk to it by typing, hear reply.mp3)
4. uvicorn phone_server:app --port 8000   (answer real calls through Twilio)

clinic_info.md   the documents the receptionist answers from; replace with your own
receptionist.py  hear, think and speak, plus the booking tools
try_it.py        test on your computer
phone_server.py  the Twilio webhook for real phone calls
