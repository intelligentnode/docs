/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  pythonSidebar: [
    'python/index',
    {
      type: 'category',
      label: 'Get Started',
      items: ['python/get-started/installation', 'python/get-started/quickstart'],
    },
    {
      type: 'category',
      label: 'Chatbot',
      items: ['python/chatbot/get-started', 'python/chatbot/multiple-messages', 'python/chatbot/model-switching', 'python/chatbot/docs-chat'],
    },
    {
      type: 'category',
      label: 'Offline Chatbot',
      items: ['python/offline-chatbot/gemma', 'python/offline-chatbot/mistral', 'python/offline-chatbot/llama', 'python/offline-chatbot/whisper'],
    },
    {
      type: 'category',
      label: 'Flows',
      items: ['python/flows/get-started', 'python/flows/sequence-flow', 'python/flows/async-flow', 'python/flows/agent', 'python/flows/kagent', 'python/flows/tasks', 'python/flows/processors', 'python/flows/templates'],
    },
    {
      type: 'category',
      label: 'Controllers',
      items: ['python/controllers/introduction', 'python/controllers/embedding', 'python/controllers/image-generation', 'python/controllers/speech', 'python/controllers/vision'],
    },
    {
      type: 'category',
      label: 'Use cases',
      items: ['python/use-cases/content-platform'],
    },
    {
      type: 'doc',
      id: "python/intellicloud"
    },
    
  ],

  npmSidebar: [
    'npm/index',
    {
      type: 'category',
      label: 'Get started',
      items: ['npm/get-started/installation', 'npm/get-started/quickstart'],
    },
    {
      type: 'category',
      label: 'Chatbot',
      items: ['npm/chatbot/get-started', 'npm/chatbot/multiple-messages', 'npm/chatbot/docs-chat', 'npm/chatbot/nvidia-chat'],
    },
    {
      type: 'category',
      label: 'Controllers',
      items: ['npm/controllers/introduction', 'npm/controllers/embedding', 'npm/controllers/fine-tuning', 'npm/controllers/image-generation', 'npm/controllers/speech'],
    },
    {
      type: 'category',
      label: 'Functions',
      items: ['npm/functions/gen', 'npm/functions/semantic-search', 'npm/functions/text-analyzer', 'npm/functions/llm-evaluation'],
    },
    {
      type: 'category',
      label: 'Use cases',
      items: ['npm/use-cases/ecommerce-materials', 'npm/use-cases/generate-html'],
    },
    {
      type: 'doc',
      id: "npm/intellicloud"
    },
  ],
   
};

export default sidebars;
