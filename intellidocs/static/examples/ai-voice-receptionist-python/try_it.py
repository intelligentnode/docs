"""Talk to the receptionist on your computer before you connect a phone number.

  python try_it.py                      type what a caller says, hear the answer in reply.mp3
  python try_it.py question.mp3         send a recording instead of typing
"""
import sys

from receptionist import hear, speak, think

CALLER = "+15550100"  # a pretend caller id; the receptionist remembers callers by this number


def answer(text):
    reply = think(text, CALLER)
    print(f"Sam: {reply}\n")
    with open("reply.mp3", "wb") as file:
        file.write(speak(reply))


if len(sys.argv) > 1:
    question = hear(sys.argv[1])
    print(f"Caller: {question}")
    answer(question)
else:
    print("Type what a caller says. Press Enter on an empty line to stop.\n")
    while question := input("Caller: ").strip():
        answer(question)
