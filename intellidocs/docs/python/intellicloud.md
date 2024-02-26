---

---

# Intellicloud

Intellinode cloud streamlines the integration of your data with a variety of AI models, enabling the deployment of production-ready AI-powered apps in short time. 

### Get Started

1. **Create a Project**: Visit [app.intellinode.ai](https://app.intellinode.ai/) and start a new document-based project.
2. **Upload Documents**: Upload PDFs, DOCs, images, code files, or any data you want to analyze or use for AI content generation.
3. **Generate One Key**: Intellicloud processes your data and generates a unique key for easy integration using intellinode modules.
4. **Integrate into Your Application**: Use the One Key to connect AI with your data.


### Deploying IntelliServer with Docker

Pull the IntelliServer Docker Image.

```bash
docker pull intellinode/intelliserver:latest
```

Run the AI microservice with the provded one key.

```bash
ONE_KEY=<your-key>
docker run -p 80:80 -e ONE_KEY=$ONE_KEY intellinode/intelliserver:latest
```


### Integration with python

```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot

# initialize the chatbot with your API key and the One Key
chatbot = Chatbot(api_key=YOUR_API_KEY, provider="mistral", options={"one_key": INTELLI_ONE_KEY})

# prepare the input with attachment references
chat_input = ChatModelInput(system="You are a helpful assistant.", model="mistral-medium")
chat_input.attach_reference = True
chat_input.add_user_message("Explain the concept of relativity.")

response = chatbot.chat(chat_input)
```
