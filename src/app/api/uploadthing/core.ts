import dbConnect from "@/client/mongoose";
import FileModel from "@/models/file-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

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
      console.log("File saved to database:", createdFile);

      try {
        // Step 1: Download and Load the PDF
        // vectorize and index entire document
      } catch (error) {}
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
