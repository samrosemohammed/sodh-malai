import dbConnect from "@/client/mongoose";
import FileModel from "@/models/file-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });
export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: metadata.userId });
      try {
        const createFile = await FileModel.create({
          key: file.key,
          name: file.name,
          url: file.url,
          uploadStatus: "PROCESSING",
          user: userDb?._id,
        });
        console.log("File saved to database:", createFile);
      } catch (error) {
        console.error("Error saving file to database:", error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
