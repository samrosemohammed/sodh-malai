import dbConnect from "@/client/mongoose";
import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
import FileModel from "@/models/file-model";
import MessageModel from "@/models/message-model";
import UserModel from "@/models/user-model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json;
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const { id: userId } = user;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { fileId, message } = SendMessageValidator.parse(body);
  await dbConnect();
  const userDb = await UserModel.findOne({ kinde_id: userId });
  const file = await FileModel.findOne({ _id: fileId, user: userDb?._id });
  if (!file) {
    return new Response("File not found", { status: 404 });
  }
  const messageDb = await MessageModel.create({
    text: message,
    isUserMessage: true,
    user: userDb?._id,
    file: fileId,
  });
};
