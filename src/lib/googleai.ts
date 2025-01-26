import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const googleai = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-pro",
  streaming: true,
  temperature: 0,
});
