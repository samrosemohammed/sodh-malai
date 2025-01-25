import dbConnect from "@/client/mongoose";
import FileModel from "@/models/file-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: metadata.userId });
      const createdFile = await FileModel.create({
        key: file.key,
        name: file.name,
        url: file.url,
        uploadStatus: "PROCESSING",
        user: userDb?._id,
      });
      // console.log("File saved to database:", createdFile);

      try {
        // Step 1: Download and Load the PDF
        const response = await fetch(file.url);
        const blob = await response.blob();
        const loader = new PDFLoader(blob);
        console.log("PDF Loader: ", loader);
        const pageLevelDocs = await loader.load();
        console.log("Page Level Docs: ", pageLevelDocs);
        const pageAmt = pageLevelDocs.length;
        console.log("Page Amount: ", pageAmt);

        // vectorize and index entire document
        const pineconeIndex = pinecone.Index("sod-malai");
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          model: "text-embedding-3-large",
        });
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile._id.toString(),
        });
        await FileModel.updateOne(
          { _id: createdFile._id },
          { $set: { uploadStatus: "SUCCESS" } }
        );
      } catch (error) {
        await FileModel.updateOne(
          { _id: createdFile._id },
          { $set: { uploadStatus: "FAILED" } }
        );

        console.error(error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
