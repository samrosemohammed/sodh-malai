import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const googleai = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  model: "models/gemini-1.5-flash",
  streaming: true,
  temperature: 0,
});
