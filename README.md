# 📄 Sodh-Malai – AI-Powered PDF Assistant
Sodh-Malai is a full-stack AI-powered platform that allows users to upload PDF documents, ask context-based questions, and receive intelligent answers powered by LLMs and vector similarity search.

## 🚀 Features

- 📥 PDF Upload via drag-and-drop UI

- 🤖 AI Question Answering on Uploaded Documents

- 🔐 Secure Authentication with Kinde

- 💳 Stripe Integration for Premium Access

- 🧠 Context-aware Retrieval with Pinecone & LangChain

- 💬 Powered by Gemini API via Google AI Embeddings

- 🗂 Organized User Dashboard for file and query management

## 🛠️ Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS

- Authentication: Kinde Auth

- Storage: MongoDB (via Mongoose), UploadThing (PDF uploads)

- AI & NLP: LangChain, Google AI Embeddings, Gemini API

- Vector DB: Pinecone (semantic search & retrieval)

- Payments: Stripe (subscriptions & webhook integration)

## 📦 Getting Started
1. Clone the Repository
```bash
git clone https://github.com/samrosemohammed/sodh-malai.git
cd sodh-malai
```
2. Install Dependencies
```base
npm install
```
3. Set Up Environment Variables
Create a .env.local file in the root of the project using the template:
```base
cp .env.example .env.local
```
Fill in the values with your credentials.

4. Start the Development Server
```bash
npm run dev
```
Visit http://localhost:3000 to view the app.


## 📤 Deployment
Deploy easily on Vercel with environment variables configured.
