---
sidebar_position: 1
---

# Get started

Intellinode module provides various language models, including **OpenAI's ChatGPT** and **Llama V2 model** from Replicate or AWS SageMaker.

We will demonstrate the setup for OpenAI's ChatGPT, followed by the two methods of integrating the Llama V2 model - through Replicate's API or AWS SageMaker dedicated deployment. All the models are available with the unified chatbot interface with a minimum code change when switching between models.

### ChatGPT Model

1. Import the necessary modules from IntelliNode. This will include the `Chatbot`, `ChatGPTInput`, and `ChatGPTMessage` classes.
```javascript
const { Chatbot, ChatGPTInput, ChatGPTMessage } = require('intellinode');
```

2. To use OpenAI, you'll need a valid API key. Create a `Chatbot` instance, providing the API key and 'openai' as the provider.
```javascript
const chatbot = new Chatbot(OPENAI_API_KEY, 'openai');
```

3. Construct a chat input instance and add user messages:
```javascript
const system = 'You are a helpful assistant.';
const input = new ChatGPTInput(system);
input.addUserMessage('Explain the plot of the Inception movie in one line.');
```
4. Use the `chatbot` instance to send chat input:
```javascript
const responses = await chatbot.chat(input);

responses.forEach(response => console.log('- ', response));
```
#### ChatGPT Streaming

To use the ChatGPT streaming with IntelliNodese, call `chatbot.stream` method to send the chat input and receive a stream of responses:

```javascript
let response = '';
for await (const contentText of chatbot.stream(input)) {
  response += contentText;
  console.log('Received chunk:', contentText);
}
```

By using the `chatbot.stream`, you can receive a stream of responses from ChatGPT instead of waiting for the entire conversation to complete. The stream function supported for openai provider only.

### Cohere Model
Initiate the chatbot with cohere coral model and web search capabilities.
1. Import the necessary modules.
```javascript
const { Chatbot, CohereInput, SupportedChatModels } = require('intellinode');
```
2. Initiate the chatbot object with a valid api key from (cohere.com).
```javascript
const bot = new Chatbot(process.env.COHERE_API_KEY, SupportedChatModels.COHERE); 
```
3. Prepare the input with cohere web search extension:
```javascript
const input = new CohereInput("You are a helpful computer programming assistant.", {web: true});
input.addUserMessage("What is the difference between Python and Java?");
```
4. Call the chatbot and parse the responses.
```javascript
const responses = await bot.chat(input);
responses.forEach((response) => console.log("- " + response));
```

### Mistral AI
Mistral provide open source mixer of experts models.

1. Import the `Chatbot` and `MistralInput`  modules.
```javascript
const { Chatbot, MistralInput, SupportedChatModels } = require('intellinode');
```
2. Initiate the chatbot object with a valid api key from (mistral.ai).
```javascript
const mistralBot = new Chatbot(apiKey, SupportedChatModels.MISTRAL);
```
3. Prepare the input and select your preferred mistral model like `mistral-tiny` or `mistral-medium`.
```javascript
const input = new MistralInput('You are an art expert.', {model: 'mistral-tiny'});
input.addUserMessage('Who painted the Mona Lisa?');
```
4. Call the chatbot and parse the responses.
```javascript
const responses = await mistralBot.chat(input);
```

### Llama V2 Model 

