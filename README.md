# Chat Vibe

Chat Vibe is a more friendly and emotional chatbot than other LLM's.  The character AI will respond your request in a way that makes sense to you.

https://github.com/user-attachments/assets/524d65aa-5fe4-4d23-b9eb-7e0a687e56fb

## 🔥 Updates
- **`2024/08/29`**: Applied a 3D character. For more details, check [**here**](https://skettee.github.io/chat-vibe/2024/08/28/3d-character.html) (in Korean).
- **`2024/08/19`**: I've added Shakespeare. For more details, check [**here**](https://skettee.github.io/chat-vibe/2024/08/19/add-shakespeare.html) (in Korean).

## Why Chat Vibe?

It was developed to solve two problems.

- LLM is Boring.
  - LLM is too boring and list-like. It was developed to convey knowledge in a way that is easy to understand and lively for the general public.
- Character AI is a Liar.
  - Character AI talks about things it doesn't know as if it does. In order to deliver the most accurate information to the user, we use various LLMs, including web search, to collect and organize information.

## Features

- 🎭 Character AI: Conveying knowledges in an easy and friendly way. 
- 😀 Emotional Character: Expressing dynamic emotions and actions. Using OpenAI GPT-4o mini.
- 🦸 Agent: Core AI systems for reasoning and calling other LLMs to adjust response. Using Anthropic Claude 3.5 Sonnet.
- 🔎 Web Search: Agent call web search LLM if needed. Using Perplexity.
- 🕵️ Dual View: Displaying Agent and other LLM's original response on seperated window, You can easily reference it.
- 🛡️ Local Data Storage: Using browser managed storage and database, your data remains on your device.
- 📜 Markdown Support: Enhanced readability with markdown and syntax highlighting capabilities.
- 🌟 And more... : Constantly improving Chat Vibe with new features!

## How to install

- Clone the repository from Github
```bash

git clone https://github.com/skettee/chat-vibe.git 

```

- Install dependencies
```bash

cd chat-vibe
npm install

```

- Set environment variables
```bash

# rename .env.example to .env
# add your api keys
ANTHROPIC_API_KEY=your-anthropic-api-key
PERPLEXITY_API_KEY=your-pplx-api-key
OPENAI_API_KEY=your-openai-api-key

```

- Start a development server
```bash

npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

```

- Build the application
```bash

npm run build

```

- Start the application
```bash

node -r dotenv/config build

# If you use Node.js v20.6+, you can use the `--env-file`
node --env-file=.env build

```
