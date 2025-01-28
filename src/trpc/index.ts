import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/client/mongoose";
import UserModel, { TUser } from "@/models/user-model";
import FileModel, { TFile } from "@/models/file-model";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import MessageModel, { TMessage } from "@/models/message-model";
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
    const files: TFile[] = await FileModel.find({ user: userDb._id });
    return { success: true, files };
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        fileId: z.string(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: userId });
      const file = await FileModel.findOne({ _id: fileId, user: userDb?._id });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages: TMessage[] = await MessageModel.find({
        file: fileId,
        ...(cursor ? { _id: { $lt: cursor } } : {}), // Fetch messages with _id less than cursor
      })
        .limit(limit + 1)
        .sort({ createdAt: -1 })
        .select({ _id: 1, isUserMessage: 1, createdAt: 1, text: 1 });

      let nextCursor =
        messages.length > limit ? messages.pop()?._id : undefined;

      return {
        messages,
        nextCursor,
      };
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      await dbConnect();
      const userDb = await UserModel.findOne({ kinde_id: userId });
      const file: TFile | null = await FileModel.findOne({
        _id: input.fileId,
        user: userDb?._id,
      });
      if (!file) return { success: false, status: "PENDING" as const };
      return { success: true, status: file.uploadStatus };
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
