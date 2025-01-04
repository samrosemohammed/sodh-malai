import mongoose, { Schema, Model } from "mongoose";

interface IUser {
  kinde_id: string;
  name: string;
  email: string;
  family_name: string;
  given_name: string;
}

export interface MongoUser extends IUser, Document {}

export type TUser = IUser & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const UserSchema = new Schema<MongoUser>(
  {
    kinde_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    family_name: { type: String, required: true },
    given_name: { type: String, required: true },
  },
  { timestamps: true }
);

const UserModel: Model<MongoUser> =
  mongoose.models.User || mongoose.model<MongoUser>("User", UserSchema);
export default UserModel;
