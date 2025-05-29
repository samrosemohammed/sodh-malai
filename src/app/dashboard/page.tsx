import Dashboard from "@/components/Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  console.log("dashboard user: ", user);
  if (!user) redirect("auth-callback?origin=dashboard");
  const userDb = await UserModel.findOne({kinde_id: user.id});
  console.log("dashboard userDb: ", userDb);
  if (!userDb) redirect("auth-callback?origin=dashboard");
  const subscriptionPlan = await getUserSubscriptionPlan();
  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
