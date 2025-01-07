import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/client/mongoose";
import UserModel, { TUser } from "@/models/user-model";
import FileModel, { TFile } from "@/models/file-model";
import { z } from "zod";
import { notFound } from "next/navigation";
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
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;
    await dbConnect();
    const userDb = await UserModel.findOne({ kinde_id: userId });
    if (!userDb) throw new TRPCError({ code: "UNAUTHORIZED" });
    // await FileModel.create({
    //   name: "test",
    //   uploadStatus: "PENDING",
    //   url: "test",
    //   key: "test",
    //   user: userDb._id,
    // });
    const files: TFile[] = await FileModel.find({ user: userDb._id });
    return { success: true, files };
  }),
  getFiles: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: userId });
      const file: TFile | null = await FileModel.findOne({
        key: input.key,
        user: userDb?._id,
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      return { success: true, file };
    }),
  deleteFiles: privateProcedure
    .input(z.object({ _id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: userId });
      const file = await FileModel.findOne({
        _id: input._id,
        user: userDb?._id,
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await file.deleteOne();
      return { success: true, file };
    }),
});

export type AppRouter = typeof appRouter;
