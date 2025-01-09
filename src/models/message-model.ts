import mongoose, { Schema, Model } from "mongoose";

interface IMessage {
  text: string;
  isUserMessage: boolean;
  user: mongoose.Types.ObjectId;
}

export interface MongoUser extends IMessage, Document {}

export type TMessage = IMessage & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
const MessageSchema = new Schema<MongoUser>(
  {
    text: { type: String, required: true },
    isUserMessage: { type: Boolean, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MessageModel: Model<MongoUser> =
  mongoose.models.Message ||
  mongoose.model<MongoUser>("Message", MessageSchema);
export default MessageModel;
