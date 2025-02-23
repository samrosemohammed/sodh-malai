import dbConnect from "@/client/mongoose";
import FileModel from "@/models/file-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();
const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) throw new UploadThingError("Unauthorized");
  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: { key: string; name: string; url: string };
}) => {
  const isFileExist = await FileModel.exists({ key: file.key });
  if (isFileExist) return;
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
    const pageLevelDocs = await loader.load();
    const pageAmt = pageLevelDocs.length;
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;
    const isProExceded =
      pageAmt > PLANS.find((plan) => plan.name === "pro")!.pagesPerPdf;
    const isFreeExceded =
      pageAmt > PLANS.find((plan) => plan.name === "free")!.pagesPerPdf;
    if ((isSubscribed && isProExceded) || (!isSubscribed && isFreeExceded)) {
      await dbConnect();
      await FileModel.updateOne(
        { _id: createdFile._id },
        { $set: { uploadStatus: "FAILED" } }
      );
    }
    // vectorize and index entire document
    const pineconeIndex = pinecone.Index("sod-malai");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
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
};
export const ourFileRouter = {
  freePlanUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
