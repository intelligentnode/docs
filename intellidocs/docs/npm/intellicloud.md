---

---

# Intellicloud


Intellinode cloud streamlines the integration of your data with a variety of AI models, enabling the deployment of production-ready AI-powered apps. 

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


### Integration with javascript

```javascript
const { Chatbot, SupportedChatModels, GeminiInput } = require("intellinode");

// create the bot with the one key
const intelliKey = '<generated_one_key>';
const bot = new Chatbot(geminiApiKey, SupportedChatModels.GEMINI, null, {oneKey: intelliKey});

// prepare the input
const input = new GeminiInput();
input.addUserMessage(query);

// call the chatbot and print responses
const responses = await bot.chat(input);
responses.forEach(response => console.log("- " + response));

```
