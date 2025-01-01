import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/client/mongoose";
export const appRouter = router({
  // ...
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });
    // CHECK IF THE USER IN ON THE DATABASE
    await dbConnect();
    return { success: true, user };
  }),
});

export type AppRouter = typeof appRouter;
