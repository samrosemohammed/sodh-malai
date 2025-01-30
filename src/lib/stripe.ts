import { PLANS } from "../config/stripe";
import dbConnect from "@/client/mongoose";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";
import UserModel from "@/models/user-model";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  await dbConnect();

  const userDb = await UserModel.findOne({ kinde_id: user.id });

  //   const dbUser = await db.user.findFirst({
  //     where: {
  //       id: user.id,
  //     },
  //   })

  if (!userDb) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    userDb.stripePriceId &&
      userDb.stripeCurrentPeriodEnd && // 86400000 = 1 day
      userDb.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find(
        (plan: (typeof PLANS)[number]) =>
          plan.prices.priceIds.test === userDb.stripePriceId
      )
    : null;

  let isCanceled = false;
  if (isSubscribed && userDb.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      userDb.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: userDb.stripeSubscriptionId,
    stripeCurrentPeriodEnd: userDb.stripeCurrentPeriodEnd,
    stripeCustomerId: userDb.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
