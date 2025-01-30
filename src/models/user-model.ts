import mongoose, { Schema, Model } from "mongoose";

interface IUser {
  kinde_id: string;
  name: string;
  email: string;
  family_name: string;
  given_name: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  // stripeCurrentPeriodStart? :Date
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
    stripeCustomerId: { type: String, unique: true, sparse: true },
    stripeSubscriptionId: { type: String, unique: true, sparse: true },
    stripePriceId: { type: String, sparse: true },
    stripeCurrentPeriodEnd: { type: Date, sparse: true },
  },
  { timestamps: true }
);

const UserModel: Model<MongoUser> =
  mongoose.models.User || mongoose.model<MongoUser>("User", UserSchema);
export default UserModel;