Integration with Llama V2 is attainable via two options, using:
1. **Replicate's API**: simple integration.
2. **AWS SageMaker**: hosted in your account for extra privacy and control ([SageMaker steps](https://github/.com/Barqawiz/IntelliNode/wiki/ChatBot#aws-sagemaker-integration)).


#### Replicate's Llama Integration

1. Import the necessary classes.
```javascript
const { Chatbot, LLamaReplicateInput, SupportedChatModels } = require('intellinode');
```
2. You'll need a valid API key. This time, it should be for replicate.com. 
```javascript
const chatbot = new Chatbot(REPLICATE_API_KEY, SupportedChatModels.REPLICATE);
```
3. Create the chat input with `LLamaReplicateInput`
```javascript
const system = 'You are a helpful assistant.';
const input = new LLamaReplicateInput(system);
input.addUserMessage('Explain the plot of the Inception movie in one line.');
```
4. Use the `chatbot` instance to send chat input:
```javascript
const response = await chatbot.chat(input);

console.log('- ', response);
```

**Advanced Settings**

You can create the input with the desired model name:

```javascript
// import the config loader
const {Config2} = require('intellinode');

// llama 13B model (default)
const input = new LLamaReplicateInput(system, {model: Config2.getInstance().getProperty('models.replicate.llama.13b')});
// llama 70B model 
const input = new LLamaReplicateInput(system, {model: Config2.getInstance().getProperty('models.replicate.llama.70b')});
```

#### AWS SageMaker Integration

Integration with the **Llama V2 model** via AWS SageMaker, providing an additional layer of control, is achievable through IntelliNode.

##### IntelliNode Integration


1. Import the necessary classes:

```javascript
const { Chatbot, LLamaSageInput, SupportedChatModels } = require('intellinode');
```

2. With AWS SageMaker, you'll be providing the URL of your API gateway, _the steps to deploy your model and get the URL in [the Prerequisite section](https://github.com/Barqawiz/IntelliNode/wiki/ChatBot#prerequisite-to-integrate-aws-sagemaker-and-intellinode)_:

```javascript
const chatbot = new Chatbot(null /*replace with the API key, or null if the API gateway key not used*/, 
                            SupportedChatModels.SAGEMAKER, 
                            {url: process.env.AWS_API_URL /*replace with your API gateway url*/});
```

3. Create the chat input with `LLamaSageInput`:

```javascript
const system = 'You are a helpful assistant.';
const input = new LLamaSageInput(system);
input.addUserMessage('Explain the plot of the Inception movie in one line.');
```

4. Use the `chatbot` instance to send the chat input:

```javascript
const response = await chatbot.chat(input);

console.log('Chatbot response:' + response);
```


##### Prerequisite to Integrate AWS SageMaker and IntelliNode

<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/s1_sagemaker.png" width="500em">

The steps to leverage AWS SageMaker for hosting the **Llama V2 model**:

1. **Create a SageMaker Domain**: Begin by setting up a domain on your AWS SageMaker. This step establishes a controlled space for your SageMaker operations.

<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/step_domain.png" width="500em">

2. **Deploy the Llama Model**: Utilize SageMaker JumpStart to deploy the Llama model you plan to integrate.

<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/s2_jumpstart.png" width="500em">

3. **Copy the Endpoint Name**: Once you have a model deployed, make sure to note the endpoint name, which is crucial for future steps.

<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/s3_endpoint.png" width="500em">

4. **Create a Node.js Lambda Function**: AWS Lambda allows running the back-end code without managing servers. Create a Node.js lambda function to use for integrating the deployed model.

5. **Set Up Environment Variable**: Create an environment variable named `llama_endpoint` with the value of the SageMaker endpoint.

6. **Intellinode Lambda Import**: You need to import the prepared Lambda zip file that establishes a connection to your SageMaker Llama deployment. This export is a zip file, and it can be found in the [lambda_llama_sagemaker](https://github.com/Barqawiz/IntelliNode/tree/main/samples/lambda_llama_sagemaker) directory.

7. **API Gateway Configuration**: Click on the "Add trigger" option on the Lambda function page, and select "API Gateway" from the list of available triggers.

<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/s4_lambda_trigger.png" width="500em">
<img src="https://github.com/Barqawiz/IntelliNode/blob/main/images/llama_sagemaker/s5_gateway.png" width="500em">

8. **Lambda Function Settings**: Update the lambda role to grant necessary permissions to access SageMaker endpoints. Additionally, the function's timeout period should be extended to accommodate the processing time. Make these adjustments in the "Configuration" tab of your Lambda function.

Once you complete these steps, your AWS SageMaker will be ready to host and run the Llama V2 model, and you can easily integrate it with IntelliNode.
