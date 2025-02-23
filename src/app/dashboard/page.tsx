import Dashboard from "@/components/Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) redirect("auth-callback?origin=dashboard");
  const subscriptionPlan = await getUserSubscriptionPlan();
  // const dbUser = await UserModel.findOne({ kinde_id: user.id });
  // if (!dbUser) redirect("auth-callback?origin=dashboard");
  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
