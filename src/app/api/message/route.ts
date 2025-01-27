import dbConnect from "@/client/mongoose";
import { googleai } from "@/lib/googleai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
import FileModel from "@/models/file-model";
import MessageModel from "@/models/message-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log("body", body);
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { id: userId } = user;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { fileId, message } = SendMessageValidator.parse(body);
    await dbConnect();
    const userDb = await UserModel.findOne({ kinde_id: userId });
    const file = await FileModel.findOne({ _id: fileId, user: userDb?._id });
    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    const messageDb = await MessageModel.create({
      text: message,
      isUserMessage: true,
      user: userDb?._id,
      file: fileId,
    });

    // Vectorize message
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
    });
    const pineconeIndex = pinecone.Index("sod-malai");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file._id.toString(),
    });

    // Perform similarity search
    const result = await vectorStore.similaritySearch(message, 4);
    const hasRelevantContext = result && result.length > 0;

    // Fetch previous messages
    const prevMessages = await MessageModel.find({ file: fileId })
      .sort({ createdAt: 1 })
      .limit(6);
    const formattedPrevMessages = prevMessages.map((m) => ({
      id: m._id,
      content: m.text,
      role: m.isUserMessage ? ("user" as const) : ("assistant" as const),
    }));

    // Construct the messages array for Google AI
    const contextText = hasRelevantContext
      ? `\n\nCONTEXT:\n${result.map((r) => r.pageContent).join("\n\n")}`
      : "\n\n(No context available)";

    const messages = [
      {
        role: "system",
        content:
          "You are an AI assistant. Answer the user's questions in markdown format. Use the provided context if available. If no context is given, answer using your general knowledge. If you don't know the answer, say that you don't know and don't make up answers.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversation if needed) to answer the user's question. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages
    .map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })
    .join("")}
  
  \n----------------\n
  ${contextText}
  
  USER INPUT: ${message}`,
      },
    ];

    // Invoke Google AI with the constructed messages
    const response = await googleai.invoke(messages, { streamUsage: true });

    await MessageModel.create({
      text: response.content,
      isUserMessage: false,
      file: fileId,
      user: userDb?._id,
    });

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error from message route ", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
