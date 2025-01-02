import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/client/mongoose";
import userModel from "@/models/user-model";
import UserModel from "@/models/user-model";
export const appRouter = router({
  // ...
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
});

export type AppRouter = typeof appRouter;
