import Dashboard from "@/components/Dashboard";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) redirect("auth-callback?origin=dashboard");
  // const dbUser = await UserModel.findOne({ kinde_id: user.id });
  // if (!dbUser) redirect("auth-callback?origin=dashboard");
  console.log(user);
  return <Dashboard />;
};

export default Page;
