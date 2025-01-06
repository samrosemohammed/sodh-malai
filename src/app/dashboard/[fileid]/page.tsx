import dbConnect from "@/client/mongoose";
import ChatWrapper from "@/components/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import FileModel from "@/models/file-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = await params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect(`auth-callback?origin=dashboard/${fileid}`);
  await dbConnect();
  const dbUser = await UserModel.findOne({ kinde_id: user.id });
  if (!dbUser) redirect(`auth-callback?origin=dashboard/${fileid}`);
  const file = await FileModel.findOne({ _id: fileid, user: dbUser._id });
  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc-(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper />
        </div>
      </div>
    </div>
  );
};

export default Page;
