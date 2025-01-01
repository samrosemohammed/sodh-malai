import mongoose, { model, Schema } from "mongoose";

interface IUser {
  kinde_id: string;
  name: string;
  email: string;
  family_name: string;
  given_name: string;
}

const userSchema = new Schema<IUser>({
  kinde_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  family_name: { type: String, required: true },
  given_name: { type: String, required: true },
});

const userModel = () => {
  return mongoose.models && mongoose.models.User
    ? mongoose.models.User
    : model<IUser>("User", userSchema);
};

export default userModel;
