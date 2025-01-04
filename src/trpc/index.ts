import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/client/mongoose";
import UserModel from "@/models/user-model";
import FileModel from "@/models/file-model";
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // CHECK IF THE USER IN ON THE DATABASE
    await dbConnect();
    const dbUser = await UserModel.findOne({ kinde_id: user.id });
    if (!dbUser) {
      await UserModel.create({
        kinde_id: user.id,
        name: `${user.given_name} ${user.family_name}`,
        email: user.email,
        family_name: user.family_name,
        given_name: user.given_name,
      });
    }

    return { success: true, user };
  }),
  getUserFile: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;
    await dbConnect();
    const userDb = await UserModel.findOne({ kinde_id: userId });
    if (!userDb)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    await FileModel.create({
      name: "test",
      uploadStatus: "PENDING",
      url: "test",
      key: "test",
    });
    const files = await FileModel.find({ user: userDb._id }).sort({
      createdAt: -1,
    });
    if (!files || files.length === 0)
      return { success: false, message: "No files found" };
    return { success: true, files };
  }),
});

export type AppRouter = typeof appRouter;
